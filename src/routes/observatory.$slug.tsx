'use client'

import { useState, useMemo, useCallback, useRef, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery, HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ModelCard } from '../components/features/model-card'
import { ComparisonChart } from '../components/features/comparison-chart'
import { SavedLocations } from '../components/features/saved-locations'
import { RunSelector } from '../components/features/run-selector'
import { RunImageViewer } from '../components/features/run-image-viewer'
import { SimpleHero, SimpleWeatherView } from '../components/features/simple-mode'
import { MODELS, MODEL_CONFIG, type ModelId } from '../types/models'
import { detectRegion } from '../lib/utils/runs'
import { useModelRuns, getNearestValidRunHour, getLatestModelRun } from '../hooks/use-model-runs'
import { allModelsQueryOptions } from '../lib/api/weather'
import { getQueryClient } from '../lib/query-client'
import { getLocationBySlug } from '../lib/server/locations'
import { getServerSavedLocations, getServerSelectedModel, getServerProMode } from '../lib/server/storage'
import { useWeatherStore } from '../stores'
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts'
import type { WeatherResponse } from '../types/weather'
import { WeeklyOutlookWidget, OutlookTrigger } from '../components/features/weekly-outlook'
import { AirQualityCard } from '../components/features/air-quality'
import { WeatherAlerts } from '../components/features/weather-alerts'
import { useWeeklyOutlook } from '../lib/forecast/use-weekly-outlook'
import { Button } from '../components/ui/button'
import { ShareButton } from '../components/ui/share-button'
import { ErrorBoundary } from '../components/ui/error-boundary'
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  useSidebar,
} from '../components/ui/sidebar'
import i18n from '../lib/i18n'

// Helper to convert country code to flag emoji
function countryCodeToFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Loader - prefetches data with React Query for optimal caching
export const Route = createFileRoute('/observatory/$slug')({
  loader: async ({ params }) => {
    // Get location, saved locations, selected model, and pro mode from server
    const [location, savedLocations, savedModel, proMode] = await Promise.all([
      getLocationBySlug({ data: params.slug }),
      getServerSavedLocations(),
      getServerSelectedModel(),
      getServerProMode(),
    ])

    // Get QueryClient for this request (new instance on server, singleton on client)
    const queryClient = getQueryClient()

    // Prefetch weather data - React Query will cache it
    // ensureQueryData only fetches if data is stale or missing
    await queryClient.ensureQueryData(
      allModelsQueryOptions(location.lat, location.lon, proMode)
    )

    // Dehydrate the QueryClient state to transfer to client
    // This prevents grey screen on first load by hydrating the cache
    // Use JSON serialization to ensure clean transfer between server/client
    const dehydratedState = dehydrate(queryClient)

    return {
      location,
      savedLocations,
      savedModel,
      proMode,
      // Serialize/deserialize to ensure clean types for TanStack Router
      dehydratedState: JSON.parse(JSON.stringify(dehydratedState)),
    }
  },
  head: ({ loaderData }) => {
    const locationName = loaderData?.location?.name || 'Weather'
    const slug = loaderData?.location?.slug || ''
    const lat = loaderData?.location?.lat || 0
    const lon = loaderData?.location?.lon || 0
    const country = loaderData?.location?.country || ''
    const title = i18n.t('metaObservatoryTitle', { location: locationName })
    const description = i18n.t('metaObservatoryDescription', { location: locationName })
    const url = `https://nimbi.gr/observatory/${slug}`

    // JSON-LD structured data for weather forecast page
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url: url,
      name: title,
      description: description,
      isPartOf: {
        '@id': 'https://nimbi.gr/#website',
      },
      about: {
        '@type': 'Place',
        name: locationName,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: lat,
          longitude: lon,
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: country,
        },
      },
      mainEntity: {
        '@type': 'WebApplication',
        name: 'nimbi.gr Weather Forecast',
        applicationCategory: 'WeatherApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
      },
      inLanguage: ['en', 'el'],
      dateModified: new Date().toISOString(),
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
          content: url,
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
          href: url,
        },
        // Hreflang for this specific page
        {
          rel: 'alternate',
          hrefLang: 'en',
          href: url,
        },
        {
          rel: 'alternate',
          hrefLang: 'el',
          href: url,
        },
        {
          rel: 'alternate',
          hrefLang: 'x-default',
          href: url,
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
  component: ObservatoryPage,
})

