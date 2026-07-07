import { ImageResponse } from 'next/og'

export const alt = 'Gem — the context-aware clipboard for macOS & Windows'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const GEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="228" fill="#181310"/><g stroke="#fff" stroke-opacity="0.55" stroke-width="16" stroke-linejoin="round"><polygon points="392,336 632,336 512,476" fill="#c9f7db"/><polygon points="392,336 272,476 512,476" fill="#6fe3a4"/><polygon points="632,336 752,476 512,476" fill="#2fbf71"/><polygon points="272,476 432,476 512,796" fill="#128a4f"/><polygon points="432,476 592,476 512,796" fill="#3ecf7d"/><polygon points="592,476 752,476 512,796" fill="#0c6b3c"/></g></svg>`

const gemDataUri = `data:image/svg+xml;base64,${Buffer.from(GEM_SVG).toString('base64')}`

const CARDS = [
  { title: 'Code', color: '#af52de' },
  { title: 'Markdown', color: '#ff9f0a' },
  { title: 'Link', color: '#34c759' },
  { title: 'Color', color: '#ff6b2c' }
]

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#faf6f0',
          backgroundImage:
            'radial-gradient(900px 500px at 88% -8%, rgba(255,214,92,0.5), transparent 60%), radial-gradient(800px 520px at 6% 108%, rgba(47,191,113,0.28), transparent 62%)',
          fontFamily: 'sans-serif',
          color: '#1c1510'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gemDataUri} width={64} height={64} alt="" />
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>Gem</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 82, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02 }}>
            Every copy, kept
          </div>
          <div style={{ display: 'flex', fontSize: 82, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02 }}>
            and{' '}
            <span
              style={{
                marginLeft: 20,
                paddingBottom: 4,
                borderBottom: '10px solid rgba(47,191,113,0.55)'
              }}
            >
              understood.
            </span>
          </div>
          <div style={{ display: 'flex', marginTop: 26, fontSize: 32, color: 'rgba(28,21,16,0.66)' }}>
            The context-aware clipboard for macOS &amp; Windows.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {['Free & open source', 'macOS', 'Windows', 'MIT'].map((t) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#0b7e57',
                  background: 'rgba(47,191,113,0.12)',
                  border: '1px solid rgba(47,191,113,0.32)',
                  borderRadius: 999,
                  padding: '10px 22px'
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {CARDS.map((c) => (
              <div
                key={c.title}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: 96,
                  height: 118,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#fff',
                  border: '1px solid rgba(28,21,16,0.1)',
                  boxShadow: '0 10px 24px rgba(28,21,16,0.12)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    background: c.color,
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    padding: '8px 10px'
                  }}
                >
                  {c.title}
                </div>
                <div style={{ display: 'flex', flex: 1, background: c.title === 'Color' ? '#ff6b2c' : '#fff' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  )
}
