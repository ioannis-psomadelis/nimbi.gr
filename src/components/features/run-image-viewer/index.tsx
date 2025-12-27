'use client'

import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import {
  CHART_PARAMS,
  buildMeteocielUrl,
  type ChartParamId,
  type ChartRegion,
  detectBestRegion,
} from '../../../lib/utils/runs'
import {
  type RunImageViewerProps,
  type ForecastDateTime,
  snapToValidHour,
  getParamTranslations,
  MODEL_HOUR_CONFIG,
} from './types'
import { ParamSelector } from './param-selector'
import { RegionSelector } from './region-selector'
import { ForecastTimeBar } from './forecast-time-bar'
import { ImageDisplay } from './image-display'
import { HourSlider } from './hour-slider'

export function RunImageViewer({ runId, model, latitude, longitude, forecastHourRef }: RunImageViewerProps) {
  const { t, i18n } = useTranslation()
  const [selectedParam, setSelectedParam] = useState<ChartParamId>('0')
  const [forecastHour, setForecastHour] = useState(24)
  const detectedRegion = latitude && longitude ? detectBestRegion(latitude, longitude) : 'europe'
  const [selectedRegion, setSelectedRegion] = useState<ChartRegion>(detectedRegion)

  // Track previous model to detect changes and snap hour synchronously
  const prevModelRef = useRef(model)
  const effectiveForecastHour = useMemo(() => {
    if (prevModelRef.current !== model) {
      prevModelRef.current = model
      const snapped = snapToValidHour(forecastHour, model)
      // Update state for slider but return snapped value immediately
      if (snapped !== forecastHour) {
        // Schedule state update for next tick to avoid setState during render
        Promise.resolve().then(() => setForecastHour(snapped))
      }
      return snapped
    }
    return forecastHour
  }, [model, forecastHour])

  // Expose navigation methods via ref for keyboard shortcuts
  const hourConfig = MODEL_HOUR_CONFIG[model]
  const goToPrevious = useCallback(() => {
    setForecastHour(prev => Math.max(hourConfig.min, prev - hourConfig.step))
  }, [hourConfig])

  const goToNext = useCallback(() => {
    setForecastHour(prev => Math.min(hourConfig.max, prev + hourConfig.step))
  }, [hourConfig])

  // Expose methods to parent via ref
  useEffect(() => {
    if (forecastHourRef) {
      forecastHourRef.current = { goToPrevious, goToNext }
    }
    return () => {
      if (forecastHourRef) {
        forecastHourRef.current = null
      }
    }
  }, [forecastHourRef, goToPrevious, goToNext])

  // All params are available for ECMWF-HRES (it has full parameter support)
  const availableParams = useMemo(() => CHART_PARAMS, [])

  // Available regions for this location (memoized)
  const availableRegions = useMemo(() => {
    const regions: ChartRegion[] = ['europe']
    if (detectedRegion !== 'europe') {
      regions.push(detectedRegion)
    }
    return regions
  }, [detectedRegion])

  // Get the config for the selected parameter
  const selectedParamConfig = CHART_PARAMS.find(p => p.id === selectedParam)
  const mode = selectedParamConfig?.mode ?? 0

  // Build the target image URL - use effectiveForecastHour for immediate response
  const targetUrl = buildMeteocielUrl(model, runId, mode, effectiveForecastHour, selectedRegion)

  // Calculate forecast date/time from run ID and forecast hour (memoized)
  const forecastDateTime: ForecastDateTime = useMemo(() => {
    // runId format: YYYYMMDDHH
    const year = parseInt(runId.slice(0, 4))
    const month = parseInt(runId.slice(4, 6)) - 1
    const day = parseInt(runId.slice(6, 8))
    const runHour = parseInt(runId.slice(8, 10))

    const runDate = new Date(Date.UTC(year, month, day, runHour))
    const forecastDate = new Date(runDate.getTime() + effectiveForecastHour * 60 * 60 * 1000)

    const locale = i18n.language === 'el' ? 'el-GR' : 'en-US'
    const weekday = forecastDate.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' })
    const monthName = forecastDate.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' })
    const dayNum = forecastDate.getUTCDate()
    const hour = forecastDate.getUTCHours().toString().padStart(2, '0')

    return {
      short: `${weekday} ${monthName} ${dayNum}, ${hour}:00 UTC`,
      weekday,
      date: `${monthName} ${dayNum}`,
      time: `${hour}:00 UTC`,
    }
  }, [runId, effectiveForecastHour, i18n.language])

  const formatHourLabel = (h: number) => {
    const days = Math.floor(h / 24)
    const hours = h % 24
    if (days === 0) return `+${h}h`
    if (hours === 0) return `+${days}d`
    return `+${days}d ${hours}h`
  }

  // Generate alt text for the image
  const altText = selectedParamConfig
    ? `${t(getParamTranslations(selectedParamConfig.id).label)} forecast`
    : 'Forecast chart'

  return (
    <Card className="overflow-hidden border-border shadow-sm py-0 gap-0">
      <CardContent className="p-0">
        {/* Parameter Tabs with Info Buttons */}
        <ParamSelector
          selectedParam={selectedParam}
          onChange={setSelectedParam}
          availableParams={availableParams}
        />

        {/* Region Selector - Show for models that support regional charts */}
        <RegionSelector
          selectedRegion={selectedRegion}
          onChange={setSelectedRegion}
          availableRegions={availableRegions}
          model={model}
        />

        {/* Forecast Time Display */}
        <ForecastTimeBar
          forecastDateTime={forecastDateTime}
          forecastHour={effectiveForecastHour}
          formatHourLabel={formatHourLabel}
        />

        {/* Image Container */}
        <ImageDisplay
          targetUrl={targetUrl}
          altText={altText}
        />

        {/* Navigation Controls */}
        <HourSlider
          forecastHour={forecastHour}
          onChange={setForecastHour}
          forecastDateTime={forecastDateTime}
          model={model}
        />

        {/* Attribution and Keyboard Shortcuts */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground/60">
              {t('chartsFrom')}{' '}
              <a
                href="https://www.meteociel.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary transition-colors"
              >
                Meteociel.fr
              </a>
            </p>
            {/* Keyboard shortcut hints - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2 text-[9px] text-muted-foreground/50">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-muted/50 rounded text-[8px] font-mono">1-4</kbd>
                <span>{t('keyboardShortcutModels', 'models')}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-muted/50 rounded text-[8px] font-mono">&larr;&rarr;</kbd>
                <span>{t('keyboardShortcutTime', 'time')}</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