// Component that renders model cards with resolved data
function ModelCardsContent({
  modelData,
  selectedModel,
  onModelSelect,
}: {
  modelData: Record<ModelId, WeatherResponse | null>
  selectedModel: ModelId
  onModelSelect: (model: ModelId) => void
}) {
  const getCurrentTemperature = useCallback((model: ModelId) => {
    const data = modelData[model]
    if (!data) return undefined
    const temp = data.hourly.temperature_2m[0]
    return temp !== null ? temp : undefined
  }, [modelData])

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-2 sm:gap-3 min-w-max">
        {MODELS.map((model) => (
          <ModelCard
            key={model}
            model={model}
            temperature={getCurrentTemperature(model)}
            isLoading={false}
            isError={modelData[model] === null}
            isSelected={selectedModel === model}
            onClick={() => onModelSelect(model)}
            showInfo
          />
        ))}
      </div>
    </div>
  )
}

// Component that renders charts with resolved data
function ChartsContent({
  modelData,
}: {
  modelData: Record<ModelId, WeatherResponse | null>
}) {
  const { t } = useTranslation()

  const chartModels = useMemo(
    () => MODELS.map((model) => ({ model, data: modelData[model] ?? undefined })),
    [modelData]
  )

  return (
    <div className="space-y-4">
      <ComparisonChart
        models={chartModels}
        variable="temperature_2m"
        title={t('temperature')}
        unit="°C"
        isLoading={false}
      />
      <ComparisonChart
        models={chartModels}
        variable="precipitation"
        title={t('precipitation')}
        unit="mm"
        isLoading={false}
      />
      <ComparisonChart
        models={chartModels}
        variable="wind_speed_10m"
        title={t('windSpeed')}
        unit="km/h"
        isLoading={false}
      />
    </div>
  )
}

// Component that renders the weekly outlook widget with resolved data
function WeeklyOutlookContent({
  modelData,
  location,
  lat,
  lon,
}: {
  modelData: Record<ModelId, WeatherResponse | null>
  location: string
  lat: number
  lon: number
}) {
  // Filter out null values for the hook
  const validModelData = useMemo(() => {
    const result: Record<ModelId, WeatherResponse> = {} as Record<ModelId, WeatherResponse>
    for (const [key, value] of Object.entries(modelData)) {
      if (value !== null) {
        result[key as ModelId] = value
      }
    }
    return Object.keys(result).length > 0 ? result : null
  }, [modelData])

  const { narrative } = useWeeklyOutlook({
    modelData: validModelData,
    location,
    lat,
    lon,
  })

  return <WeeklyOutlookWidget narrative={narrative} />
}

// Sidebar trigger for weekly outlook
function SidebarOutlookTrigger({
  modelData,
  location,
  lat,
  lon,
}: {
  modelData: Record<ModelId, WeatherResponse | null>
  location: string
  lat: number
  lon: number
}) {
  const validModelData = useMemo(() => {
    const result: Record<ModelId, WeatherResponse> = {} as Record<ModelId, WeatherResponse>
    for (const [key, value] of Object.entries(modelData)) {
      if (value !== null) {
        result[key as ModelId] = value
      }
    }
    return Object.keys(result).length > 0 ? result : null
  }, [modelData])

  const { narrative } = useWeeklyOutlook({
    modelData: validModelData,
    location,
    lat,
    lon,
  })

  return <OutlookTrigger narrative={narrative} variant="sidebar" />
}

