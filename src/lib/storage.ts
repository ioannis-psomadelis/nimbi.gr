import Cookies from 'js-cookie'
import { type SavedLocation } from './server/storage'
import { type ModelId } from '../types/models'

const LOCATIONS_KEY = 'nimbus_locations'
const SELECTED_MODEL_KEY = 'nimbus_selected_model'

// Cookie options - 1 year expiry
const COOKIE_OPTIONS = {
  expires: 365,
  sameSite: 'lax' as const,
}

export function getSavedLocations(): SavedLocation[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = Cookies.get(LOCATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveLocation(location: SavedLocation): void {
  const locations = getSavedLocations()
  const existing = locations.findIndex((l) => l.id === location.id)

  if (existing >= 0) {
    locations[existing] = location
  } else {
    locations.push(location)
  }

  Cookies.set(LOCATIONS_KEY, JSON.stringify(locations), COOKIE_OPTIONS)
}

export function removeLocation(id: string): void {
  const locations = getSavedLocations().filter((l) => l.id !== id)
  Cookies.set(LOCATIONS_KEY, JSON.stringify(locations), COOKIE_OPTIONS)
}

// Selected model functions
export function getSelectedModel(): ModelId | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = Cookies.get(SELECTED_MODEL_KEY)
    return stored as ModelId | null
  } catch {
    return null
  }
}

export function saveSelectedModel(model: ModelId): void {
  Cookies.set(SELECTED_MODEL_KEY, model, COOKIE_OPTIONS)
}
