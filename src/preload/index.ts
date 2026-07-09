import { contextBridge, ipcRenderer } from 'electron'
import type { AppState, GemApi, SettingsView, UpdateState } from '../shared/types'

function subscribe<T>(channel: string, listener: (payload: T) => void): () => void {
  const handler = (_e: Electron.IpcRendererEvent, payload: T): void => listener(payload)
  ipcRenderer.on(channel, handler)
  return () => ipcRenderer.removeListener(channel, handler)
}

const api: GemApi = {
  getState: () => ipcRenderer.invoke('state:get') as Promise<AppState>,
  onStateChange: (listener) => subscribe<AppState>('state:changed', listener),
  pasteItem: (id) => ipcRenderer.invoke('item:paste', id) as Promise<void>,
  copyItem: (id) => ipcRenderer.invoke('item:copy', id) as Promise<void>,
  deleteItem: (id) => ipcRenderer.invoke('item:delete', id) as Promise<void>,
  setPinned: (id, pinned) => ipcRenderer.invoke('item:pin', id, pinned) as Promise<void>,
  renameItem: (id, title) => ipcRenderer.invoke('item:rename', id, title) as Promise<void>,
  assignToBoard: (itemId, boardId) =>
    ipcRenderer.invoke('item:assign', itemId, boardId) as Promise<void>,
  createBoard: (name) => ipcRenderer.invoke('board:create', name) as Promise<void>,
  deleteBoard: (id) => ipcRenderer.invoke('board:delete', id) as Promise<void>,
  showItemMenu: (id) => ipcRenderer.invoke('item:menu', id) as Promise<void>,
  showBoardMenu: (id) => ipcRenderer.invoke('board:menu', id) as Promise<void>,
  onItemEdit: (listener) => subscribe<string>('item:edit', listener),
  onTitlingChange: (listener) => subscribe<string[]>('titling:changed', listener),
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<SettingsView>,
  setTheme: (theme) => ipcRenderer.invoke('settings:set-theme', theme) as Promise<void>,
  setRetentionDays: (days) =>
    ipcRenderer.invoke('settings:set-retention', days) as Promise<void>,
  setAiSettings: (update) => ipcRenderer.invoke('settings:set-ai', update) as Promise<void>,
  clearHistory: () => ipcRenderer.invoke('history:clear') as Promise<void>,
  hidePanel: () => ipcRenderer.invoke('panel:hide') as Promise<void>,
  onPanelShown: (listener) => subscribe<void>('panel:shown', () => listener()),
  onPanelDim: (listener) => subscribe<boolean>('panel:dim', listener),
  onPanelAnimateOut: (listener) => subscribe<void>('panel:animate-out', () => listener()),
  openSettings: () => ipcRenderer.invoke('settings:open') as Promise<void>,
  closeSettings: () => ipcRenderer.invoke('settings:close') as Promise<void>,
  appVersion: () => ipcRenderer.invoke('app:version') as Promise<string>,
  onboardingPending: () => ipcRenderer.invoke('onboarding:pending') as Promise<boolean>,
  checkForUpdate: () => ipcRenderer.invoke('update:check') as Promise<void>,
  downloadUpdate: () => ipcRenderer.invoke('update:download') as Promise<void>,
  installUpdate: () => ipcRenderer.invoke('update:install') as Promise<void>,
  onUpdateStatus: (listener) => subscribe<UpdateState>('update:status', listener)
}

contextBridge.exposeInMainWorld('api', api)
