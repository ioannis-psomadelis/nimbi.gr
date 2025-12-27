import type { ModelId } from '../../types/models'

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
  condition: WeatherCondition
  windMax: number
  pressureTrend: PressureTrend
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
  icon: string
  tempHigh: number
  tempLow: number
  modelNote?: string
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