// Header sidebar trigger - animates in/out based on sidebar state
// On mobile: always visible. On desktop: hidden when sidebar is open.
// Uses consistent wrapper structure for SSR to prevent layout shift.
function HeaderSidebarTrigger() {
  const { open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar()

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(!openMobile)
    } else {
      setOpen(true)
    }
  }

  // SSR: render with desktop-hidden classes (md:w-0) since sidebar defaults open
  // This matches the hydrated desktop state, preventing layout shift
  if (isMobile === undefined) {
    return (
      <div className="w-9 md:w-0 md:opacity-0 overflow-hidden transition-all duration-300 ease-out">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
          onClick={handleClick}
        >
          <div className="hamburger-menu" data-open={false}>
            <span />
            <span />
            <span />
          </div>
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
    )
  }

  // Mobile: always show, no wrapper animation needed
  if (isMobile) {
    return (
      <div className="w-9 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
          onClick={handleClick}
        >
          <div className="hamburger-menu" data-open={openMobile}>
            <span />
            <span />
            <span />
          </div>
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
    )
  }

  // Desktop: animate width based on sidebar state
  return (
    <div
      className={`
        overflow-hidden transition-all duration-300 ease-out
        ${open ? 'w-0 opacity-0' : 'w-9 opacity-100'}
      `}
    >
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
        onClick={handleClick}
      >
        <div className="hamburger-menu" data-open={open}>
          <span />
          <span />
          <span />
        </div>
        <span className="sr-only">Open sidebar</span>
      </Button>
    </div>
  )
}

/**
 * Loading fallback for Suspense boundary
 * Shows a minimal skeleton while data loads (rare case - usually hydrated from SSR)
 */
function ObservatoryLoadingFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 bg-card/95 border-b border-border/50" />
      <div className="pt-14 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-32 bg-muted/60 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ObservatoryPage() {
  // Get loader data including dehydrated React Query state
  const { location, savedLocations, savedModel, proMode, dehydratedState } = Route.useLoaderData()
  const { lat, lon, name, nameLocal, country } = location

  // Wrap with ErrorBoundary to catch hydration/rendering failures
  // Wrap with Suspense as fallback for useSuspenseQuery (rarely needed due to SSR hydration)
  // HydrationBoundary rehydrates the React Query cache from server
  return (
    <ErrorBoundary>
      <HydrationBoundary state={dehydratedState}>
        <Suspense fallback={<ObservatoryLoadingFallback />}>
          <ObservatoryContent
            lat={lat}
            lon={lon}
            name={name}
            nameLocal={nameLocal}
            country={country}
            savedLocations={savedLocations}
            savedModel={savedModel}
            proMode={proMode}
          />
        </Suspense>
      </HydrationBoundary>
    </ErrorBoundary>
  )
}

