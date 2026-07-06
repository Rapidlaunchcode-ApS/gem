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
  '#0a84ff',
  '#30d158',
  '#ff9f0a',
  '#64d2ff',
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

export const settingsSchema = z.object({
  theme: themeSchema
})
export type Settings = z.infer<typeof settingsSchema>

export interface AppState {
  items: ClipItem[]
  boards: Board[]
}

export interface PasteFreeApi {
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
  getSettings: () => Promise<Settings>
  setTheme: (theme: Theme) => Promise<void>
  clearHistory: () => Promise<void>
  hidePanel: () => Promise<void>
  onPanelShown: (listener: () => void) => () => void
}
