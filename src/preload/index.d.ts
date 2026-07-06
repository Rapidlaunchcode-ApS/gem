import type { PasteFreeApi } from '../shared/types'

declare global {
  interface Window {
    api: PasteFreeApi
  }
}

export {}
