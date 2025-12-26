import type { WeeklyForecast, WeeklyNarrative, NarrativeDay, DayComparison } from './types'
import { getWeatherIcon, getModelName, formatModelList } from './analyzer'
import { en } from './templates/en'
import { el } from './templates/el'
import type { TranslationKeys } from './templates/en'

type Language = 'en' | 'el'

const translations: Record<Language, TranslationKeys> = { en, el }

/**
 * Get localized day name, handling "Today" and "Tomorrow"
 */
function getLocalizedDayName(date: Date, dayOfWeek: string, lang: Language): string {
  const t = translations[lang]
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t.today
  if (diffDays === 1) return t.tomorrow
  return t.days[dayOfWeek as keyof typeof t.days] || dayOfWeek
}

/**
 * Generate headline for a single day
 */
function generateDayHeadline(day: DayComparison, lang: Language): string {
  const t = translations[lang]
  const condition = t.conditions[day.primary.condition]
  return t.templates.dayWillBe
    .replace('{condition}', condition)
    .replace('{high}', day.primary.tempHigh.toString())
}

/**
 * Generate details text for a single day
 */
function generateDayDetails(day: DayComparison, lang: Language): string {
  const t = translations[lang]
  const parts: string[] = []

  // Precipitation info
  if (day.primary.precipTotal > 10) {
    parts.push(t.templates.heavyRain.replace('{amount}', day.primary.precipTotal.toString()))
  } else if (day.primary.precipTotal > 2) {
    parts.push(t.templates.rainExpected.replace('{amount}', day.primary.precipTotal.toString()))
  } else if (day.primary.precipTotal > 0.5) {
    parts.push(t.templates.lightRain)
  }

  // Model agreement
  if (day.agreement.overall >= 80) {
    parts.push(t.templates.allModelsAgree)
  } else if (day.agreement.agreeingModels.length > 0) {
    parts.push(
      t.templates.modelsAgree.replace('{models}', formatModelList(day.agreement.agreeingModels))
    )
  }

  // Model disagreement details
  if (day.agreement.differingModels.length > 0 && day.agreement.overall < 70) {
    const diffModels = formatModelList(day.agreement.differingModels)
    if (day.temperatureSpread > 3) {
      const diffModel = day.models[day.agreement.differingModels[0]]
      if (diffModel) {
        parts.push(
          t.templates.differOnTemp
            .replace('{models}', diffModels)
            .replace('{temp}', diffModel.tempHigh.toString())
        )
      }
    } else if (day.precipSpread > 5) {
      parts.push(t.templates.differOnTiming.replace('{models}', diffModels))
    }
  }

  return parts.join('. ') || t.conditionDescriptions[day.primary.condition]
}

/**
 * Generate model comparison note for a day
 */
function generateModelNote(day: DayComparison, lang: Language): string | undefined {
  if (day.agreement.overall >= 80) return undefined

  const t = translations[lang]
  const differing = day.agreement.differingModels

  if (differing.length === 0) return undefined

  const modelNames = formatModelList(differing)
  const diffModel = day.models[differing[0]]

  if (!diffModel) return undefined

  if (Math.abs(diffModel.tempHigh - day.primary.tempHigh) > 3) {
    return t.templates.differOnTemp
      .replace('{models}', modelNames)
      .replace('{temp}', diffModel.tempHigh.toString())
  }

  if (Math.abs(diffModel.precipTotal - day.primary.precipTotal) > 5) {
    return t.templates.differOnAmount
      .replace('{models}', modelNames)
      .replace('{amount}', diffModel.precipTotal.toString())
  }

  return undefined
}

/**
 * Generate overall summary for the week
 */
function generateWeeklySummary(forecast: WeeklyForecast, lang: Language): string {
  const t = translations[lang]
  const parts: string[] = []

  // Opening based on first day's temperature
  const firstDay = forecast.days[0]
  if (firstDay) {
    if (firstDay.primary.tempHigh > 25) {
      parts.push(t.templates.warmStart)
    } else if (firstDay.primary.tempHigh < 15) {
      parts.push(t.templates.coolStart)
    } else {
      parts.push(t.templates.mildStart)
    }
  }

  // Trend
  parts.push(t.trends[forecast.overallTrend])

  // Look for significant weather events
  const rainyDays = forecast.days.filter((d) => d.primary.precipTotal > 5)
  if (rainyDays.length > 0) {
    const rainyDay = rainyDays[0]
    const dayName = getLocalizedDayName(rainyDay.date, rainyDay.dayOfWeek, lang)
    parts.push(
      t.templates.rainExpected
        .replace('{amount}', rainyDay.primary.precipTotal.toString())
        .replace('({amount}mm)', `${dayName}`)
    )
  }

  return parts.join('. ') + '.'
}

/**
 * Main narrative generator
 */
export function generateWeeklyNarrative(
  forecast: WeeklyForecast,
  lang: Language = 'en'
): WeeklyNarrative {
  const t = translations[lang]

  const days: NarrativeDay[] = forecast.days.map((day) => ({
    date: day.date,
    dayOfWeek: getLocalizedDayName(day.date, day.dayOfWeek, lang),
    headline: generateDayHeadline(day, lang),
    details: generateDayDetails(day, lang),
    icon: getWeatherIcon(day.primary.condition),
    tempHigh: day.primary.tempHigh,
    tempLow: day.primary.tempLow,
    modelNote: generateModelNote(day, lang),
  }))

  return {
    location: forecast.location,
    summary: generateWeeklySummary(forecast, lang),
    days,
    confidence: forecast.confidence,
    confidenceText: `${t.confidence[forecast.confidence]} - ${t.confidenceDescriptions[forecast.confidence]}`,
    lastUpdated: forecast.lastUpdated,
    primaryModelName: getModelName(forecast.primaryModel),
  }
}
