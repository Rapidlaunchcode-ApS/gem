import { useCallback, useEffect, useState } from 'react'
import { shortcutLabel, type SettingsView } from '../../../shared/types'
import { Onboarding } from './Onboarding'

const IS_MAC =
  typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')

/** Root of the standalone onboarding window (renderer at #onboarding). */
export function OnboardingWindow() {
  const [shortcut, setShortcut] = useState('')

  useEffect(() => {
    void window.api.getSettings().then((s: SettingsView) => {
      setShortcut(s.shortcut)
      if (s.theme === 'system') delete document.documentElement.dataset['theme']
      else document.documentElement.dataset['theme'] = s.theme
    })
  }, [])

  // "Open Gem now": close onboarding, then reveal the panel so the shortcut's
  // effect is immediately visible.
  const done = useCallback(() => {
    void window.api.closeOnboarding()
    void window.api.openPanel()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') void window.api.closeOnboarding()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return <Onboarding openShortcut={shortcutLabel(shortcut, IS_MAC)} onDone={done} />
}
