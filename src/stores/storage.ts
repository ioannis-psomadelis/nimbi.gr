import Cookies from 'js-cookie'
import type { StateStorage } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'

const COOKIE_NAME = 'nimbi-store'
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 365,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/', // Ensure cookie is available on all routes
}

/**
 * Base storage adapter that stores raw strings in a single namespaced cookie.
 */
const baseCookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === 'undefined') return null

    const cookie = Cookies.get(COOKIE_NAME)
    if (!cookie) return null

    try {
      const data = JSON.parse(cookie)
      const value = data[name]
      // Return the stored JSON string directly
      return value !== undefined ? JSON.stringify(value) : null
    } catch {
      return null
    }
  },

  setItem: (name: string, value: string): void => {
    if (typeof document === 'undefined') return

    try {
      // Handle case where existing cookie might be corrupted
      const existingCookie = Cookies.get(COOKIE_NAME)
      let data: Record<string, unknown> = {}

      if (existingCookie) {
        try {
          data = JSON.parse(existingCookie)
        } catch {
          // Cookie was corrupted, start fresh
          data = {}
        }
      }

      // Parse and store the value
      const parsed = JSON.parse(value)
      data[name] = parsed

      Cookies.set(COOKIE_NAME, JSON.stringify(data), COOKIE_OPTIONS)
    } catch (error) {
      console.error('[nimbi-store] Failed to save:', error)
    }
  },

  removeItem: (name: string): void => {
    if (typeof document === 'undefined') return

    try {
      const cookie = Cookies.get(COOKIE_NAME)
      if (!cookie) return
      const data = JSON.parse(cookie)
      delete data[name]
      Cookies.set(COOKIE_NAME, JSON.stringify(data), COOKIE_OPTIONS)
    } catch {
      // Ignore storage errors
    }
  },
}

/**
 * Cookie storage wrapped with JSON serialization for Zustand persist.
 */
export const cookieStorage = createJSONStorage(() => baseCookieStorage)
