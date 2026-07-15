import {
  app,
  BrowserWindow,
  clipboard,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  screen,
  Tray
} from 'electron'
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import {
  aiProviderSchema,
  SHORTCUTS_MAC,
  SHORTCUTS_WIN,
  shortcutLabel,
  themeSchema,
  type ClipItem,
  type UpdateState
} from '../shared/types'
import { Enricher } from './enricher'
import { SettingsStore } from './settings'
import { HistoryStore } from './store'
import { createTrayIcon } from './trayIcon'
import { checkForUpdate, downloadUpdate, initUpdater, installUpdate } from './updater'
import { ClipboardWatcher } from './watcher'

const PANEL_HEIGHT = 380
/** Gap between the floating panel and the screen edges. */
const PANEL_MARGIN = 14
/**
 * Duration of the panel's enter/leave animation. The native window ramps its own
 * opacity across this window in lockstep with the child `.panel`'s CSS transition,
 * so its vibrancy/acrylic material never lingers as a bare rectangle around the
 * animating card. MUST stay in sync with the longest transition in styles.css
 * (`.panel { transition: transform 0.19s … }`).
 */
const PANEL_ANIM_MS = 190
const isDev = !app.isPackaged && process.env['ELECTRON_RENDERER_URL'] !== undefined
const isMac = process.platform === 'darwin'

// One stable data dir regardless of dev/packaged process name.
app.setPath('userData', join(app.getPath('appData'), 'Gem'))

/** Move data captured under the app's previous name (PasteFree) into place. */
function migrateLegacyUserData(): void {
  const newDir = app.getPath('userData')
  const oldDir = join(app.getPath('appData'), 'pastefree')
  if (existsSync(join(newDir, 'history.json')) || !existsSync(join(oldDir, 'history.json'))) {
    return
  }
  try {
    mkdirSync(newDir, { recursive: true })
    for (const name of ['history.json', 'settings.json', 'images']) {
      const from = join(oldDir, name)
      const to = join(newDir, name)
      if (existsSync(from) && !existsSync(to)) renameSync(from, to)
    }
    // Stored image entries carry absolute paths — point them at the new dir.
    const historyPath = join(newDir, 'history.json')
    writeFileSync(historyPath, readFileSync(historyPath, 'utf8').split(oldDir).join(newDir))
    rmSync(oldDir, { recursive: true, force: true })
  } catch (err) {
    console.error('Legacy data migration failed:', err)
  }
}

let panel: BrowserWindow | null = null
let settingsWin: BrowserWindow | null = null
let onboardingWin: BrowserWindow | null = null
let tray: Tray | null = null
/** The accelerator currently registered with globalShortcut, so it can be replaced. */
let registeredShortcut: string | null = null
/** Fallback timer that force-hides the panel if the opacity ramp never completes. */
let hideSafety: ReturnType<typeof setTimeout> | null = null
/** Interval driving the native window's opacity ramp during show/hide. */
let panelFade: ReturnType<typeof setInterval> | null = null
let store: HistoryStore
let settings: SettingsStore
let watcher: ClipboardWatcher
let enricher: Enricher

