import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'

// Air Quality API response schema
const AirQualityResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  current: z.object({
    time: z.string(),
    interval: z.number(),
    european_aqi: z.number().nullable(),
    us_aqi: z.number().nullable(),
    pm10: z.number().nullable(),
    pm2_5: z.number().nullable(),
    ozone: z.number().nullable(),
    nitrogen_dioxide: z.number().nullable(),
  }),
  current_units: z.object({
    time: z.string(),
    interval: z.string(),
    european_aqi: z.string(),
    us_aqi: z.string(),
    pm10: z.string(),
    pm2_5: z.string(),
    ozone: z.string(),
    nitrogen_dioxide: z.string(),
  }),
})

type AirQualityResponse = z.infer<typeof AirQualityResponseSchema>
export type AirQualityCurrent = AirQualityResponse['current']

// AQI level definitions with colors and labels
export type AQILevel = 'good' | 'fair' | 'moderate' | 'poor' | 'very_poor' | 'extremely_poor'

interface AQIInfo {
  level: AQILevel
  color: string
  bgColor: string
  textColor: string
}

// European AQI classification (0-500 scale)
// https://www.eea.europa.eu/themes/air/air-quality-index
export function getEuropeanAQIInfo(aqi: number | null): AQIInfo | null {
  if (aqi === null) return null

  if (aqi <= 20) {
    return {
      level: 'good',
      color: '#14b8a6',
      bgColor: 'rgba(20, 184, 166, 0.12)',
      textColor: '#0f766e',
    }
  }
  if (aqi <= 40) {
    return {
      level: 'fair',
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.12)',
      textColor: '#15803d',
    }
  }
  if (aqi <= 60) {
    return {
      level: 'moderate',
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.12)',
      textColor: '#a16207',
    }
  }
  if (aqi <= 80) {
    return {
      level: 'poor',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.12)',
      textColor: '#c2410c',
    }
  }
  if (aqi <= 100) {
    return {
      level: 'very_poor',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.12)',
      textColor: '#b91c1c',
    }
  }
  return {
    level: 'extremely_poor',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.12)',
    textColor: '#7e22ce',
  }
}

const AIR_QUALITY_ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality'

const CURRENT_PARAMS = [
  'european_aqi',
  'us_aqi',
  'pm10',
  'pm2_5',
  'ozone',
  'nitrogen_dioxide',
].join(',')

function buildAirQualityUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: CURRENT_PARAMS,
    timezone: 'auto',
  })
  return `${AIR_QUALITY_ENDPOINT}?${params.toString()}`
}

async function fetchAirQuality(
  lat: number,
  lon: number
): Promise<AirQualityResponse> {
  const url = buildAirQualityUrl(lat, lon)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch air quality: ${response.statusText}`)
  }

  const data = await response.json()
  return AirQualityResponseSchema.parse(data)
}

// Query options for air quality data
export function airQualityQueryOptions(lat: number, lon: number) {
  return queryOptions({
    queryKey: ['air-quality', lat, lon],
    queryFn: () => fetchAirQuality(lat, lon),
    staleTime: 1000 * 60 * 15, // 15 minutes - AQI doesn't change as frequently
    gcTime: 1000 * 60 * 60, // 1 hour - keep in cache
  })
}
