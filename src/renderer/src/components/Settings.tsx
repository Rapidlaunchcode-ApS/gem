import { useRef, useState } from 'react'
import {
  AI_MODELS,
  RETENTION_OPTIONS,
  SHORTCUTS_MAC,
  SHORTCUTS_WIN,
  type AiProvider,
  type AiUpdate,
  type SettingsView,
  type Theme,
  type UpdateState
} from '../../../shared/types'
import { MonitorIcon, MoonIcon, SunIcon } from './Icons'

interface SettingsProps {
  settings: SettingsView
  version: string
  update: UpdateState
  onThemeChange: (theme: Theme) => void
  onRetentionChange: (days: number) => void
  onShortcutChange: (accel: string) => void
  onAiChange: (update: AiUpdate) => void
  onCheckUpdate: () => void
  onDownloadUpdate: () => void
  onInstallUpdate: () => void
  onClose: () => void
}

const IS_MAC =
  typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')

const SHORTCUTS = IS_MAC ? SHORTCUTS_MAC : SHORTCUTS_WIN

const THEME_OPTIONS: { value: Theme; label: string; Icon: typeof SunIcon }[] = [
  { value: 'system', label: 'System', Icon: MonitorIcon },
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon }
]

const PROVIDERS: { value: AiProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'anthropic', label: 'Anthropic' }
]

