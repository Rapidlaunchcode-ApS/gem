import { app } from 'electron'
import electronUpdater, { type ProgressInfo, type UpdateInfo } from 'electron-updater'
import type { UpdateState } from '../shared/types'

// electron-updater ships CommonJS; pull autoUpdater off the default export (ESM interop).
const { autoUpdater } = electronUpdater

type Emit = (state: UpdateState) => void
let emit: Emit = () => {}

/**
 * Wire electron-updater to the GitHub releases feed (configured via build.publish,
 * baked into app-update.yml). We don't auto-download — the user triggers it from
 * Settings — but a queued update installs on the next quit.
 */
export function initUpdater(send: Emit): void {
  emit = send
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => emit({ status: 'checking' }))
  autoUpdater.on('update-available', (info: UpdateInfo) =>
    emit({ status: 'available', version: info.version })
  )
  autoUpdater.on('update-not-available', () => emit({ status: 'not-available' }))
  autoUpdater.on('download-progress', (p: ProgressInfo) =>
    emit({ status: 'downloading', percent: Math.round(p.percent) })
  )
  autoUpdater.on('update-downloaded', (info: UpdateInfo) =>
    emit({ status: 'downloaded', version: info.version })
  )
  autoUpdater.on('error', (err: Error) =>
    emit({ status: 'error', message: err?.message ?? 'Update failed' })
  )

  // One quiet check a few seconds after launch (packaged builds only).
  if (app.isPackaged) {
    setTimeout(() => void autoUpdater.checkForUpdates().catch(() => undefined), 8_000)
  }
}

export async function checkForUpdate(): Promise<void> {
  if (!app.isPackaged) {
    emit({ status: 'not-available' })
    return
  }
  try {
    await autoUpdater.checkForUpdates()
  } catch (err) {
    emit({ status: 'error', message: err instanceof Error ? err.message : 'Update check failed' })
  }
}

export async function downloadUpdate(): Promise<void> {
  try {
    await autoUpdater.downloadUpdate()
  } catch (err) {
    emit({ status: 'error', message: err instanceof Error ? err.message : 'Download failed' })
  }
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall()
}
