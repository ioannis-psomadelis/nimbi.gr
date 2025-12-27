import Cookies from 'js-cookie'
import { type SavedLocation } from './server/storage'
import { type ModelId } from '../types/models'

const LOCATIONS_KEY = 'nimbus_locations'
const SELECTED_MODEL_KEY = 'nimbus_selected_model'
const PRO_MODE_KEY = 'pro-mode'
const RECENT_SEARCHES_KEY = 'nimbus_recent_searches'

// Recent search type
export interface RecentSearch {
  name: string
  lat: number
  lon: number
  country: string
  admin1?: string
  timestamp: number
}

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
export function saveSelectedModel(model: ModelId): void {
  Cookies.set(SELECTED_MODEL_KEY, model, COOKIE_OPTIONS)
}

// Pro mode functions
export function saveProMode(enabled: boolean): void {
  Cookies.set(PRO_MODE_KEY, enabled ? 'true' : 'false', COOKIE_OPTIONS)
}

// Recent searches functions (localStorage for larger storage)
const MAX_RECENT_SEARCHES = 5

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addRecentSearch(search: Omit<RecentSearch, 'timestamp'>): void {
  if (typeof window === 'undefined') return

  try {
    const searches = getRecentSearches()

    // Remove existing entry with same coordinates (avoid duplicates)
    const filtered = searches.filter(
      s => !(Math.abs(s.lat - search.lat) < 0.01 && Math.abs(s.lon - search.lon) < 0.01)
    )

    // Add new search at the beginning with timestamp
    const newSearches = [
      { ...search, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT_SEARCHES)

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches))
  } catch {
    // Ignore storage errors
  }
}

