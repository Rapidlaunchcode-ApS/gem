import { z } from 'zod'

export const clipKindSchema = z.enum(['text', 'code', 'markdown', 'link', 'color', 'image'])
export type ClipKind = z.infer<typeof clipKindSchema>

export const boardSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string()
})
export type Board = z.infer<typeof boardSchema>

/** Cycled through when creating boards, matching Paste's pinboard dot colors. */
export const BOARD_COLORS = [
  '#ff453a',
  '#bf5af2',
  '#ffd60a',
  '#30d158',
  '#ff9f0a',
  '#66d4a3',
  '#ff375f'
] as const

export const clipItemSchema = z.object({
  id: z.string(),
  kind: clipKindSchema,
  /** Text content, or for images the absolute path of the stored PNG. */
  content: z.string(),
  /** User-given name, shown instead of the kind label (pinboard snippets). */
  title: z.string().optional(),
  /** Pinboard this item belongs to; boarded items survive trimming and Clear History. */
  boardId: z.string().optional(),
  /** Data-URL thumbnail (images only). */
  thumbnail: z.string().optional(),
  /** Image dimensions (images only). */
  width: z.number().optional(),
  height: z.number().optional(),
  /** Character count for text kinds. */
  chars: z.number().optional(),
  pinned: z.boolean(),
  copiedAt: z.number()
})
export type ClipItem = z.infer<typeof clipItemSchema>

export const historyFileSchema = z.object({
  version: z.literal(2),
  boards: z.array(boardSchema),
  items: z.array(clipItemSchema)
})
export type HistoryFile = z.infer<typeof historyFileSchema>

export const legacyHistoryFileSchema = z.object({
  version: z.literal(1),
  items: z.array(clipItemSchema)
})

export const themeSchema = z.enum(['system', 'light', 'dark'])
export type Theme = z.infer<typeof themeSchema>

export const aiProviderSchema = z.enum(['openai', 'gemini', 'anthropic'])
export type AiProvider = z.infer<typeof aiProviderSchema>

/** Days to keep unpinned, unboarded history. 0 = forever. */
export const RETENTION_OPTIONS: { days: number; label: string }[] = [
  { days: 1, label: '1 day' },
  { days: 3, label: '3 days' },
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '1 year' },
  { days: 0, label: 'Forever' }
]

const DEFAULT_AI = { enabled: false, provider: 'anthropic' as const, encryptedKey: '' }

/** On-disk settings; the API key is stored encrypted and never sent to the renderer. */
export const settingsFileSchema = z
  .object({
    theme: themeSchema.catch('system'),
    retentionDays: z.number().int().min(0).max(3650).catch(7),
    ai: z
      .object({
        enabled: z.boolean().catch(false),
        provider: aiProviderSchema.catch('anthropic'),
        encryptedKey: z.string().catch('')
      })
      .catch(DEFAULT_AI)
  })
  .catch({ theme: 'system', retentionDays: 7, ai: DEFAULT_AI })
export type SettingsFile = z.infer<typeof settingsFileSchema>

/** What the renderer sees — no key material. */
export interface SettingsView {
  theme: Theme
  retentionDays: number
  ai: {
    enabled: boolean
    provider: AiProvider
    hasKey: boolean
  }
}

export interface AiUpdate {
  enabled: boolean
  provider: AiProvider
  /** New key to store (encrypted); omit to keep the existing one. */
  apiKey?: string
}

export interface AppState {
  items: ClipItem[]
  boards: Board[]
}

export interface GemApi {
  getState: () => Promise<AppState>
  onStateChange: (listener: (state: AppState) => void) => () => void
  pasteItem: (id: string) => Promise<void>
  copyItem: (id: string) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  setPinned: (id: string, pinned: boolean) => Promise<void>
  renameItem: (id: string, title: string) => Promise<void>
  assignToBoard: (itemId: string, boardId: string | null) => Promise<void>
  createBoard: (name: string) => Promise<void>
  deleteBoard: (id: string) => Promise<void>
  /** Open the native right-click menu for an item. */
  showItemMenu: (id: string) => Promise<void>
  /** Open the native right-click menu for a board tab. */
  showBoardMenu: (id: string) => Promise<void>
  /** Fired when the user picks “Rename” in the native menu. */
  onItemEdit: (listener: (id: string) => void) => () => void
  getSettings: () => Promise<SettingsView>
  setTheme: (theme: Theme) => Promise<void>
  setRetentionDays: (days: number) => Promise<void>
  setAiSettings: (update: AiUpdate) => Promise<void>
  clearHistory: () => Promise<void>
  hidePanel: () => Promise<void>
  onPanelShown: (listener: () => void) => () => void
}
