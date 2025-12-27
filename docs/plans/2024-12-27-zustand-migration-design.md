# Zustand State Management Migration Design

**Date:** 2024-12-27
**Status:** Approved
**Goal:** Migrate scattered state management to Zustand stores

## Problem Statement

Current state is scattered across:
- Cookies (saved locations, selected model, pro mode, language)
- localStorage (theme, recent searches)
- React Context (theme provider)
- useState (15+ components with local state)

Pain points:
- Prop drilling through component layers
- Hard to debug, understand where state lives
- Unnecessary re-renders when state changes

## Architecture

### File Structure

```
src/
├── stores/
│   ├── index.ts                 # Re-exports all stores
│   ├── storage.ts               # Cookie storage adapter for persist middleware
│   ├── preferences-store.ts     # Theme, language, proMode
│   ├── locations-store.ts       # Saved locations, recent searches
│   ├── weather-store.ts         # Model selection, run, region, params
│   └── ui-store.ts              # Sidebar, modals, dropdowns
```

### Persistence Strategy

- **Storage:** Cookies only (SSR compatibility)
- **Cookie name:** `nimbi-store` (single cookie, namespaced keys)
- **Expiry:** 365 days
- **Size management:** Partialize to limit stored data

### What Gets Persisted

| Persisted (cookies) | Transient (memory) |
|---------------------|-------------------|
| theme, language, proMode | sidebarOpen, modals |
| savedLocations (max 10) | selectedRun, selectedParam |
| recentSearches (max 5) | selectedRegion, forecastHour |
| selectedModel | |

## Store Designs

### 1. Cookie Storage Adapter

```typescript
// src/stores/storage.ts
import Cookies from 'js-cookie'

const COOKIE_NAME = 'nimbi-store'
const COOKIE_OPTIONS = {
  expires: 365,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

export const cookieStorage = {
  getItem: (name: string): string | null => {
    const cookie = Cookies.get(COOKIE_NAME)
    if (!cookie) return null
    try {
      const data = JSON.parse(cookie)
      return JSON.stringify(data[name] ?? null)
    } catch {
      return null
    }
  },

  setItem: (name: string, value: string): void => {
    const cookie = Cookies.get(COOKIE_NAME)
    const data = cookie ? JSON.parse(cookie) : {}
    data[name] = JSON.parse(value)
    Cookies.set(COOKIE_NAME, JSON.stringify(data), COOKIE_OPTIONS)
  },

  removeItem: (name: string): void => {
    const cookie = Cookies.get(COOKIE_NAME)
    if (!cookie) return
    const data = JSON.parse(cookie)
    delete data[name]
    Cookies.set(COOKIE_NAME, JSON.stringify(data), COOKIE_OPTIONS)
  },
}
```

### 2. Preferences Store

```typescript
// src/stores/preferences-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cookieStorage } from './storage'

type Theme = 'light' | 'dark' | 'system'
type Language = 'en' | 'el'

interface PreferencesState {
  theme: Theme
  language: Language
  proMode: boolean

  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  setProMode: (enabled: boolean) => void
  toggleProMode: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      proMode: false,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setProMode: (proMode) => set({ proMode }),
      toggleProMode: () => set((s) => ({ proMode: !s.proMode })),
    }),
    {
      name: 'preferences',
      storage: cookieStorage,
    }
  )
)
```

### 3. Locations Store

```typescript
// src/stores/locations-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cookieStorage } from './storage'

interface SavedLocation {
  slug: string
  name: string
  country: string
  lat: number
  lon: number
}

interface LocationsState {
  savedLocations: SavedLocation[]
  recentSearches: string[]

  saveLocation: (location: SavedLocation) => void
  removeLocation: (slug: string) => void
  isLocationSaved: (slug: string) => boolean
  addRecentSearch: (slug: string) => void
  clearRecentSearches: () => void
}

export const useLocationsStore = create<LocationsState>()(
  persist(
    (set, get) => ({
      savedLocations: [],
      recentSearches: [],

      saveLocation: (location) => set((s) => ({
        savedLocations: s.savedLocations.some(l => l.slug === location.slug)
          ? s.savedLocations
          : [...s.savedLocations, location]
      })),

      removeLocation: (slug) => set((s) => ({
        savedLocations: s.savedLocations.filter(l => l.slug !== slug)
      })),

      isLocationSaved: (slug) => get().savedLocations.some(l => l.slug === slug),

      addRecentSearch: (slug) => set((s) => ({
        recentSearches: [slug, ...s.recentSearches.filter(r => r !== slug)].slice(0, 5)
      })),

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'locations',
      storage: cookieStorage,
      partialize: (state) => ({
        savedLocations: state.savedLocations.slice(0, 10),
        recentSearches: state.recentSearches,
      }),
    }
  )
)
```

