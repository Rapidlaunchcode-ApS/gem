import type { GemApi } from '../shared/types'

declare global {
  interface Window {
    api: GemApi
  }
}

export {}
