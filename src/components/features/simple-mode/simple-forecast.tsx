'use client'

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { WeatherResponse } from '../../../types/weather'
import type { WeatherCondition } from '../../../lib/forecast/types'
import { getWeatherIcon } from '../../../lib/forecast/analyzer'

interface SimpleForecastProps {
  data: WeatherResponse
}

interface DayForecastData {
  dayName: string
  dayNameShort: string
  icon: string
  highTemp: number
  isToday: boolean
}

const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_FULL_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Get weather condition from cloud cover and precipitation
 */
function getCondition(cloudCover: number, precip: number): WeatherCondition {
  if (precip > 10) return 'stormy'
  if (precip > 2) return 'rainy'
  if (cloudCover > 70) return 'cloudy'
  if (cloudCover > 30) return 'partly_cloudy'
  return 'sunny'
}

/**
 * Extract 7-day forecast from hourly data
 */
function extractDailyForecasts(data: WeatherResponse): DayForecastData[] {
  const forecasts: DayForecastData[] = []
  const hoursPerDay = 24
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const startIdx = dayIdx * hoursPerDay
    const endIdx = startIdx + hoursPerDay

    if (startIdx >= data.hourly.time.length) break

    const temps = data.hourly.temperature_2m.slice(startIdx, endIdx)
    const clouds = data.hourly.cloud_cover.slice(startIdx, endIdx)
    const precips = data.hourly.precipitation.slice(startIdx, endIdx)

    if (temps.length === 0) continue

    const date = new Date(data.hourly.time[startIdx])
    date.setHours(0, 0, 0, 0)
    const dayOfWeek = date.getDay()

    // Get average cloud cover and total precipitation for condition
    const avgCloud = clouds.reduce((a, b) => a + b, 0) / clouds.length
    const totalPrecip = precips.reduce((a, b) => a + b, 0)
    const condition = getCondition(avgCloud, totalPrecip)

    const isToday = date.getTime() === today.getTime()

    forecasts.push({
      dayName: DAY_NAMES_FULL_EN[dayOfWeek],
      dayNameShort: DAY_NAMES_EN[dayOfWeek],
      icon: getWeatherIcon(condition),
      highTemp: Math.round(Math.max(...temps)),
      isToday,
    })
  }

  return forecasts
}

export const SimpleForecast = memo(function SimpleForecast({ data }: SimpleForecastProps) {
  const { t } = useTranslation()

  const forecasts = useMemo(() => extractDailyForecasts(data), [data])

  return (
    <div className="w-full">
      <h2 className="text-sm font-medium text-muted-foreground mb-4 px-1">
        {t('forecast')}
      </h2>

      {/* Horizontal scrollable forecast row */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {forecasts.map((day, idx) => (
          <div
            key={idx}
            className={`
              flex flex-col items-center justify-center min-w-[72px] py-4 px-3 rounded-xl
              transition-colors shrink-0
              ${day.isToday
                ? 'bg-primary/10 border border-primary/20'
                : 'bg-muted/40 hover:bg-muted/60'
              }
            `}
          >
            {/* Day name */}
            <span
              className={`
                text-xs font-medium mb-2
                ${day.isToday ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              {day.isToday ? t('today') : day.dayNameShort}
            </span>

            {/* Weather icon */}
            <span className="text-2xl mb-2" aria-hidden="true">
              {day.icon}
            </span>

            {/* High temperature */}
            <span
              className={`
                text-sm font-semibold tabular-nums
                ${day.isToday ? 'text-primary' : 'text-foreground'}
              `}
            >
              {day.highTemp}&deg;
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
