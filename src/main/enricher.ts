import Anthropic from '@anthropic-ai/sdk'
import type { ClipItem } from '../shared/types'
import type { SettingsStore } from './settings'
import type { HistoryStore } from './store'

const MIN_CHARS = 20
const CONTENT_SNIPPET = 1500
const TIMEOUT_MS = 20_000

const PROMPT =
  'You name clipboard snippets for a clipboard manager. ' +
  'Reply with ONLY a short descriptive title, 2-5 words, no quotes, no trailing punctuation. ' +
  'Name this snippet:\n\n'

/**
 * Gives freshly captured clips an AI-generated title using the user's own
 * API key (BYOK). Runs entirely in the main process; failures are logged
 * and skipped — the clip simply keeps its kind label.
 */
export class Enricher {
  private queue: Promise<void> = Promise.resolve()
  /** Item ids with an in-flight titling request, for the "naming…" indicator. */
  private readonly inFlight = new Set<string>()

  constructor(
    private readonly store: HistoryStore,
    private readonly settings: SettingsStore,
    private readonly onTitled: () => void,
    private readonly onTitlingChange: (ids: string[]) => void
  ) {}

  maybeEnrich(item: ClipItem): void {
    if (!this.settings.aiEnabled()) return
    if (item.title !== undefined) return
    if (item.kind !== 'text' && item.kind !== 'code' && item.kind !== 'markdown') return
    if (item.content.length < MIN_CHARS) return

    // Mark it immediately so the card shows a "naming…" shimmer even while the
    // request waits in the queue behind an earlier clip.
    this.inFlight.add(item.id)
    this.emitTitling()

    // One request at a time — clipboard bursts shouldn't fan out.
    this.queue = this.queue.then(() => this.enrich(item.id, item.content))
  }

  private async enrich(itemId: string, content: string): Promise<void> {
    const key = this.settings.aiKey()
    if (!key) {
      this.finish(itemId)
      return
    }
    try {
      const raw = await this.requestTitle(key, content.slice(0, CONTENT_SNIPPET))
      const title = sanitizeTitle(raw)
      if (!title) return
      const current = this.store.get(itemId)
      // The item may have been deleted or renamed by the user in the meantime.
      if (!current || current.title !== undefined) return
      this.store.rename(itemId, title)
      this.onTitled()
    } catch (err) {
      console.error('AI titling failed:', err instanceof Error ? err.message : err)
    } finally {
      this.finish(itemId)
    }
  }

  private finish(itemId: string): void {
    if (this.inFlight.delete(itemId)) this.emitTitling()
  }

  private emitTitling(): void {
    this.onTitlingChange([...this.inFlight])
  }

  private async requestTitle(key: string, snippet: string): Promise<string> {
    switch (this.settings.aiProvider()) {
      case 'anthropic':
        return this.requestAnthropic(key, snippet)
      case 'openai':
        return this.requestOpenAi(key, snippet)
      case 'gemini':
        return this.requestGemini(key, snippet)
    }
  }

  private async requestAnthropic(key: string, snippet: string): Promise<string> {
    const client = new Anthropic({ apiKey: key, timeout: TIMEOUT_MS, maxRetries: 1 })
    const response = await client.messages.create({
      model: this.settings.aiModel(),
      max_tokens: 256,
      messages: [{ role: 'user', content: PROMPT + snippet }]
    })
    const block = response.content.find((b) => b.type === 'text')
    return block && block.type === 'text' ? block.text : ''
  }

  private async requestOpenAi(key: string, snippet: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.settings.aiModel(),
        reasoning_effort: 'minimal',
        max_completion_tokens: 256,
        messages: [{ role: 'user', content: PROMPT + snippet }]
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    return data.choices?.[0]?.message?.content ?? ''
  }

  private async requestGemini(key: string, snippet: string): Promise<string> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.settings.aiModel()}:generateContent`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT + snippet }] }],
          generationConfig: { maxOutputTokens: 256 }
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS)
      }
    )
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  }
}

function sanitizeTitle(raw: string): string | null {
  const firstLine = raw.trim().split('\n')[0] ?? ''
  const cleaned = firstLine
    .replace(/^["'“”‘’`]+|["'“”‘’`.]+$/g, '')
    .trim()
    .slice(0, 60)
  return cleaned.length >= 2 ? cleaned : null
}
