import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display'
})

const body = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body'
})

export const metadata: Metadata = {
  title: 'Gem — the context-aware clipboard for macOS & Windows',
  description:
    'Free, open-source clipboard manager. Every copy classified and previewed — code, markdown, links, colors, screenshots — with pinboards and optional BYOK AI titles.',
  openGraph: {
    title: 'Gem — the context-aware clipboard',
    description:
      'Free, open-source clipboard manager for macOS and Windows. Code, markdown, links, colors and screenshots — kept and understood.',
    type: 'website'
  }
}

export const viewport: Viewport = {
  themeColor: '#faf6f0'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
