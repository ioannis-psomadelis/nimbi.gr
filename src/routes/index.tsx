'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { getAllLocations, createLocationFromCoords } from '../lib/server/locations'
import { searchLocations, type GeocodeResult } from '../lib/server/geocode'
import i18n from '../lib/i18n'

export const Route = createFileRoute('/')({
  loader: async () => {
    const locations = await getAllLocations()
    return { locations }
  },
  head: () => ({
    meta: [
      {
        title: i18n.t('metaHomeTitle'),
      },
      {
        name: 'description',
        content: i18n.t('metaHomeDescription'),
      },
      {
        property: 'og:title',
        content: i18n.t('metaHomeTitle'),
      },
      {
        property: 'og:description',
        content: i18n.t('metaHomeDescription'),
      },
      {
        property: 'og:url',
        content: 'https://nimbi.gr/',
      },
    ],
  }),
  component: HomePage,
})

type PermissionState = 'prompt' | 'granted' | 'denied'

function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { locations } = Route.useLoaderData()
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Geolocation state
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt')
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Check geolocation permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermissionState(result.state as PermissionState)
          result.addEventListener('change', () => {
            setPermissionState(result.state as PermissionState)
          })
        })
        .catch(() => {
          setPermissionState('prompt')
        })
    }
  }, [])

  // Navigate to observatory with slug
  const navigateToObservatory = useCallback(async (lat: number, lon: number) => {
    const { slug } = await createLocationFromCoords({ data: { lat, lon } })
    navigate({ to: '/observatory/$slug', params: { slug } })
  }, [navigate])

  // Handle "Use my location" button click
  const handleUseLocation = async () => {
    setIsLocating(true)
    setLocationError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
        })
      })

      await navigateToObservatory(position.coords.latitude, position.coords.longitude)
    } catch (error) {
      const geoError = error as GeolocationPositionError
      let errorMessage = t('locationError')

      if (geoError.code === geoError.PERMISSION_DENIED) {
        setPermissionState('denied')
        errorMessage = t('locationPermissionDenied')
      } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
        errorMessage = t('locationUnavailable')
      } else if (geoError.code === geoError.TIMEOUT) {
        errorMessage = t('locationTimeout')
      }

      setLocationError(errorMessage)
      setIsLocating(false)
    }
  }

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)

    try {
      const results = await searchLocations({ data: query })
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search result selection
  const handleSelectSearchResult = async (result: GeocodeResult) => {
    setShowResults(false)
    setSearchQuery('')
    await navigateToObservatory(result.lat, result.lon)
  }

  // Handle quick pick selection
  const handleQuickPick = (slug: string) => {
    navigate({ to: '/observatory/$slug', params: { slug } })
  }

  // Get top 6 locations for quick picks
  const quickPicks = Object.entries(locations).slice(0, 6)

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Generate weather particles
  const snowflakes = Array.from({ length: 40 }, (_, i) => (
    <div key={`snow-${i}`} className="snowflake" />
  ))

  const raindrops = Array.from({ length: 50 }, (_, i) => (
    <div key={`rain-${i}`} className="raindrop" />
  ))

  // Clouds
  const clouds = (
    <div className="clouds-layer">
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />
      <div className="cloud cloud-5" />
    </div>
  )

  // Full-page loading overlay when locating
  if (isLocating) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
        {/* Living Weather Background */}
        <div className="home-bg">
          {clouds}
          <div className="weather-particles">
            <div className="snow-layer">{snowflakes}</div>
            <div className="rain-layer">{raindrops}</div>
          </div>
        </div>

        <div className="relative animate-fade-in-scale">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
        </div>
        <p className="mt-8 text-foreground/80 font-medium tracking-wide">{t('findingYourLocation')}</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Living Weather Background */}
      <div className="home-bg">
        {clouds}
        <div className="weather-particles">
          <div className="snow-layer">{snowflakes}</div>
          <div className="rain-layer">{raindrops}</div>
        </div>
      </div>

      {/* Minimal Header */}
      <header className="flex items-center justify-between px-6 sm:px-8 py-5 animate-fade-in">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white/90 dark:bg-primary/15 flex items-center justify-center border border-white/50 dark:border-primary/20 group-hover:bg-white dark:group-hover:bg-primary/25 transition-colors shadow-md dark:shadow-none">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <span className="font-semibold text-white dark:text-foreground/90 text-sm tracking-wide drop-shadow-md dark:drop-shadow-none">nimbi</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 pb-20">
        <div className="w-full max-w-md stagger">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/15">
                <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white dark:text-foreground tracking-tight mb-3 drop-shadow-lg">
              Nimbus
            </h1>
            <p className="text-white/80 dark:text-foreground/60 text-sm sm:text-base max-w-xs mx-auto leading-relaxed drop-shadow-md">
              {t('multiModelWeatherObservatory')}
            </p>
          </div>

          {/* Actions Card */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            {/* Location button */}
            {permissionState !== 'denied' && (
              <button
                onClick={handleUseLocation}
                className="home-btn-primary w-full h-12 rounded-xl text-sm flex items-center justify-center gap-2.5"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('useMyLocation')}
              </button>
            )}

            {/* Error message */}
            {locationError && (
              <p className="text-destructive text-xs text-center">{locationError}</p>
            )}

            {/* Search input */}
            <div className="relative" ref={searchContainerRef}>
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  placeholder={t('searchForACity')}
                  className="w-full h-12 pl-10 pr-4 text-sm rounded-xl bg-background/50 border-border/50 focus:bg-background focus:border-primary/50"
                />
                {isSearching && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search results dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-50 py-1">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.lat}-${result.lon}-${index}`}
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground block truncate">{result.name}</span>
                        <span className="text-xs text-foreground/50">{result.country}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {showResults && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl py-4 px-4 text-center text-foreground/50 text-sm z-50">
                  {t('noResultsFound')}
                </div>
              )}
            </div>
          </div>

          {/* Quick picks */}
          <div className="mt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px flex-1 bg-white/30 dark:bg-foreground/10" />
              <span className="text-xs text-white/70 dark:text-foreground/50 uppercase tracking-widest font-medium">{t('orExplore')}</span>
              <div className="h-px flex-1 bg-white/30 dark:bg-foreground/10" />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {quickPicks.map(([slug, location]) => (
                <button
                  key={slug}
                  onClick={() => handleQuickPick(slug)}
                  className="home-pill h-9 px-4 rounded-full text-xs font-medium text-foreground/80"
                >
                  {location.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center animate-fade-in space-y-1">
        <p className="text-xs text-foreground/40">
          © {new Date().getFullYear()} nimbi.gr
        </p>
        <p className="text-[10px] text-foreground/25">
          {t('dataFrom')} Open-Meteo & Meteociel
        </p>
      </footer>
    </div>
  )
}
