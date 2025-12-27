import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export interface GeocodeResult {
  name: string
  lat: number
  lon: number
  country: string
  countryCode: string
  admin1?: string
}

// European country codes for search filtering (ISO 3166-1 alpha-2)
// Includes EU, EEA, UK, Balkans, and nearby countries
const EU_COUNTRY_CODES = new Set([
  // Western Europe
  'BE', 'NL', 'LU', 'FR', 'MC', 'CH', 'LI', 'DE', 'AT',
  // Southern Europe
  'IT', 'MT', 'SM', 'VA', 'ES', 'AD', 'PT', 'GR', 'CY',
  // Northern Europe
  'GB', 'IE', 'DK', 'SE', 'NO', 'FI', 'IS',
  // Eastern Europe
  'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'SI', 'HR', 'BA', 'RS', 'ME', 'MK', 'AL', 'XK',
  // Baltic States
  'EE', 'LV', 'LT',
  // Eastern
  'UA', 'BY', 'MD',
  // Turkey (partly European)
  'TR',
])

// Search input schema
const SearchInputSchema = z.object({
  query: z.string().min(2),
  language: z.string().optional().default('en'),
})

// Search locations via Open-Meteo Geocoding API (EU filtered server-side)
export const searchLocations = createServerFn()
  .inputValidator(z.string().min(2))
  .handler(async ({ data: query }): Promise<GeocodeResult[]> => {
    // Fetch more results to filter down to EU countries
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=20&language=en`
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Geocoding API error: ${res.statusText}`)
    }

    const data = await res.json()

    if (!data.results) return []

    // Filter to EU countries and take first 6
    return data.results
      .filter((r: { country_code: string }) => EU_COUNTRY_CODES.has(r.country_code))
      .slice(0, 6)
      .map(
        (r: {
          name: string
          latitude: number
          longitude: number
          country: string
          country_code: string
          admin1?: string
        }) => ({
          name: r.name,
          lat: r.latitude,
          lon: r.longitude,
          country: r.country,
          countryCode: r.country_code,
          admin1: r.admin1,
        })
      )
  })

// Search with language parameter (EU filtered server-side)
export const searchLocationsWithLang = createServerFn()
  .inputValidator(SearchInputSchema)
  .handler(async ({ data: { query, language } }): Promise<GeocodeResult[]> => {
    // Fetch more results to filter down to EU countries
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=20&language=${language}`
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Geocoding API error: ${res.statusText}`)
    }

    const data = await res.json()

    if (!data.results) return []

    // Filter to EU countries and take first 6
    return data.results
      .filter((r: { country_code: string }) => EU_COUNTRY_CODES.has(r.country_code))
      .slice(0, 6)
      .map(
        (r: {
          name: string
          latitude: number
          longitude: number
          country: string
          country_code: string
          admin1?: string
        }) => ({
          name: r.name,
          lat: r.latitude,
          lon: r.longitude,
          country: r.country,
          countryCode: r.country_code,
          admin1: r.admin1,
        })
      )
  })
