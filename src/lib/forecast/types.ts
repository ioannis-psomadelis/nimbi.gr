import type { ModelId } from '../../types/models'
import type { MeteoconName } from '@/components/ui/weather-icon'

export type WeatherCondition = 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'snowy'
export type PressureTrend = 'rising' | 'falling' | 'stable'
export type TemperatureTrend = 'warming' | 'cooling' | 'stable'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface DayForecast {
  date: Date
  dayOfWeek: string
  tempHigh: number
  tempLow: number
  precipTotal: number
  precipHours: number
  precipProbability: number
  condition: WeatherCondition
  windMax: number
  windAvg: number
  pressureTrend: PressureTrend
  // Additional metrics
  feelsLikeHigh: number
  feelsLikeLow: number
  uvMax: number
  cloudCoverAvg: number
  // Hourly data for charts
  hourlyTemps: number[]
  hourlyPrecip: number[]
}

export interface DayComparison {
  date: Date
  dayOfWeek: string
  primary: DayForecast // ECMWF HD
  models: Record<ModelId, DayForecast>
  agreement: AgreementScore
  temperatureSpread: number // max - min across models
  precipSpread: number
}

export interface AgreementScore {
  temperature: number // 0-100
  precipitation: number // 0-100
  condition: number // 0-100
  overall: number // 0-100
  agreeingModels: ModelId[]
  differingModels: ModelId[]
}

export interface WeeklyForecast {
  location: string
  days: DayComparison[]
  overallTrend: TemperatureTrend
  confidence: ConfidenceLevel
  lastUpdated: Date
  primaryModel: ModelId
}

export interface NarrativeDay {
  date: Date
  dayOfWeek: string
  headline: string
  details: string
  icon: MeteoconName
  tempHigh: number
  tempLow: number
  modelNote?: string
  // Enhanced data
  precipTotal: number
  precipProbability: number // 0-100
  windMax: number
  windAvg: number
  agreement: number // 0-100 overall model agreement
  // Additional metrics
  feelsLikeHigh: number
  feelsLikeLow: number
  uvMax: number
  cloudCoverAvg: number
  // Hourly breakdown (for expanded view)
  hourlyTemps?: number[] // 24 hours
  hourlyPrecip?: number[] // 24 hours
}

export interface WeeklyNarrative {
  location: string
  lat?: number
  lon?: number
  summary: string
  days: NarrativeDay[]
  confidence: ConfidenceLevel
  confidenceText: string
  lastUpdated: Date
  primaryModelName: string
  sunrise?: string
  sunset?: string
}
