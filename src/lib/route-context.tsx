'use client'

import { createContext, useContext, useMemo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'

export type Language = 'el' | 'en'

interface RouteContextValue {
  lang: Language
  proMode: boolean
}

const RouteContext = createContext<RouteContextValue>({
  lang: 'el',
  proMode: false,
})

export function RouteContextProvider({
  children,
  lang,
  proMode,
}: {
  children: React.ReactNode
  lang: Language
  proMode: boolean
}) {
  return (
    <RouteContext.Provider value={{ lang, proMode }}>
      {children}
    </RouteContext.Provider>
  )
}

export function useRouteContext() {
  return useContext(RouteContext)
}

/**
 * Parse a URL pathname to extract language, pro mode, and base path
 */
export function parsePathname(pathname: string): {
  lang: Language
  proMode: boolean
  basePath: string
} {
  let lang: Language = 'el'
  let proMode = false
  let basePath = pathname

  // Check for /en/ prefix
  if (pathname.startsWith('/en/') || pathname === '/en') {
    lang = 'en'
    basePath = pathname.slice(3) || '/'
  }

  // Check for /pro/ prefix (after removing language prefix)
  if (basePath.startsWith('/pro/') || basePath === '/pro') {
    proMode = true
    basePath = basePath.slice(4) || '/'
  }

  // Ensure basePath starts with /
  if (!basePath.startsWith('/')) {
    basePath = '/' + basePath
  }

  return { lang, proMode, basePath }
}

/**
 * Build a URL with the given language, pro mode, and base path
 */
export function buildPath(
  lang: Language,
  proMode: boolean,
  basePath: string
): string {
  const langPrefix = lang === 'en' ? '/en' : ''
  const proPrefix = proMode ? '/pro' : ''

  // Handle root path
  if (basePath === '/') {
    return `${langPrefix}${proPrefix}/` || '/'
  }

  return `${langPrefix}${proPrefix}${basePath}`
}

/**
 * Build a locale-aware observatory path
 */
export function buildObservatoryPath(
  lang: Language,
  proMode: boolean,
  slug: string
): string {
  return buildPath(lang, proMode, `/observatory/${slug}`)
}

/**
 * Hook that provides locale-aware path utilities based on current URL
 */
export function useLocalePath() {
  const location = useLocation()
  const navigate = useNavigate()

  // Parse current path
  const { lang, proMode, basePath } = useMemo(
    () => parsePathname(location.pathname),
    [location.pathname]
  )

  return useMemo(() => ({
    /** Current language */
    lang,
    /** Current pro mode state */
    proMode,
    /** Current base path (without lang/pro prefixes) */
    basePath,

    /**
     * Build a path preserving current lang/pro context
     */
    getPath: (path: string) => buildPath(lang, proMode, path),

    /**
     * Build a path with toggled language
     */
    getPathWithLang: (targetLang: Language) => buildPath(targetLang, proMode, basePath),

    /**
     * Build a path with toggled pro mode
     */
    getPathWithPro: (targetPro: boolean) => buildPath(lang, targetPro, basePath),

    /**
     * Build an observatory path preserving current lang/pro context
     */
    getObservatoryPath: (slug: string) => buildObservatoryPath(lang, proMode, slug),

    /**
     * Navigate to a locale-aware path
     */
    navigateTo: (path: string) => {
      navigate({ to: buildPath(lang, proMode, path) })
    },

    /**
     * Navigate to observatory with slug
     */
    navigateToObservatory: (slug: string) => {
      navigate({ to: buildObservatoryPath(lang, proMode, slug) })
    },

    /**
     * Navigate to change language (same page, different language)
     */
    navigateToLang: (targetLang: Language) => {
      if (targetLang !== lang) {
        navigate({ to: buildPath(targetLang, proMode, basePath) })
      }
    },

    /**
     * Navigate to toggle pro mode (same page, toggled pro)
     */
    navigateToPro: (targetPro: boolean) => {
      navigate({ to: buildPath(lang, targetPro, basePath) })
    },
  }), [lang, proMode, basePath, navigate])
}

/**
 * Get the canonical (non-pro) URL for SEO
 */
export function getCanonicalUrl(slug: string, lang: Language): string {
  const baseUrl = 'https://nimbi.gr'
  const langPrefix = lang === 'en' ? '/en' : ''

  if (!slug) {
    return `${baseUrl}${langPrefix}/`
  }

  return `${baseUrl}${langPrefix}/observatory/${slug}`
}

/**
 * Get hreflang URLs for a page
 */
export function getHreflangUrls(slug: string): { el: string; en: string; xDefault: string } {
  const baseUrl = 'https://nimbi.gr'
  const path = slug ? `/observatory/${slug}` : '/'

  return {
    el: `${baseUrl}${path}`,
    en: `${baseUrl}/en${path}`,
    xDefault: `${baseUrl}${path}`,
  }
}
