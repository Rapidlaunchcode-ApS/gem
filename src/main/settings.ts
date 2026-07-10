import { app, nativeTheme, safeStorage } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  DEFAULT_SHORTCUT_MAC,
  DEFAULT_SHORTCUT_WIN,
  resolveModel,
  settingsFileSchema,
  type AiProvider,
  type AiUpdate,
  type SettingsFile,
  type SettingsView,
  type Theme
} from '../shared/types'

const PLAIN_PREFIX = 'plain:'
const DEFAULT_SHORTCUT =
  process.platform === 'darwin' ? DEFAULT_SHORTCUT_MAC : DEFAULT_SHORTCUT_WIN

export class SettingsStore {
  private settings: SettingsFile
  private readonly filePath: string

  constructor() {
    this.filePath = join(app.getPath('userData'), 'settings.json')
    let raw: unknown = {}
    if (existsSync(this.filePath)) {
      try {
        raw = JSON.parse(readFileSync(this.filePath, 'utf8'))
      } catch {
        // Corrupt file — fall through to schema defaults.
      }
    }
    this.settings = settingsFileSchema.parse(raw)
    this.applyTheme()
  }

  view(): SettingsView {
    const key = this.aiKey()
    return {
      theme: this.settings.theme,
      retentionDays: this.settings.retentionDays,
      shortcut: this.shortcut(),
      ai: {
        enabled: this.settings.ai.enabled,
        provider: this.settings.ai.provider,
        hasKey: this.settings.ai.encryptedKey.length > 0,
        keyHint: key ? `${key.slice(0, 6)}••••••` : '',
        model: this.aiModel()
      }
    }
  }

  /** The resolved global open-panel shortcut (platform default if unset). */
  shortcut(): string {
    return this.settings.shortcut || DEFAULT_SHORTCUT
  }

  setShortcut(accel: string): void {
    this.settings = { ...this.settings, shortcut: accel }
    this.save()
  }

  /** The resolved model id for the active provider (cheapest default if unset). */
  aiModel(): string {
    return resolveModel(this.settings.ai.provider, this.settings.ai.model)
  }

  retentionDays(): number {
    return this.settings.retentionDays
  }

  aiEnabled(): boolean {
    return this.settings.ai.enabled && this.settings.ai.encryptedKey.length > 0
  }

  aiProvider(): AiProvider {
    return this.settings.ai.provider
  }

  aiKey(): string | null {
    const stored = this.settings.ai.encryptedKey
    if (stored.length === 0) return null
    try {
      if (stored.startsWith(PLAIN_PREFIX)) {
        return Buffer.from(stored.slice(PLAIN_PREFIX.length), 'base64').toString('utf8')
      }
      return safeStorage.decryptString(Buffer.from(stored, 'base64'))
    } catch (err) {
      console.error('Failed to decrypt API key:', err)
      return null
    }
  }

  setTheme(theme: Theme): void {
    this.settings = { ...this.settings, theme }
    this.applyTheme()
    this.save()
  }

  setRetentionDays(days: number): void {
    this.settings = { ...this.settings, retentionDays: Math.max(0, Math.floor(days)) }
    this.save()
  }

  setAi(update: AiUpdate): void {
    let encryptedKey = this.settings.ai.encryptedKey
    if (update.apiKey !== undefined) {
      const key = update.apiKey.trim()
      if (key.length === 0) {
        encryptedKey = ''
      } else if (safeStorage.isEncryptionAvailable()) {
        encryptedKey = safeStorage.encryptString(key).toString('base64')
      } else {
        encryptedKey = PLAIN_PREFIX + Buffer.from(key, 'utf8').toString('base64')
      }
    }
    // Switching provider resets the model to that provider's cheapest default
    // ("" resolves to the default); an explicit model choice always wins.
    let model = update.provider === this.settings.ai.provider ? this.settings.ai.model : ''
    if (update.model !== undefined) model = update.model
    this.settings = {
      ...this.settings,
      ai: { enabled: update.enabled, provider: update.provider, encryptedKey, model }
    }
    this.save()
  }

  private applyTheme(): void {
    // Drives both the window vibrancy material and prefers-color-scheme in the renderer.
    nativeTheme.themeSource = this.settings.theme
  }

  private save(): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.settings))
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }
}
