'use client'

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { WeatherResponse } from '../../../types/weather'
import type { WeatherCondition } from '../../../lib/forecast/types'
import { getWeatherIcon } from '../../../lib/forecast/analyzer'

interface SimpleHeroProps {
  data: WeatherResponse
}

/**
 * Get current weather condition from hourly data
 */
function getCurrentCondition(cloudCover: number, precip: number): WeatherCondition {
  if (precip > 10) return 'stormy'
  if (precip > 2) return 'rainy'
  if (cloudCover > 70) return 'cloudy'
  if (cloudCover > 30) return 'partly_cloudy'
  return 'sunny'
}

/**
 * Get condition label for display
 */
function getConditionLabel(condition: WeatherCondition, t: (key: string) => string): string {
  const labels: Record<WeatherCondition, string> = {
    sunny: t('conditionSunny'),
    partly_cloudy: t('conditionPartlyCloudy'),
    cloudy: t('conditionCloudy'),
    rainy: t('conditionRainy'),
    stormy: t('conditionStormy'),
  }
  return labels[condition] || condition
}

/**
 * Get current hour index (closest to current time)
 */
function getCurrentHourIndex(times: string[]): number {
  const now = new Date()
  let closestIdx = 0
  let closestDiff = Infinity

  for (let i = 0; i < times.length; i++) {
    const time = new Date(times[i])
    const diff = Math.abs(now.getTime() - time.getTime())
    if (diff < closestDiff) {
      closestDiff = diff
      closestIdx = i
    }
  }

  return closestIdx
}

/**
 * Calculate feels like temperature (simplified heat index/wind chill)
 */
function calculateFeelsLike(temp: number, windSpeed: number, humidity: number): number {
  // Simplified feels like calculation
  // At higher temps, humidity makes it feel warmer
  // At lower temps, wind makes it feel colder
  if (temp > 27) {
    // Heat index approximation
    const hi = temp + 0.05 * humidity
    return Math.round(hi)
  } else if (temp < 10) {
    // Wind chill approximation
    const wc = temp - windSpeed * 0.1
    return Math.round(wc)
  }
  return Math.round(temp)
}

export const SimpleHero = memo(function SimpleHero({ data }: SimpleHeroProps) {
  const { t } = useTranslation()

  const currentWeather = useMemo(() => {
    const idx = getCurrentHourIndex(data.hourly.time)
    const temp = data.hourly.temperature_2m[idx]
    const cloudCover = data.hourly.cloud_cover[idx]
    const precip = data.hourly.precipitation[idx]
    const windSpeed = data.hourly.wind_speed_10m[idx]

    // Estimate humidity from cloud cover (since humidity isn't in the API response)
    // This is a rough approximation
    const estimatedHumidity = Math.min(95, 30 + cloudCover * 0.5)

    const condition = getCurrentCondition(cloudCover, precip)
    const feelsLike = calculateFeelsLike(temp, windSpeed, estimatedHumidity)

    return {
      temperature: Math.round(temp),
      feelsLike,
      condition,
      icon: getWeatherIcon(condition),
      windSpeed: Math.round(windSpeed),
      humidity: Math.round(estimatedHumidity),
    }
  }, [data])

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      {/* Weather Icon */}
      <div className="text-7xl md:text-8xl mb-4" aria-hidden="true">
        {currentWeather.icon}
      </div>

      {/* Temperature */}
      <div className="text-6xl md:text-7xl font-light tracking-tight text-foreground mb-2">
        {currentWeather.temperature}
        <span className="text-4xl md:text-5xl text-muted-foreground align-top ml-1">&deg;</span>
      </div>

      {/* Condition */}
      <div className="text-lg md:text-xl text-muted-foreground mb-6">
        {getConditionLabel(currentWeather.condition, t)}
        <span className="mx-2">&middot;</span>
        {t('feelsLike')} {currentWeather.feelsLike}&deg;
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
          <span>
            {currentWeather.windSpeed} {t('kmh')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <span>{currentWeather.humidity}%</span>
        </div>
      </div>
    </div>
  )
})
