'use client'

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useRef, useState } from 'react'

const STEPS = [
  {
    key: 'code',
    title: 'Code with syntax highlighting',
    caption: 'Language auto-detected, syntax colored, long lines wrapped. Snippets stay legible.'
  },
  {
    key: 'link',
    title: 'Links as rich cards',
    caption: 'The hostname up front, the full URL preserved. No more mystery strings.'
  },
  {
    key: 'color',
    title: 'Color hex-code swatches',
    caption: 'Copy #hex, rgb() or hsl() and you see the swatch, not the string.'
  },
  {
    key: 'shot',
    title: 'Screenshot thumbnails',
    caption: 'Image and screenshot previews in the panel, originals kept at full quality.'
  }
]

export function Scrolly() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end']
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.max(0, Math.min(STEPS.length - 1, Math.floor(v * STEPS.length))))
  })

  return (
    <section className="scrolly" id="how">
      <div className="scrolly__track" ref={trackRef}>
        <div className="scrolly__viewport">
          <div className="shell" style={{ width: '100%' }}>
            <div className="scrolly__grid">
              <div>
                <div className="kicker">Context-aware previews</div>
                <h2 className="h2" style={{ marginBottom: '1.6rem' }}>
                  A clipboard history that previews what you copied
                </h2>
                <div className="scrolly__steps">
                  {STEPS.map((step, i) => (
                    <div
                      key={step.key}
                      className={`scrolly__step${i === active ? ' scrolly__step--on' : ''}`}
                      style={{ opacity: i === active ? 1 : 0.45 }}
                    >
                      <h3>{step.title}</h3>
                      <p>{step.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="scrolly__card-wrap">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 60, rotate: 2.5 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, y: -60, rotate: -2.5 }}
                    transition={{ type: 'spring', stiffness: 190, damping: 24 }}
                  >
                    {active === 0 && <CodeCard />}
                    {active === 1 && <LinkCard />}
                    {active === 2 && <ColorCard />}
                    {active === 3 && <ShotCard />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Line({ children, i }: { children: React.ReactNode; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + i * 0.14 }}
    >
      {children}
    </motion.div>
  )
}

function CodeCard() {
  return (
    <div className="bigcard">
      <div className="bigcard__head" style={{ background: '#af52de' }}>
        <span>Code · typescript</span>
        <span>◇</span>
      </div>
      <div className="bigcard__body bigcard__body--code">
        <Line i={0}>
          <span className="tok-k">const</span> check = <span className="tok-k">new</span>{' '}
          <span className="tok-f">RegExp</span>(<span className="tok-s">{'/^[^\\s@]+@/'}</span>)
        </Line>
        <Line i={1}>&nbsp;</Line>
        <Line i={2}>
          <span className="tok-k">function</span> <span className="tok-f">validate</span>(email:{' '}
          <span className="tok-s">string</span>) {'{'}
        </Line>
        <Line i={3}>
          {'  '}
          <span className="tok-k">return</span> check.<span className="tok-f">test</span>(email)
        </Line>
        <Line i={4}>{'}'}</Line>
      </div>
      <div className="bigcard__foot">
        <span>just now</span>
        <span>132 characters</span>
      </div>
    </div>
  )
}

function LinkCard() {
  return (
    <div className="bigcard">
      <div className="bigcard__head" style={{ background: '#34c759' }}>
        <span>Link</span>
        <span>◇</span>
      </div>
      <div className="bigcard__body linkbody">
        <motion.span
          className="linkbody__badge"
          style={{ width: 56, height: 56 }}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.25 }}
        >
          <svg
            width="26"
            height="26"
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
        </motion.span>
        <motion.span
          className="linkbody__host"
          style={{ fontSize: '1.25rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          rapidlaunchcode.app
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          https://rapidlaunchcode.app/work
        </motion.span>
      </div>
      <div className="bigcard__foot">
        <span>2m ago</span>
        <span>34 characters</span>
      </div>
    </div>
  )
}

function ColorCard() {
  return (
    <div className="bigcard">
      <div className="bigcard__head" style={{ background: '#ff6b2c' }}>
        <span>Color</span>
        <span>◇</span>
      </div>
      <div className="bigcard__body bigcard__body--fill" style={{ position: 'relative' }}>
        <motion.div
          style={{ position: 'absolute', inset: 0, background: '#ff6b2c', originY: 1 }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.21, 0.65, 0.32, 1] }}
        />
        <motion.span
          className="hexchip"
          style={{ position: 'relative', fontSize: '1.1rem' }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          #ff6b2c
        </motion.span>
      </div>
      <div className="bigcard__foot">
        <span>5m ago</span>
        <span>7 characters</span>
      </div>
    </div>
  )
}

function ShotCard() {
  return (
    <div className="bigcard">
      <div className="bigcard__head" style={{ background: '#ff375f' }}>
        <span>Image</span>
        <span>◇</span>
      </div>
      <div className="bigcard__body bigcard__body--fill">
        <div className="shotgrid">
          <motion.div
            className="shotgrid__img"
            initial={{ scale: 0.55, rotate: -7, opacity: 0 }}
            animate={{ scale: 1, rotate: -2, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.25 }}
          />
        </div>
      </div>
      <div className="bigcard__foot">
        <span>8m ago</span>
        <span>2940×1912</span>
      </div>
    </div>
  )
}
