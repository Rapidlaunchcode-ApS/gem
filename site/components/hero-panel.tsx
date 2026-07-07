'use client'

import { motion } from 'motion/react'

const spring = { type: 'spring' as const, stiffness: 260, damping: 24 }

export function HeroPanel() {
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
          {CARDS.map((card, i) => (
            <motion.div
              key={card.key}
              className="clipcard"
              initial={{ opacity: 0, y: 34, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.55 + i * 0.11, ...spring }}
              whileHover={{ y: -5 }}
            >
              <div className="clipcard__head" style={{ background: card.color }}>
                {card.title}
              </div>
              {card.body}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

const CARDS = [
  {
    key: 'code',
    title: 'Validate Email',
    color: '#af52de',
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
    body: (
      <div className="clipcard__body clipcard__body--fill" style={{ background: '#ff6b2c' }}>
        <span className="hexchip">#ff6b2c</span>
      </div>
    )
  }
]
