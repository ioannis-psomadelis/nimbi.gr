import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { cookieStorage } from './storage'
import { trackEvent } from '../lib/posthog'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
export type Language = 'en' | 'el'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

interface PreferencesState {
  // State
  theme: Theme
  resolvedTheme: ResolvedTheme
  language: Language
  proMode: boolean

  // Actions
  setTheme: (theme: Theme) => void
  updateResolvedTheme: () => void
  setLanguage: (language: Language) => void
  setProMode: (enabled: boolean) => void
  toggleProMode: () => void
  toggleTheme: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // Defaults - use system theme preference
      theme: 'system',
      resolvedTheme: typeof window !== 'undefined' ? getSystemTheme() : 'dark',
      language: 'en',
      proMode: false,

      // Actions
      setTheme: (theme) => {
        const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
        set({ theme, resolvedTheme })
      },

      updateResolvedTheme: () => {
        const { theme } = get()
        if (theme === 'system') {
          set({ resolvedTheme: getSystemTheme() })
        }
      },

      toggleTheme: () => {
        const { resolvedTheme } = get()
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
        set({ theme: newTheme, resolvedTheme: newTheme })
      },

      setLanguage: (language) => set({ language }),
      setProMode: (proMode) => {
        trackEvent('pro_mode_toggled', { enabled: proMode })
        set({ proMode })
      },
      toggleProMode: () => {
        const newProMode = !usePreferencesStore.getState().proMode
        trackEvent('pro_mode_toggled', { enabled: newProMode })
        set({ proMode: newProMode })
      },
    }),
    {
      name: 'preferences',
      storage: cookieStorage,
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        proMode: state.proMode,
        // Don't persist resolvedTheme - it's computed
      }),
      onRehydrateStorage: () => (state) => {
        // After hydration, resolve the theme
        if (state) {
          state.resolvedTheme = state.theme === 'system' ? getSystemTheme() : state.theme
        }
      },
    }
  )
)

// Selector hooks for optimized re-renders
// Use useShallow to prevent infinite re-renders with object selectors
export const useTheme = () => usePreferencesStore(
  useShallow((s) => ({
    theme: s.theme,
    resolvedTheme: s.resolvedTheme,
    setTheme: s.setTheme,
    toggleTheme: s.toggleTheme,
  }))
)
export const useLanguage = () => usePreferencesStore((s) => s.language)
export const useProMode = () => usePreferencesStore((s) => s.proMode)
