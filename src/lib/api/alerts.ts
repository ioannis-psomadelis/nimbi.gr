import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { fetchMeteoAlarmFeed } from '../server/meteoalarm'

// MeteoAlarm severity levels
export type AlertSeverity = 'minor' | 'moderate' | 'severe' | 'extreme'

// MeteoAlarm awareness types (event types)
export type AlertType =
  | 'wind'
  | 'snow-ice'
  | 'thunderstorm'
  | 'fog'
  | 'high-temperature'
  | 'low-temperature'
  | 'coastal-event'
  | 'forest-fire'
  | 'avalanche'
  | 'rain'
  | 'flood'
  | 'rain-flood'

// Country code to feed mapping
const COUNTRY_FEED_MAPPING: Record<string, string> = {
  GR: 'greece',
  DE: 'germany',
  FR: 'france',
  IT: 'italy',
  ES: 'spain',
  PT: 'portugal',
  GB: 'united-kingdom',
  UK: 'united-kingdom',
  NL: 'netherlands',
  BE: 'belgium',
  AT: 'austria',
  CH: 'switzerland',
  PL: 'poland',
  CZ: 'czechia',
  SK: 'slovakia',
  HU: 'hungary',
  RO: 'romania',
  BG: 'bulgaria',
  HR: 'croatia',
  SI: 'slovenia',
  RS: 'serbia',
  ME: 'montenegro',
  BA: 'bosnia-and-herzegovina',
  MK: 'north-macedonia',
  AL: 'albania',
  FI: 'finland',
  SE: 'sweden',
  NO: 'norway',
  DK: 'denmark',
  EE: 'estonia',
  LV: 'latvia',
  LT: 'lithuania',
  IE: 'ireland',
  CY: 'cyprus',
  MT: 'malta',
  LU: 'luxembourg',
  IS: 'iceland',
  UA: 'ukraine',
  MD: 'moldova',
  IL: 'israel',
}

// MeteoAlarm event type keywords mapping
const EVENT_TYPE_MAPPING: Record<string, AlertType> = {
  wind: 'wind',
  gale: 'wind',
  storm: 'wind',
  snow: 'snow-ice',
  ice: 'snow-ice',
  freezing: 'snow-ice',
  frost: 'snow-ice',
  blizzard: 'snow-ice',
  thunder: 'thunderstorm',
  lightning: 'thunderstorm',
  fog: 'fog',
  mist: 'fog',
  visibility: 'fog',
  heat: 'high-temperature',
  hot: 'high-temperature',
  'high temperature': 'high-temperature',
  cold: 'low-temperature',
  'low temperature': 'low-temperature',
  coastal: 'coastal-event',
  tide: 'coastal-event',
  wave: 'coastal-event',
  fire: 'forest-fire',
  wildfire: 'forest-fire',
  avalanche: 'avalanche',
  rain: 'rain',
  precipitation: 'rain',
  flood: 'flood',
  flooding: 'flood',
}

// WeatherAlert schema
export const WeatherAlertSchema = z.object({
  id: z.string(),
  event: z.string(),
  type: z.enum([
    'wind',
    'snow-ice',
    'thunderstorm',
    'fog',
    'high-temperature',
    'low-temperature',
    'coastal-event',
    'forest-fire',
    'avalanche',
    'rain',
    'flood',
    'rain-flood',
  ]),
  severity: z.enum(['minor', 'moderate', 'severe', 'extreme']),
  certainty: z.string().optional(),
  urgency: z.string().optional(),
  effective: z.string(),
  expires: z.string(),
  onset: z.string().optional(),
  headline: z.string(),
  description: z.string().optional(),
  areaDesc: z.string(),
  sender: z.string().optional(),
})

export type WeatherAlert = z.infer<typeof WeatherAlertSchema>

/**
 * Parse severity from MeteoAlarm feed title/content
 */
function parseSeverity(text: string): AlertSeverity {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('extreme') || lowerText.includes('red')) {
    return 'extreme'
  }
  if (lowerText.includes('severe') || lowerText.includes('orange')) {
    return 'severe'
  }
  if (lowerText.includes('moderate') || lowerText.includes('yellow')) {
    return 'moderate'
  }
  return 'minor'
}

/**
 * Parse alert type from event description
 */
function parseAlertType(event: string): AlertType {
  const lowerEvent = event.toLowerCase()

  for (const [keyword, type] of Object.entries(EVENT_TYPE_MAPPING)) {
    if (lowerEvent.includes(keyword)) {
      return type
    }
  }

  // Default to rain if we can't determine type
  return 'rain'
}

/**
 * Parse MeteoAlarm Atom feed XML
 */
