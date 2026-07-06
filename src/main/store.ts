import { app } from 'electron'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  BOARD_COLORS,
  historyFileSchema,
  legacyHistoryFileSchema,
  type AppState,
  type Board,
  type ClipItem
} from '../shared/types'

const MAX_ITEMS = 500

export class HistoryStore {
  private items: ClipItem[] = []
  private boards: Board[] = []
  private saveTimer: NodeJS.Timeout | null = null
  private readonly filePath: string
  readonly imagesDir: string

  constructor() {
    const dir = app.getPath('userData')
    this.filePath = join(dir, 'history.json')
    this.imagesDir = join(dir, 'images')
    mkdirSync(this.imagesDir, { recursive: true })
    this.load()
  }

  private load(): void {
    if (!existsSync(this.filePath)) return
    try {
      const raw: unknown = JSON.parse(readFileSync(this.filePath, 'utf8'))
      const v2 = historyFileSchema.safeParse(raw)
      if (v2.success) {
        this.items = v2.data.items
        this.boards = v2.data.boards
        return
      }
      const v1 = legacyHistoryFileSchema.parse(raw)
      this.items = v1.items
      this.boards = []
      this.scheduleSave()
    } catch {
      // Corrupt history is not worth crashing over; start fresh.
      this.items = []
      this.boards = []
    }
  }

  private scheduleSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null
      try {
        writeFileSync(
          this.filePath,
          JSON.stringify({ version: 2, boards: this.boards, items: this.items })
        )
      } catch (err) {
        console.error('Failed to save history:', err)
      }
    }, 300)
  }

  state(): AppState {
    return { items: this.items, boards: this.boards }
  }

  get(id: string): ClipItem | null {
    return this.items.find((i) => i.id === id) ?? null
  }

  getBoard(id: string): Board | null {
    return this.boards.find((b) => b.id === id) ?? null
  }

  add(item: ClipItem): void {
    // Re-copying identical content moves it to the front instead of duplicating,
    // keeping any title/board/pin the existing entry has.
    const existing = this.items.find((i) => i.kind === item.kind && i.content === item.content)
    if (existing) {
      existing.copiedAt = item.copiedAt
      this.items = [existing, ...this.items.filter((i) => i.id !== existing.id)]
    } else {
      this.items = [item, ...this.items]
      this.trim()
    }
    this.scheduleSave()
  }

  private isProtected(item: ClipItem): boolean {
    return item.pinned || item.boardId !== undefined
  }

  private trim(): void {
    const evictable = this.items.filter((i) => !this.isProtected(i))
    if (evictable.length <= MAX_ITEMS) return
    const evicted = new Set(evictable.slice(MAX_ITEMS).map((i) => i.id))
    for (const item of this.items) {
      if (evicted.has(item.id)) this.removeImageFile(item)
    }
    this.items = this.items.filter((i) => !evicted.has(i.id))
  }

  delete(id: string): void {
    const item = this.get(id)
    if (!item) return
    this.removeImageFile(item)
    this.items = this.items.filter((i) => i.id !== id)
    this.scheduleSave()
  }

  setPinned(id: string, pinned: boolean): void {
    const item = this.get(id)
    if (!item) return
    item.pinned = pinned
    this.scheduleSave()
  }

  rename(id: string, title: string): void {
    const item = this.get(id)
    if (!item) return
    const trimmed = title.trim()
    if (trimmed.length === 0) delete item.title
    else item.title = trimmed
    this.scheduleSave()
  }

  assignToBoard(itemId: string, boardId: string | null): void {
    const item = this.get(itemId)
    if (!item) return
    if (boardId === null) delete item.boardId
    else if (this.getBoard(boardId)) item.boardId = boardId
    this.scheduleSave()
  }

  createBoard(name: string): Board | null {
    const trimmed = name.trim()
    if (trimmed.length === 0) return null
    const color = BOARD_COLORS[this.boards.length % BOARD_COLORS.length] ?? BOARD_COLORS[0]
    const board: Board = { id: randomUUID(), name: trimmed, color }
    this.boards = [...this.boards, board]
    this.scheduleSave()
    return board
  }

  deleteBoard(id: string): void {
    this.boards = this.boards.filter((b) => b.id !== id)
    for (const item of this.items) {
      if (item.boardId === id) delete item.boardId
    }
    this.scheduleSave()
  }

  clear(): void {
    for (const item of this.items) {
      if (this.isProtected(item)) continue
      this.removeImageFile(item)
    }
    this.items = this.items.filter((i) => this.isProtected(i))
    this.scheduleSave()
  }

  private removeImageFile(item: ClipItem): void {
    if (item.kind !== 'image') return
    try {
      rmSync(item.content, { force: true })
    } catch {
      // Best effort — a stray thumbnail file is harmless.
    }
  }
}
