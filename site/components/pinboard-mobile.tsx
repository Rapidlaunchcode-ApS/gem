'use client'

import { motion } from 'motion/react'

// A mobile-native pinboard demo: a vertical stack of full-width cards with the
// top card flying up into the "Regex" board pill. Not a shrunk desktop board.
const LOOP = {
  duration: 3.8,
  repeat: Infinity,
  repeatDelay: 1.4,
  ease: 'easeInOut' as const,
  times: [0, 0.14, 0.42, 0.52, 0.68]
}

export function PinboardMobile() {
  return (
    <div className="pinmobile" aria-hidden="true">
      <div className="pinmobile__tabs">
        <span className="pinmobile__tab pinmobile__tab--active">
          <span className="pinmobile__dot" style={{ background: '#8e8e93' }} />
          History
        </span>
        <motion.span
          className="pinmobile__tab"
          animate={{
            backgroundColor: [
              'rgba(175, 82, 222, 0)',
              'rgba(175, 82, 222, 0)',
              'rgba(175, 82, 222, 0.18)',
              'rgba(175, 82, 222, 0.3)',
              'rgba(175, 82, 222, 0)'
            ],
            scale: [1, 1, 1.06, 1.12, 1]
          }}
          transition={LOOP}
        >
          <span className="pinmobile__dot" style={{ background: '#af52de' }} />
          Regex
        </motion.span>
        <span className="pinmobile__tab">
          <span className="pinmobile__dot" style={{ background: '#34c759' }} />
          Emails
        </span>
      </div>

      <div className="pinmobile__stack">
        <motion.div
          className="pinmobile__card pinmobile__card--fly"
          animate={{
            y: [0, -6, -132, -146, 0],
            x: [0, 2, 26, 36, 0],
            scale: [1, 1.04, 0.46, 0.3, 1],
            opacity: [1, 1, 0.9, 0, 1],
            rotate: [0, -1, -6, -8, 0]
          }}
          transition={LOOP}
        >
          <div className="pinmobile__head" style={{ background: '#af52de' }}>
            Validate Email
          </div>
          <div className="pinmobile__body pinmobile__body--code">
            const check = new RegExp(…)
            <br />
            return check.test(email)
          </div>
        </motion.div>

        <div className="pinmobile__card">
          <div className="pinmobile__head" style={{ background: '#8e8e93' }}>
            Signature
          </div>
          <div className="pinmobile__body">
            Nicklas Dupont
            <br />
            Rapidlaunchcode
          </div>
        </div>

        <div className="pinmobile__card">
          <div className="pinmobile__head" style={{ background: '#ff9f0a' }}>
            Markdown
          </div>
          <div className="pinmobile__body">
            <strong style={{ color: 'var(--ink)' }}>Release notes</strong>
            <br />
            <span style={{ color: 'var(--green)' }}>✓</span> Pinboards
          </div>
        </div>
      </div>

      <p className="pinmobile__hint">Drag a clip onto a board — it&apos;s kept for good.</p>
    </div>
  )
}
