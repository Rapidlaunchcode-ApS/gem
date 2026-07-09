'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

// Mobile-native "pop up, grab, gone": the Gem panel genies up from the bottom
// over a bit of content, a clip lights up, and it warps away. Portrait, not a
// shrunk desktop scene.
const STEPS: [string, number][] = [
  ['closed', 700],
  ['open', 1000],
  ['pick', 1600],
  ['close', 600]
]

interface MCard {
  title: string
  color: string
  body: React.ReactNode
  dark?: boolean
  fill?: string
}

const MCARDS: MCard[] = [
  {
    title: 'Code',
    color: '#af52de',
    dark: true,
    body: (
      <>
        <span style={{ color: '#ff8f8f' }}>const</span> ok
      </>
    )
  },
  {
    title: 'Link',
    color: '#34c759',
    body: (
      <>
        <strong style={{ color: 'var(--ink)' }}>github.com</strong>
      </>
    )
  },
  { title: 'Color', color: '#ff6b2c', fill: '#ff6b2c', body: <span className="hexchip">#ff6b2c</span> }
]

export function DemoMobile() {
  const [i, setI] = useState(0)
  const phase = STEPS[i % STEPS.length]?.[0] ?? 'closed'

  useEffect(() => {
    const d = STEPS[i % STEPS.length]?.[1] ?? 1000
    const t = setTimeout(() => setI((s) => s + 1), d)
    return () => clearTimeout(t)
  }, [i])

  const open = phase === 'open' || phase === 'pick'
  const picked = phase === 'pick'

  return (
    <div className="demomobile" aria-hidden="true">
      <div className="demomobile__content">
        <div className="demomobile__dots">
          <i /> <i /> <i />
        </div>
        <div className="demomobile__code">
          <span style={{ color: '#ff8f8f' }}>const</span>{' '}
          <span style={{ color: '#f4efe7' }}>panel</span> ={' '}
          <span style={{ color: '#b8e28a' }}>open</span>(
          <span style={{ color: '#ffd479' }}>&apos;⌘⇧V&apos;</span>)
          <br />
          <span style={{ color: '#8a8378' }}>{'// your clipboard, kept'}</span>
        </div>
      </div>

      <motion.div
        className="demomobile__keys"
        animate={{ opacity: phase === 'closed' ? [0.4, 1, 0.4] : 0 }}
        transition={{ duration: 1.2, repeat: phase === 'closed' ? Infinity : 0 }}
      >
        <span>⌘</span>
        <span>⇧</span>
        <span>V</span>
      </motion.div>

      <motion.div
        className="demomobile__panel"
        style={{ transformOrigin: '50% 120%' }}
        initial={false}
        animate={open ? 'open' : 'closed'}
        variants={{
          open: {
            opacity: [0.3, 1, 1, 1],
            scaleY: [0.06, 1.05, 0.98, 1],
            scaleX: [0.5, 0.96, 1.01, 1],
            y: [130, -6, 3, 0],
            transition: { duration: 0.72, times: [0, 0.55, 0.82, 1], ease: 'easeOut' }
          },
          closed: {
            opacity: 0,
            scaleY: 0.06,
            scaleX: 0.5,
            y: 130,
            transition: { duration: 0.58, ease: [0.55, 0, 0.85, 0.35] }
          }
        }}
      >
        <div className="demomobile__bar">
          <span className="demomobile__search">Search…</span>
          <span className="demomobile__tab">
            <span className="pinmobile__dot" style={{ background: '#8e8e93' }} />
            History
          </span>
        </div>
        <div className="demomobile__cards">
          {MCARDS.map((c, idx) => (
            <motion.div
              key={c.title}
              className="demomobile__card"
              animate={{
                scale: picked && idx === 0 ? 1.04 : 1,
                boxShadow:
                  picked && idx === 0
                    ? '0 0 0 3px rgba(47, 191, 113, 0.8), 0 8px 18px rgba(28,21,16,0.16)'
                    : '0 0 0 0px rgba(47, 191, 113, 0), 0 5px 12px rgba(28,21,16,0.1)'
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <div className="demomobile__cardhead" style={{ background: c.color }}>
                {c.title}
              </div>
              <div
                className={`demomobile__cardbody${c.dark ? ' demomobile__cardbody--dark' : ''}`}
                style={c.fill ? { background: c.fill, padding: 0 } : undefined}
              >
                {c.body}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
