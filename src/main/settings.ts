import { app, nativeTheme } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { settingsSchema, type Settings, type Theme } from '../shared/types'

export class SettingsStore {
  private settings: Settings = { theme: 'system' }
  private readonly filePath: string

  constructor() {
    this.filePath = join(app.getPath('userData'), 'settings.json')
    if (existsSync(this.filePath)) {
      try {
        this.settings = settingsSchema.parse(JSON.parse(readFileSync(this.filePath, 'utf8')))
      } catch {
        // Fall back to defaults on a corrupt file.
      }
    }
    this.applyTheme()
  }

  get(): Settings {
    return this.settings
  }

  setTheme(theme: Theme): void {
    this.settings = { ...this.settings, theme }
    this.applyTheme()
    try {
      writeFileSync(this.filePath, JSON.stringify(this.settings))
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  private applyTheme(): void {
    // Drives both the window vibrancy material and prefers-color-scheme in the renderer.
    nativeTheme.themeSource = this.settings.theme
  }
}