// Actual page content - uses useSuspenseQuery which will use hydrated cache
function ObservatoryContent({
  lat,
  lon,
  name,
  nameLocal,
  country,
  savedLocations,
  savedModel,
  proMode,
}: {
  lat: number
  lon: number
  name: string
  nameLocal?: string
  country: string
  savedLocations: { id: string; name: string; lat: number; lon: number; isDefault: boolean }[]
  savedModel: ModelId | null
  proMode: boolean
}) {
  const { t } = useTranslation()

  // Get weather data from React Query cache (hydrated from server)
  // No loading/suspense on first load - data is already in cache
  const { data: modelData } = useSuspenseQuery(
    allModelsQueryOptions(lat, lon, proMode)
  )

  // Run state - use saved model from cookie or default to ecmwf-hres
  const [selectedModel, setSelectedModel] = useState<ModelId>(savedModel || 'ecmwf-hres')
  const region = detectRegion(lat, lon)

  // Get model-specific run times
  const { latestRun, previousRuns } = useModelRuns(selectedModel)
  const [selectedRun, setSelectedRun] = useState(latestRun)

  // Zustand store for persisting selected model
  const setStoredModel = useWeatherStore((s) => s.setSelectedModel)

  // Update selected run when model changes to use model-appropriate runs
  useEffect(() => {
    // Get the nearest valid run for the new model
    const currentRunHour = selectedRun.hour
    const nearestValidHour = getNearestValidRunHour(selectedModel, currentRunHour)

    if (nearestValidHour !== currentRunHour) {
      // Find the matching run or use the latest
      const newRun = getLatestModelRun(selectedModel)
      setSelectedRun(newRun)
    }
  }, [selectedModel, selectedRun.hour])

  // Memoized model select handler - save to Zustand store (persisted to cookie)
  const handleModelSelect = useCallback((model: ModelId) => {
    setSelectedModel(model)
    setStoredModel(model)
  }, [setStoredModel])

  // Ref for keyboard navigation of forecast hours
  const forecastHourRef = useRef<{ goToPrevious: () => void; goToNext: () => void } | null>(null)

  // Keyboard shortcuts for pro mode
  useKeyboardShortcuts({
    enabled: proMode,
    onPreviousHour: () => forecastHourRef.current?.goToPrevious(),
    onNextHour: () => forecastHourRef.current?.goToNext(),
    onModelChange: handleModelSelect,
    currentModel: selectedModel,
  })

  // Simple mode layout - only shows ECMWF HRES data in a clean interface
  if (!proMode) {
    return (
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="offcanvas" className="!top-14 !h-[calc(100svh-3.5rem)]">
          {/* Top Header with Toggle */}
          <SidebarHeader className="flex-row items-center justify-between p-3 border-b border-border">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              {t('stormObservatory')}
            </span>
            <SidebarTrigger className="w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" />
          </SidebarHeader>

          <SidebarContent className="pt-2">
            {/* Location Info */}
            <SidebarGroup>
              <SidebarGroupContent>
                <div className="relative overflow-hidden rounded-xl bg-muted/50 border border-border p-4">
                  {/* Decorative Element */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{countryCodeToFlag(country)}</span>
                      <h2 className="text-lg font-semibold text-foreground">
                        {name}
                      </h2>
                    </div>
                    {nameLocal && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {nameLocal}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground font-mono">
                      {region === 'europe' ? t('europeanRegion') : t('northAmericanRegion')}
                    </p>

                    {/* Live Indicator and Share */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('live')}</span>
                      </div>
                      <ShareButton
                        title={`${name} - ${t('weatherObservatory')}`}
                        text={t('shareForecastText', { location: name, defaultValue: `Weather forecast for ${name}` })}
                      />
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Saved Locations */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {t('savedLocations')}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SavedLocations currentLat={lat} currentLon={lon} currentName={nameLocal || name} initialLocations={savedLocations} />
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Weekly Outlook in Sidebar */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarOutlookTrigger modelData={modelData} location={name} lat={lat} lon={lon} />
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Air Quality in Sidebar */}
            <SidebarGroup>
              <SidebarGroupContent>
                <AirQualityCard lat={lat} lon={lon} variant="sidebar" />
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Weather Alerts in Sidebar */}
            <SidebarGroup>
              <SidebarGroupContent>
                <WeatherAlerts countryCode={country} lat={lat} lon={lon} locationName={name} compact />
              </SidebarGroupContent>
            </SidebarGroup>

          </SidebarContent>
        </Sidebar>

        <SidebarInset className="pt-14 bg-background">
          <Header proMode={proMode} leftSlot={<HeaderSidebarTrigger />} />
          {/* Main Content - Simple Mode */}
          <main className="flex-1 min-w-0 overflow-auto">
            {/* Hero Section with Current Weather */}
            <section className="relative overflow-hidden border-b border-border">
              {/* Subtle Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />

              <div className="relative p-4 sm:p-6 lg:p-8">
                {modelData['ecmwf-hres'] && <SimpleHero data={modelData['ecmwf-hres']} />}
              </div>
            </section>

            {/* Connected Hourly + 7-Day Forecast */}
            <section className="min-w-0 p-4 sm:p-6 lg:p-8">
              {modelData['ecmwf-hres'] && <SimpleWeatherView data={modelData['ecmwf-hres']} />}
            </section>
          </main>

          {/* Weekly Outlook Widget */}
          <WeeklyOutlookContent modelData={modelData} location={name} lat={lat} lon={lon} />

          <Footer />
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Pro mode layout - full feature set with all models
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="offcanvas" className="!top-14 !h-[calc(100svh-3.5rem)]">
        {/* Top Header with Toggle */}
        <SidebarHeader className="flex-row items-center justify-between p-3 border-b border-border">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            {t('stormObservatory')}
          </span>
          <SidebarTrigger className="w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" />
        </SidebarHeader>

        <SidebarContent className="pt-2">
          {/* Location Info */}
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="relative overflow-hidden rounded-xl bg-muted/50 border border-border p-4">
                {/* Decorative Element */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{countryCodeToFlag(country)}</span>
                    <h2 className="text-lg font-semibold text-foreground">
                      {name}
                    </h2>
                  </div>
                  {nameLocal && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {nameLocal}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono">
                    {region === 'europe' ? t('europeanRegion') : t('northAmericanRegion')}
                  </p>

                  {/* Live Indicator and Share */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('live')}</span>
                    </div>
                    <ShareButton
                      title={`${name} - ${t('weatherObservatory')}`}
                      text={t('shareForecastText', { location: name, defaultValue: `Weather forecast for ${name}` })}
                    />
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Saved Locations */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {t('savedLocations')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SavedLocations currentLat={lat} currentLon={lon} currentName={nameLocal || name} initialLocations={savedLocations} />
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Weekly Outlook in Sidebar */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarOutlookTrigger modelData={modelData} location={name} lat={lat} lon={lon} />
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Air Quality in Sidebar */}
          <SidebarGroup>
            <SidebarGroupContent>
              <AirQualityCard lat={lat} lon={lon} variant="sidebar" />
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Weather Alerts in Sidebar */}
          <SidebarGroup>
            <SidebarGroupContent>
              <WeatherAlerts countryCode={country} lat={lat} lon={lon} locationName={name} compact />
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
      </Sidebar>

      <SidebarInset className="pt-14 bg-background">
        <Header proMode={proMode} leftSlot={<HeaderSidebarTrigger />} />
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Hero Section with Model Cards */}
          <section className="relative overflow-hidden border-b border-border">
            {/* Subtle Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />

            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-foreground">
                    {t('modelOverview')}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('currentTemperatureForecasts')}</p>
                </div>
              </div>

              {/* Model Cards Grid */}
              <ModelCardsContent
                modelData={modelData}
                selectedModel={selectedModel}
                onModelSelect={handleModelSelect}
              />
            </div>
          </section>

          {/* Two Column Layout on Desktop, Stacked on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-border">
            {/* Left Column - Run Selector & Image Viewer */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 border-b lg:border-b-0 border-border">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${MODEL_CONFIG[selectedModel].color}20` }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: MODEL_CONFIG[selectedModel].color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      {MODEL_CONFIG[selectedModel].name} {t('charts')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t('chartsFrom')} Meteociel
                    </p>
                  </div>
                </div>

                <RunSelector
                  currentRun={latestRun}
                  previousRuns={previousRuns}
                  selectedRun={selectedRun}
                  onRunChange={setSelectedRun}
                />
              </div>

              <RunImageViewer runId={selectedRun.id} model={selectedModel} latitude={lat} longitude={lon} forecastHourRef={forecastHourRef} />
            </div>

            {/* Right Column - Comparison Charts */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {t('modelComparison')}
                  </h3>
                  <p className="text-xs text-muted-foreground">{t('compareAllModelsSideBySide')}</p>
                </div>

                {/* Legend - Responsive */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {MODELS.map((model) => (
                    <div key={model} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: MODEL_CONFIG[model].color }}
                      />
                      <span className="text-[10px] text-muted-foreground">{MODEL_CONFIG[model].name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ChartsContent modelData={modelData} />
            </div>
          </div>
        </main>

        {/* Weekly Outlook Widget */}
        <WeeklyOutlookContent modelData={modelData} location={name} lat={lat} lon={lon} />

        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
