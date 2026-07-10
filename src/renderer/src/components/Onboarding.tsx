import type { ReactNode } from 'react'
import { ClipboardIcon, PinIcon, SettingsIcon } from './Icons'

interface OnboardingProps {
  /** Human-readable open-panel shortcut, e.g. "⌘⇧V" or "Ctrl+Alt+V". */
  openShortcut: string
  onDone: () => void
}

const IS_MAC =
  typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')

const PIN = IS_MAC ? '⌘P' : 'Ctrl+P'

function steps(open: string): { Icon: typeof ClipboardIcon; title: string; body: ReactNode }[] {
  return [
    {
      Icon: ClipboardIcon,
      title: 'Gem lives in your menu bar',
      body: (
        <>
          There&apos;s no window and no Dock icon — look for the Gem gem in the{' '}
          {IS_MAC ? 'menu bar (top-right)' : 'system tray (bottom-right)'}. It quietly saves
          everything you copy.
        </>
      )
    },
    {
      Icon: ClipboardIcon,
      title: `Press ${open} to open it`,
      body: (
        <>
          Hit <kbd>{open}</kbd> over any app to pop the panel, then <kbd>←</kbd> <kbd>→</kbd> to
          move between clips. You can change this shortcut anytime in Settings.
        </>
      )
    },
    {
      Icon: PinIcon,
      title: 'Paste it back, or keep it forever',
      body: (
        <>
          Press <kbd>↵</kbd> to paste the selected clip into the app you came from. Pin with{' '}
          <kbd>{PIN}</kbd> or drag onto a pinboard to keep it for good.
        </>
      )
    },
    {
      Icon: SettingsIcon,
      title: 'Make it yours',
      body: (
        <>
          Theme, how long history is kept, the shortcut, and optional AI titles all live in
          Settings.
        </>
      )
    }
  ]
}

export function Onboarding({ openShortcut, onDone }: OnboardingProps) {
  return (
    <div className="onboarding-win">
      <div className="onboarding">
        <div className="onboarding__hero">
          <span className="onboarding__badge" aria-hidden>
            <ClipboardIcon size={22} />
          </span>
          <div className="onboarding__title">Welcome to Gem</div>
          <div className="onboarding__tagline">Every copy, kept and understood.</div>
        </div>

        <ul className="onboarding__steps">
          {steps(openShortcut).map((step, i) => (
            <li key={i} className="onboarding__step">
              <span className="onboarding__step-icon" aria-hidden>
                <step.Icon size={16} />
              </span>
              <div>
                <div className="onboarding__step-title">{step.title}</div>
                <div className="onboarding__step-body">{step.body}</div>
              </div>
            </li>
          ))}
        </ul>

        <button className="onboarding__cta" onClick={onDone} autoFocus>
          Open Gem now
        </button>
      </div>
    </div>
  )
}
