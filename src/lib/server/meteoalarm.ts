import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Country code to feed name mapping for MeteoAlarm
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

/**
 * Server function to fetch MeteoAlarm feed for a country
 * This runs on the server, bypassing CORS restrictions
 */
export const fetchMeteoAlarmFeed = createServerFn()
  .inputValidator(z.string().length(2))
  .handler(async ({ data: countryCode }): Promise<string> => {
    const countryName = COUNTRY_FEED_MAPPING[countryCode.toUpperCase()]

    if (!countryName) {
      // Country not supported, return empty feed
      return ''
    }

    const feedUrl = `https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-${countryName}`

    try {
      const response = await fetch(feedUrl, {
        headers: {
          'Accept': '*/*',
          'User-Agent': 'nimbi.gr Weather App',
        },
      })

      if (!response.ok) {
        console.warn(`MeteoAlarm feed error for ${countryCode}: ${response.statusText}`)
        return ''
      }

      return await response.text()
    } catch (error) {
      console.warn(`Failed to fetch MeteoAlarm feed for ${countryCode}:`, error)
      return ''
    }
  })
