import type { WeatherResponse } from '../../types/weather'
import type { ModelId } from '../../types/models'
import { MODEL_CONFIG, MODELS } from '../../types/models'
import type {
  DayForecast,
  DayComparison,
  WeeklyForecast,
  AgreementScore,
  WeatherCondition,
  PressureTrend,
  TemperatureTrend,
  ConfidenceLevel,
} from './types'

const PRIMARY_MODEL: ModelId = 'ecmwf-hres'
const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Determine weather condition from cloud cover, precipitation and temperature
 * When temperature is below 2°C, precipitation becomes snow
 */
function getCondition(cloudCover: number, precip: number, temp?: number): WeatherCondition {
  const isSnow = temp !== undefined && temp < 2
  if (precip > 10) return isSnow ? 'snowy' : 'stormy'
  if (precip > 2) return isSnow ? 'snowy' : 'rainy'
  if (cloudCover > 70) return 'cloudy'
  if (cloudCover > 30) return 'partly_cloudy'
  return 'sunny'
}

/**
 * Get pressure trend from hourly data
 */
function getPressureTrend(pressureValues: number[]): PressureTrend {
  if (pressureValues.length < 2) return 'stable'
  const first = pressureValues.slice(0, 6).reduce((a, b) => a + b, 0) / 6
  const last = pressureValues.slice(-6).reduce((a, b) => a + b, 0) / 6
  const diff = last - first
  if (diff > 3) return 'rising'
  if (diff < -3) return 'falling'
  return 'stable'
}

/**
 * Get weather icon for condition
 */
export function getWeatherIcon(condition: WeatherCondition): string {
  const icons: Record<WeatherCondition, string> = {
    sunny: '\u2600\uFE0F',
    partly_cloudy: '\u26C5',
    cloudy: '\u2601\uFE0F',
    rainy: '\uD83C\uDF27\uFE0F',
    stormy: '\u26C8\uFE0F',
    snowy: '\uD83C\uDF28\uFE0F',
  }
  return icons[condition]
}

/**
 * Extract daily forecast from hourly data
 */
function extractDailyForecast(
  data: WeatherResponse,
  dayIndex: number,
  _modelId: ModelId
): DayForecast | null {
  const hoursPerDay = 24
  const startIdx = dayIndex * hoursPerDay
  const endIdx = startIdx + hoursPerDay

  if (startIdx >= data.hourly.time.length) return null

  const tempsRaw = data.hourly.temperature_2m.slice(startIdx, endIdx)
  const precipsRaw = data.hourly.precipitation.slice(startIdx, endIdx)
  const cloudsRaw = data.hourly.cloud_cover.slice(startIdx, endIdx)
  const windsRaw = data.hourly.wind_speed_10m.slice(startIdx, endIdx)
  const pressuresRaw = data.hourly.pressure_msl.slice(startIdx, endIdx)

  // Filter out null values
  const temps = tempsRaw.filter((t): t is number => t !== null)
  const precips = precipsRaw.filter((p): p is number => p !== null)
  const clouds = cloudsRaw.filter((c): c is number => c !== null)
  const winds = windsRaw.filter((w): w is number => w !== null)
  const pressures = pressuresRaw.filter((p): p is number => p !== null)

  if (temps.length === 0) return null

  const date = new Date(data.hourly.time[startIdx])
  const avgCloud = clouds.length > 0 ? clouds.reduce((a, b) => a + b, 0) / clouds.length : 0
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
  const totalPrecip = precips.reduce((a, b) => a + b, 0)
  const precipHours = precips.filter((p) => p > 0.1).length

  return {
    date,
    dayOfWeek: DAY_NAMES_EN[date.getDay()],
    tempHigh: Math.round(Math.max(...temps)),
    tempLow: Math.round(Math.min(...temps)),
    precipTotal: Math.round(totalPrecip * 10) / 10,
    precipHours,
    condition: getCondition(avgCloud, totalPrecip, avgTemp),
    windMax: winds.length > 0 ? Math.round(Math.max(...winds)) : 0,
    pressureTrend: getPressureTrend(pressures),
  }
}

/**
 * Calculate agreement score between models for a specific day
 */
