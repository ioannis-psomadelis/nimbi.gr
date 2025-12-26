'use client'

import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createFileRoute, Await } from '@tanstack/react-router'
import { MenuIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ModelCard } from '../components/features/model-card'
import { ComparisonChart } from '../components/features/comparison-chart'
import { SavedLocations } from '../components/features/saved-locations'
import { RunSelector } from '../components/features/run-selector'
import { RunImageViewer } from '../components/features/run-image-viewer'
import { MODELS, MODEL_CONFIG, type ModelId } from '../types/models'
import { getLatestRun, getPreviousRuns, detectRegion } from '../lib/utils/runs'
import { fetchModelData } from '../lib/api/weather'
import { getLocationBySlug } from '../lib/server/locations'
import { getServerSavedLocations, getServerSelectedModel } from '../lib/server/storage'
import { saveSelectedModel } from '../lib/storage'
import type { WeatherResponse } from '../types/weather'
import { ModelCardSkeleton, ChartSkeleton } from '../components/skeletons'
import { WeeklyOutlookWidget, OutlookTrigger } from '../components/features/weekly-outlook'
import { useWeeklyOutlook } from '../lib/forecast/use-weekly-outlook'
import { Button } from '../components/ui/button'
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

// Type for deferred model data
type DeferredModelData = Promise<Record<ModelId, WeatherResponse | null>>

// Helper to convert country code to flag emoji
function countryCodeToFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Loader - returns deferred (unawaited) promise for streaming SSR
export const Route = createFileRoute('/observatory/$slug')({
  loader: async ({ params }) => {
    // Get location, saved locations, and selected model from server
    const [location, savedLocations, savedModel] = await Promise.all([
      getLocationBySlug({ data: params.slug }),
      getServerSavedLocations(),
      getServerSelectedModel(),
    ])

    // Return unawaited promise - this enables streaming SSR
    const modelDataPromise: DeferredModelData = Promise.allSettled(
      MODELS.map((model) => fetchModelData(model, location.lat, location.lon))
    ).then((results) => {
      const modelData: Record<ModelId, WeatherResponse | null> = {} as Record<ModelId, WeatherResponse | null>
      MODELS.forEach((model, index) => {
        const result = results[index]
        modelData[model] = result.status === 'fulfilled' ? result.value : null
      })
      return modelData
    })

    return {
      location,
      savedLocations,
      savedModel,
      modelDataPromise,
    }
  },
  component: ObservatoryPage,
})

// Skeleton for model cards section
function ModelCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      {MODELS.map((model) => (
        <ModelCardSkeleton key={model} />
      ))}
    </div>
  )
}

// Skeleton for charts section
function ChartsSkeleton() {
  return (
    <div className="space-y-4">
      <ChartSkeleton />
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  )
}

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
    return data.hourly.temperature_2m[0]
  }, [modelData])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      {MODELS.map((model) => (
        <ModelCard
          key={model}
          model={model}
          temperature={getCurrentTemperature(model)}
          isLoading={false}
          isError={modelData[model] === null}
          isSelected={selectedModel === model}
          onClick={() => onModelSelect(model)}
        />
      ))}
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
}: {
  modelData: Record<ModelId, WeatherResponse | null>
  location: string
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
  })

  return <WeeklyOutlookWidget narrative={narrative} />
}

// Sidebar trigger for weekly outlook
function SidebarOutlookTrigger({
  modelData,
  location,
}: {
  modelData: Record<ModelId, WeatherResponse | null>
  location: string
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
  })

  return <OutlookTrigger narrative={narrative} variant="sidebar" />
}

