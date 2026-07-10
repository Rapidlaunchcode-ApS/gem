import Link from 'next/link'
import { DemoMobile } from '../components/demo-mobile'
import { DemoScene } from '../components/demo-scene'
import { FadeIn } from '../components/fade-in'
import { HeroPanel } from '../components/hero-panel'
import { KeyPress } from '../components/keys'
import { PinboardDemo } from '../components/pinboard-demo'
import { PinboardMobile } from '../components/pinboard-mobile'
import { Scrolly } from '../components/scrolly'
import { Stats } from '../components/stats'
import { FAQ, MAC_URL, REPO_URL, WIN_URL } from '../lib/site'
import { getRepoStats } from '../lib/stats'

export default async function Page() {
  const stats = await getRepoStats()
  return (
    <>
      <nav className="nav">
        <div className="shell nav__inner">
          <a className="brand" href="#">
            <GemMark />
            Gem
          </a>
          <div className="nav__links">
            <a className="nav__link" href="#how">
              How it works
            </a>
            <a className="nav__link" href="#trust">
              Privacy
            </a>
            <a className="nav__link" href="#faq">
              FAQ
            </a>
            <a className="nav__link" href={REPO_URL}>
              GitHub
            </a>
            <a className="nav__cta" href="#download">
              Download
            </a>
          </div>
        </div>
      </nav>

      <main>
        <header className="hero shell">
          <FadeIn>
            <p className="hero__eyebrow">
              <span className="hero__free">Free forever</span>
              <span className="hero__sep" aria-hidden="true" />
              Open source
              <span className="hero__sep" aria-hidden="true" />
              Mac &amp; Windows
            </p>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1>
              Every copy, <span className="u">kept</span> and{' '}
              <span className="u">understood</span>.
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="hero__lede">
              Gem watches your clipboard and turns every copy into something you can actually see —
              highlighted code, rendered markdown, link cards, color swatches, screenshot
              thumbnails.
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="cta">
              <a className="btn btn--primary" href={MAC_URL}>
                <AppleIcon />
                Download for Mac
              </a>
              <a className="btn btn--ghost" href={WIN_URL}>
                <WindowsIcon />
                Download for Windows
              </a>
            </div>
            <p className="hero__fineprint">
              No account. No subscription. MIT licensed.
              <br />
              Switching from Paste?{' '}
              <Link className="hero__inlinelink" href="/paste-alternative">
                See how Gem compares →
              </Link>
            </p>
            <Stats stats={stats} />
          </FadeIn>
          <HeroPanel />
        </header>

        <Scrolly />

        <section className="demo shell" id="demo">
          <FadeIn>
            <div className="kicker">In action</div>
            <h2 className="h2">Pop up. Grab. Gone.</h2>
            <p className="section-lede">
              One shortcut over whatever you&apos;re doing, pick a clip, and it warps away —
              exactly like it never left your keyboard.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <DemoScene />
            <DemoMobile />
          </FadeIn>
        </section>

        <section className="pinboards shell">
          <div className="split">
            <FadeIn>
              <div>
                <div className="kicker">Pinboards</div>
                <h2 className="h2">Keep the ones you reuse</h2>
                <p className="section-lede">
                  Drag a card onto a board and it&apos;s saved for good — regexes, signatures,
                  answers to the same five emails. Boards live as tabs, one keystroke away, and
                  never expire.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <PinboardDemo />
              <PinboardMobile />
            </FadeIn>
          </div>
        </section>

        <section className="keys">
          <div className="shell" style={{ textAlign: 'center' }}>
            <FadeIn>
              <div className="kicker">Keyboard-first</div>
              <h2 className="h2" style={{ margin: '0 auto' }}>
                Your hands never leave the keys
              </h2>
            </FadeIn>
            <KeyPress />
            <div className="keys__hintrow">
              <span>
                <kbd>↵</kbd> paste into the app you came from
              </span>
              <span>
                <kbd>Space</kbd> quick-look
              </span>
              <span>
                <kbd>⇥</kbd> switch boards
              </span>
              <span>
                <kbd>Esc</kbd> gone
              </span>
            </div>
            <p className="keys__note">⌘⇧V on Mac · Ctrl+Alt+V on Windows</p>
          </div>
        </section>

        <section className="trust shell" id="trust">
          <FadeIn>
            <div className="kicker">Boring on purpose</div>
            <h2 className="h2">Your clipboard is none of our business</h2>
          </FadeIn>
          <div className="trust__rows">
            <FadeIn>
              <div className="trust__row">
                <h3>Local-only history</h3>
                <p>
                  Everything lives in a plain file on your machine. No account, no sync, no
                  telemetry — the code is open if you want to check.
                </p>
              </div>
            </FadeIn>
            <FadeIn>
              <div className="trust__row">
                <h3>Tidies itself</h3>
                <p>
                  History is deleted after 7 days by default — set anything from 1 day to forever.
                  Pinned items and pinboards always stay.
                </p>
              </div>
            </FadeIn>
            <FadeIn>
              <div className="trust__row">
                <h3>AI titles, your key</h3>
                <p>
                  Optional: name clips automatically with your own OpenAI, Gemini or Anthropic API
                  key. Stored encrypted on-device, off by default, and the only network calls the
                  app ever makes.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="faq shell" id="faq">
          <FadeIn>
            <div className="kicker">FAQ</div>
            <h2 className="h2">Questions, answered</h2>
          </FadeIn>
          <div className="faq__list">
            {FAQ.map(({ q, a }) => (
              <FadeIn key={q}>
                <details className="faq__item">
                  <summary className="faq__q">
                    {q}
                    <span className="faq__chevron" aria-hidden="true" />
                  </summary>
                  <p className="faq__a">{a}</p>
                </details>
              </FadeIn>
            ))}
          </div>
        </section>

        <section className="download shell" id="download">
          <FadeIn>
            <div className="download__card">
              <div className="kicker">Get Gem</div>
              <h2 className="h2" style={{ margin: '0 auto' }}>
                Copy something worth keeping
              </h2>
              <div className="download__buttons">
                <a className="btn btn--primary" href={MAC_URL}>
                  <AppleIcon />
                  Mac (Apple Silicon)
                </a>
                <a className="btn btn--ghost" href={WIN_URL}>
                  <WindowsIcon />
                  Windows (x64)
                </a>
              </div>
              <p className="download__note">
                The <b>macOS</b> build is signed with a Developer ID and notarized by Apple, so
                it opens with no warning &mdash; just move Gem to Applications and open it. On{' '}
                <b>Windows</b>: the installer isn&apos;t code-signed yet, so choose{' '}
                <em>More info → Run anyway</em> if SmartScreen appears. Everything is inspectable
                on <a href={REPO_URL}>GitHub</a>.
              </p>
            </div>
          </FadeIn>
        </section>
      </main>

      <footer className="footer shell">
        <span>
          MIT © {new Date().getFullYear()}{' '}
          <a href="https://rapidlaunchcode.app">Rapidlaunchcode</a>
        </span>
        <div className="footer__links">
          <Link href="/paste-alternative">Paste alternative</Link>
          <a href={REPO_URL}>GitHub</a>
          <a href={`${REPO_URL}/releases`}>Releases</a>
          <a href={`${REPO_URL}/issues`}>Issues</a>
        </div>
      </footer>
    </>
  )
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

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.03-2.89 2.36-4.27 2.47-4.34-1.35-1.97-3.44-2.24-4.18-2.27-1.78-.18-3.47 1.05-4.37 1.05-.9 0-2.29-1.02-3.77-1-1.94.03-3.72 1.13-4.72 2.86-2.01 3.49-.51 8.66 1.45 11.49.96 1.39 2.1 2.94 3.6 2.88 1.45-.06 1.99-.93 3.74-.93s2.24.93 3.77.9c1.56-.03 2.54-1.41 3.49-2.81 1.1-1.61 1.55-3.17 1.58-3.25-.04-.01-3.03-1.16-3.06-4.58zM14.16 4.06c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.73-.74.86-1.39 2.23-1.22 3.55 1.29.1 2.6-.65 3.41-1.62z" />
    </svg>
  )
}

function WindowsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.5 10.5 4.4v7.1H3V5.5zm0 13 7.5 1.1v-7H3v5.9zM11.5 4.25 21 3v8.5h-9.5v-7.25zm0 15.5L21 21v-8.5h-9.5v7.25z" />
    </svg>
  )
}
