import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { type ModelId, MODELS } from '../../types/models'
import type { SavedLocation } from '../../stores/locations-store'

const STORE_COOKIE_NAME = 'nimbi-store'

// Helper to read from the Zustand store cookie
function getStoreData(): Record<string, unknown> | null {
  try {
    let cookie = getCookie(STORE_COOKIE_NAME)
    if (!cookie) return null

    // Try to decode if URL-encoded
    try {
      if (cookie.includes('%')) {
        cookie = decodeURIComponent(cookie)
      }
    } catch {
      // Not URL-encoded, use as-is
    }

    const data = JSON.parse(cookie)
    // Validate it's an object with expected structure
    if (typeof data === 'object' && data !== null) {
      return data
    }
    return null
  } catch {
    return null
  }
}

// Helper to extract state from Zustand persist format { state: {...}, version: N }
function getStateFromStore<T>(data: Record<string, unknown> | null, storeName: string): T | null {
  if (!data?.[storeName]) return null
  const store = data[storeName] as { state?: T }
  return store.state || null
}

// Server-side function to read saved locations from cookie
export const getServerSavedLocations = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SavedLocation[]> => {
    try {
      const data = getStoreData()
      const state = getStateFromStore<{ savedLocations?: SavedLocation[] }>(data, 'locations')
      return state?.savedLocations ?? []
    } catch {
      return []
    }
  }
)

// Server-side function to read selected model from cookie
export const getServerSelectedModel = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ModelId | null> => {
    try {
      const data = getStoreData()
      const state = getStateFromStore<{ selectedModel?: string }>(data, 'weather')
      const model = state?.selectedModel
      if (model && MODELS.includes(model as ModelId)) {
        return model as ModelId
      }
      return null
    } catch {
      return null
    }
  }
)

// Server-side function to read pro mode from cookie
export const getServerProMode = createServerFn({ method: 'GET' }).handler(
  async (): Promise<boolean> => {
    try {
      const data = getStoreData()
      const state = getStateFromStore<{ proMode?: boolean }>(data, 'preferences')
      return state?.proMode === true
    } catch {
      return false
    }
  }
)
