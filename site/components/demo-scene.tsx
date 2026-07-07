'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

type Phase =
  | 'closed'
  | 'opening'
  | 'idle'
  | 'toTab'
  | 'clickTab'
  | 'board'
  | 'toCard'
  | 'clickCard'
  | 'selected'
  | 'closing'

const TIMELINE: [Phase, number][] = [
  ['closed', 1300],
  ['opening', 900],
  ['idle', 600],
  ['toTab', 800],
  ['clickTab', 450],
  ['board', 1000],
  ['toCard', 800],
  ['clickCard', 450],
  ['selected', 1200],
  ['closing', 700]
]

const PANEL_OPEN = ['opening', 'idle', 'toTab', 'clickTab', 'board', 'toCard', 'clickCard', 'selected']
const BOARD_MODE = ['board', 'toCard', 'clickCard', 'selected']
const AT_TAB = ['toTab', 'clickTab', 'board']
const AT_CARD = ['toCard', 'clickCard', 'selected']

interface Point {
  left: number
  top: number
  opacity: number
}

const RESTING: Point = { left: 60, top: 86, opacity: 0 }

export function DemoScene() {
  const [step, setStep] = useState(0)
  const entry = TIMELINE[step % TIMELINE.length]
  const phase: Phase = entry ? entry[0] : 'closed'

  const sceneRef = useRef<HTMLDivElement>(null)
  const regexRef = useRef<HTMLSpanElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState<Point>(RESTING)

  useEffect(() => {
    const duration = TIMELINE[step % TIMELINE.length]?.[1] ?? 1000
    const t = setTimeout(() => setStep((s) => (s + 1) % TIMELINE.length), duration)
    return () => clearTimeout(t)
  }, [step])

  const open = PANEL_OPEN.includes(phase)
  const board = BOARD_MODE.includes(phase)
  const cardSelected = phase === 'clickCard' || phase === 'selected'

  // Anchor the cursor to the real Regex pill / first card so the click always
  // lands exactly on the target, at any viewport width.
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const centerOf = (el: HTMLElement | null): Point | null => {
      if (!el) return null
      const s = scene.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      return {
        left: ((r.left + r.width / 2 - s.left) / s.width) * 100,
        top: ((r.top + r.height / 2 - s.top) / s.height) * 100,
        opacity: 1
      }
    }
    if (phase === 'closed' || phase === 'opening') {
      setCursor(RESTING)
    } else if (phase === 'idle') {
      setCursor({ left: 58, top: 78, opacity: 1 })
    } else if (AT_TAB.includes(phase)) {
      const p = centerOf(regexRef.current)
      if (p) setCursor(p)
    } else if (AT_CARD.includes(phase)) {
      // Query the live DOM rather than a ref: AnimatePresence swaps the cards,
      // and a shared ref gets nulled by the exiting card's cleanup. Skip any
      // exiting card (popLayout gives it position:absolute) and take the first
      // in-flow card.
      const cards = cardsRef.current
      const first = cards
        ? ([...cards.children] as HTMLElement[]).find(
            (c) => getComputedStyle(c).position !== 'absolute'
          )
        : null
      const p = centerOf(first ?? null)
      if (p) setCursor(p)
    } else if (phase === 'closing') {
      setCursor((c) => ({ ...c, opacity: 0 }))
    }
  }, [phase, board])

  return (
    <div className="demoscene" aria-hidden="true" ref={sceneRef}>
      {/* menu bar */}
      <div className="demoscene__menubar">
        <span></span>
        <span className="demoscene__menu-app">Finder</span>
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span className="demoscene__clock">Mon 9:41</span>
      </div>

      {/* a window sitting on the desktop behind the panel */}
      <div className="demoscene__editor">
        <div className="demoscene__editor-bar">
          <i /> <i /> <i />
        </div>
        <div className="demoscene__editor-code">
          <span style={{ color: '#ff8f8f' }}>const</span>{' '}
          <span style={{ color: '#f4efe7' }}>panel</span> ={' '}
          <span style={{ color: '#b8e28a' }}>open</span>(
          <span style={{ color: '#ffd479' }}>&apos;⌘⇧V&apos;</span>)
          <br />
          <span style={{ color: '#ff8f8f' }}>await</span>{' '}
          <span style={{ color: '#b8e28a' }}>paste</span>(panel.
          <span style={{ color: '#f4efe7' }}>pick</span>())
          <br />
          <span style={{ color: '#8a8378' }}>{'// your clipboard, kept'}</span>
        </div>
      </div>

      {/* the Gem panel — genie in / genie out */}
      <motion.div
        className="demoscene__panel"
        style={{ transformOrigin: '50% 130%' }}
        initial={false}
        animate={open ? 'open' : 'closed'}
        variants={{
          open: {
            opacity: [0.3, 1, 1, 1],
            scaleY: [0.04, 1.06, 0.97, 1],
            scaleX: [0.45, 0.94, 1.01, 1],
            y: [110, -8, 3, 0],
            transition: { duration: 0.85, times: [0, 0.55, 0.82, 1], ease: 'easeOut' }
          },
          closed: {
            opacity: 0,
            scaleY: 0.04,
            scaleX: 0.45,
            y: 110,
            transition: { duration: 0.6, ease: [0.55, 0, 0.85, 0.35] }
          }
        }}
      >
        <div className="demoscene__bar">
          <span className="demoscene__search">Search…</span>
          <span className={`tab${!board ? ' tab--active' : ''}`}>
            <span className="tab__dot" style={{ background: '#8e8e93' }} />
            Clipboard History
          </span>
          <span className={`tab${board ? ' tab--active' : ''}`} ref={regexRef}>
            <span className="tab__dot" style={{ background: '#af52de' }} />
            Regex
          </span>
          <span className="tab demoscene__tab-hide">
            <span className="tab__dot" style={{ background: '#34c759' }} />
            Email Templates
          </span>
        </div>

        <div className="demoscene__cards" ref={cardsRef}>
          <AnimatePresence mode="popLayout" initial={false}>
            {(board ? BOARD_CARDS : HISTORY_CARDS).map((card, i) => (
              <motion.div
                key={card.title}
                className="democard"
                initial={{ opacity: 0, y: 26, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: cardSelected && board && i === 0 ? 1.03 : 1,
                  boxShadow:
                    cardSelected && board && i === 0
                      ? '0 0 0 3px rgba(47, 191, 113, 0.7), 0 10px 22px rgba(28,21,16,0.18)'
                      : '0 0 0 0px rgba(47, 191, 113, 0), 0 6px 14px rgba(28,21,16,0.10)'
                }}
                exit={{ opacity: 0, y: -22, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26, delay: i * 0.05 }}
              >
                <div className="democard__head" style={{ background: card.color }}>
                  {card.title}
                </div>
                <div
                  className={`democard__body${card.dark ? ' democard__body--dark' : ''}`}
                  style={card.fill ? { background: card.fill, padding: 0 } : undefined}
                >
                  {card.body}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* cursor + click ripple */}
      <motion.div
        className="demoscene__cursor"
        initial={false}
        animate={{ left: `${cursor.left}%`, top: `${cursor.top}%`, opacity: cursor.opacity }}
        transition={{ duration: 0.75, ease: [0.3, 0.1, 0.25, 1] }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path
            d="M5 2l14 12-6.5.6L16 21l-3 1.3-3.4-6.6L5 20z"
            fill="#111"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {(phase === 'clickTab' || phase === 'clickCard') && (
          <motion.span
            key={phase}
            className="demoscene__ripple"
            initial={{ scale: 0.2, opacity: 0.55 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
      </motion.div>
    </div>
  )
}

interface DemoCard {
  title: string
  color: string
  body: React.ReactNode
  dark?: boolean
  fill?: string
}

const CODE_MINI = (
  <>
    <span style={{ color: '#ff8f8f' }}>const</span> ok ={' '}
    <span style={{ color: '#b8e28a' }}>check</span>(
    <span style={{ color: '#ffd479' }}>email</span>)
  </>
)

const HISTORY_CARDS: DemoCard[] = [
  { title: 'Code', color: '#af52de', dark: true, body: CODE_MINI },
  {
    title: 'Markdown',
    color: '#ff9f0a',
    body: (
      <>
        <strong style={{ color: 'var(--ink)' }}>Release notes</strong>
        <br />
        <span style={{ color: 'var(--green)' }}>✓</span> Pinboards
      </>
    )
  },
  {
    title: 'Link',
    color: '#34c759',
    body: (
      <>
        <strong style={{ color: 'var(--ink)' }}>github.com</strong>
        <br />
        Rapidlaunchcode/gem
      </>
    )
  },
  { title: 'Color', color: '#ff6b2c', fill: '#ff6b2c', body: <span className="hexchip">#ff6b2c</span> }
]

const BOARD_CARDS: DemoCard[] = [
  {
    title: 'Validate Email',
    color: '#af52de',
    dark: true,
    body: (
      <>
        <span style={{ color: '#ff8f8f' }}>return</span>{' '}
        <span style={{ color: '#b8e28a' }}>check</span>.test(email)
      </>
    )
  },
  {
    title: 'Extract URL',
    color: '#af52de',
    dark: true,
    body: (
      <>
        <span style={{ color: '#ff8f8f' }}>new</span>{' '}
        <span style={{ color: '#b8e28a' }}>RegExp</span>(
        <span style={{ color: '#ffd479' }}>/https?:\/\//</span>)
      </>
    )
  },
  {
    title: 'Password Strength',
    color: '#af52de',
    dark: true,
    body: (
      <>
        <span style={{ color: '#ffd479' }}>{'(?=.*[A-Z])'}</span>
        <br />
        <span style={{ color: '#ffd479' }}>{'(?=.{8,})'}</span>
      </>
    )
  },
  {
    title: 'Sort Keys',
    color: '#af52de',
    dark: true,
    body: (
      <>
        keys.<span style={{ color: '#b8e28a' }}>sort</span>()
      </>
    )
  }
]
