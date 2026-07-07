const DOWNLOAD_URL =
  'https://github.com/Rapidlaunchcode-ApS/gem/releases/latest/download/Gem-macOS-arm64.zip'
const REPO_URL = 'https://github.com/Rapidlaunchcode-ApS/gem'

export default function Page() {
  return (
    <div className="shell">
      <header className="header">
        <a className="brand" href="#">
          <GemMark />
          Gem
        </a>
        <nav className="header__nav">
          <a className="header__link" href="#features">
            Features
          </a>
          <a className="header__link" href="#install">
            Install
          </a>
          <a className="header__link" href={REPO_URL}>
            GitHub
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            Free &amp; open source — MIT
          </div>
          <h1>
            Every copy, <em>kept and understood.</em>
          </h1>
          <p className="hero__lede">
            Gem is a context-aware clipboard manager for macOS. Code, markdown, links, colors and
            screenshots are classified the moment you copy them — and stay one ⌘⇧V away.
          </p>
          <div className="cta">
            <a className="cta__primary" href={DOWNLOAD_URL}>
              <DownloadIcon />
              Download for macOS
            </a>
            <a className="cta__secondary" href={REPO_URL}>
              <GitHubIcon />
              View on GitHub
            </a>
          </div>
          <p className="hero__fineprint">Apple Silicon · macOS 12+ · no account, no subscription</p>

          <div className="mock" aria-hidden="true">
            <div className="mock__bar">
              <span className="mock__search">Type to search…</span>
              <span className="mock__tab mock__tab--active">
                <span className="mock__dot" style={{ background: '#8e8e93' }} />
                Clipboard History
              </span>
              <span className="mock__tab">
                <span className="mock__dot" style={{ background: '#bf5af2' }} />
                Regex
              </span>
              <span className="mock__tab">
                <span className="mock__dot" style={{ background: '#30d158' }} />
                Email Templates
              </span>
            </div>
            <div className="mock__cards">
              <div className="mock__card">
                <div className="mock__head" style={{ background: '#af52de' }}>
                  Validate Email
                </div>
                <div className="mock__body mock__body--code">
                  <span className="tok-k">const</span> check = <span className="tok-k">new</span>{' '}
                  <span className="tok-t">RegExp</span>(
                  <span className="tok-s">{'/^[^\\s@]+@[^\\s@]+$/'}</span>)
                  {'\n\n'}
                  <span className="tok-k">function</span> <span className="tok-t">validate</span>
                  (email) {'{'}
                  {'\n  '}
                  <span className="tok-k">return</span> check.test(email)
                  {'\n'}
                  {'}'}
                </div>
              </div>
              <div className="mock__card">
                <div className="mock__head" style={{ background: '#ff9f0a' }}>
                  Markdown
                </div>
                <div className="mock__body">
                  <div className="mock__md-title">Release notes</div>
                  <div>
                    <span className="mock__check">✓</span>Clipboard watcher
                  </div>
                  <div>
                    <span className="mock__check">✓</span>Context-aware previews
                  </div>
                  <div>
                    <span className="mock__check">✓</span>Pinboards
                  </div>
                </div>
              </div>
              <div className="mock__card">
                <div className="mock__head" style={{ background: '#0a84ff' }}>
                  Link
                </div>
                <div className="mock__body mock__link">
                  <span className="mock__link-badge">
                    <LinkIcon />
                  </span>
                  <span className="mock__link-host">github.com</span>
                  <span>Rapidlaunchcode-ApS/gem</span>
                </div>
              </div>
              <div className="mock__card">
                <div className="mock__head" style={{ background: '#ff6b2c' }}>
                  Color
                </div>
                <div className="mock__body mock__body--color">
                  <span className="mock__hex">#ff6b2c</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <div className="section-kicker">Why Gem</div>
          <h2 className="section-title">A clipboard that knows what you copied</h2>
          <div className="features__grid">
            <div className="feature">
              <div className="feature__icon">
                <CodeIcon />
              </div>
              <h3>Context-aware cards</h3>
              <p>
                Code gets syntax highlighting with language detection, markdown renders, links and
                colors preview, screenshots get thumbnails. Automatically.
              </p>
            </div>
            <div className="feature">
              <div className="feature__icon">
                <BoardIcon />
              </div>
              <h3>Pinboards</h3>
              <p>
                Keep snippets you reuse — regexes, signatures, templates — on named boards. Drag a
                card onto a tab and it&apos;s saved forever.
              </p>
            </div>
            <div className="feature">
              <div className="feature__icon">
                <SparkIcon />
              </div>
              <h3>AI titles, your key</h3>
              <p>
                Optionally name clips automatically with your own OpenAI, Gemini or Anthropic API
                key. Stored encrypted on your Mac; off by default.
              </p>
            </div>
            <div className="feature">
              <div className="feature__icon">
                <KeyboardIcon />
              </div>
              <h3>Keyboard-first</h3>
              <p>
                ⌘⇧V opens the panel, arrows navigate, ↵ pastes straight into the app you came from,
                Space quick-looks. Your hands never leave the keys.
              </p>
            </div>
            <div className="feature">
              <div className="feature__icon">
                <LockIcon />
              </div>
              <h3>Private by design</h3>
              <p>
                History lives in a local file on your Mac. No account, no sync, no telemetry — the
                only network calls are the optional AI titles to your provider.
              </p>
            </div>
            <div className="feature">
              <div className="feature__icon">
                <ClockIcon />
              </div>
              <h3>Tidies itself</h3>
              <p>
                History expires after 7 days by default — dial it from 1 day to forever. Pinned
                items and pinboards always stay.
              </p>
            </div>
          </div>
        </section>

        <section className="install" id="install">
          <div className="section-kicker">Install</div>
          <h2 className="section-title">Running in under a minute</h2>
          <div className="install__steps">
            <div className="step">
              <p>
                <a href={DOWNLOAD_URL}>
                  <strong>Download Gem</strong>
                </a>
                , unzip, and drag <strong>Gem.app</strong> into Applications.
              </p>
            </div>
            <div className="step">
              <p>
                First launch: right-click Gem.app → <strong>Open</strong>. Gem is open source but
                not yet notarized, so macOS asks once. Or run{' '}
                <code>xattr -d com.apple.quarantine /Applications/Gem.app</code>
              </p>
            </div>
            <div className="step">
              <p>
                Grant <strong>Accessibility</strong> permission (System Settings → Privacy &amp;
                Security) so ↵ can paste into the frontmost app. Then copy something and press{' '}
                <strong>⌘⇧V</strong>.
              </p>
            </div>
          </div>
          <p className="install__note">
            Gem is a menu-bar app — look for the gem icon. Everything about it is inspectable in{' '}
            <a href={REPO_URL}>the source</a>.
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>
          MIT © {new Date().getFullYear()}{' '}
          <a href="https://rapidlaunchcode.app">Rapidlaunchcode</a>
        </span>
        <div className="footer__links">
          <a href={REPO_URL}>GitHub</a>
          <a href={`${REPO_URL}/releases`}>Releases</a>
          <a href={`${REPO_URL}/issues`}>Issues</a>
        </div>
      </footer>
    </div>
  )
}

function GemMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 1024 1024" aria-hidden="true">
      <rect width="1024" height="1024" rx="228" fill="#191542" />
      <g stroke="#fff" strokeOpacity="0.55" strokeWidth="14" strokeLinejoin="round">
        <polygon points="392,336 632,336 512,476" fill="#9fd9ff" />
        <polygon points="392,336 272,476 512,476" fill="#4f8cf7" />
        <polygon points="632,336 752,476 512,476" fill="#8b7bff" />
        <polygon points="272,476 432,476 512,796" fill="#2a3fae" />
        <polygon points="432,476 592,476 512,796" fill="#3d63e8" />
        <polygon points="592,476 752,476 512,796" fill="#312a96" />
      </g>
    </svg>
  )
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function DownloadIcon() {
  return (
    <Icon>
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Icon>
  )
}

function GitHubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <Icon>
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.33-1.33" />
    </Icon>
  )
}

function CodeIcon() {
  return (
    <Icon>
      <path d="m8 6-5 6 5 6" />
      <path d="m16 6 5 6-5 6" />
    </Icon>
  )
}

function BoardIcon() {
  return (
    <Icon>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 9v11" />
    </Icon>
  )
}

function SparkIcon() {
  return (
    <Icon>
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
    </Icon>
  )
}

function KeyboardIcon() {
  return (
    <Icon>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
    </Icon>
  )
}

function LockIcon() {
  return (
    <Icon>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </Icon>
  )
}

function ClockIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </Icon>
  )
}