function createPanel(): BrowserWindow {
  const win = new BrowserWindow({
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: true,
    // macOS gets real vibrancy; Windows 11 gets acrylic, older Windows the solid fallback.
    ...(isMac
      ? {
          transparent: true,
          // Adaptive frosted material so the panel is true glass in both light
          // and dark (unlike the always-dark 'hud'); matches the Settings window.
          vibrancy: 'sidebar' as const,
          visualEffectState: 'active' as const,
          roundedCorners: true
        }
      : {
          backgroundColor: '#1c1917',
          backgroundMaterial: 'acrylic' as const
        }),
    webPreferences: {
      preload: join(import.meta.dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  win.setAlwaysOnTop(true, 'pop-up-menu')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  // Auto-hide is handled app-wide (see the browser-window-blur handler) so it
  // still fires when focus leaves Gem from the Settings window, not just the panel.

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (isDev && rendererUrl) {
    void win.loadURL(rendererUrl)
  } else {
    void win.loadFile(join(import.meta.dirname, '../renderer/index.html'))
  }
  return win
}

/** Standalone, screen-centered Settings window (the same renderer at #settings). */
function openSettings(): void {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.show()
    settingsWin.focus()
    return
  }
  const win = new BrowserWindow({
    width: 460,
    height: 640,
    center: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    skipTaskbar: true,
    show: false,
    ...(isMac
      ? { transparent: true, vibrancy: 'sidebar' as const, visualEffectState: 'active' as const, roundedCorners: true }
      : { backgroundColor: '#1c1917', backgroundMaterial: 'acrylic' as const }),
    webPreferences: { preload: join(import.meta.dirname, '../preload/index.mjs'), sandbox: false }
  })
  win.once('ready-to-show', () => {
    // The panel floats at 'pop-up-menu' level; drop that so the Settings window
    // (a normal focused window) sits above it instead of behind it.
    panel?.setAlwaysOnTop(false)
    panel?.webContents.send('panel:dim', true)
    win.show()
    win.focus()
  })
  win.on('closed', () => {
    settingsWin = null
    panel?.setAlwaysOnTop(true, 'pop-up-menu')
    panel?.webContents.send('panel:dim', false)
  })
  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (isDev && rendererUrl) {
    void win.loadURL(`${rendererUrl}#settings`)
  } else {
    void win.loadFile(join(import.meta.dirname, '../renderer/index.html'), { hash: 'settings' })
  }
  settingsWin = win
}

function closeSettings(): void {
  if (settingsWin && !settingsWin.isDestroyed()) settingsWin.close()
}

/** Standalone, screen-centered onboarding window (the same renderer at #onboarding). */
function openOnboarding(): void {
  if (onboardingWin && !onboardingWin.isDestroyed()) {
    onboardingWin.show()
    onboardingWin.focus()
    return
  }
  const win = new BrowserWindow({
    width: 440,
    height: 620,
    center: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    skipTaskbar: true,
    show: false,
    ...(isMac
      ? { transparent: true, vibrancy: 'sidebar' as const, visualEffectState: 'active' as const, roundedCorners: true }
      : { backgroundColor: '#1c1917', backgroundMaterial: 'acrylic' as const }),
    webPreferences: { preload: join(import.meta.dirname, '../preload/index.mjs'), sandbox: false }
  })
  win.once('ready-to-show', () => {
    win.show()
    win.focus()
  })
  win.on('closed', () => {
    onboardingWin = null
  })
  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (isDev && rendererUrl) {
    void win.loadURL(`${rendererUrl}#onboarding`)
  } else {
    void win.loadFile(join(import.meta.dirname, '../renderer/index.html'), { hash: 'onboarding' })
  }
  onboardingWin = win
}

function closeOnboarding(): void {
  if (onboardingWin && !onboardingWin.isDestroyed()) onboardingWin.close()
}

/** (Re)register the global open-panel hotkey from settings, replacing any prior one. */
function registerShortcut(): void {
  if (registeredShortcut) {
    globalShortcut.unregister(registeredShortcut)
    registeredShortcut = null
  }
  const accel = settings.shortcut()
  if (globalShortcut.register(accel, togglePanel)) {
    registeredShortcut = accel
  } else {
    console.error(`Failed to register ${accel} — is another app using that shortcut?`)
  }
}

function clearPanelFade(): void {
  if (panelFade) {
    clearInterval(panelFade)
    panelFade = null
  }
}

/**
 * Step the panel window's own opacity from `from` to `to` over PANEL_ANIM_MS so
 * the native window fades in lockstep with the child `.panel`'s CSS transition,
 * instead of its vibrancy/acrylic material popping in or lingering around the
 * animating card. `setOpacity` isn't natively animatable, so ramp it in a few
 * steps; `done` fires once it reaches `to`.
 */
function rampPanelOpacity(from: number, to: number, done?: () => void): void {
  if (!panel || panel.isDestroyed()) return
  clearPanelFade()
  const steps = 8
  panel.setOpacity(from)
  let i = 0
  panelFade = setInterval(() => {
    i += 1
    if (panel && !panel.isDestroyed()) panel.setOpacity(from + (to - from) * (i / steps))
    if (i >= steps) {
      clearPanelFade()
      done?.()
    }
  }, Math.round(PANEL_ANIM_MS / steps))
}

function showPanel(): void {
  if (!panel) return
  clearPanelFade()
  if (hideSafety) {
    clearTimeout(hideSafety)
    hideSafety = null
  }
  const cursor = screen.getCursorScreenPoint()
  const { workArea } = screen.getDisplayNearestPoint(cursor)
  panel.setBounds({
    x: workArea.x + PANEL_MARGIN,
    y: workArea.y + workArea.height - PANEL_HEIGHT - PANEL_MARGIN,
    width: workArea.width - PANEL_MARGIN * 2,
    height: PANEL_HEIGHT
  })
  // Reopening an already-visible panel (tray, second-instance) must not flash
  // through opacity 0 — only ramp the window in when it's actually appearing.
  // Ramp from whatever opacity it's currently at (e.g. mid-leave-fade if the
  // user re-triggers show right after dismiss) instead of snapping to 0 first.
  const currentOpacity = panel.isVisible() ? panel.getOpacity() : 0
  const appearing = currentOpacity < 0.99
  panel.show()
  panel.focus()
  // The renderer runs the GPU-composited enter transition on this signal.
  panel.webContents.send('panel:shown')
  if (appearing) rampPanelOpacity(currentOpacity, 1)
  else panel.setOpacity(1)
}

/**
 * Instantly hide the panel with no fade (paste flow, or the final step of the
 * leave ramp). Resets opacity to 1 so an interrupted ramp can't leave the next
 * show transparent.
 */
function hidePanelNow(): void {
  clearPanelFade()
  if (hideSafety) {
    clearTimeout(hideSafety)
    hideSafety = null
  }
  if (panel && !panel.isDestroyed()) {
    if (panel.isVisible()) panel.hide()
    panel.setOpacity(1)
  }
}

/**
 * Play the leave transition: tell the renderer to swap in `panel--hidden` (the
 * child card's CSS transition) and fade the native window out in lockstep, then
 * hide once the ramp reaches 0. A safety timeout force-hides if the ramp is
 * interrupted, so the panel can never get stuck open.
 */
function requestHidePanel(): void {
  if (!panel || panel.isDestroyed() || !panel.isVisible()) return
  panel.webContents.send('panel:animate-out')
  rampPanelOpacity(1, 0, hidePanelNow)
  if (hideSafety) clearTimeout(hideSafety)
  hideSafety = setTimeout(hidePanelNow, PANEL_ANIM_MS + 120)
}

function togglePanel(): void {
  if (!panel) return
  if (panel.isVisible()) requestHidePanel()
  else showPanel()
}

/**
 * First-launch onboarding. Gem is a menu-bar app with no window or Dock icon, so
 * a cold start otherwise looks like "nothing happened" (the #1 "Windows won't
 * launch" report). On the very first run we open a real onboarding window that
 * explains the tray, the shortcut, and how to use it.
 */
function maybeShowWelcome(): void {
  const marker = join(app.getPath('userData'), '.welcomed')
  if (existsSync(marker)) return
  try {
    writeFileSync(marker, new Date().toISOString())
  } catch {
    // If we can't persist the marker, still show the welcome this once.
  }
  openOnboarding()
  if (Notification.isSupported()) {
    new Notification({
      title: 'Gem is ready',
      body: `Gem lives in your ${isMac ? 'menu bar' : 'system tray'} — press ${shortcutLabel(settings.shortcut(), isMac)} anytime to open your clipboard.`,
      silent: true
    }).show()
  }
}

function broadcastState(): void {
  panel?.webContents.send('state:changed', store.state())
}

function broadcastTitling(ids: string[]): void {
  panel?.webContents.send('titling:changed', ids)
}

function broadcastUpdate(state: UpdateState): void {
  panel?.webContents.send('update:status', state)
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.webContents.send('update:status', state)
  }
}

function writeItemToClipboard(item: ClipItem): void {
  if (item.kind === 'image') {
    clipboard.writeImage(nativeImage.createFromPath(item.content))
  } else {
    clipboard.writeText(item.content)
  }
  watcher.markOwnWrite()
  // Re-copying bumps the item to the front of history.
  store.add({ ...item, copiedAt: Date.now() })
  broadcastState()
}

function pasteItem(item: ClipItem): void {
  // Hide instantly (no animation) so focus returns before the paste keystroke fires.
  hidePanelNow()
  writeItemToClipboard(item)
  // Give macOS a beat to return focus to the previous app before keystroking.
  setTimeout(simulatePaste, 150)
}

function simulatePaste(): void {
  if (isMac) {
    // Requires Accessibility permission; if denied the item is still on the
    // clipboard so the user can Cmd+V manually.
    execFile(
      'osascript',
      ['-e', 'tell application "System Events" to keystroke "v" using command down'],
      (err) => {
        if (err) console.error('Auto-paste failed (grant Accessibility permission):', err.message)
      }
    )
  } else if (process.platform === 'win32') {
    execFile(
      'powershell',
      ['-NoProfile', '-Command', "$w = New-Object -ComObject wscript.shell; $w.SendKeys('^v')"],
      (err) => {
        if (err) console.error('Auto-paste failed:', err.message)
      }
    )
  }
}

function showItemMenu(id: string): void {
  const item = store.get(id)
  if (!item || !panel) return
  const boardEntries = store.state().boards.map((board) => ({
    label: board.name,
    type: 'checkbox' as const,
    checked: item.boardId === board.id,
    click: () => {
      store.assignToBoard(id, item.boardId === board.id ? null : board.id)
      broadcastState()
    }
  }))

  const menu = Menu.buildFromTemplate([
    { label: 'Paste', click: () => pasteItem(item) },
    { label: 'Copy', click: () => writeItemToClipboard(item) },
    { label: 'Rename…', click: () => panel?.webContents.send('item:edit', id) },
    { type: 'separator' },
    {
      label: item.pinned ? 'Unpin' : 'Pin',
      click: () => {
        store.setPinned(id, !item.pinned)
        broadcastState()
      }
    },
    ...(boardEntries.length > 0
      ? [{ label: 'Pinboard', submenu: boardEntries } as const]
      : []),
    { type: 'separator' as const },
    {
      label: 'Delete',
      click: () => {
        store.delete(id)
        broadcastState()
      }
    }
  ])
  menu.popup({ window: panel })
}

function showBoardMenu(id: string): void {
  const board = store.getBoard(id)
  if (!board || !panel) return
  const menu = Menu.buildFromTemplate([
    {
      label: `Delete “${board.name}”`,
      click: () => {
        store.deleteBoard(id)
        broadcastState()
      }
    }
  ])
  menu.popup({ window: panel })
}

function buildTrayMenu(): Menu {
  return Menu.buildFromTemplate([
    { label: `Open Gem  ${shortcutLabel(settings.shortcut(), isMac)}`, click: () => showPanel() },
    { label: 'How to use Gem…', click: () => openOnboarding() },
    { label: 'Settings…', click: () => openSettings() },
    { type: 'separator' },
    {
      label: 'Launch at Login',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked })
    },
    {
      label: 'Clear History…',
      click: () => {
        store.clear()
        broadcastState()
      }
    },
    { type: 'separator' },
    { label: 'Quit Gem', click: () => app.quit() }
  ])
}

