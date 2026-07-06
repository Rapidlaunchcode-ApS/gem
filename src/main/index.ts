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
import { themeSchema, type ClipItem } from '../shared/types'
import { SettingsStore } from './settings'
import { HistoryStore } from './store'
import { createTrayIcon } from './trayIcon'
import { ClipboardWatcher } from './watcher'

const PANEL_HEIGHT = 380
const isDev = !app.isPackaged && process.env['ELECTRON_RENDERER_URL'] !== undefined

let panel: BrowserWindow | null = null
let tray: Tray | null = null
let store: HistoryStore
let settings: SettingsStore
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

function broadcastState(): void {
  panel?.webContents.send('state:changed', store.state())
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
          broadcastState()
        }
      },
      { type: 'separator' },
      { label: 'Quit PasteFree', click: () => app.quit() }
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

  ipcMain.handle('settings:get', () => settings.get())

  ipcMain.handle('settings:set-theme', (_e, theme: unknown) => {
    settings.setTheme(themeSchema.parse(theme))
  })

  ipcMain.handle('panel:hide', () => panel?.hide())
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

    store = new HistoryStore()
    settings = new SettingsStore()
    watcher = new ClipboardWatcher(store, broadcastState)
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