export function Settings({
  settings,
  version,
  update,
  onThemeChange,
  onRetentionChange,
  onShortcutChange,
  onAiChange,
  onCheckUpdate,
  onDownloadUpdate,
  onInstallUpdate,
  onClose
}: SettingsProps) {
  const keyRef = useRef<HTMLInputElement>(null)
  const [keyDirty, setKeyDirty] = useState(false)

  const submitAi = (patch: Partial<AiUpdate>): void => {
    const update: AiUpdate = {
      enabled: settings.ai.enabled,
      provider: settings.ai.provider,
      ...patch
    }
    const typedKey = keyRef.current?.value.trim() ?? ''
    if (keyDirty && typedKey.length > 0) {
      update.apiKey = typedKey
    }
    onAiChange(update)
    if (update.apiKey !== undefined && keyRef.current) {
      keyRef.current.value = ''
      setKeyDirty(false)
    }
  }

  return (
    <div className="settings-win">
      <header className="settings-win__bar">
        <span className="settings-win__title">Settings</span>
        <button className="settings-win__done" onClick={onClose}>
          Done
        </button>
      </header>

      <div className="settings-win__body">
        <div className="settings__section">
          <div className="settings__label">Appearance</div>
          <div className="settings__segments" role="radiogroup" aria-label="Theme">
            {THEME_OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                role="radio"
                aria-checked={settings.theme === value}
                className={`settings__segment${settings.theme === value ? ' settings__segment--active' : ''}`}
                onClick={() => onThemeChange(value)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings__section">
          <div className="settings__label">History</div>
          <div className="settings__row">
            <span>Keep items for</span>
            <select
              className="settings__select"
              value={settings.retentionDays}
              onChange={(e) => onRetentionChange(Number(e.target.value))}
            >
              {RETENTION_OPTIONS.map((o) => (
                <option key={o.days} value={o.days}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="settings__hint">Pinned items and pinboards are always kept.</div>
        </div>

        <div className="settings__section">
          <div className="settings__label">Shortcut</div>
          <div className="settings__row">
            <span>Open Gem with</span>
            <select
              className="settings__select"
              value={settings.shortcut}
              onChange={(e) => onShortcutChange(e.target.value)}
            >
              {SHORTCUTS.map((s) => (
                <option key={s.accel} value={s.accel}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="settings__hint">
            {IS_MAC
              ? 'The global hotkey that pops the panel over any app.'
              : 'Windows reserves Ctrl+Shift+V for “paste as plain text”, so Gem uses one of these instead.'}
          </div>
        </div>

        <div className="settings__section">
          <div className="settings__label">AI titles</div>
          <label className="settings__row settings__row--clickable">
            <span>Name new clips automatically</span>
            <input
              type="checkbox"
              className="settings__switch"
              checked={settings.ai.enabled}
              onChange={(e) => submitAi({ enabled: e.target.checked })}
            />
          </label>
          <div className="settings__segments" role="radiogroup" aria-label="AI provider">
            {PROVIDERS.map(({ value, label }) => (
              <button
                key={value}
                role="radio"
                aria-checked={settings.ai.provider === value}
                className={`settings__segment${settings.ai.provider === value ? ' settings__segment--active' : ''}`}
                onClick={() => submitAi({ provider: value })}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="settings__row">
            <span>Model</span>
            <select
              className="settings__select"
              value={settings.ai.model}
              onChange={(e) => submitAi({ model: e.target.value })}
            >
              {AI_MODELS[settings.ai.provider].map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {settings.ai.hasKey && (
            <div className="settings__key-saved">
              <span>Saved key</span>
              <code className="settings__key-mask">{settings.ai.keyHint}</code>
            </div>
          )}

          <div className="settings__key-row">
            <input
              ref={keyRef}
              type="password"
              className="settings__key"
              placeholder={
                settings.ai.hasKey
                  ? 'Type a new key to replace'
                  : `${providerLabel(settings.ai.provider)} API key`
              }
              spellCheck={false}
              onChange={() => setKeyDirty(true)}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter') submitAi({})
              }}
            />
            <button
              className="settings__btn settings__btn--accent"
              disabled={!keyDirty}
              onClick={() => submitAi({})}
            >
              Save
            </button>
          </div>
          <div className="settings__hint">
            Your own key (BYOK), stored encrypted on this device and only used to title clips.
          </div>
        </div>

        <div className="settings__section">
          <div className="settings__label">Updates</div>
          <div className="settings__row">
            <span>{updateLine(update, version)}</span>
            <UpdateButton
              update={update}
              onCheck={onCheckUpdate}
              onDownload={onDownloadUpdate}
              onInstall={onInstallUpdate}
            />
          </div>
          {update.status === 'error' && <div className="settings__hint">{update.message}</div>}
        </div>

        <div className="settings__footnote">
          History is stored locally and never leaves this device unless AI titles are enabled.
        </div>
      </div>
    </div>
  )
}

function providerLabel(provider: AiProvider): string {
  return PROVIDERS.find((p) => p.value === provider)?.label ?? provider
}

function updateLine(update: UpdateState, version: string): string {
  switch (update.status) {
    case 'checking':
      return 'Checking for updates…'
    case 'available':
      return `Version ${update.version} is available`
    case 'downloading':
      return `Downloading… ${update.percent}%`
    case 'downloaded':
      return `Version ${update.version} ready to install`
    case 'not-available':
      return `Gem ${version} — up to date`
    case 'error':
      return `Gem ${version} — couldn’t check`
    default:
      return version ? `Gem ${version}` : 'Gem'
  }
}

interface UpdateButtonProps {
  update: UpdateState
  onCheck: () => void
  onDownload: () => void
  onInstall: () => void
}

function UpdateButton({ update, onCheck, onDownload, onInstall }: UpdateButtonProps) {
  switch (update.status) {
    case 'checking':
      return (
        <button className="settings__btn" disabled>
          Checking…
        </button>
      )
    case 'available':
      return (
        <button className="settings__btn settings__btn--accent" onClick={onDownload}>
          Download
        </button>
      )
    case 'downloading':
      return (
        <button className="settings__btn" disabled>
          Downloading…
        </button>
      )
    case 'downloaded':
      return (
        <button className="settings__btn settings__btn--accent" onClick={onInstall}>
          Restart &amp; update
        </button>
      )
    default:
      return (
        <button className="settings__btn" onClick={onCheck}>
          Check for updates
        </button>
      )
  }
}