function calculateAgreement(
  primary: DayForecast,
  models: Record<ModelId, DayForecast>
): AgreementScore {
  const modelIds = Object.keys(models) as ModelId[]
  const agreeingModels: ModelId[] = []
  const differingModels: ModelId[] = []

  let tempAgreement = 0
  let precipAgreement = 0
  let conditionAgreement = 0

  for (const modelId of modelIds) {
    const model = models[modelId]
    const tempDiff = Math.abs(model.tempHigh - primary.tempHigh)
    const precipDiff = Math.abs(model.precipTotal - primary.precipTotal)
    const conditionMatch = model.condition === primary.condition

    // Score this model
    const modelScore =
      (tempDiff <= 2 ? 1 : 0) + (precipDiff <= 5 ? 1 : 0) + (conditionMatch ? 1 : 0)

    if (modelScore >= 2) {
      agreeingModels.push(modelId)
    } else {
      differingModels.push(modelId)
    }

    // Accumulate scores
    tempAgreement += tempDiff <= 2 ? 100 : tempDiff <= 4 ? 60 : 30
    precipAgreement += precipDiff <= 3 ? 100 : precipDiff <= 8 ? 60 : 30
    conditionAgreement += conditionMatch ? 100 : 40
  }

  const count = modelIds.length || 1
  const temperature = Math.round(tempAgreement / count)
  const precipitation = Math.round(precipAgreement / count)
  const condition = Math.round(conditionAgreement / count)
  const overall = Math.round((temperature + precipitation + condition) / 3)

  return {
    temperature,
    precipitation,
    condition,
    overall,
    agreeingModels,
    differingModels,
  }
}

/**
 * Determine overall temperature trend for the week
 */
function getTemperatureTrend(days: DayComparison[]): TemperatureTrend {
  if (days.length < 3) return 'stable'

  const firstHalf = days.slice(0, 3)
  const secondHalf = days.slice(-3)

  const firstAvg =
    firstHalf.reduce((sum, d) => sum + d.primary.tempHigh, 0) / firstHalf.length
  const secondAvg =
    secondHalf.reduce((sum, d) => sum + d.primary.tempHigh, 0) / secondHalf.length

  const diff = secondAvg - firstAvg
  if (diff > 3) return 'warming'
  if (diff < -3) return 'cooling'
  return 'stable'
}

/**
 * Determine confidence level from agreement scores
 */
function getConfidenceLevel(days: DayComparison[]): ConfidenceLevel {
  const avgAgreement =
    days.reduce((sum, d) => sum + d.agreement.overall, 0) / days.length

  if (avgAgreement >= 75) return 'high'
  if (avgAgreement >= 50) return 'medium'
  return 'low'
}

/**
 * Main analyzer: Process weather data from all models into weekly forecast
 */
export function analyzeWeeklyForecast(
  modelData: Record<ModelId, WeatherResponse>,
  location: string
): WeeklyForecast {
  const days: DayComparison[] = []
  const primaryData = modelData[PRIMARY_MODEL]

  // Guard: if primary model data is missing, return empty forecast
  if (!primaryData) {
    return {
      location,
      days: [],
      overallTrend: 'stable',
      confidence: 'low',
      lastUpdated: new Date(),
      primaryModel: PRIMARY_MODEL,
    }
  }

  // Analyze 7 days
  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const primaryForecast = extractDailyForecast(primaryData, dayIdx, PRIMARY_MODEL)
    if (!primaryForecast) continue

    const modelForecasts: Record<ModelId, DayForecast> = {} as Record<ModelId, DayForecast>

    for (const modelId of MODELS) {
      const data = modelData[modelId]
      if (!data) continue
      const forecast = extractDailyForecast(data, dayIdx, modelId)
      if (forecast) {
        modelForecasts[modelId] = forecast
      }
    }

    const agreement = calculateAgreement(primaryForecast, modelForecasts)

    // Calculate spreads
    const allTemps = Object.values(modelForecasts).map((m) => m.tempHigh)
    const allPrecips = Object.values(modelForecasts).map((m) => m.precipTotal)

    days.push({
      date: primaryForecast.date,
      dayOfWeek: primaryForecast.dayOfWeek,
      primary: primaryForecast,
      models: modelForecasts,
      agreement,
      temperatureSpread: allTemps.length > 0 ? Math.max(...allTemps) - Math.min(...allTemps) : 0,
      precipSpread: allPrecips.length > 0 ? Math.max(...allPrecips) - Math.min(...allPrecips) : 0,
    })
  }

  return {
    location,
    days,
    overallTrend: getTemperatureTrend(days),
    confidence: getConfidenceLevel(days),
    lastUpdated: new Date(),
    primaryModel: PRIMARY_MODEL,
  }
}

/**
 * Get model display name
 */
export function getModelName(modelId: ModelId): string {
  return MODEL_CONFIG[modelId]?.name || modelId.toUpperCase()
}

/**
 * Format model list for display (e.g., "GFS and GEM")
 */
export function formatModelList(modelIds: ModelId[]): string {
  if (modelIds.length === 0) return ''
  if (modelIds.length === 1) return getModelName(modelIds[0])
  if (modelIds.length === 2) {
    return `${getModelName(modelIds[0])} and ${getModelName(modelIds[1])}`
  }
  const last = modelIds.pop()!
  return `${modelIds.map(getModelName).join(', ')}, and ${getModelName(last)}`
}
