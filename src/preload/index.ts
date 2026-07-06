import { contextBridge, ipcRenderer } from 'electron'
import type { ClipItem, PasteFreeApi } from '../shared/types'

const api: PasteFreeApi = {
  getHistory: () => ipcRenderer.invoke('history:get') as Promise<ClipItem[]>,
  onHistoryChange: (listener) => {
    const handler = (_e: Electron.IpcRendererEvent, items: ClipItem[]): void => listener(items)
    ipcRenderer.on('history:changed', handler)
    return () => ipcRenderer.removeListener('history:changed', handler)
  },
  pasteItem: (id) => ipcRenderer.invoke('item:paste', id) as Promise<void>,
  copyItem: (id) => ipcRenderer.invoke('item:copy', id) as Promise<void>,
  deleteItem: (id) => ipcRenderer.invoke('item:delete', id) as Promise<void>,
  setPinned: (id, pinned) => ipcRenderer.invoke('item:pin', id, pinned) as Promise<void>,
  clearHistory: () => ipcRenderer.invoke('history:clear') as Promise<void>,
  hidePanel: () => ipcRenderer.invoke('panel:hide') as Promise<void>,
  onPanelShown: (listener) => {
    const handler = (): void => listener()
    ipcRenderer.on('panel:shown', handler)
    return () => ipcRenderer.removeListener('panel:shown', handler)
  }
}

contextBridge.exposeInMainWorld('api', api)
