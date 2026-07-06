import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ClipItem, ClipKind } from '../../shared/types'
import { Card } from './components/Card'
import { Preview } from './components/Preview'
import { KIND_META } from './kinds'

type Filter = 'all' | 'pinned' | ClipKind

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pinned', label: '★ Pinned' },
  { key: 'text', label: KIND_META.text.label },
  { key: 'code', label: KIND_META.code.label },
  { key: 'markdown', label: KIND_META.markdown.label },
  { key: 'link', label: 'Links' },
  { key: 'color', label: 'Colors' },
  { key: 'image', label: 'Images' }
]

export function App() {
  const [items, setItems] = useState<ClipItem[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void window.api.getHistory().then(setItems)
    return window.api.onHistoryChange(setItems)
  }, [])

  useEffect(() => {
    return window.api.onPanelShown(() => {
      setQuery('')
      setFilter('all')
      setSelectedIndex(0)
      setPreviewOpen(false)
      searchRef.current?.focus()
      stripRef.current?.scrollTo({ left: 0 })
    })
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (filter === 'pinned' && !item.pinned) return false
      if (filter !== 'all' && filter !== 'pinned' && item.kind !== filter) return false
      if (q.length === 0) return true
      if (item.kind === 'image') return 'image screenshot'.includes(q)
      return item.content.toLowerCase().includes(q)
    })
  }, [items, query, filter])

  const selected = filtered[Math.min(selectedIndex, filtered.length - 1)] ?? null

  useEffect(() => {
    if (selectedIndex > 0 && selectedIndex >= filtered.length) {
      setSelectedIndex(Math.max(0, filtered.length - 1))
    }
  }, [filtered.length, selectedIndex])

  useEffect(() => {
    if (!selected) return
    stripRef.current
      ?.querySelector(`[data-id="${selected.id}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [selected])

  const paste = useCallback((item: ClipItem) => {
    void window.api.pasteItem(item.id)
  }, [])

  const togglePin = useCallback((item: ClipItem) => {
    void window.api.setPinned(item.id, !item.pinned)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(0, i - 1))
          break
        case 'Home':
          e.preventDefault()
          setSelectedIndex(0)
          break
        case 'End':
          e.preventDefault()
          setSelectedIndex(Math.max(0, filtered.length - 1))
          break
        case 'Enter':
          e.preventDefault()
          if (selected) paste(selected)
          break
        case ' ':
          // Space toggles the large preview unless the user is typing a search.
          if (query.length === 0) {
            e.preventDefault()
            if (selected) setPreviewOpen((open) => !open)
          }
          break
        case 'Escape':
          e.preventDefault()
          if (previewOpen) setPreviewOpen(false)
          else void window.api.hidePanel()
          break
        case 'Backspace':
          if (e.metaKey) {
            e.preventDefault()
            if (selected) void window.api.deleteItem(selected.id)
          }
          break
        case 'p':
          if (e.metaKey) {
            e.preventDefault()
            if (selected) togglePin(selected)
          }
          break
        default:
          // Any printable character routes to the search field.
          if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
            searchRef.current?.focus()
          }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [filtered.length, selected, paste, togglePin, previewOpen, query])

  return (
    <div className="panel">
      <header className="panel__header">
        <div className="search">
          <span className="search__icon">⌕</span>
          <input
            ref={searchRef}
            className="search__input"
            placeholder="Type to search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            autoFocus
            spellCheck={false}
          />
        </div>
        <nav className="filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filters__chip${filter === f.key ? ' filters__chip--active' : ''}`}
              onClick={() => {
                setFilter(f.key)
                setSelectedIndex(0)
              }}
            >
              {f.label}
            </button>
          ))}
        </nav>
        <span className="panel__count">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        </span>
      </header>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty__icon">📋</div>
          <div className="empty__title">
            {items.length === 0 ? 'Your clipboard history will appear here' : 'No matches'}
          </div>
          <div className="empty__hint">
            {items.length === 0
              ? 'Copy something — code, links, images and markdown get smart previews.'
              : 'Try a different search or filter.'}
          </div>
        </div>
      ) : (
        <div className="strip" ref={stripRef} role="listbox" aria-label="Clipboard history">
          {filtered.map((item, i) => (
            <Card
              key={item.id}
              item={item}
              selected={i === Math.min(selectedIndex, filtered.length - 1)}
              onSelect={() => setSelectedIndex(i)}
              onPaste={() => paste(item)}
              onTogglePin={() => togglePin(item)}
            />
          ))}
        </div>
      )}

      <footer className="panel__hints">
        <span><kbd>↵</kbd> Paste</span>
        <span><kbd>Space</kbd> Preview</span>
        <span><kbd>⌘P</kbd> Pin</span>
        <span><kbd>⌘⌫</kbd> Delete</span>
        <span><kbd>Esc</kbd> Close</span>
      </footer>

      {previewOpen && selected && (
        <Preview item={selected} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  )
}
