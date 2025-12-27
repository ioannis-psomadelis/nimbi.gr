'use client'

import { memo, useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { WeatherResponse } from '../../../types/weather'
import type { WeatherCondition } from '../../../lib/forecast/types'
import { getWeatherIcon } from '../../../lib/forecast/analyzer'

interface SimpleWeatherViewProps {
  data: WeatherResponse
}

interface HourData {
  hour: number
  time: string
  temp: number
  icon: string
  precipProb: number
  isCurrent: boolean
  isNight: boolean
  index: number
}

interface DayData {
  dayIndex: number
  dayName: string
  dateStr: string
  monthDay: string
  icon: string
  highTemp: number
  lowTemp: number
  precipProb: number
  condition: WeatherCondition
  isToday: boolean
}

// Locale mapping for date formatting
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  el: 'el-GR',
}

/**
 * Get weather condition from data
 */
function getCondition(cloudCover: number, precip: number, temp?: number, weatherCode?: number): WeatherCondition {
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

function isNightHour(hour: number): boolean {
  return hour >= 20 || hour < 6
}

function getCurrentHourIndex(times: string[]): number {
  const now = new Date()
  let closestIdx = 0
  let closestDiff = Infinity
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(now.getTime() - new Date(times[i]).getTime())
    if (diff < closestDiff) {
      closestDiff = diff
      closestIdx = i
    }
  }
  return closestIdx
}

/**
 * Extract hours for a specific day
 */
function extractHoursForDay(data: WeatherResponse, dayIndex: number, isToday: boolean): HourData[] {
  const hours: HourData[] = []
  const hoursPerDay = 24
  const currentGlobalIdx = getCurrentHourIndex(data.hourly.time)

  let startIdx: number

  if (isToday && dayIndex === 0) {
    startIdx = currentGlobalIdx
  } else {
    startIdx = dayIndex * hoursPerDay
  }

  const hoursToShow = 24

  for (let i = 0; i < hoursToShow; i++) {
    const idx = startIdx + i
    if (idx >= data.hourly.time.length) break

    const time = new Date(data.hourly.time[idx])
    const hour = time.getHours()
    const temp = data.hourly.temperature_2m[idx] ?? 0
    const cloud = data.hourly.cloud_cover[idx] ?? 0
    const precip = data.hourly.precipitation[idx] ?? 0
    const precipProb = data.hourly.precipitation_probability?.[idx] ?? 0
    const weatherCode = data.hourly.weather_code?.[idx] ?? undefined
    const condition = getCondition(cloud, precip, temp, weatherCode)

    hours.push({
      hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      temp: Math.round(temp),
      icon: getWeatherIcon(condition),
      precipProb: typeof precipProb === 'number' ? precipProb : 0,
      isCurrent: idx === currentGlobalIdx,
      isNight: isNightHour(hour),
      index: idx,
    })
  }

  return hours
}

/**
 * Extract 7-day forecast
 */
function extractDays(data: WeatherResponse, locale: string): DayData[] {
  const days: DayData[] = []
  const hoursPerDay = 24
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const startIdx = dayIdx * hoursPerDay
    const endIdx = startIdx + hoursPerDay
    if (startIdx >= data.hourly.time.length) break

    const tempsRaw = data.hourly.temperature_2m.slice(startIdx, endIdx)
    const cloudsRaw = data.hourly.cloud_cover.slice(startIdx, endIdx)
    const precipsRaw = data.hourly.precipitation.slice(startIdx, endIdx)
    const precipProbs = data.hourly.precipitation_probability?.slice(startIdx, endIdx) ?? []
    const weatherCodes = data.hourly.weather_code?.slice(startIdx, endIdx) ?? []

    // Filter out null values
    const temps = tempsRaw.filter((t): t is number => t !== null)
    const clouds = cloudsRaw.filter((c): c is number => c !== null)
    const precips = precipsRaw.filter((p): p is number => p !== null)

    if (temps.length === 0) continue

    const date = new Date(data.hourly.time[startIdx])
    date.setHours(0, 0, 0, 0)

    const avgCloud = clouds.length > 0 ? clouds.reduce((a, b) => a + b, 0) / clouds.length : 0
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
    const totalPrecip = precips.reduce((a, b) => a + b, 0)
    const validProbs = precipProbs.filter((p): p is number => p !== null && p !== undefined)
    const maxPrecipProb = validProbs.length > 0 ? Math.max(...validProbs) : 0

    const validCodes = weatherCodes.filter((c): c is number => c !== null && c !== undefined)
    const midDayCode = validCodes[Math.floor(validCodes.length / 2)]
    const condition = getCondition(avgCloud, totalPrecip, avgTemp, midDayCode)

    days.push({
      dayIndex: dayIdx,
      dayName: date.toLocaleDateString(locale, { weekday: 'short' }),
      dateStr: date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
      monthDay: `${date.getDate()}`,
      icon: getWeatherIcon(condition),
      highTemp: Math.round(Math.max(...temps)),
      lowTemp: Math.round(Math.min(...temps)),
      precipProb: maxPrecipProb,
      condition,
      isToday: date.getTime() === today.getTime(),
    })
  }

  return days
}

