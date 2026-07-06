import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { historyFileSchema, type ClipItem } from '../shared/types'

const MAX_ITEMS = 500

export class HistoryStore {
  private items: ClipItem[] = []
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
      const parsed = historyFileSchema.parse(JSON.parse(readFileSync(this.filePath, 'utf8')))
      this.items = parsed.items
    } catch {
      // Corrupt history is not worth crashing over; start fresh.
      this.items = []
    }
  }

  private scheduleSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null
      try {
        writeFileSync(this.filePath, JSON.stringify({ version: 1, items: this.items }))
      } catch (err) {
        console.error('Failed to save history:', err)
      }
    }, 300)
  }

  all(): ClipItem[] {
    return this.items
  }

  get(id: string): ClipItem | null {
    return this.items.find((i) => i.id === id) ?? null
  }

  add(item: ClipItem): void {
    // Re-copying identical content moves it to the front instead of duplicating.
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

  private trim(): void {
    const unpinned = this.items.filter((i) => !i.pinned)
    if (unpinned.length <= MAX_ITEMS) return
    const evicted = new Set(unpinned.slice(MAX_ITEMS).map((i) => i.id))
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

  clear(): void {
    for (const item of this.items) {
      if (item.pinned) continue
      this.removeImageFile(item)
    }
    this.items = this.items.filter((i) => i.pinned)
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
