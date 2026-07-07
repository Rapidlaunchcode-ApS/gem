import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gem — the context-aware clipboard for macOS',
  description:
    'Free, open-source clipboard manager for macOS. Every copy classified and previewed — code, markdown, links, colors, screenshots — with pinboards and optional BYOK AI titles.',
  openGraph: {
    title: 'Gem — the context-aware clipboard for macOS',
    description:
      'Free, open-source clipboard manager for macOS. Code, markdown, links, colors and screenshots — kept and understood.',
    type: 'website'
  }
}

export const viewport: Viewport = {
  themeColor: '#0a0918'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
