import { z } from 'zod'

export const clipKindSchema = z.enum(['text', 'code', 'markdown', 'link', 'color', 'image'])
export type ClipKind = z.infer<typeof clipKindSchema>

export const clipItemSchema = z.object({
  id: z.string(),
  kind: clipKindSchema,
  /** Text content, or for images the absolute path of the stored PNG. */
  content: z.string(),
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
  version: z.literal(1),
  items: z.array(clipItemSchema)
})
export type HistoryFile = z.infer<typeof historyFileSchema>

export interface PasteFreeApi {
  getHistory: () => Promise<ClipItem[]>
  onHistoryChange: (listener: (items: ClipItem[]) => void) => () => void
  pasteItem: (id: string) => Promise<void>
  copyItem: (id: string) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  setPinned: (id: string, pinned: boolean) => Promise<void>
  clearHistory: () => Promise<void>
  hidePanel: () => Promise<void>
  onPanelShown: (listener: () => void) => () => void
}
