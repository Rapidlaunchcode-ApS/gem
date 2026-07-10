import { useCallback, useEffect, useState } from 'react'
import type { AiUpdate, SettingsView, Theme, UpdateState } from '../../../shared/types'
import { Settings } from './Settings'

const DEFAULT: SettingsView = {
  theme: 'system',
  retentionDays: 7,
  shortcut: 'CommandOrControl+Shift+V',
  ai: { enabled: false, provider: 'anthropic', hasKey: false, keyHint: '', model: 'claude-haiku-4-5' }
}

/** Root of the standalone, screen-centered Settings window (renderer at #settings). */
export function SettingsWindow() {
  const [settings, setSettings] = useState<SettingsView>(DEFAULT)
  const [version, setVersion] = useState('')
  const [update, setUpdate] = useState<UpdateState>({ status: 'idle' })

  useEffect(() => {
    void window.api.getSettings().then(setSettings)
    void window.api.appVersion().then(setVersion)
    return window.api.onUpdateStatus(setUpdate)
  }, [])

  // Explicit choice wins over prefers-color-scheme.
  useEffect(() => {
    if (settings.theme === 'system') delete document.documentElement.dataset['theme']
    else document.documentElement.dataset['theme'] = settings.theme
  }, [settings.theme])

  const close = useCallback(() => void window.api.closeSettings(), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const changeTheme = useCallback((next: Theme) => {
    setSettings((s) => ({ ...s, theme: next }))
    void window.api.setTheme(next)
  }, [])

  const changeRetention = useCallback((days: number) => {
    setSettings((s) => ({ ...s, retentionDays: days }))
    void window.api.setRetentionDays(days)
  }, [])

  const changeShortcut = useCallback((accel: string) => {
    setSettings((s) => ({ ...s, shortcut: accel }))
    void window.api.setShortcut(accel)
  }, [])

  const changeAi = useCallback((patch: AiUpdate) => {
    void window.api
      .setAiSettings(patch)
      .then(() => window.api.getSettings())
      .then(setSettings)
  }, [])

  return (
    <Settings
      settings={settings}
      version={version}
      update={update}
      onThemeChange={changeTheme}
      onRetentionChange={changeRetention}
      onShortcutChange={changeShortcut}
      onAiChange={changeAi}
      onCheckUpdate={() => void window.api.checkForUpdate()}
      onDownloadUpdate={() => void window.api.downloadUpdate()}
      onInstallUpdate={() => void window.api.installUpdate()}
      onClose={close}
    />
  )
}
