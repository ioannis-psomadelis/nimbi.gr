import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { WeatherResponse } from '../../types/weather'
import type { ModelId } from '../../types/models'
import type { WeeklyNarrative } from './types'
import { analyzeWeeklyForecast } from './analyzer'
import { generateWeeklyNarrative } from './narrative'

interface UseWeeklyOutlookOptions {
  modelData: Record<ModelId, WeatherResponse> | null
  location: string
  lat?: number
  lon?: number
  isLoading?: boolean
}

interface UseWeeklyOutlookResult {
  narrative: WeeklyNarrative | null
  isLoading: boolean
}

/**
 * Format time from ISO string
 */
function formatSunTime(isoString: string | undefined): string | undefined {
  if (!isoString) return undefined
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return undefined
  }
}

/**
 * Hook to generate weekly outlook narrative from model data
 */
export function useWeeklyOutlook({
  modelData,
  location,
  lat = 0,
  lon = 0,
  isLoading = false,
}: UseWeeklyOutlookOptions): UseWeeklyOutlookResult {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'el' ? 'el' : 'en'

  const narrative = useMemo(() => {
    if (!modelData || isLoading) return null

    try {
      const forecast = analyzeWeeklyForecast(modelData, location)
      const baseNarrative = generateWeeklyNarrative(forecast, lang)

      // Get sunrise/sunset from primary model data
      const primaryData = modelData['ecmwf-hres'] || Object.values(modelData)[0]
      const sunrise = formatSunTime(primaryData?.daily?.sunrise?.[0])
      const sunset = formatSunTime(primaryData?.daily?.sunset?.[0])

      return {
        ...baseNarrative,
        lat,
        lon,
        sunrise,
        sunset,
      }
    } catch (error) {
      console.error('Failed to generate weekly outlook:', error)
      return null
    }
  }, [modelData, location, lat, lon, lang, isLoading])

  return {
    narrative,
    isLoading,
  }
}
