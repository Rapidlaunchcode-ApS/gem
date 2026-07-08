import type { ReactNode } from 'react'
import { ClipboardIcon, PinIcon, SettingsIcon } from './Icons'

interface OnboardingProps {
  onDone: () => void
}

const IS_MAC =
  typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')

const OPEN = IS_MAC ? '⌘⇧V' : 'Ctrl+Shift+V'
const PIN = IS_MAC ? '⌘P' : 'Ctrl+P'

const STEPS: { Icon: typeof ClipboardIcon; title: string; body: ReactNode }[] = [
  {
    Icon: ClipboardIcon,
    title: 'Everything you copy lands here',
    body: <>Code, links, images, colors and markdown each get a smart preview automatically.</>
  },
  {
    Icon: ClipboardIcon,
    title: `Press ${OPEN} to open Gem`,
    body: (
      <>
        Gem lives in your menu bar — no window, no Dock icon. Hit <kbd>{OPEN}</kbd> over any app
        to pop the panel, and <kbd>←</kbd> <kbd>→</kbd> to move between clips.
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
    body: <>Light/dark theme, how long history is kept, and optional AI titles all live in Settings.</>
  }
]

export function Onboarding({ onDone }: OnboardingProps) {
  return (
    <div className="overlay">
      <div className="onboarding">
        <div className="onboarding__hero">
          <span className="onboarding__badge" aria-hidden>
            <ClipboardIcon size={22} />
          </span>
          <div className="onboarding__title">Welcome to Gem</div>
          <div className="onboarding__tagline">Every copy, kept and understood.</div>
        </div>

        <ul className="onboarding__steps">
          {STEPS.map((step, i) => (
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
          Get started
        </button>
      </div>
    </div>
  )
}
