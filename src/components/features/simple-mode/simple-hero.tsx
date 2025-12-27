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
 * When temp < 2°C, precipitation becomes snow
 */
function getCurrentCondition(cloudCover: number, precip: number, temp?: number, weatherCode?: number): WeatherCondition {
  // Use weather code if available for more accurate conditions
  if (weatherCode !== undefined) {
    if (weatherCode >= 95) return 'stormy'
    if (weatherCode >= 71 && weatherCode <= 77) return 'snowy'
    if (weatherCode >= 51 && weatherCode <= 67) return 'rainy'
    if (weatherCode >= 80 && weatherCode <= 82) return 'rainy'
    if (weatherCode >= 45 && weatherCode <= 48) return 'cloudy'
    if (weatherCode >= 2 && weatherCode <= 3) return 'partly_cloudy'
    if (weatherCode <= 1) return 'sunny'
  }

  const isSnow = temp !== undefined && temp < 2
  if (precip > 10) return isSnow ? 'snowy' : 'stormy'
  if (precip > 2) return isSnow ? 'snowy' : 'rainy'
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
    snowy: t('conditionSnowy'),
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
 * Get today's high and low temperatures
 */
function getTodayHighLow(data: WeatherResponse, currentIdx: number): { high: number; low: number } {
  // Get remaining hours of today (up to 24 hours from current)
  const endIdx = Math.min(currentIdx + 24, data.hourly.temperature_2m.length)
  const todayTemps = data.hourly.temperature_2m.slice(currentIdx, endIdx)

  return {
    high: Math.round(Math.max(...todayTemps)),
    low: Math.round(Math.min(...todayTemps)),
  }
}

/**
 * Get precipitation summary for next 24 hours
 */
function getPrecipSummary(data: WeatherResponse, currentIdx: number) {
  const next24 = data.hourly.precipitation.slice(currentIdx, currentIdx + 24)
  const next24Prob = data.hourly.precipitation_probability?.slice(currentIdx, currentIdx + 24) ?? []
  const total = next24.reduce((a, b) => a + b, 0)
  const rainyHours = next24.filter(p => p > 0.1).length
  const validProbs = next24Prob.filter((p): p is number => p !== null && p !== undefined)
  const maxProb = validProbs.length > 0 ? Math.max(...validProbs) : 0
  return { total: Math.round(total * 10) / 10, rainyHours, maxProb }
}

/**
 * Get UV level info for color coding
 */
function getUVInfo(uv: number): { label: string; color: string; bgColor: string } {
  if (uv <= 2) {
    return { label: 'uvLow', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10' }
  }
  if (uv <= 5) {
    return { label: 'uvModerate', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500/10' }
  }
  if (uv <= 7) {
    return { label: 'uvHigh', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500/10' }
  }
  if (uv <= 10) {
    return { label: 'uvVeryHigh', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10' }
  }
  return { label: 'uvExtreme', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-500/10' }
}

/**
 * Get today's sunrise and sunset times
 */
function getSunTimes(data: WeatherResponse): { sunrise: string | null; sunset: string | null } {
  if (!data.daily?.sunrise?.[0] || !data.daily?.sunset?.[0]) {
    return { sunrise: null, sunset: null }
  }

  const sunriseDate = new Date(data.daily.sunrise[0])
  const sunsetDate = new Date(data.daily.sunset[0])

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return {
    sunrise: formatTime(sunriseDate),
    sunset: formatTime(sunsetDate),
  }
}

/**
 * Get next few hours forecast
 */
function getHourlyPreview(data: WeatherResponse, currentIdx: number, count: number = 6) {
  const hours = []
  for (let i = 0; i < count; i++) {
    const idx = currentIdx + i + 1
    if (idx >= data.hourly.time.length) break

    const time = new Date(data.hourly.time[idx])
    const temp = data.hourly.temperature_2m[idx]
    const cloud = data.hourly.cloud_cover[idx]
    const precip = data.hourly.precipitation[idx]
    const weatherCode = data.hourly.weather_code?.[idx] ?? undefined
    const condition = getCurrentCondition(cloud, precip, temp, weatherCode)

    hours.push({
      hour: time.getHours(),
      temp: Math.round(temp),
      icon: getWeatherIcon(condition),
    })
  }
  return hours
}

/**
 * Calculate feels like temperature (simplified heat index/wind chill)
 */
function calculateFeelsLike(temp: number, windSpeed: number, humidity: number, apparentTemp?: number): number {
  // Use apparent temperature from API if available
  if (apparentTemp !== undefined) {
    return Math.round(apparentTemp)
  }
  if (temp > 27) {
    const hi = temp + 0.05 * humidity
    return Math.round(hi)
  } else if (temp < 10) {
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
    const pressure = data.hourly.pressure_msl[idx]
    const apparentTemp = data.hourly.apparent_temperature?.[idx] ?? undefined
    const weatherCode = data.hourly.weather_code?.[idx] ?? undefined
    const uvIndex = data.hourly.uv_index?.[idx] ?? 0
    const precipProb = data.hourly.precipitation_probability?.[idx] ?? 0
    const estimatedHumidity = Math.min(95, 30 + cloudCover * 0.5)
    const condition = getCurrentCondition(cloudCover, precip, temp, weatherCode)
    const feelsLike = calculateFeelsLike(temp, windSpeed, estimatedHumidity, apparentTemp)
    const { high, low } = getTodayHighLow(data, idx)
    const hourlyPreview = getHourlyPreview(data, idx, 6)
    const precipSummary = getPrecipSummary(data, idx)
    const sunTimes = getSunTimes(data)

    return {
      temperature: Math.round(temp),
      feelsLike,
      condition,
      icon: getWeatherIcon(condition),
      windSpeed: Math.round(windSpeed),
      humidity: Math.round(estimatedHumidity),
      pressure: Math.round(pressure),
      high,
      low,
      uvIndex,
      precipProb,
      hourlyPreview,
      precipSummary,
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset,
    }
  }, [data])

  const uvInfo = getUVInfo(currentWeather.uvIndex)

  return (
    <div className="flex flex-col items-center justify-center py-6 md:py-10">
      {/* Main Weather Display */}
      <div className="flex items-center gap-6 md:gap-8 mb-6">
        {/* Weather Icon */}
        <div className="text-6xl md:text-7xl" aria-hidden="true">
          {currentWeather.icon}
        </div>

        {/* Temperature + High/Low */}
        <div className="flex flex-col">
          <div className="text-5xl md:text-6xl font-light tracking-tight text-foreground">
            {currentWeather.temperature}
            <span className="text-3xl md:text-4xl text-muted-foreground align-top ml-1">&deg;</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="text-foreground/70">H: {currentWeather.high}&deg;</span>
            <span className="text-foreground/50">L: {currentWeather.low}&deg;</span>
          </div>
        </div>
      </div>

      {/* Condition */}
      <div className="text-base md:text-lg text-muted-foreground mb-6">
        {getConditionLabel(currentWeather.condition, t)}
        <span className="mx-2 opacity-50">&middot;</span>
        {t('feelsLike')} {currentWeather.feelsLike}&deg;
      </div>

      {/* Hourly Preview */}
      <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-muted/30 rounded-xl">
        {currentWeather.hourlyPreview.map((hour, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1 min-w-[40px]">
            <span className="text-[10px] text-muted-foreground">
              {hour.hour.toString().padStart(2, '0')}:00
            </span>
            <span className="text-lg">{hour.icon}</span>
            <span className="text-xs font-medium text-foreground">{hour.temp}&deg;</span>
          </div>
        ))}
      </div>

      {/* Stats Grid - Enhanced with UV and Precip Probability */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-lg">
        {/* Wind */}
        <div className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-muted/30 rounded-xl">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="text-xs sm:text-sm font-semibold text-foreground">{currentWeather.windSpeed}</span>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">{t('kmh')}</span>
        </div>

        {/* Humidity */}
        <div className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-muted/30 rounded-xl">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
          </svg>
          <span className="text-xs sm:text-sm font-semibold text-foreground">{currentWeather.humidity}%</span>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">{t('humidity')}</span>
        </div>

        {/* UV Index with color coding */}
        <div className={`flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl ${uvInfo.bgColor}`}>
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${uvInfo.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <span className={`text-xs sm:text-sm font-semibold ${uvInfo.color}`}>{Math.round(currentWeather.uvIndex)}</span>
          <span className={`text-[9px] sm:text-[10px] ${uvInfo.color}`}>{t(uvInfo.label)}</span>
        </div>

        {/* Precipitation Probability */}
        <div className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-blue-500/10 rounded-xl">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
          </svg>
          <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">{currentWeather.precipSummary.maxProb}%</span>
          <span className="text-[9px] sm:text-[10px] text-blue-600/80 dark:text-blue-400/80">{t('precipChance')}</span>
        </div>

        {/* Pressure */}
        <div className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-muted/30 rounded-xl">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
          <span className="text-xs sm:text-sm font-semibold text-foreground">{currentWeather.pressure}</span>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">hPa</span>
        </div>
      </div>

      {/* Sunrise/Sunset Widget */}
      {(currentWeather.sunrise || currentWeather.sunset) && (
        <div className="flex items-center gap-6 px-5 py-3 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-rose-500/10 rounded-xl border border-amber-500/20 mt-4 w-full max-w-md justify-center">
          {currentWeather.sunrise && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('sunrise')}</span>
                <span className="text-sm font-semibold text-foreground">{currentWeather.sunrise}</span>
              </div>
            </div>
          )}
          {currentWeather.sunset && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('sunset')}</span>
                <span className="text-sm font-semibold text-foreground">{currentWeather.sunset}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