// Sidebar trigger component - shows when sidebar is closed
function SidebarOpenTrigger() {
  const { open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar()

  // Hide when sidebar is open
  if (isMobile ? openMobile : open) return null

  return (
    <Button
      variant="default"
      size="icon"
      className="fixed left-4 top-[72px] z-40 shadow-lg bg-primary hover:bg-primary/90"
      onClick={() => isMobile ? setOpenMobile(true) : setOpen(true)}
    >
      <MenuIcon className="h-4 w-4" />
      <span className="sr-only">Open sidebar</span>
    </Button>
  )
}

function ObservatoryPage() {
  const { t } = useTranslation()

  // Get deferred loader data
  const { location, savedLocations, savedModel, modelDataPromise } = Route.useLoaderData()
  const { lat, lon, name, nameLocal, country } = location

  // Scroll state for sidebar transformation - debounced with RAF
  const [isScrolled, setIsScrolled] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current !== null) return // Skip if already scheduled
      rafRef.current = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20)
        rafRef.current = null
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Run state - use saved model from cookie or default to ecmwf-hres
  const [selectedModel, setSelectedModel] = useState<ModelId>(savedModel || 'ecmwf-hres')
  const currentRun = getLatestRun()
  const previousRuns = getPreviousRuns(4)
  const [selectedRun, setSelectedRun] = useState(currentRun)
  const region = detectRegion(lat, lon)

  // Memoized model select handler - save to cookie
  const handleModelSelect = useCallback((model: ModelId) => {
    setSelectedModel(model)
    saveSelectedModel(model)
  }, [])

  return (
    <>
      <Header />
      <div className="pt-14 min-h-screen">
        <SidebarProvider defaultOpen={true}>
          {/* Sidebar open trigger - shows when closed */}
          <SidebarOpenTrigger />

          <Sidebar
            collapsible="offcanvas"
            className={`
              will-change-transform transition-all duration-300 ease-out overflow-hidden
              ${isScrolled
                ? 'md:top-[72px] md:left-4 md:rounded-xl md:border md:border-border md:max-h-[calc(100vh-144px)] md:h-auto top-14 bottom-0'
                : 'top-14 bottom-0'
              }
            `}
          >
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

                      {/* Live Indicator */}
                      <div className="flex items-center gap-1.5 mt-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('live')}</span>
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
                  <SavedLocations currentLat={lat} currentLon={lon} initialLocations={savedLocations} />
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Weekly Outlook in Sidebar */}
              <SidebarGroup>
                <SidebarGroupContent>
                  <Suspense fallback={null}>
                    <Await promise={modelDataPromise}>
                      {(modelData) => (
                        <SidebarOutlookTrigger modelData={modelData} location={name} />
                      )}
                    </Await>
                  </Suspense>
                </SidebarGroupContent>
              </SidebarGroup>

            </SidebarContent>
          </Sidebar>

      <SidebarInset className="bg-background">
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

              {/* Model Cards Grid - Responsive with Suspense */}
              <Suspense fallback={<ModelCardsSkeleton />}>
                <Await promise={modelDataPromise}>
                  {(modelData) => (
                    <ModelCardsContent
                      modelData={modelData}
                      selectedModel={selectedModel}
                      onModelSelect={handleModelSelect}
                    />
                  )}
                </Await>
              </Suspense>
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
                  currentRun={currentRun}
                  previousRuns={previousRuns}
                  selectedRun={selectedRun}
                  onRunChange={setSelectedRun}
                />
              </div>

              <RunImageViewer runId={selectedRun.id} model={selectedModel} latitude={lat} longitude={lon} />
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

              <Suspense fallback={<ChartsSkeleton />}>
                <Await promise={modelDataPromise}>
                  {(modelData) => <ChartsContent modelData={modelData} />}
                </Await>
              </Suspense>
            </div>
          </div>
        </main>
        </SidebarInset>
      </SidebarProvider>
      </div>
      {/* Weekly Outlook Widget */}
      <Suspense fallback={null}>
        <Await promise={modelDataPromise}>
          {(modelData) => (
            <WeeklyOutlookContent modelData={modelData} location={name} />
          )}
        </Await>
      </Suspense>

      <Footer />
    </>
  )
}
