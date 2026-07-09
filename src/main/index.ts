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
import { aiProviderSchema, themeSchema, type ClipItem, type UpdateState } from '../shared/types'
import { Enricher } from './enricher'
import { SettingsStore } from './settings'
import { HistoryStore } from './store'
import { createTrayIcon } from './trayIcon'
import { checkForUpdate, downloadUpdate, initUpdater, installUpdate } from './updater'
import { ClipboardWatcher } from './watcher'

const PANEL_HEIGHT = 380
/** Gap between the floating panel and the screen edges. */
const PANEL_MARGIN = 14
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
let tray: Tray | null = null
/** True after a first-launch welcome until the renderer picks it up once. */
let onboardingPending = false
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
          vibrancy: 'hud' as const,
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

  win.on('blur', () => {
    // Defer so the newly-focused window (if any) is known. Keep the panel in the
    // background when focus moves to our own Settings window; only dismiss it when
    // focus leaves Gem entirely (no Gem window focused → user switched apps/clicked away).
    setImmediate(() => {
      if (win.isDestroyed() || !win.isVisible()) return
      if (BrowserWindow.getFocusedWindow() === null) win.hide()
    })
  })

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
    win.show()
    win.focus()
  })
  win.on('closed', () => {
    settingsWin = null
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

function showPanel(): void {
  if (!panel) return
  const cursor = screen.getCursorScreenPoint()
  const { workArea } = screen.getDisplayNearestPoint(cursor)
  panel.setBounds({
    x: workArea.x + PANEL_MARGIN,
    y: workArea.y + workArea.height - PANEL_HEIGHT - PANEL_MARGIN,
    width: workArea.width - PANEL_MARGIN * 2,
    height: PANEL_HEIGHT
  })
  panel.show()
  panel.focus()
  panel.webContents.send('panel:shown')
}

function togglePanel(): void {
  if (!panel) return
  if (panel.isVisible()) panel.hide()
  else showPanel()
}

/**
 * First-launch onboarding. Gem is a menu-bar app with no window or Dock icon, so
 * a cold start otherwise looks like "nothing happened". On the very first run we
 * pop the panel once and fire a notification pointing at the menu bar + shortcut.
 */
function maybeShowWelcome(): void {
  const marker = join(app.getPath('userData'), '.welcomed')
  if (existsSync(marker)) return
  try {
    writeFileSync(marker, new Date().toISOString())
  } catch {
    // If we can't persist the marker, still show the welcome this once.
  }
  const shortcut = isMac ? '⌘⇧V' : 'Ctrl+Shift+V'
  onboardingPending = true
  showPanel()
  if (Notification.isSupported()) {
    new Notification({
      title: 'Gem is ready',
      body: `Gem lives in your menu bar — press ${shortcut} anytime to open your clipboard.`,
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
  panel?.hide()
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

function createTray(): void {
  tray = new Tray(createTrayIcon())
  tray.setToolTip('Gem')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: `Open Gem  ${isMac ? '⌘⇧V' : 'Ctrl+Shift+V'}`, click: () => showPanel() },
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
  )
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

  ipcMain.handle('panel:hide', () => panel?.hide())
  ipcMain.handle('settings:open', () => openSettings())
  ipcMain.handle('settings:close', () => closeSettings())

  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('onboarding:pending', () => {
    const pending = onboardingPending
    onboardingPending = false
    return pending
  })
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
    createTray()
    registerIpc()

    if (!globalShortcut.register('CommandOrControl+Shift+V', togglePanel)) {
      console.error('Failed to register ⌘⇧V — is another clipboard manager running?')
    }

    maybeShowWelcome()
    initUpdater(broadcastUpdate)
  })

  app.on('second-instance', () => showPanel())

  app.on('window-all-closed', () => {
    // Menu-bar app: stay alive with no windows.
  })

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
    watcher.stop()
  })
}
