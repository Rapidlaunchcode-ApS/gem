import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import { DESCRIPTION, FAQ, MAC_URL, REPO_URL, SITE_URL, VERSION } from '../lib/site'
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Gem — Free Open-Source Clipboard Manager for Mac & Windows',
    template: '%s · Gem'
  },
  description: DESCRIPTION,
  applicationName: 'Gem',
  keywords: [
    'clipboard manager',
    'best free clipboard manager',
    'best clipboard manager for Mac',
    'best clipboard manager for Windows',
    'free clipboard manager Mac',
    'free clipboard manager Windows',
    'clipboard history',
    'Paste alternative',
    'free Paste alternative',
    'pasteapp.io alternative',
    'open source clipboard manager',
    'pinboards',
    'macOS clipboard',
    'context-aware clipboard'
  ],
  authors: [{ name: 'Rapidlaunchcode', url: 'https://rapidlaunchcode.app' }],
  creator: 'Rapidlaunchcode',
  publisher: 'Rapidlaunchcode',
  category: 'productivity',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
  },
  openGraph: {
    type: 'website',
    siteName: 'Gem',
    url: SITE_URL,
    title: 'Gem — Free Open-Source Clipboard Manager for Mac & Windows',
    description: DESCRIPTION,
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gem — Free Open-Source Clipboard Manager for Mac & Windows',
    description: DESCRIPTION
  }
}

export const viewport: Viewport = {
  themeColor: '#faf6f0'
}

const softwareLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Gem',
  description: DESCRIPTION,
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'macOS, Windows',
  softwareVersion: VERSION,
  url: SITE_URL,
  downloadUrl: MAC_URL,
  softwareHelp: REPO_URL,
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: {
    '@type': 'Organization',
    name: 'Rapidlaunchcode',
    url: 'https://rapidlaunchcode.app'
  },
  featureList: [
    'Context-aware previews for code, markdown, links, colors and images',
    'Pinboards for reusable snippets',
    'Keyboard-first panel (⌘⇧V / Ctrl+Alt+V)',
    'Local-only history with configurable retention',
    'Optional bring-your-own-key AI titles (OpenAI, Gemini, Anthropic)'
  ]
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a }
  }))
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      </body>
    </html>
  )
}
