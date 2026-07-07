import { useRef, useState } from 'react'
import {
  RETENTION_OPTIONS,
  type AiProvider,
  type AiUpdate,
  type SettingsView,
  type Theme
} from '../../../shared/types'
import { MonitorIcon, MoonIcon, SunIcon } from './Icons'

interface SettingsProps {
  settings: SettingsView
  onThemeChange: (theme: Theme) => void
  onRetentionChange: (days: number) => void
  onAiChange: (update: AiUpdate) => void
  onClose: () => void
}

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
  onThemeChange,
  onRetentionChange,
  onAiChange,
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
    <div className="overlay" onClick={onClose}>
      <div className="settings" onClick={(e) => e.stopPropagation()}>
        <div className="settings__header">Settings</div>

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
          <input
            ref={keyRef}
            type="password"
            className="settings__key"
            placeholder={
              settings.ai.hasKey ? 'Key saved — type to replace' : `${providerLabel(settings.ai.provider)} API key`
            }
            spellCheck={false}
            onChange={() => setKeyDirty(true)}
            onBlur={() => {
              if (keyDirty && (keyRef.current?.value.trim().length ?? 0) > 0) submitAi({})
            }}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') submitAi({})
            }}
          />
          <div className="settings__hint">
            Your own key (BYOK), stored encrypted on this Mac and only used to title clips.
          </div>
        </div>

        <div className="settings__footnote">
          History is stored locally and never leaves this Mac unless AI titles are enabled.
        </div>
      </div>
    </div>
  )
}

function providerLabel(provider: AiProvider): string {
  return PROVIDERS.find((p) => p.value === provider)?.label ?? provider
}
