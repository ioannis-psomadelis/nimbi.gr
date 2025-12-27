'use client'

import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { SearchModal } from '@/components/features/search-modal'
import { getAllLocations, createLocationFromCoords } from '../lib/server/locations'
import i18n from '../lib/i18n'
import { CLOUD_PATH } from '../components/ui/logo'

export const Route = createFileRoute('/')({
  loader: async () => {
    const locations = await getAllLocations()
    return { locations }
  },
  head: () => {
    const title = i18n.t('metaHomeTitle')
    const description = i18n.t('metaHomeDescription')

    // JSON-LD for home page
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://nimbi.gr/#homepage',
      url: 'https://nimbi.gr/',
      name: title,
      description: description,
      isPartOf: {
        '@id': 'https://nimbi.gr/#website',
      },
      about: {
        '@type': 'WebApplication',
        name: 'nimbi.gr',
        applicationCategory: 'WeatherApplication',
        operatingSystem: 'Web',
        description: 'Multi-model weather forecasts comparing ECMWF, GFS, GEM & UKMO models',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
        featureList: [
          'ECMWF weather forecasts',
          'GFS weather forecasts',
          'GEM weather forecasts',
          'UKMO weather forecasts',
          'Multi-model comparison',
          '7-day weather forecast',
          'Hourly weather data',
        ],
      },
      inLanguage: ['en', 'el'],
    }

    return {
      meta: [
        {
          title,
        },
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
        {
          property: 'og:url',
          content: 'https://nimbi.gr/',
        },
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:description',
          content: description,
        },
      ],
      links: [
        {
          rel: 'canonical',
          href: 'https://nimbi.gr/',
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(jsonLd),
        },
      ],
    }
  },
  component: HomePage,
})

type PermissionState = 'prompt' | 'granted' | 'denied'

function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { locations } = Route.useLoaderData()

  // Geolocation state
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt')
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

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

  // Handle quick pick selection
  const handleQuickPick = (slug: string) => {
    navigate({ to: '/observatory/$slug', params: { slug } })
  }

  // Get top 6 locations for quick picks
  const quickPicks = Object.entries(locations).slice(0, 6)

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={CLOUD_PATH} />
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
              <div className="w-14 h-14 rounded-2xl bg-white/90 dark:bg-primary/15 flex items-center justify-center border border-white/50 dark:border-primary/20 shadow-lg dark:shadow-none">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={CLOUD_PATH} />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white dark:text-foreground tracking-tight mb-3 drop-shadow-lg">
              nimbi
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

            {/* Search - uses shared modal */}
            <SearchModal variant="home" />
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
