import type { ClipItem, PasteFreeApi } from '../../shared/types'

// 8x5 orange PNG so the image card has something to show.
const DEMO_THUMB =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAGElEQVR4nGP8L8DwnwEPYMInOaqAOAUAos4CJs/tGMEAAAAASUVORK5CYII='

const now = Date.now()

const demoItems: ClipItem[] = [
  {
    id: 'demo-code',
    kind: 'code',
    content:
      "export function greet(name: string): string {\n  const message = `Hello, ${name}!`\n  return message\n}\n\ngreet('PasteFree')",
    chars: 118,
    pinned: true,
    copiedAt: now - 40_000
  },
  {
    id: 'demo-md',
    kind: 'markdown',
    content:
      '# Release notes\n\n- [x] Clipboard watcher\n- [x] Context-aware previews\n- [ ] Pinboards\n\n**Ship it** — see [docs](https://example.com)',
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
export function createMockApi(): PasteFreeApi {
  let items = [...demoItems]
  let notify: ((items: ClipItem[]) => void) | null = null
  const emit = (): void => notify?.([...items])

  return {
    getHistory: () => Promise.resolve([...items]),
    onHistoryChange: (listener) => {
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
    clearHistory: () => {
      items = items.filter((i) => i.pinned)
      emit()
      return Promise.resolve()
    },
    hidePanel: () => Promise.resolve(),
    onPanelShown: () => () => undefined
  }
}