function createTray(): void {
  tray = new Tray(createTrayIcon())
  tray.setToolTip('Gem')
  tray.setContextMenu(buildTrayMenu())
}

/** Rebuild the tray menu so its shortcut label reflects the current setting. */
function refreshTray(): void {
  tray?.setContextMenu(buildTrayMenu())
}

function registerIpc(): void {
  ipcMain.handle('state:get', () => store.state())

  ipcMain.handle('item:paste', (_e, id: unknown) => {
    const item = store.get(asString(id))
    if (item) pasteItem(item)
  })

  ipcMain.handle('item:copy', (_e, id: unknown) => {
    const item = store.get(asString(id))
    if (item) writeItemToClipboard(item)
  })

  ipcMain.handle('item:delete', (_e, id: unknown) => {
    store.delete(asString(id))
    broadcastState()
  })

  ipcMain.handle('item:pin', (_e, id: unknown, pinned: unknown) => {
    store.setPinned(asString(id), pinned === true)
    broadcastState()
  })

  ipcMain.handle('item:rename', (_e, id: unknown, title: unknown) => {
    store.rename(asString(id), asString(title))
    broadcastState()
  })

  ipcMain.handle('item:assign', (_e, id: unknown, boardId: unknown) => {
    store.assignToBoard(asString(id), boardId === null ? null : asString(boardId))
    broadcastState()
  })

  ipcMain.handle('item:menu', (_e, id: unknown) => showItemMenu(asString(id)))

  ipcMain.handle('board:create', (_e, name: unknown) => {
    store.createBoard(asString(name))
    broadcastState()
  })

  ipcMain.handle('board:delete', (_e, id: unknown) => {
    store.deleteBoard(asString(id))
    broadcastState()
  })

  ipcMain.handle('board:menu', (_e, id: unknown) => showBoardMenu(asString(id)))

  ipcMain.handle('history:clear', () => {
    store.clear()
    broadcastState()
  })

  ipcMain.handle('settings:get', () => settings.view())

  ipcMain.handle('settings:set-theme', (_e, theme: unknown) => {
    settings.setTheme(themeSchema.parse(theme))
  })

  ipcMain.handle('settings:set-retention', (_e, days: unknown) => {
    if (typeof days !== 'number' || !Number.isFinite(days)) {
      throw new TypeError('Expected a number of days')
    }
    settings.setRetentionDays(days)
    if (store.purgeExpired(settings.retentionDays())) broadcastState()
  })

  ipcMain.handle('settings:set-ai', (_e, update: unknown) => {
    const { apiKey, ...rest } = z
      .object({
        enabled: z.boolean(),
        provider: aiProviderSchema,
        apiKey: z.string().optional()
      })
      .parse(update)
    settings.setAi(apiKey === undefined ? rest : { ...rest, apiKey })
  })

  ipcMain.handle('settings:set-shortcut', (_e, accel: unknown) => {
    const value = asString(accel)
    // Only accept one of the known per-platform presets so we never hand
    // globalShortcut an accelerator it can't parse.
    const valid = (isMac ? SHORTCUTS_MAC : SHORTCUTS_WIN).some((s) => s.accel === value)
    if (!valid) throw new Error(`Unknown shortcut: ${value}`)
    settings.setShortcut(value)
    registerShortcut()
    refreshTray()
    // The panel re-reads settings each time it opens, so no push needed here.
  })

  ipcMain.handle('panel:hide', () => hidePanelNow())
  ipcMain.handle('panel:open', () => showPanel())
  ipcMain.handle('settings:open', () => openSettings())
  ipcMain.handle('settings:close', () => closeSettings())
  ipcMain.handle('onboarding:open', () => openOnboarding())
  ipcMain.handle('onboarding:close', () => closeOnboarding())

  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('update:check', () => checkForUpdate())
  ipcMain.handle('update:download', () => downloadUpdate())
  ipcMain.handle('update:install', () => installUpdate())
}

