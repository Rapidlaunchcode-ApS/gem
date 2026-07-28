'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

const spring = { type: 'spring' as const, stiffness: 260, damping: 24 }

/** How many cards the strip shows at once — the grid is four columns wide. */
const VISIBLE = 4
/** Gap between simulated copies. Slow enough to read, quick enough to notice. */
const ARRIVE_EVERY_MS = 5200

interface Card {
  key: string
  title: string
  color: string
  meta: string
  body: ReactNode
}

interface Entry {
  /** Unique per arrival — the same card can come back around the rotation. */
  id: number
  card: Card
  /** Epoch ms, or null until the client has mounted (see below). */
  at: number | null
}

/** Mirrors the app's own timeAgo() in src/renderer/src/kinds.ts. */
function ago(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000))
  if (s < 10) return 'now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.round(m / 60)}h ago`
}

export function HeroPanel() {
  // Seeded with real cards but no timestamps: Date.now() during SSR would differ
  // from the client's value and React would flag a hydration mismatch. The markup
  // is identical on both sides; only the time text fills in after mount.
  const [entries, setEntries] = useState<Entry[]>(() =>
    POOL.slice(0, VISIBLE).map((card, i) => ({ id: i, card, at: null }))
  )
  const [now, setNow] = useState(0)
  const nextId = useRef(VISIBLE)
  const nextCard = useRef(VISIBLE % POOL.length)

  // Backdate the seed cards so the strip opens looking lived-in rather than as
  // four things copied in the same instant.
  useEffect(() => {
    const t0 = Date.now()
    setNow(t0)
    setEntries((prev) =>
      prev.map((e, i) => ({ ...e, at: t0 - (12 + i * 78) * 1000 }))
    )
  }, [])

  // Age the labels.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // A new copy lands every few seconds; the oldest falls off the end.
  useEffect(() => {
    const t = setInterval(() => {
      // Advance the rotation OUTSIDE the updater — React double-invokes updaters
      // in development, so mutating a ref inside one skips a card every tick.
      const card = POOL[nextCard.current % POOL.length]
      if (!card) return
      nextCard.current += 1
      const entry: Entry = { id: nextId.current, card, at: Date.now() }
      nextId.current += 1
      setEntries((prev) => [entry, ...prev].slice(0, VISIBLE))
    }, ARRIVE_EVERY_MS)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="stage">
      <motion.div
        className="keyfloat"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, ...spring }}
        aria-hidden="true"
      >
        {['⌘', '⇧', 'V'].map((k, i) => (
          <motion.span
            key={k}
            className="keycap"
            animate={{ y: [0, 3, 0] }}
            transition={{
              duration: 0.5,
              delay: 1.4 + i * 0.12,
              repeat: Infinity,
              repeatDelay: 3.2,
              ease: 'easeInOut'
            }}
          >
            {k}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        className="panelmock"
        initial={{ opacity: 0, y: 46 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7, ease: [0.21, 0.65, 0.32, 1] }}
      >
        <div className="panelmock__bar">
          <span className="panelmock__search">Type to search…</span>
          <span className="tab tab--active">
            <span className="tab__dot" style={{ background: '#8e8e93' }} />
            Clipboard History
          </span>
          <span className="tab">
            <span className="tab__dot" style={{ background: '#af52de' }} />
            Regex
          </span>
          <span className="tab">
            <span className="tab__dot" style={{ background: '#34c759' }} />
            Email Templates
          </span>
        </div>
        <div className="panelmock__cards">
          {/* popLayout so the outgoing card leaves the grid flow and the rest
              slide across to meet the arrival. It needs a positioned container —
              see .panelmock__cards. */}
          <AnimatePresence mode="popLayout" initial={false}>
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                layout
                className="clipcard"
                initial={{ opacity: 0, y: 34, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.22 } }}
                transition={{ delay: entry.at === null ? 0.55 + i * 0.11 : 0, ...spring }}
                whileHover={{ y: -5 }}
              >
                <div className="clipcard__head" style={{ background: entry.card.color }}>
                  {entry.card.title}
                </div>
                {entry.card.body}
                <div className="clipcard__foot">
                  <span>{entry.at === null ? '' : ago(entry.at, now)}</span>
                  <span>{entry.card.meta}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

const POOL: Card[] = [
  {
    key: 'code',
    title: 'Validate Email',
    color: '#af52de',
    meta: '132 characters',
    body: (
      <div className="clipcard__body clipcard__body--code">
        <span className="tok-k">const</span> ok = <span className="tok-f">check</span>(
        <span className="tok-s">email</span>)
        {'\n\n'}
        <span className="tok-k">return</span> ok
        {'\n  '}? <span className="tok-f">save</span>()
        {'\n  '}: <span className="tok-f">warn</span>()
      </div>
    )
  },
  {
    key: 'md',
    title: 'Markdown',
    color: '#ff9f0a',
    meta: '3 items',
    body: (
      <div className="clipcard__body">
        <div className="mdtitle">Release notes</div>
        <div>
          <span className="mdcheck">✓</span>Clipboard watcher
        </div>
        <div>
          <span className="mdcheck">✓</span>Smart previews
        </div>
        <div>
          <span className="mdcheck">✓</span>Pinboards
        </div>
      </div>
    )
  },
  {
    key: 'link',
    title: 'Link',
    color: '#34c759',
    meta: 'github.com',
    body: (
      <div className="clipcard__body linkbody">
        <span className="linkbody__badge">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.33-1.33" />
          </svg>
        </span>
        <span className="linkbody__host">github.com</span>
        <span>Rapidlaunchcode-ApS/gem</span>
      </div>
    )
  },
  {
    key: 'color',
    title: 'Color',
    color: '#ff6b2c',
    meta: 'HEX',
    body: (
      <div className="clipcard__body clipcard__body--fill" style={{ background: '#ff6b2c' }}>
        <span className="hexchip">#ff6b2c</span>
      </div>
    )
  },
  {
    key: 'image',
    title: 'Image',
    color: '#0f9b8e',
    meta: '1676×678',
    body: (
      <div className="clipcard__body clipcard__body--shot" aria-hidden="true">
        <span className="shot__bar" />
        <span className="shot__line shot__line--wide" />
        <span className="shot__line" />
        <span className="shot__line shot__line--short" />
      </div>
    )
  },
  {
    key: 'shell',
    title: 'Deploy command',
    color: '#af52de',
    meta: '48 characters',
    body: (
      <div className="clipcard__body clipcard__body--code">
        <span className="tok-f">pnpm</span> build
        {'\n'}
        <span className="tok-f">pnpm</span> dist --mac
        {'\n\n'}
        <span className="tok-s"># ships universal</span>
      </div>
    )
  },
  {
    key: 'text',
    title: 'Signature',
    color: '#8e8e93',
    meta: '79 characters',
    body: (
      <div className="clipcard__body">
        Sam Okafor
        <br />
        Support, Acme Co.
        <br />
        <br />
        sam@example.com
      </div>
    )
  },
  {
    key: 'link-docs',
    title: 'Link',
    color: '#34c759',
    meta: 'gemclipboard.app',
    body: (
      <div className="clipcard__body linkbody">
        <span className="linkbody__badge">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.33-1.33" />
          </svg>
        </span>
        <span className="linkbody__host">gemclipboard.app</span>
        <span>/paste-alternative</span>
      </div>
    )
  },
  {
    key: 'color-emerald',
    title: 'Color',
    color: '#12a45c',
    meta: 'HEX',
    body: (
      <div className="clipcard__body clipcard__body--fill" style={{ background: '#12a45c' }}>
        <span className="hexchip">#12a45c</span>
      </div>
    )
  },
  {
    key: 'text-note',
    title: 'Reply template',
    color: '#8e8e93',
    meta: '164 characters',
    body: (
      <div className="clipcard__body">
        Thanks for the report — I can reproduce it. Fix is going out in the next
        release; I&apos;ll follow up here when it ships.
      </div>
    )
  }
]
