import type { Metadata } from 'next'
import Link from 'next/link'
import { MAC_URL, REPO_URL, SITE_URL, WIN_URL } from '../../lib/site'

const TITLE = 'The free, open-source Paste alternative for Mac & Windows'
const DESC =
  'Looking for a free alternative to Paste (pasteapp.io)? Gem is an open-source clipboard manager for macOS and Windows with context-aware previews and pinboards — free, local, and cross-platform.'

export const metadata: Metadata = {
  title: 'Free Paste Alternative for Mac & Windows',
  description: DESC,
  keywords: [
    'Paste alternative',
    'free Paste alternative',
    'pasteapp.io alternative',
    'Paste app alternative Mac',
    'Paste for Windows',
    'free clipboard manager Mac',
    'free clipboard manager Windows',
    'open source clipboard manager'
  ],
  alternates: { canonical: '/paste-alternative' },
  openGraph: {
    type: 'article',
    url: `${SITE_URL}/paste-alternative`,
    title: TITLE,
    description: DESC
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC }
}

interface Row {
  feature: string
  gem: string | boolean
  paste: string | boolean
}

const ROWS: Row[] = [
  { feature: 'Price', gem: 'Free forever', paste: 'Paid subscription' },
  { feature: 'Open source', gem: true, paste: false },
  { feature: 'macOS', gem: true, paste: true },
  { feature: 'Windows', gem: true, paste: false },
  { feature: 'iOS / iPad', gem: false, paste: true },
  { feature: 'Context-aware previews', gem: true, paste: true },
  { feature: 'Pinboards', gem: true, paste: true },
  { feature: 'Cloud sync across devices', gem: 'Local only', paste: 'iCloud' },
  { feature: 'AI-generated titles', gem: 'Yes (your own key)', paste: false },
  { feature: 'Account required', gem: false, paste: false }
]

const PAGE_FAQ = [
  {
    q: 'Is there a free alternative to Paste?',
    a: 'Yes — Gem is a free, open-source clipboard manager for macOS and Windows. It offers the context-aware previews and pinboards people like about Paste, at no cost and with its full source on GitHub.'
  },
  {
    q: 'Does Paste work on Windows?',
    a: 'No. Paste is macOS and iOS only. If you need a Paste-style clipboard manager on Windows, Gem runs natively on Windows (and macOS) for free.'
  },
  {
    q: 'How do I switch from Paste to Gem?',
    a: 'Download Gem, move it to Applications (macOS) or run the installer (Windows), and open the panel with ⌘⇧V or Ctrl+Alt+V. Gem starts building your history from the moment it is installed — there is nothing to import.'
  },
  {
    q: 'Is Gem as good as Paste?',
    a: 'Gem covers the core of what most people use Paste for — a searchable, previewed clipboard history with pinboards — for free and on both macOS and Windows. Paste is more mature and syncs across Apple devices via iCloud; Gem keeps everything local and adds optional AI titles. Which is “better” depends on whether you value cross-platform and free (Gem) or Apple-ecosystem sync (Paste).'
  }
]

