import {
  app,
  BrowserWindow,
  clipboard,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  screen,
  Tray
} from 'electron'
import { execFile } from 'node:child_process'
import { join } from 'node:path'
import type { ClipItem } from '../shared/types'
import { HistoryStore } from './store'
import { ClipboardWatcher } from './watcher'

const PANEL_HEIGHT = 380
const isDev = !app.isPackaged && process.env['ELECTRON_RENDERER_URL'] !== undefined

let panel: BrowserWindow | null = null
let tray: Tray | null = null
let store: HistoryStore
let watcher: ClipboardWatcher

function createPanel(): BrowserWindow {
  const win = new BrowserWindow({
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: true,
    vibrancy: 'hud',
    visualEffectState: 'active',
    roundedCorners: false,
    webPreferences: {
      preload: join(import.meta.dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  win.setAlwaysOnTop(true, 'pop-up-menu')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  win.on('blur', () => {
    if (win.isVisible()) win.hide()
  })

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (isDev && rendererUrl) {
    void win.loadURL(rendererUrl)
  } else {
    void win.loadFile(join(import.meta.dirname, '../renderer/index.html'))
  }
  return win
}

function showPanel(): void {
  if (!panel) return
  const cursor = screen.getCursorScreenPoint()
  const { workArea } = screen.getDisplayNearestPoint(cursor)
  panel.setBounds({
    x: workArea.x,
    y: workArea.y + workArea.height - PANEL_HEIGHT,
    width: workArea.width,
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

function broadcastHistory(): void {
  panel?.webContents.send('history:changed', store.all())
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
  broadcastHistory()
}

function simulatePaste(): void {
  // Requires Accessibility permission; if denied the item is still on the
  // clipboard so the user can Cmd+V manually.
  execFile(
    'osascript',
    ['-e', 'tell application "System Events" to keystroke "v" using command down'],
    (err) => {
      if (err) console.error('Auto-paste failed (grant Accessibility permission):', err.message)
    }
  )
}

function createTray(): void {
  tray = new Tray(nativeImage.createEmpty())
  tray.setTitle('📋')
  tray.setToolTip('PasteFree')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open PasteFree  ⌘⇧V', click: () => showPanel() },
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
          broadcastHistory()
        }
      },
      { type: 'separator' },
      { label: 'Quit PasteFree', click: () => app.quit() }
    ])
  )
}

function registerIpc(): void {
  ipcMain.handle('history:get', () => store.all())

  ipcMain.handle('item:paste', (_e, id: unknown) => {
    const item = store.get(asId(id))
    if (!item) return
    panel?.hide()
    writeItemToClipboard(item)
    // Give macOS a beat to return focus to the previous app before keystroking.
    setTimeout(simulatePaste, 150)
  })

  ipcMain.handle('item:copy', (_e, id: unknown) => {
    const item = store.get(asId(id))
    if (!item) return
    writeItemToClipboard(item)
  })

  ipcMain.handle('item:delete', (_e, id: unknown) => {
    store.delete(asId(id))
    broadcastHistory()
  })

  ipcMain.handle('item:pin', (_e, id: unknown, pinned: unknown) => {
    store.setPinned(asId(id), pinned === true)
    broadcastHistory()
  })

  ipcMain.handle('history:clear', () => {
    store.clear()
    broadcastHistory()
  })

  ipcMain.handle('panel:hide', () => panel?.hide())
}

function asId(value: unknown): string {
  if (typeof value !== 'string') throw new TypeError('Expected item id string')
  return value
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  void app.whenReady().then(() => {
    app.dock?.hide()

    store = new HistoryStore()
    watcher = new ClipboardWatcher(store, broadcastHistory)
    watcher.start()

    panel = createPanel()
    createTray()
    registerIpc()

    if (!globalShortcut.register('CommandOrControl+Shift+V', togglePanel)) {
      console.error('Failed to register ⌘⇧V — is another clipboard manager running?')
    }
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
