import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AppState, Board, ClipItem, ClipKind, Theme } from '../../shared/types'
import { Card } from './components/Card'
import { ClipboardIcon, PinIcon, SearchIcon, SettingsIcon } from './components/Icons'
import { Preview } from './components/Preview'
import { Settings } from './components/Settings'
import { KIND_META } from './kinds'

type TypeFilter = 'all' | 'pinned' | ClipKind

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'text', label: KIND_META.text.label },
  { key: 'code', label: KIND_META.code.label },
  { key: 'markdown', label: KIND_META.markdown.label },
  { key: 'link', label: 'Links' },
  { key: 'color', label: 'Colors' },
  { key: 'image', label: 'Images' }
]

export function App() {
  const [state, setState] = useState<AppState>({ items: [], boards: [] })
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [creatingBoard, setCreatingBoard] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [dragOverBoardId, setDragOverBoardId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('system')
  const searchRef = useRef<HTMLInputElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const { items, boards } = state
  const activeBoard = boards.find((b) => b.id === activeBoardId) ?? null

  useEffect(() => {
    void window.api.getState().then(setState)
    return window.api.onStateChange(setState)
  }, [])

  useEffect(() => window.api.onItemEdit(setEditingItemId), [])

  useEffect(() => {
    void window.api.getSettings().then((s) => setTheme(s.theme))
  }, [])

  // data-theme lets an explicit choice win over prefers-color-scheme
  // (and makes the toggle work in the browser-mock renderer too).
  useEffect(() => {
    if (theme === 'system') delete document.documentElement.dataset['theme']
    else document.documentElement.dataset['theme'] = theme
  }, [theme])

  const changeTheme = useCallback((next: Theme) => {
    setTheme(next)
    void window.api.setTheme(next)
  }, [])

  useEffect(() => {
    return window.api.onPanelShown(() => {
      setQuery('')
      setTypeFilter('all')
      setSelectedIndex(0)
      setPreviewOpen(false)
      setCreatingBoard(false)
      setEditingItemId(null)
      setSettingsOpen(false)
      searchRef.current?.focus()
      stripRef.current?.scrollTo({ left: 0 })
    })
  }, [])

  // If the active board was deleted, fall back to history.
  useEffect(() => {
    if (activeBoardId && !boards.some((b) => b.id === activeBoardId)) {
      setActiveBoardId(null)
    }
  }, [boards, activeBoardId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (activeBoard) {
        if (item.boardId !== activeBoard.id) return false
      } else {
        if (typeFilter === 'pinned' && !item.pinned) return false
        if (typeFilter !== 'all' && typeFilter !== 'pinned' && item.kind !== typeFilter)
          return false
      }
      if (q.length === 0) return true
      if (item.title?.toLowerCase().includes(q)) return true
      if (item.kind === 'image') return 'image screenshot'.includes(q)
      return item.content.toLowerCase().includes(q)
    })
  }, [items, query, typeFilter, activeBoard])

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

  const selectTab = useCallback((boardId: string | null) => {
    setActiveBoardId(boardId)
    setSelectedIndex(0)
    setQuery('')
    searchRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      // Let inline inputs (rename, new board) handle their own keys.
      const target = e.target as HTMLElement | null
      if (target instanceof HTMLInputElement && !target.classList.contains('search__input')) {
        return
      }
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
        case 'Tab': {
          // Tab / Shift+Tab cycles History → boards → History.
          e.preventDefault()
          const tabs: (string | null)[] = [null, ...boards.map((b) => b.id)]
          const current = tabs.indexOf(activeBoardId)
          const next = (current + (e.shiftKey ? -1 : 1) + tabs.length) % tabs.length
          selectTab(tabs[next] ?? null)
          break
        }
        case 'Escape':
          e.preventDefault()
          if (settingsOpen) setSettingsOpen(false)
          else if (previewOpen) setPreviewOpen(false)
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
            if (selected) void window.api.setPinned(selected.id, !selected.pinned)
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
  }, [
    filtered.length,
    selected,
    paste,
    previewOpen,
    settingsOpen,
    query,
    boards,
    activeBoardId,
    selectTab
  ])

  return (
    <div className="panel">
      <header className="panel__header">
        <div className="search">
          <SearchIcon className="search__icon" size={14} />
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

        <nav className="tabs">
          <button
            className={`tabs__tab${activeBoardId === null ? ' tabs__tab--active' : ''}`}
            onClick={() => selectTab(null)}
          >
            <span className="tabs__dot" style={{ background: '#8e8e93' }} />
            Clipboard History
          </button>
          {boards.map((board) => (
            <BoardTab
              key={board.id}
              board={board}
              active={activeBoardId === board.id}
              dragOver={dragOverBoardId === board.id}
              onSelect={() => selectTab(board.id)}
              onDragOver={() => setDragOverBoardId(board.id)}
              onDragLeave={() => setDragOverBoardId(null)}
              onDropItem={(itemId) => {
                setDragOverBoardId(null)
                void window.api.assignToBoard(itemId, board.id)
              }}
            />
          ))}
          {creatingBoard ? (
            <input
              className="tabs__new-input"
              placeholder="Board name"
              autoFocus
              spellCheck={false}
              onBlur={() => setCreatingBoard(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const name = e.currentTarget.value.trim()
                  if (name) void window.api.createBoard(name)
                  setCreatingBoard(false)
                } else if (e.key === 'Escape') {
                  setCreatingBoard(false)
                }
              }}
            />
          ) : (
            <button
              className="tabs__add"
              title="New pinboard"
              onClick={() => setCreatingBoard(true)}
            >
              +
            </button>
          )}
        </nav>

        {activeBoard === null && (
          <nav className="filters">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.key}
                className={`filters__chip${typeFilter === f.key ? ' filters__chip--active' : ''}`}
                onClick={() => {
                  setTypeFilter(f.key)
                  setSelectedIndex(0)
                }}
              >
                {f.key === 'pinned' ? <PinIcon size={12} /> : f.label}
              </button>
            ))}
          </nav>
        )}

        <span className="panel__count">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        </span>

        <button
          className="panel__settings"
          title="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon size={16} />
        </button>
      </header>

      {filtered.length === 0 ? (
        <div className="empty">
          <ClipboardIcon className="empty__icon" size={36} />
          <div className="empty__title">
            {activeBoard
              ? `“${activeBoard.name}” is empty`
              : items.length === 0
                ? 'Your clipboard history will appear here'
                : 'No matches'}
          </div>
          <div className="empty__hint">
            {activeBoard
              ? 'Drag a card onto the tab, or right-click a card → Pinboard.'
              : items.length === 0
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
              boardColor={activeBoard?.color ?? null}
              selected={i === Math.min(selectedIndex, filtered.length - 1)}
              editing={editingItemId === item.id}
              onSelect={() => setSelectedIndex(i)}
              onPaste={() => paste(item)}
              onTogglePin={() => void window.api.setPinned(item.id, !item.pinned)}
              onContextMenu={() => void window.api.showItemMenu(item.id)}
              onRenamed={(title) => {
                setEditingItemId(null)
                void window.api.renameItem(item.id, title)
              }}
              onEditCancel={() => setEditingItemId(null)}
            />
          ))}
        </div>
      )}

      <footer className="panel__hints">
        <span><kbd>↵</kbd> Paste</span>
        <span><kbd>Space</kbd> Preview</span>
        <span><kbd>⇥</kbd> Boards</span>
        <span><kbd>⌘P</kbd> Pin</span>
        <span><kbd>⌘⌫</kbd> Delete</span>
        <span><kbd>Esc</kbd> Close</span>
      </footer>

      {previewOpen && selected && (
        <Preview item={selected} onClose={() => setPreviewOpen(false)} />
      )}

      {settingsOpen && (
        <Settings theme={theme} onThemeChange={changeTheme} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}

interface BoardTabProps {
  board: Board
  active: boolean
  dragOver: boolean
  onSelect: () => void
  onDragOver: () => void
  onDragLeave: () => void
  onDropItem: (itemId: string) => void
}

function BoardTab({
  board,
  active,
  dragOver,
  onSelect,
  onDragOver,
  onDragLeave,
  onDropItem
}: BoardTabProps) {
  return (
    <button
      className={`tabs__tab${active ? ' tabs__tab--active' : ''}${dragOver ? ' tabs__tab--drop' : ''}`}
      onClick={onSelect}
      onContextMenu={(e) => {
        e.preventDefault()
        void window.api.showBoardMenu(board.id)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver()
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault()
        const itemId = e.dataTransfer.getData('application/x-gem-item')
        if (itemId) onDropItem(itemId)
      }}
    >
      <span className="tabs__dot" style={{ background: board.color }} />
      {board.name}
    </button>
  )
}
