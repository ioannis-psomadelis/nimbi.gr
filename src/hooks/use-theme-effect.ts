'use client'

import { useEffect } from 'react'
import { usePreferencesStore } from '../stores'

const THEME_COLORS = {
  light: '#ffffff',
  dark: '#0a0a0a',
} as const

/**
 * Hook that applies theme changes to the DOM.
 * Should be called once in the root layout.
 */
export function useThemeEffect() {
  const resolvedTheme = usePreferencesStore((s) => s.resolvedTheme)
  const theme = usePreferencesStore((s) => s.theme)
  const updateResolvedTheme = usePreferencesStore((s) => s.updateResolvedTheme)

  // Apply theme to document and update status bar color
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    root.style.colorScheme = resolvedTheme

    // Update theme-color meta tag for mobile status bar
    const existingMetas = document.querySelectorAll('meta[name="theme-color"]')
    existingMetas.forEach((meta) => meta.remove())

    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = THEME_COLORS[resolvedTheme]
    document.head.appendChild(meta)
  }, [resolvedTheme])

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      updateResolvedTheme()
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, updateResolvedTheme])
}