function asString(value: unknown): string {
  if (typeof value !== 'string') throw new TypeError('Expected a string argument')
  return value
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  void app.whenReady().then(() => {
    app.dock?.hide()

    migrateLegacyUserData()
    store = new HistoryStore()
    settings = new SettingsStore()
    enricher = new Enricher(store, settings, broadcastState, broadcastTitling)
    watcher = new ClipboardWatcher(store, (item) => {
      broadcastState()
      enricher.maybeEnrich(item)
    })
    watcher.start()

    // Retention: purge at startup and hourly while running.
    if (store.purgeExpired(settings.retentionDays())) broadcastState()
    setInterval(() => {
      if (store.purgeExpired(settings.retentionDays())) broadcastState()
    }, 3_600_000)

    panel = createPanel()
    // A tray failure must not abort startup — otherwise the whole app looks like
    // it "won't launch" (a reported Windows symptom). Onboarding + the shortcut
    // still come up, and the user gets a menu-bar-less but working Gem.
    try {
      createTray()
    } catch (err) {
      console.error('Tray creation failed:', err)
    }
    registerIpc()

    registerShortcut()

    maybeShowWelcome()
    initUpdater(broadcastUpdate)
  })

  app.on('second-instance', () => showPanel())

  // Dismiss the UI only when focus leaves Gem entirely. Deferring lets the
  // newly-focused window register first, so moving focus between the panel and
  // the Settings window (both Gem windows) never triggers a hide.
  app.on('browser-window-blur', () => {
    setImmediate(() => {
      if (BrowserWindow.getFocusedWindow() !== null) return
      closeSettings()
      requestHidePanel()
    })
  })

  app.on('window-all-closed', () => {
    // Menu-bar app: stay alive with no windows.
  })

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
    watcher.stop()
  })
}
