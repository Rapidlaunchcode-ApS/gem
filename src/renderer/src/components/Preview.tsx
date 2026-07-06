import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import { marked } from 'marked'
import { useMemo } from 'react'
import type { ClipItem } from '../../../shared/types'
import { KIND_META, timeAgo } from '../kinds'

interface PreviewProps {
  item: ClipItem
  onClose: () => void
}

export function Preview({ item, onClose }: PreviewProps) {
  return (
    <div className="preview" onClick={onClose}>
      <div className="preview__card" onClick={(e) => e.stopPropagation()}>
        <div className="preview__header">
          <span>{KIND_META[item.kind].label}</span>
          <span>{timeAgo(item.copiedAt)}</span>
        </div>
        <div className="preview__body">
          <PreviewBody item={item} />
        </div>
      </div>
    </div>
  )
}

function PreviewBody({ item }: { item: ClipItem }) {
  switch (item.kind) {
    case 'image':
      return item.thumbnail ? (
        <img className="preview__image" src={item.thumbnail} alt="Copied image" />
      ) : (
        <div>Image</div>
      )
    case 'color':
      return (
        <div className="preview__color">
          <div className="preview__swatch" style={{ background: item.content }} />
          <code>{item.content}</code>
        </div>
      )
    case 'code':
      return <HighlightedCode content={item.content} />
    case 'markdown':
      return <RenderedMarkdown content={item.content} />
    case 'link':
    case 'text':
      return <div className="preview__text">{item.content}</div>
  }
}

function HighlightedCode({ content }: { content: string }) {
  const html = useMemo(
    () => DOMPurify.sanitize(hljs.highlightAuto(content.slice(0, 20_000)).value),
    [content]
  )
  return (
    <pre className="preview__code">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  )
}

function RenderedMarkdown({ content }: { content: string }) {
  const html = useMemo(
    () =>
      DOMPurify.sanitize(marked.parse(content.slice(0, 20_000), { async: false, gfm: true })),
    [content]
  )
  return <div className="preview__markdown" dangerouslySetInnerHTML={{ __html: html }} />
}
