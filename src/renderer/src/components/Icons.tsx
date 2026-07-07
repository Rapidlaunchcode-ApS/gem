import type { SVGProps } from 'react'
import type { ClipKind } from '../../../shared/types'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  )
}

export function PinIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Svg {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M9 4h6l-.8 6.2 2.8 2.8V15H7v-2l2.8-2.8L9 4z" />
      <path d="M12 15v6" />
    </Svg>
  )
}

export function ClipboardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
    </Svg>
  )
}

export function TextIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
    </Svg>
  )
}

export function CodeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m8 6-5 6 5 6" />
      <path d="m16 6 5 6-5 6" />
    </Svg>
  )
}

export function LinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.33-1.33" />
    </Svg>
  )
}

export function ImageIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="m21 15-4.5-4.5L6 21" />
    </Svg>
  )
}

export function MarkdownIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.8}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M6 15v-5.5l2.5 3 2.5-3V15" />
      <path d="M17.5 9.5V15m0 0-2-2m2 2 2-2" />
    </Svg>
  )
}

export function ColorIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3s6 6.3 6 10.5a6 6 0 0 1-12 0C6 9.3 12 3 12 3z" />
    </Svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
      <circle cx="9" cy="7" r="2" fill="var(--bg, #1c1c21)" />
      <circle cx="15" cy="12" r="2" fill="var(--bg, #1c1c21)" />
      <circle cx="7" cy="17" r="2" fill="var(--bg, #1c1c21)" />
    </Svg>
  )
}

export function SparkleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </Svg>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </Svg>
  )
}

export function MonitorIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </Svg>
  )
}

export function KindIcon({ kind, ...props }: IconProps & { kind: ClipKind }) {
  switch (kind) {
    case 'text':
      return <TextIcon {...props} />
    case 'code':
      return <CodeIcon {...props} />
    case 'markdown':
      return <MarkdownIcon {...props} />
    case 'link':
      return <LinkIcon {...props} />
    case 'color':
      return <ColorIcon {...props} />
    case 'image':
      return <ImageIcon {...props} />
  }
}