export default function PasteAlternativePage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Paste alternative',
        item: `${SITE_URL}/paste-alternative`
      }
    ]
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PAGE_FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  }

  return (
    <>
      <nav className="nav">
        <div className="shell nav__inner">
          <Link className="brand" href="/">
            <GemMark />
            Gem
          </Link>
          <div className="nav__links">
            <Link className="nav__link" href="/#how">
              How it works
            </Link>
            <Link className="nav__link" href="/#faq">
              FAQ
            </Link>
            <a className="nav__link" href={REPO_URL}>
              GitHub
            </a>
            <a className="nav__cta" href={MAC_URL}>
              Download
            </a>
          </div>
        </div>
      </nav>

      <main className="shell article">
        <p className="article__crumb">
          <Link href="/">Gem</Link> › Paste alternative
        </p>

        <div className="kicker">Paste alternative</div>
        <h1 className="article__h1">
          The free, open-source <span className="u">Paste alternative</span>
        </h1>
        <p className="article__lede">
          <a href="https://pasteapp.io">Paste</a> is a lovely macOS clipboard manager — but
          it&apos;s paid, closed-source, and Apple-only. <strong>Gem</strong> gives you the same
          idea — a searchable clipboard history where every copy is previewed in context, with
          pinboards for the snippets you reuse — <strong>free, open source, and on both macOS and
          Windows</strong>.
        </p>

        <div className="cta" style={{ justifyContent: 'flex-start', marginBottom: '2.5rem' }}>
          <a className="btn btn--primary" href={MAC_URL}>
            Download for Mac
          </a>
          <a className="btn btn--ghost" href={WIN_URL}>
            Download for Windows
          </a>
        </div>

        <h2 className="h2">Gem vs Paste</h2>
        <div className="cmp">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Gem</th>
                <th>Paste</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.feature}>
                  <th scope="row">{r.feature}</th>
                  <td>
                    <Cell value={r.gem} good />
                  </td>
                  <td>
                    <Cell value={r.paste} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="h2" style={{ marginTop: '3rem' }}>
          When Gem is the better pick
        </h2>
        <ul className="article__list">
          <li>
            You want a clipboard manager on <strong>Windows</strong> — Paste doesn&apos;t run there.
          </li>
          <li>
            You&apos;d rather not pay a subscription for something you use dozens of times a day.
          </li>
          <li>
            You care that your clipboard history stays <strong>local</strong> and that the code is
            open to inspect.
          </li>
          <li>You work across a Mac and a Windows PC and want the same tool on both.</li>
        </ul>

        <h2 className="h2" style={{ marginTop: '2.5rem' }}>
          When to stick with Paste
        </h2>
        <p className="article__lede" style={{ marginBottom: '2.5rem' }}>
          If you live entirely in the Apple ecosystem and want your clipboard to{' '}
          <strong>sync across your Mac, iPhone, and iPad via iCloud</strong>, Paste does that today
          and Gem doesn&apos;t — Gem keeps history on each device, locally. Paste is also older and
          more battle-tested. We think that&apos;s a fair trade for free, open, and cross-platform —
          but it&apos;s your call.
        </p>

        <h2 className="h2">Questions</h2>
        <div className="faq__list" style={{ marginTop: '1.5rem' }}>
          {PAGE_FAQ.map(({ q, a }) => (
            <details className="faq__item" key={q}>
              <summary className="faq__q">
                {q}
                <span className="faq__chevron" aria-hidden="true" />
              </summary>
              <p className="faq__a">{a}</p>
            </details>
          ))}
        </div>

        <div className="download__card" style={{ marginTop: '3.5rem' }}>
          <div className="kicker">Try it</div>
          <h2 className="h2" style={{ margin: '0 auto' }}>
            Free, and yours in a minute
          </h2>
          <div className="download__buttons">
            <a className="btn btn--primary" href={MAC_URL}>
              Download for Mac
            </a>
            <a className="btn btn--ghost" href={WIN_URL}>
              Download for Windows
            </a>
          </div>
          <p className="download__note">
            Open source on <a href={REPO_URL}>GitHub</a>. No account, no subscription, MIT licensed.
          </p>
        </div>
      </main>

      <footer className="footer shell">
        <span>
          MIT © {new Date().getFullYear()}{' '}
          <a href="https://rapidlaunchcode.app">Rapidlaunchcode</a>
        </span>
        <div className="footer__links">
          <Link href="/">Home</Link>
          <a href={REPO_URL}>GitHub</a>
          <a href={`${REPO_URL}/releases`}>Releases</a>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </>
  )
}

function Cell({ value, good = false }: { value: string | boolean; good?: boolean }) {
  if (value === true) return <span className={`cmp__yes${good ? ' cmp__yes--brand' : ''}`}>✓</span>
  if (value === false) return <span className="cmp__no">—</span>
  return <span>{value}</span>
}

function GemMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 1024 1024" aria-hidden="true">
      <rect width="1024" height="1024" rx="228" fill="#181310" />
      <g stroke="#fff" strokeOpacity="0.55" strokeWidth="14" strokeLinejoin="round">
        <polygon points="392,336 632,336 512,476" fill="#c9f7db" />
        <polygon points="392,336 272,476 512,476" fill="#6fe3a4" />
        <polygon points="632,336 752,476 512,476" fill="#2fbf71" />
        <polygon points="272,476 432,476 512,796" fill="#128a4f" />
        <polygon points="432,476 592,476 512,796" fill="#3ecf7d" />
        <polygon points="592,476 752,476 512,796" fill="#0c6b3c" />
      </g>
    </svg>
  )
}