### 4. Weather Store

```typescript
// src/stores/weather-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cookieStorage } from './storage'
import type { ModelId } from '../types/models'

type Region = 'europe' | 'greece' | 'atlantic'
type ChartParam = 'temperature' | 'precipitation' | 'wind' | 'pressure' | 'clouds'

interface ModelRun {
  id: string
  date: string
  hour: number
}

interface WeatherState {
  // Persisted
  selectedModel: ModelId

  // Transient
  selectedRun: ModelRun | null
  selectedRegion: Region
  selectedParam: ChartParam
  forecastHour: number

  setSelectedModel: (model: ModelId) => void
  setSelectedRun: (run: ModelRun) => void
  setSelectedRegion: (region: Region) => void
  setSelectedParam: (param: ChartParam) => void
  setForecastHour: (hour: number) => void
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set) => ({
      selectedModel: 'ecmwf-hres',
      selectedRun: null,
      selectedRegion: 'europe',
      selectedParam: 'temperature',
      forecastHour: 0,

      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setSelectedRun: (selectedRun) => set({ selectedRun }),
      setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
      setSelectedParam: (selectedParam) => set({ selectedParam }),
      setForecastHour: (forecastHour) => set({ forecastHour }),
    }),
    {
      name: 'weather',
      storage: cookieStorage,
      partialize: (state) => ({
        selectedModel: state.selectedModel,
      }),
    }
  )
)
```

### 5. UI Store

```typescript
// src/stores/ui-store.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  sidebarMobileOpen: boolean
  weeklyOutlookOpen: boolean

  setSidebarOpen: (open: boolean) => void
  setSidebarMobileOpen: (open: boolean) => void
  toggleSidebar: () => void
  setWeeklyOutlookOpen: (open: boolean) => void
  openWeeklyOutlook: () => void
  closeWeeklyOutlook: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  sidebarMobileOpen: false,
  weeklyOutlookOpen: false,

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarMobileOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setWeeklyOutlookOpen: (weeklyOutlookOpen) => set({ weeklyOutlookOpen }),
  openWeeklyOutlook: () => set({ weeklyOutlookOpen: true }),
  closeWeeklyOutlook: () => set({ weeklyOutlookOpen: false }),
}))
```

## Migration Plan

### Files to Delete

```
src/hooks/use-theme.tsx          → replaced by usePreferencesStore
src/lib/storage.ts               → replaced by stores
```

### Files to Modify

```
src/routes/__root.tsx            → Remove ThemeProvider, add Zustand hydration
src/routes/observatory.$slug.tsx → Use useWeatherStore instead of useState
src/components/ui/sidebar.tsx    → Use useUIStore instead of internal state
src/components/features/weekly-outlook/widget.tsx → Use useUIStore
src/lib/i18n/index.ts            → Subscribe to usePreferencesStore.language
```

### Migration Order

1. Create `src/stores/` with all stores
2. Migrate preferences (theme/language) first - highest impact
3. Migrate locations store
4. Migrate weather store
5. Migrate UI store
6. Delete old files, clean up

## SSR Considerations

Theme and language must apply before first render to avoid flash. The cookie storage adapter enables server-side reading of preferences.

```typescript
// In __root.tsx - apply theme from store
const theme = usePreferencesStore((s) => s.theme)
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}, [theme])
```

## Benefits

- **No prop drilling:** Components access state directly via hooks
- **Centralized:** All state in one place, easy to debug
- **Performance:** Zustand's selective subscriptions prevent unnecessary re-renders
- **DevTools:** Zustand integrates with Redux DevTools for debugging
- **SSR:** Cookie persistence maintains server-side compatibility
