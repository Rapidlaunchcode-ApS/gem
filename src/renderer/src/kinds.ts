import type { ClipKind } from '../../shared/types'

export interface KindMeta {
  label: string
  color: string
}

export const KIND_META: Record<ClipKind, KindMeta> = {
  text: { label: 'Text', color: '#8e8e93' },
  code: { label: 'Code', color: '#af52de' },
  markdown: { label: 'Markdown', color: '#ff9f0a' },
  link: { label: 'Link', color: '#34c759' },
  color: { label: 'Color', color: '#ffd60a' },
  image: { label: 'Image', color: '#ff375f' }
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
