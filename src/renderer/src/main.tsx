import React from 'react'
import { createRoot } from 'react-dom/client'
import type { GemApi } from '../../shared/types'
import { App } from './App'
import { OnboardingWindow } from './components/OnboardingWindow'
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

// The Settings and onboarding windows load the same bundle at their own hashes.
const hash = window.location.hash

function Root(): React.ReactElement {
  if (hash === '#settings') return <SettingsWindow />
  if (hash === '#onboarding') return <OnboardingWindow />
  return <App />
}

createRoot(rootEl).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
