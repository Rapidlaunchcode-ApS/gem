import type { Theme } from '../../../shared/types'
import { MonitorIcon, MoonIcon, SunIcon } from './Icons'

interface SettingsProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onClose: () => void
}

const THEME_OPTIONS: { value: Theme; label: string; Icon: typeof SunIcon }[] = [
  { value: 'system', label: 'System', Icon: MonitorIcon },
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon }
]

export function Settings({ theme, onThemeChange, onClose }: SettingsProps) {
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
                aria-checked={theme === value}
                className={`settings__segment${theme === value ? ' settings__segment--active' : ''}`}
                onClick={() => onThemeChange(value)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="settings__footnote">
          History is stored locally and never leaves this Mac.
        </div>
      </div>
    </div>
  )
}
