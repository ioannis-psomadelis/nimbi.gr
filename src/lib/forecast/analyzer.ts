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
import {
  type MeteoconName,
  getMeteoconFromCondition,
} from '@/components/ui/weather-icon'

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
 * Get Meteocon icon name for weather condition
 * Supports both legacy conditions and WMO codes
 */
export function getWeatherIconName(
  condition: WeatherCondition,
  isNight: boolean = false
): MeteoconName {
  return getMeteoconFromCondition(condition, isNight)
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

  // Additional data
  const feelsLikeRaw = data.hourly.apparent_temperature?.slice(startIdx, endIdx) || []
  const uvRaw = data.hourly.uv_index?.slice(startIdx, endIdx) || []
  const precipProbRaw = data.hourly.precipitation_probability?.slice(startIdx, endIdx) || []

  // Filter out null values
  const temps = tempsRaw.filter((t): t is number => t !== null)
  const precips = precipsRaw.filter((p): p is number => p !== null)
  const clouds = cloudsRaw.filter((c): c is number => c !== null)
  const winds = windsRaw.filter((w): w is number => w !== null)
  const pressures = pressuresRaw.filter((p): p is number => p !== null)
  const feelsLike = feelsLikeRaw.filter((f): f is number => f !== null)
  const uvValues = uvRaw.filter((u): u is number => u !== null)
  const precipProbs = precipProbRaw.filter((p): p is number => p !== null)

  if (temps.length === 0) return null

  const date = new Date(data.hourly.time[startIdx])
  const avgCloud = clouds.length > 0 ? clouds.reduce((a, b) => a + b, 0) / clouds.length : 0
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
  const totalPrecip = precips.reduce((a, b) => a + b, 0)
  const precipHours = precips.filter((p) => p > 0.1).length
  const maxPrecipProb = precipProbs.length > 0 ? Math.max(...precipProbs) : 0

  return {
    date,
    dayOfWeek: DAY_NAMES_EN[date.getDay()],
    tempHigh: Math.round(Math.max(...temps)),
    tempLow: Math.round(Math.min(...temps)),
    precipTotal: Math.round(totalPrecip * 10) / 10,
    precipHours,
    precipProbability: Math.round(maxPrecipProb),
    condition: getCondition(avgCloud, totalPrecip, avgTemp),
    windMax: winds.length > 0 ? Math.round(Math.max(...winds)) : 0,
    windAvg: winds.length > 0 ? Math.round(winds.reduce((a, b) => a + b, 0) / winds.length) : 0,
    pressureTrend: getPressureTrend(pressures),
    // Additional metrics
    feelsLikeHigh: feelsLike.length > 0 ? Math.round(Math.max(...feelsLike)) : Math.round(Math.max(...temps)),
    feelsLikeLow: feelsLike.length > 0 ? Math.round(Math.min(...feelsLike)) : Math.round(Math.min(...temps)),
    uvMax: uvValues.length > 0 ? Math.round(Math.max(...uvValues) * 10) / 10 : 0,
    cloudCoverAvg: Math.round(avgCloud),
    // Hourly data for mini charts
    hourlyTemps: temps.slice(0, 24).map(t => Math.round(t)),
    hourlyPrecip: precips.slice(0, 24).map(p => Math.round(p * 10) / 10),
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
