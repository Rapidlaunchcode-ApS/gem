import { ImageResponse } from 'next/og'
import { BRICOLAGE_400_B64, BRICOLAGE_700_B64 } from './og-fonts'

export const alt = 'Gem — the context-aware clipboard for macOS & Windows'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const GEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="228" fill="#181310"/><g stroke="#fff" stroke-opacity="0.55" stroke-width="16" stroke-linejoin="round"><polygon points="392,336 632,336 512,476" fill="#c9f7db"/><polygon points="392,336 272,476 512,476" fill="#6fe3a4"/><polygon points="632,336 752,476 512,476" fill="#2fbf71"/><polygon points="272,476 432,476 512,796" fill="#128a4f"/><polygon points="432,476 592,476 512,796" fill="#3ecf7d"/><polygon points="592,476 752,476 512,796" fill="#0c6b3c"/></g></svg>`

const gemDataUri = `data:image/svg+xml;base64,${Buffer.from(GEM_SVG).toString('base64')}`

export default function OpengraphImage() {
  const bold = Buffer.from(BRICOLAGE_700_B64, 'base64')
  const regular = Buffer.from(BRICOLAGE_400_B64, 'base64')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 88px',
          background: '#faf6f0',
          backgroundImage:
            'radial-gradient(1000px 560px at 92% -12%, rgba(255,214,92,0.42), transparent 60%), radial-gradient(760px 520px at -6% 112%, rgba(47,191,113,0.22), transparent 60%)',
          color: '#1c1510',
          fontFamily: 'Bricolage'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gemDataUri} width={58} height={58} alt="" />
          <div style={{ fontSize: 38, fontWeight: 700 }}>Gem</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>
            Every copy, kept
          </div>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>
            and{' '}
            <span
              style={{
                marginLeft: 24,
                paddingBottom: 6,
                borderBottom: '12px solid rgba(47,191,113,0.5)'
              }}
            >
              understood.
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 34,
              fontSize: 34,
              fontWeight: 400,
              color: 'rgba(28,21,16,0.6)'
            }}
          >
            A free, open-source clipboard manager for Mac &amp; Windows.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 26, fontWeight: 400 }}>
          <span style={{ display: 'flex', color: '#0b7e57', fontWeight: 700 }}>Free forever</span>
          <span style={{ display: 'flex', color: 'rgba(28,21,16,0.28)' }}>•</span>
          <span style={{ display: 'flex', color: 'rgba(28,21,16,0.6)' }}>Open source</span>
          <span style={{ display: 'flex', color: 'rgba(28,21,16,0.28)' }}>•</span>
          <span style={{ display: 'flex', color: 'rgba(28,21,16,0.6)' }}>gem-clipboard.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Bricolage', data: bold, weight: 700, style: 'normal' },
        { name: 'Bricolage', data: regular, weight: 400, style: 'normal' }
      ]
    }
  )
}
