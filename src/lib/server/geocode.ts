import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export interface GeocodeResult {
  name: string
  lat: number
  lon: number
  country: string
  countryCode: string
}

// Search locations via Open-Meteo Geocoding API
export const searchLocations = createServerFn()
  .inputValidator(z.string().min(2))
  .handler(async ({ data: query }): Promise<GeocodeResult[]> => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Geocoding API error: ${res.statusText}`)
    }

    const data = await res.json()

    if (!data.results) return []

    return data.results.map(
      (r: {
        name: string
        latitude: number
        longitude: number
        country: string
        country_code: string
      }) => ({
        name: r.name,
        lat: r.latitude,
        lon: r.longitude,
        country: r.country,
        countryCode: r.country_code,
      })
    )
  })
