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

/**
 * Selectable models per provider, cheapest first. The first entry is the
 * default. Titling is a tiny classification call, so the cheapest tier is
 * plenty — pricier models are offered for anyone who wants sharper titles.
 */
export const AI_MODELS: Record<AiProvider, { id: string; label: string }[]> = {
  anthropic: [
    { id: 'claude-haiku-4-5', label: 'Haiku 4.5 · cheapest' },
    { id: 'claude-sonnet-5', label: 'Sonnet 5' },
    { id: 'claude-opus-4-8', label: 'Opus 4.8' }
  ],
  openai: [
    { id: 'gpt-5-nano', label: 'GPT-5 nano · cheapest' },
    { id: 'gpt-5-mini', label: 'GPT-5 mini' },
    { id: 'gpt-5', label: 'GPT-5' }
  ],
  gemini: [
    { id: 'gemini-2.5-flash-lite', label: 'Flash-Lite · cheapest' },
    { id: 'gemini-2.5-flash', label: 'Flash' },
    { id: 'gemini-2.5-pro', label: 'Pro' }
  ]
}

/** The default (cheapest) model for each provider. */
export const DEFAULT_MODEL: Record<AiProvider, string> = {
  anthropic: AI_MODELS.anthropic[0]!.id,
  openai: AI_MODELS.openai[0]!.id,
  gemini: AI_MODELS.gemini[0]!.id
}

/** Resolve a stored model to a valid one for the provider (falls back to cheapest). */
export function resolveModel(provider: AiProvider, model: string): string {
  return AI_MODELS[provider].some((m) => m.id === model) ? model : DEFAULT_MODEL[provider]
}

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

/**
 * Selectable global shortcuts to open the panel. Per-platform because the Windows
 * default (Ctrl+Shift+V) collides with "paste as plain text" — so on Windows we
 * offer combos that don't hijack a common editing shortcut. First entry = default.
 */
export const SHORTCUTS_MAC: { accel: string; label: string }[] = [
  { accel: 'CommandOrControl+Shift+V', label: '⌘⇧V' },
  { accel: 'CommandOrControl+Option+V', label: '⌘⌥V' },
  { accel: 'Control+Shift+V', label: '⌃⇧V' },
  { accel: 'CommandOrControl+Shift+Space', label: '⌘⇧Space' }
]

export const SHORTCUTS_WIN: { accel: string; label: string }[] = [
  { accel: 'Control+Alt+V', label: 'Ctrl+Alt+V' },
  { accel: 'Control+Shift+Space', label: 'Ctrl+Shift+Space' },
  { accel: 'Alt+Shift+V', label: 'Alt+Shift+V' },
  { accel: 'Super+Shift+V', label: 'Win+Shift+V' }
]

export const DEFAULT_SHORTCUT_MAC = SHORTCUTS_MAC[0]!.accel
export const DEFAULT_SHORTCUT_WIN = SHORTCUTS_WIN[0]!.accel

/** Human label for a shortcut accelerator ("" or unknown → the platform default). */
export function shortcutLabel(accel: string, isMac: boolean): string {
  const list = isMac ? SHORTCUTS_MAC : SHORTCUTS_WIN
  const found = list.find((s) => s.accel === accel)
  return found?.label ?? list[0]!.label
}

const DEFAULT_AI = { enabled: false, provider: 'anthropic' as const, encryptedKey: '', model: '' }

/** On-disk settings; the API key is stored encrypted and never sent to the renderer. */
export const settingsFileSchema = z
  .object({
    theme: themeSchema.catch('system'),
    retentionDays: z.number().int().min(0).max(3650).catch(7),
    /** Global open-panel shortcut accelerator; "" resolves to the platform default. */
    shortcut: z.string().catch(''),
    ai: z
      .object({
        enabled: z.boolean().catch(false),
        provider: aiProviderSchema.catch('anthropic'),
        encryptedKey: z.string().catch(''),
        model: z.string().catch('')
      })
      .catch(DEFAULT_AI)
  })
  .catch({ theme: 'system', retentionDays: 7, shortcut: '', ai: DEFAULT_AI })
export type SettingsFile = z.infer<typeof settingsFileSchema>

/** What the renderer sees — no full key material, only a masked hint. */
export interface SettingsView {
  theme: Theme
  retentionDays: number
  /** Resolved open-panel shortcut accelerator (never ""). */
  shortcut: string
  ai: {
    enabled: boolean
    provider: AiProvider
    hasKey: boolean
    /** Masked preview of the saved key, e.g. "sk-ant••••" ("" when none). */
    keyHint: string
    /** Chosen model id for the active provider (resolved to the cheapest default). */
    model: string
  }
}

export interface AiUpdate {
  enabled: boolean
  provider: AiProvider
  /** New key to store (encrypted); omit to keep the existing one. */
  apiKey?: string
  /** Model id to use for the provider; omit to keep the current choice. */
  model?: string
}

export interface AppState {
  items: ClipItem[]
  boards: Board[]
}

/** In-app update lifecycle, driven by electron-updater in the main process. */
export type UpdateState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; version: string }
  | { status: 'not-available' }
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded'; version: string }
  | { status: 'error'; message: string }

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
  /** Fired with the ids of items currently getting an AI title. */
  onTitlingChange: (listener: (ids: string[]) => void) => () => void
  getSettings: () => Promise<SettingsView>
  setTheme: (theme: Theme) => Promise<void>
  setRetentionDays: (days: number) => Promise<void>
  setAiSettings: (update: AiUpdate) => Promise<void>
  /** Change the global open-panel shortcut (re-registered immediately). */
  setShortcut: (accel: string) => Promise<void>
  clearHistory: () => Promise<void>
  hidePanel: () => Promise<void>
  onPanelShown: (listener: () => void) => () => void
  /** Fired to dim + blur the panel while the Settings window is open. */
  onPanelDim: (listener: (dim: boolean) => void) => () => void
  /** Fired to play the leave transition before the panel hides. */
  onPanelAnimateOut: (listener: () => void) => () => void
  /** Open the standalone, screen-centered Settings window. */
  openSettings: () => Promise<void>
  /** Close the Settings window (from inside it). */
  closeSettings: () => Promise<void>
  /** Open the standalone onboarding window (also shown once on first launch). */
  openOnboarding: () => Promise<void>
  /** Close the onboarding window (from inside it). */
  closeOnboarding: () => Promise<void>
  /** Show the clipboard panel (used by the onboarding "Open Gem" button). */
  openPanel: () => Promise<void>
  /** The running app version (e.g. "0.2.7"). */
  appVersion: () => Promise<string>
  /** Ask the main process to check GitHub for a newer release. */
  checkForUpdate: () => Promise<void>
  /** Download the available update in the background. */
  downloadUpdate: () => Promise<void>
  /** Quit and install a downloaded update. */
  installUpdate: () => Promise<void>
  /** Subscribe to update lifecycle changes. */
  onUpdateStatus: (listener: (state: UpdateState) => void) => () => void
}
