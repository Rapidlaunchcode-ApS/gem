import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import { marked } from 'marked'
import { memo, useMemo } from 'react'
import type { ClipItem } from '../../../shared/types'
import { KIND_META, timeAgo } from '../kinds'
import { KindIcon, LinkIcon, PinIcon, SparkleIcon } from './Icons'

const PREVIEW_CHARS = 1200

interface CardProps {
  item: ClipItem
  /** Set when the card is shown inside a pinboard — colors the header like Paste. */
  boardColor: string | null
  selected: boolean
  editing: boolean
  /** True while an AI title is being generated for this clip. */
  titling: boolean
  /** Briefly true right after a click copies this clip, to flash a confirmation. */
  copied: boolean
  onSelect: () => void
  /** Single click: copy the clip to the clipboard and close the panel. */
  onActivate: () => void
  onTogglePin: () => void
  onContextMenu: () => void
  onRenamed: (title: string) => void
  onEditCancel: () => void
}

export const Card = memo(function Card({
  item,
  boardColor,
  selected,
  editing,
  titling,
  copied,
  onSelect,
  onActivate,
  onTogglePin,
  onContextMenu,
  onRenamed,
  onEditCancel
}: CardProps) {
  const headerColor = boardColor ?? (item.kind === 'color' ? item.content : KIND_META[item.kind].color)

  return (
    <div
      className={`card${selected ? ' card--selected' : ''}${titling && !item.title ? ' card--titling' : ''}${copied ? ' card--copied' : ''}`}
      data-id={item.id}
      draggable={!editing}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-gem-item', item.id)
        e.dataTransfer.effectAllowed = 'copy'
      }}
      onClick={onActivate}
      onContextMenu={(e) => {
        e.preventDefault()
        onSelect()
        onContextMenu()
      }}
      role="option"
      aria-selected={selected}
    >
      <div className="card__header" style={{ background: headerColor }}>
        {editing ? (
          <input
            className="card__title-input"
            defaultValue={item.title ?? ''}
            placeholder={kindTitle(item)}
            autoFocus
            spellCheck={false}
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => onRenamed(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRenamed(e.currentTarget.value)
              else if (e.key === 'Escape') onEditCancel()
            }}
          />
        ) : titling && !item.title ? (
          <span className="card__kind card__naming">
            <SparkleIcon size={12} className="card__naming-icon" />
            Naming…
          </span>
        ) : (
          <span className="card__kind" title={item.title ?? undefined}>
            {!item.title && <KindIcon kind={item.kind} size={12} className="card__kind-icon" />}
            {item.title ?? kindTitle(item)}
          </span>
        )}
        <button
          className={`card__pin${item.pinned ? ' card__pin--active' : ''}`}
          title={item.pinned ? 'Unpin' : 'Pin'}
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin()
          }}
        >
          <PinIcon size={13} filled={item.pinned} />
        </button>
      </div>
      <div className="card__body">
        <CardBody item={item} />
      </div>
      <div className="card__footer">
        <span>{timeAgo(item.copiedAt)}</span>
        {copied ? <span className="card__copied">Copied ✓</span> : <span>{sizeLabel(item)}</span>}
      </div>
    </div>
  )
})

function kindTitle(item: ClipItem): string {
  if (item.kind === 'code') {
    const lang = detectLanguage(item.content)
    return lang ? `Code · ${lang}` : 'Code'
  }
  return KIND_META[item.kind].label
}

function sizeLabel(item: ClipItem): string {
  if (item.kind === 'image' && item.width && item.height) {
    return `${item.width}×${item.height}`
  }
  if (item.chars !== undefined) {
    return item.chars === 1 ? '1 character' : `${item.chars.toLocaleString()} characters`
  }
  return ''
}

const languageCache = new Map<string, string | null>()

function detectLanguage(content: string): string | null {
  const key = content.slice(0, 200)
  const cached = languageCache.get(key)
  if (cached !== undefined) return cached
  const result = hljs.highlightAuto(content.slice(0, PREVIEW_CHARS))
  const lang = result.language ?? null
  languageCache.set(key, lang)
  return lang
}

function CardBody({ item }: { item: ClipItem }) {
  switch (item.kind) {
    case 'image':
      return item.thumbnail ? (
        <img className="card__image" src={item.thumbnail} alt="Copied image" draggable={false} />
      ) : (
        <div className="card__text">Image</div>
      )
    case 'color':
      return (
        <div className="card__color" style={{ background: item.content }}>
          <code className="card__color-code">{item.content}</code>
        </div>
      )
    case 'link':
      return <LinkBody url={item.content} />
    case 'code':
      return <CodeBody content={item.content} />
    case 'markdown':
      return <MarkdownBody content={item.content} />
    case 'text':
      return <div className="card__text">{item.content.slice(0, PREVIEW_CHARS)}</div>
  }
}

function LinkBody({ url }: { url: string }) {
  const host = useMemo(() => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(
        /^www\./,
        ''
      )
    } catch {
      return url
    }
  }, [url])
  return (
    <div className="card__link">
      <div className="card__link-badge">
        <LinkIcon size={20} />
      </div>
      <div className="card__link-host">{host}</div>
      <div className="card__link-url">{url}</div>
    </div>
  )
}

function CodeBody({ content }: { content: string }) {
  const html = useMemo(() => {
    const snippet = content.slice(0, PREVIEW_CHARS)
    return DOMPurify.sanitize(hljs.highlightAuto(snippet).value)
  }, [content])
  return (
    <pre className="card__code">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  )
}

function MarkdownBody({ content }: { content: string }) {
  const html = useMemo(() => {
    const raw = marked.parse(content.slice(0, PREVIEW_CHARS), { async: false, gfm: true })
    return DOMPurify.sanitize(raw)
  }, [content])
  return <div className="card__markdown" dangerouslySetInnerHTML={{ __html: html }} />
}
