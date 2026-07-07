import { clipboard, nativeImage } from 'electron'
import { createHash, randomUUID } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { classifyText } from '../shared/classify'
import type { ClipItem } from '../shared/types'
import type { HistoryStore } from './store'

const POLL_MS = 400
const MAX_TEXT_LENGTH = 100_000
const THUMB_HEIGHT = 320

export class ClipboardWatcher {
  private lastHash = ''
  private timer: NodeJS.Timeout | null = null

  constructor(
    private readonly store: HistoryStore,
    private readonly onItem: (item: ClipItem) => void
  ) {}

  start(): void {
    // Seed the hash so whatever is already on the clipboard at launch is captured once.
    this.timer = setInterval(() => this.poll(), POLL_MS)
    this.poll()
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  /** Call after Gem itself writes to the clipboard so we don't re-capture it. */
  markOwnWrite(): void {
    this.lastHash = this.currentHash()
  }

  private currentHash(): string {
    const text = clipboard.readText()
    if (text.trim().length > 0) return hash(`t:${text}`)
    const image = clipboard.readImage()
    if (!image.isEmpty()) return hash(image.toPNG())
    return ''
  }

  private poll(): void {
    try {
      const text = clipboard.readText()
      if (text.trim().length > 0) {
        const h = hash(`t:${text}`)
        if (h === this.lastHash) return
        this.lastHash = h
        this.captureText(text)
        return
      }

      const image = clipboard.readImage()
      if (!image.isEmpty()) {
        const png = image.toPNG()
        const h = hash(png)
        if (h === this.lastHash) return
        this.lastHash = h
        this.captureImage(png)
      }
    } catch (err) {
      console.error('Clipboard poll failed:', err)
    }
  }

  private captureText(text: string): void {
    const content = text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text
    const item: ClipItem = {
      id: randomUUID(),
      kind: classifyText(content),
      content,
      chars: text.length,
      pinned: false,
      copiedAt: Date.now()
    }
    this.store.add(item)
    this.onItem(item)
  }

  private captureImage(png: Buffer): void {
    const id = randomUUID()
    const filePath = join(this.store.imagesDir, `${id}.png`)
    writeFileSync(filePath, png)

    const image = nativeImage.createFromBuffer(png)
    const size = image.getSize()
    const thumb =
      size.height > THUMB_HEIGHT ? image.resize({ height: THUMB_HEIGHT }) : image

    const item: ClipItem = {
      id,
      kind: 'image',
      content: filePath,
      thumbnail: thumb.toDataURL(),
      width: size.width,
      height: size.height,
      pinned: false,
      copiedAt: Date.now()
    }
    this.store.add(item)
    this.onItem(item)
  }
}

function hash(data: string | Buffer): string {
  return createHash('sha1').update(data).digest('hex')
}
