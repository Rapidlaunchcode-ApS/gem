'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
}

export function FadeIn({ children, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.65, 0.32, 1] }}
    >
      {children}
    </motion.div>
  )
}
