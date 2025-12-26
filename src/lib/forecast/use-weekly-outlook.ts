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
  isLoading?: boolean
}

interface UseWeeklyOutlookResult {
  narrative: WeeklyNarrative | null
  isLoading: boolean
}

/**
 * Hook to generate weekly outlook narrative from model data
 */
export function useWeeklyOutlook({
  modelData,
  location,
  isLoading = false,
}: UseWeeklyOutlookOptions): UseWeeklyOutlookResult {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'el' ? 'el' : 'en'

  const narrative = useMemo(() => {
    if (!modelData || isLoading) return null

    try {
      const forecast = analyzeWeeklyForecast(modelData, location)
      return generateWeeklyNarrative(forecast, lang)
    } catch (error) {
      console.error('Failed to generate weekly outlook:', error)
      return null
    }
  }, [modelData, location, lang, isLoading])

  return {
    narrative,
    isLoading,
  }
}