/**
 * Hourly Timeline - Clean scrollable cards
 */
const HourlyGrid = memo(function HourlyGrid({
  hours,
  selectedDay,
  isToday
}: {
  hours: HourData[]
  selectedDay: DayData
  isToday: boolean
}) {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentRef.current && scrollRef.current && isToday) {
      const container = scrollRef.current
      const current = currentRef.current
      const scrollLeft = current.offsetLeft - container.offsetWidth / 2 + current.offsetWidth / 2
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' })
    }
  }, [isToday, hours])

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">
          {isToday ? t('todayHourly', 'Today\'s Hours') : `${selectedDay.dayName} ${selectedDay.dateStr}`}
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-orange-600 dark:text-orange-400 font-medium">{selectedDay.highTemp}°</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">{selectedDay.lowTemp}°</span>
        </div>
      </div>

      {/* Scrollable Hour Cards */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {hours.map((hour, idx) => (
          <div
            key={`${hour.index}-${idx}`}
            ref={hour.isCurrent ? currentRef : null}
            className={`
              relative flex flex-col items-center gap-1.5 min-w-[64px] p-2.5 rounded-xl
              transition-colors
              ${hour.isCurrent
                ? 'bg-primary/10 ring-1 ring-primary/30'
                : 'bg-muted/50 hover:bg-muted'
              }
            `}
          >
            {/* Current dot */}
            {hour.isCurrent && (
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
            )}

            {/* Time */}
            <span className={`text-[10px] font-medium ${hour.isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
              {hour.isCurrent ? t('now') : hour.time}
            </span>

            {/* Icon */}
            <span className="text-xl">{hour.icon}</span>

            {/* Temperature */}
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {hour.temp}°
            </span>

            {/* Precipitation */}
            {hour.precipProb > 0 && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium tabular-nums">
                {hour.precipProb}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

/**
 * 7-Day Forecast - Simple clickable rows
 */
const DaysForecast = memo(function DaysForecast({
  days,
  selectedDayIndex,
  onDaySelect,
}: {
  days: DayData[]
  selectedDayIndex: number
  onDaySelect: (index: number) => void
}) {
  const { t } = useTranslation()

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">
        {t('sevenDayForecast', '7-Day Forecast')}
      </h3>

      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
        {days.map((day) => {
          const isSelected = day.dayIndex === selectedDayIndex

          return (
            <button
              key={day.dayIndex}
              onClick={() => onDaySelect(day.dayIndex)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left
                ${isSelected
                  ? 'bg-primary/5'
                  : 'hover:bg-muted/50'
                }
              `}
            >
              {/* Day name */}
              <div className="w-12 shrink-0">
                <span className={`text-sm font-medium ${day.isToday ? 'text-primary' : 'text-foreground'}`}>
                  {day.isToday ? t('today') : day.dayName}
                </span>
              </div>

              {/* Weather icon */}
              <span className="text-xl shrink-0">{day.icon}</span>

              {/* Precipitation */}
              <div className="w-10 shrink-0">
                {day.precipProb > 15 ? (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium tabular-nums">
                    {day.precipProb}%
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Temperatures */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium text-foreground tabular-nums w-8 text-right">
                  {day.highTemp}°
                </span>
                <span className="text-sm text-muted-foreground tabular-nums w-8 text-right">
                  {day.lowTemp}°
                </span>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="w-1 h-5 rounded-full bg-primary shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
})

/**
 * Main Simple Weather View - Connects hourly and daily
 */
export const SimpleWeatherView = memo(function SimpleWeatherView({ data }: SimpleWeatherViewProps) {
  const { i18n } = useTranslation()
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Handle hydration - use stable locale on server, then switch to i18n locale on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const locale = mounted ? (LOCALE_MAP[i18n.language] || 'en-US') : 'en-US'
  const days = useMemo(() => extractDays(data, locale), [data, locale])

  const selectedDay = days[selectedDayIndex] || days[0]

  const hours = useMemo(() => {
    if (!selectedDay) return []
    return extractHoursForDay(data, selectedDayIndex, selectedDay.isToday)
  }, [data, selectedDayIndex, selectedDay])

  const handleDaySelect = useCallback((dayIndex: number) => {
    setSelectedDayIndex(dayIndex)
  }, [])

  if (days.length === 0) return null

  return (
    <div className="space-y-6">
      {/* Hourly Timeline */}
      <HourlyGrid
        hours={hours}
        selectedDay={selectedDay}
        isToday={selectedDay?.isToday ?? false}
      />

      {/* 7-Day Forecast */}
      <DaysForecast
        days={days}
        selectedDayIndex={selectedDayIndex}
        onDaySelect={handleDaySelect}
      />
    </div>
  )
})
