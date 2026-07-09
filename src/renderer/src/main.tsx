import React from 'react'
import { createRoot } from 'react-dom/client'
import type { GemApi } from '../../shared/types'
import { App } from './App'
import { SettingsWindow } from './components/SettingsWindow'
import { createMockApi } from './mockApi'
import './styles.css'

// In a plain browser (renderer dev server without Electron) the preload bridge
// is absent — fall back to demo data.
const globalWindow = window as Window & { api?: GemApi }
if (!globalWindow.api) {
  globalWindow.api = createMockApi()
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Missing #root element')

// The Settings window loads the same bundle at #settings.
const isSettings = window.location.hash === '#settings'

createRoot(rootEl).render(
  <React.StrictMode>{isSettings ? <SettingsWindow /> : <App />}</React.StrictMode>
)
