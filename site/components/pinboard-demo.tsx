'use client'

import { motion } from 'motion/react'

const LOOP = {
  duration: 3.4,
  repeat: Infinity,
  repeatDelay: 1.2,
  ease: 'easeInOut' as const,
  times: [0, 0.22, 0.62, 0.78, 1]
}

export function PinboardDemo() {
  return (
    <div className="boardstage" aria-hidden="true">
      <div className="boardstage__tabs">
        <span className="tab tab--active">
          <span className="tab__dot" style={{ background: '#8e8e93' }} />
          Clipboard History
        </span>
        <motion.span
          className="tab"
          style={{ padding: '0.3rem 0.75rem', borderRadius: 8 }}
          animate={{
            backgroundColor: [
              'rgba(175, 82, 222, 0)',
              'rgba(175, 82, 222, 0)',
              'rgba(175, 82, 222, 0.16)',
              'rgba(175, 82, 222, 0.28)',
              'rgba(175, 82, 222, 0)'
            ],
            scale: [1, 1, 1.04, 1.1, 1]
          }}
          transition={LOOP}
        >
          <span className="tab__dot" style={{ background: '#af52de' }} />
          Regex
        </motion.span>
        <span className="tab">
          <span className="tab__dot" style={{ background: '#34c759' }} />
          Email Templates
        </span>
      </div>

      <div className="boardstage__row">
        {/* slot the flying card returns to */}
        <motion.div
          className="minicard"
          style={{ visibility: 'hidden' }}
          aria-hidden="true"
        >
          <div className="minicard__head" style={{ background: '#af52de' }}>
            Validate Email
          </div>
          <div className="minicard__body" />
        </motion.div>
        <StaticCard title="Signature" color="#8e8e93">
          Nicklas Dupont
          <br />
          Rapidlaunchcode
        </StaticCard>
        <StaticCard title="Markdown" color="#ff9f0a">
          <strong style={{ color: 'var(--ink)' }}>Release notes</strong>
          <br />✓ Pinboards
        </StaticCard>
        <StaticCard title="Color" color="#ffd60a">
          <span
            style={{
              display: 'block',
              height: '100%',
              margin: '-0.5rem -0.6rem',
              background: '#ff6b2c'
            }}
          />
        </StaticCard>
      </div>

      {/* the card that gets dragged to the Regex board */}
      <motion.div
        className="minicard minicard--flying"
        animate={{
          x: [0, 6, 118, 128, 0],
          y: [0, -14, -52, -58, 0],
          scale: [1, 1.06, 0.72, 0.4, 1],
          opacity: [1, 1, 0.95, 0, 1],
          rotate: [0, -2, -5, -6, 0]
        }}
        transition={LOOP}
      >
        <div className="minicard__head" style={{ background: '#af52de' }}>
          Validate Email
        </div>
        <div className="minicard__body">
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>
            const check = new RegExp(…)
            <br />
            return check.test(email)
          </span>
        </div>
      </motion.div>
    </div>
  )
}

function StaticCard({
  title,
  color,
  children
}: {
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="minicard">
      <div className="minicard__head" style={{ background: color }}>
        {title}
      </div>
      <div className="minicard__body">{children}</div>
    </div>
  )
}
