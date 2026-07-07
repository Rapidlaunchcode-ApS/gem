import type { AppState, Board, ClipItem, GemApi, SettingsView } from '../../shared/types'

// 8x5 orange PNG so the image card has something to show.
const DEMO_THUMB =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAGElEQVR4nGP8L8DwnwEPYMInOaqAOAUAos4CJs/tGMEAAAAASUVORK5CYII='

const now = Date.now()

const demoBoards: Board[] = [
  { id: 'board-regex', name: 'Regex', color: '#bf5af2' },
  { id: 'board-email', name: 'Email Templates', color: '#30d158' }
]

const demoItems: ClipItem[] = [
  {
    id: 'demo-regex-email',
    kind: 'code',
    title: 'Validate Email',
    boardId: 'board-regex',
    content:
      "const check = new RegExp(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/)\n\nfunction validateEmail(email: string): boolean {\n  return check.test(email)\n}",
    chars: 132,
    pinned: false,
    copiedAt: now - 60_000
  },
  {
    id: 'demo-regex-url',
    kind: 'code',
    title: 'Extract URL',
    boardId: 'board-regex',
    content:
      'const url = new RegExp(/https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/)',
    chars: 126,
    pinned: false,
    copiedAt: now - 5 * 60_000
  },
  {
    id: 'demo-email-signature',
    kind: 'text',
    title: 'Signature',
    boardId: 'board-email',
    content:
      'Nicklas Dupont\nRapidlaunchcode\n\nnicklas@rapidlaunchcode.app\nrapidlaunchcode.app',
    chars: 79,
    pinned: false,
    copiedAt: now - 8 * 60_000
  },
  {
    id: 'demo-code',
    kind: 'code',
    content:
      "export function greet(name: string): string {\n  const message = `Hello, ${name}!`\n  return message\n}\n\ngreet('Gem')",
    chars: 118,
    pinned: true,
    copiedAt: now - 40_000
  },
  {
    id: 'demo-md',
    kind: 'markdown',
    content:
      '# Release notes\n\n- [x] Clipboard watcher\n- [x] Context-aware previews\n- [x] Pinboards\n\n**Ship it** — see [docs](https://example.com)',
    chars: 130,
    pinned: false,
    copiedAt: now - 2 * 60_000
  },
  {
    id: 'demo-link',
    kind: 'link',
    content: 'https://github.com/anthropics/claude-code',
    chars: 41,
    pinned: false,
    copiedAt: now - 9 * 60_000
  },
  {
    id: 'demo-color',
    kind: 'color',
    content: '#ff6b2c',
    chars: 7,
    pinned: false,
    copiedAt: now - 32 * 60_000
  },
  {
    id: 'demo-image',
    kind: 'image',
    content: '/demo/screenshot.png',
    thumbnail: DEMO_THUMB,
    width: 1280,
    height: 800,
    pinned: false,
    copiedAt: now - 3 * 3_600_000
  },
  {
    id: 'demo-text',
    kind: 'text',
    content:
      'Remember to renew the domain before Friday and forward the invoice to accounting.',
    chars: 82,
    pinned: false,
    copiedAt: now - 26 * 3_600_000
  }
]

/** Browser-only stand-in so the renderer can be developed at localhost:5173 without Electron. */
export function createMockApi(): GemApi {
  let items = [...demoItems]
  let boards = [...demoBoards]
  let notify: ((state: AppState) => void) | null = null
  const emit = (): void => notify?.({ items: [...items], boards: [...boards] })

  return {
    getState: () => Promise.resolve({ items: [...items], boards: [...boards] }),
    onStateChange: (listener) => {
      notify = listener
      return () => {
        notify = null
      }
    },
    pasteItem: () => Promise.resolve(),
    copyItem: () => Promise.resolve(),
    deleteItem: (id) => {
      items = items.filter((i) => i.id !== id)
      emit()
      return Promise.resolve()
    },
    setPinned: (id, pinned) => {
      items = items.map((i) => (i.id === id ? { ...i, pinned } : i))
      emit()
      return Promise.resolve()
    },
    renameItem: (id, title) => {
      const trimmed = title.trim()
      items = items.map((i) => {
        if (i.id !== id) return i
        if (trimmed.length === 0) {
          const { title: _dropped, ...rest } = i
          return rest
        }
        return { ...i, title: trimmed }
      })
      emit()
      return Promise.resolve()
    },
    assignToBoard: (itemId, boardId) => {
      items = items.map((i) => {
        if (i.id !== itemId) return i
        if (boardId === null) {
          const { boardId: _dropped, ...rest } = i
          return rest
        }
        return { ...i, boardId }
      })
      emit()
      return Promise.resolve()
    },
    createBoard: (name) => {
      boards = [...boards, { id: `board-${boards.length}`, name, color: '#30d158' }]
      emit()
      return Promise.resolve()
    },
    deleteBoard: (id) => {
      boards = boards.filter((b) => b.id !== id)
      items = items.map((i) => {
        if (i.boardId !== id) return i
        const { boardId: _dropped, ...rest } = i
        return rest
      })
      emit()
      return Promise.resolve()
    },
    showItemMenu: () => Promise.resolve(),
    showBoardMenu: () => Promise.resolve(),
    onItemEdit: () => () => undefined,
    getSettings: () =>
      Promise.resolve<SettingsView>({
        theme: 'system',
        retentionDays: 7,
        ai: { enabled: false, provider: 'anthropic', hasKey: false }
      }),
    setTheme: () => Promise.resolve(),
    setRetentionDays: () => Promise.resolve(),
    setAiSettings: () => Promise.resolve(),
    clearHistory: () => {
      items = items.filter((i) => i.pinned || i.boardId !== undefined)
      emit()
      return Promise.resolve()
    },
    hidePanel: () => Promise.resolve(),
    onPanelShown: () => () => undefined
  }
}
