import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cookieStorage } from './storage'

export interface SavedLocation {
  id: string
  name: string
  lat: number
  lon: number
  isDefault: boolean
}

export interface RecentSearch {
  name: string
  lat: number
  lon: number
  country: string
  admin1?: string
  timestamp: number
}

interface LocationsState {
  // State
  savedLocations: SavedLocation[]
  recentSearches: RecentSearch[]

  // Actions
  saveLocation: (location: SavedLocation) => void
  removeLocation: (id: string) => void
  isLocationSaved: (lat: number, lon: number) => boolean
  addRecentSearch: (search: Omit<RecentSearch, 'timestamp'>) => void
  clearRecentSearches: () => void
}

export const useLocationsStore = create<LocationsState>()(
  persist(
    (set, get) => ({
      savedLocations: [],
      recentSearches: [],

      saveLocation: (location) =>
        set((s) => ({
          savedLocations: s.savedLocations.some((l) => l.id === location.id)
            ? s.savedLocations
            : [...s.savedLocations, location],
        })),

      removeLocation: (id) =>
        set((s) => ({
          savedLocations: s.savedLocations.filter((l) => l.id !== id),
        })),

      isLocationSaved: (lat, lon) =>
        get().savedLocations.some((l) => l.lat === lat && l.lon === lon),

      addRecentSearch: (search) =>
        set((s) => {
          // Remove existing entry with same coordinates
          const filtered = s.recentSearches.filter(
            (r) => !(Math.abs(r.lat - search.lat) < 0.01 && Math.abs(r.lon - search.lon) < 0.01)
          )
          return {
            recentSearches: [
              { ...search, timestamp: Date.now() },
              ...filtered,
            ].slice(0, 5),
          }
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'locations',
      storage: cookieStorage,
      partialize: (state) => ({
        savedLocations: state.savedLocations.slice(0, 10),
        recentSearches: state.recentSearches.slice(0, 5),
      }),
    }
  )
)

// Selector hooks
export const useSavedLocations = () =>
  useLocationsStore((s) => s.savedLocations)
export const useRecentSearches = () =>
  useLocationsStore((s) => s.recentSearches)
