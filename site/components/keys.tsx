'use client'

import { motion } from 'motion/react'

export function KeyPress() {
  return (
    <div className="keys__stage" aria-hidden="true">
      {['⌘', '⇧', 'V'].map((k, i) => (
        <motion.span
          key={k}
          className="keycap keycap--xl"
          animate={{ y: [0, 5, 0], scale: [1, 0.97, 1] }}
          transition={{
            duration: 0.42,
            delay: i * 0.09,
            repeat: Infinity,
            repeatDelay: 2.6,
            ease: 'easeInOut'
          }}
        >
          {k}
        </motion.span>
      ))}
    </div>
  )
}
