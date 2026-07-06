import type { ClipKind } from '../../shared/types'

export interface KindMeta {
  label: string
  icon: string
  color: string
}

export const KIND_META: Record<ClipKind, KindMeta> = {
  text: { label: 'Text', icon: '¶', color: '#8e8e93' },
  code: { label: 'Code', icon: '</>', color: '#af52de' },
  markdown: { label: 'Markdown', icon: 'M↓', color: '#ff9f0a' },
  link: { label: 'Link', icon: '🔗', color: '#0a84ff' },
  color: { label: 'Color', icon: '◐', color: '#30d158' },
  image: { label: 'Image', icon: '🖼', color: '#64d2ff' }
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000)
  if (seconds < 10) return 'now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}
