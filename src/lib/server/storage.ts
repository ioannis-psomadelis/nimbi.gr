import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { type ModelId, MODELS } from '../../types/models'

export interface SavedLocation {
  id: string
  name: string
  lat: number
  lon: number
  isDefault: boolean
}

const LOCATIONS_KEY = 'nimbus_locations'
const SELECTED_MODEL_KEY = 'nimbus_selected_model'

// Server-side function to read saved locations from cookie
export const getServerSavedLocations = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SavedLocation[]> => {
    try {
      const stored = getCookie(LOCATIONS_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      return []
    } catch {
      return []
    }
  }
)

// Server-side function to read selected model from cookie
export const getServerSelectedModel = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ModelId | null> => {
    try {
      const stored = getCookie(SELECTED_MODEL_KEY)
      if (stored && MODELS.includes(stored as ModelId)) {
        return stored as ModelId
      }
      return null
    } catch {
      return null
    }
  }
)