function parseAtomFeed(xmlText: string): WeatherAlert[] {
  const alerts: WeatherAlert[] = []

  // Simple XML parsing using regex (works in both browser and server)
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let entryMatch

  while ((entryMatch = entryRegex.exec(xmlText)) !== null) {
    const entry = entryMatch[1]

    // Extract fields using regex
    const getId = (xml: string) => {
      const match = xml.match(/<id>([^<]*)<\/id>/)
      return match ? match[1] : ''
    }

    const getTitle = (xml: string) => {
      const match = xml.match(/<title[^>]*>([^<]*)<\/title>/)
      return match ? match[1] : ''
    }

    const getCapField = (xml: string, field: string) => {
      const regex = new RegExp(`<cap:${field}>([^<]*)</cap:${field}>`)
      const match = xml.match(regex)
      return match ? match[1] : ''
    }

    const getAreaDesc = (xml: string) => {
      const match = xml.match(/<cap:areaDesc>([^<]*)<\/cap:areaDesc>/)
      return match ? match[1] : ''
    }

    const id = getId(entry)
    const title = getTitle(entry)
    const effective = getCapField(entry, 'effective')
    const expires = getCapField(entry, 'expires')
    const onset = getCapField(entry, 'onset')
    const certainty = getCapField(entry, 'certainty')
    const urgency = getCapField(entry, 'urgency')
    const areaDesc = getAreaDesc(entry)
    const sender = getCapField(entry, 'sender')

    // Skip expired alerts
    if (expires) {
      const expiresDate = new Date(expires)
      if (expiresDate < new Date()) {
        continue
      }
    }

    // Parse the title for event info
    const severity = parseSeverity(title)
    const alertType = parseAlertType(title)

    if (id && title && effective && expires) {
      alerts.push({
        id,
        event: title,
        type: alertType,
        severity,
        certainty: certainty || undefined,
        urgency: urgency || undefined,
        effective,
        expires,
        onset: onset || undefined,
        headline: title,
        description: undefined,
        areaDesc: areaDesc || 'Unknown area',
        sender: sender || undefined,
      })
    }
  }

  return alerts
}

/**
 * Check if a country is supported by MeteoAlarm
 */
function isCountrySupported(countryCode: string): boolean {
  return countryCode.toUpperCase() in COUNTRY_FEED_MAPPING
}

/**
 * Fetch weather alerts for a country using server function
 * The server function handles the actual API call to bypass CORS
 */
export async function fetchWeatherAlerts(countryCode: string): Promise<WeatherAlert[]> {
  if (!isCountrySupported(countryCode)) {
    // Country not supported by MeteoAlarm
    return []
  }

  try {
    // Use server function to fetch the feed (bypasses CORS)
    const xmlText = await fetchMeteoAlarmFeed({ data: countryCode })

    if (!xmlText) {
      return []
    }

    return parseAtomFeed(xmlText)
  } catch (error) {
    console.warn('Error fetching weather alerts:', error)
    return []
  }
}

/**
 * Filter alerts by proximity to coordinates
 * Since MeteoAlarm provides region-based alerts, we return all alerts for the country
 * A more sophisticated implementation could geocode the areaDesc to filter by proximity
 */
export function filterAlertsByLocation(
  alerts: WeatherAlert[],
  _lat: number,
  _lon: number
): WeatherAlert[] {
  // For now, return all alerts for the country
  // Future enhancement: geocode areaDesc and filter by distance
  return alerts
}

/**
 * Query options for fetching weather alerts
 */
export function weatherAlertsQueryOptions(countryCode: string) {
  return queryOptions({
    queryKey: ['weather-alerts', countryCode],
    queryFn: () => fetchWeatherAlerts(countryCode),
    staleTime: 1000 * 60 * 15, // 15 minutes - alerts don't change frequently
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!countryCode && countryCode.length === 2,
  })
}

/**
 * Get severity color for alert styling
 */
export function getSeverityColor(severity: AlertSeverity): {
  bg: string
  border: string
  text: string
  icon: string
} {
  switch (severity) {
    case 'extreme':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-700 dark:text-red-400',
        icon: 'text-red-500',
      }
    case 'severe':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-700 dark:text-orange-400',
        icon: 'text-orange-500',
      }
    case 'moderate':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        icon: 'text-yellow-500',
      }
    default:
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: 'text-blue-500',
      }
  }
}

/**
 * Get icon name for alert type
 */
export function getAlertTypeIcon(type: AlertType): string {
  switch (type) {
    case 'wind':
      return 'wind'
    case 'snow-ice':
      return 'snowflake'
    case 'thunderstorm':
      return 'cloud-lightning'
    case 'fog':
      return 'cloud-fog'
    case 'high-temperature':
      return 'thermometer-sun'
    case 'low-temperature':
      return 'thermometer-snowflake'
    case 'coastal-event':
      return 'waves'
    case 'forest-fire':
      return 'flame'
    case 'avalanche':
      return 'mountain-snow'
    case 'rain':
      return 'cloud-rain'
    case 'flood':
    case 'rain-flood':
      return 'droplets'
    default:
      return 'alert-triangle'
  }
}
