import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { z } from 'zod'

// Types
export interface Location {
  name: string
  nameLocal?: string
  lat: number
  lon: number
  country: string
}

export interface LocationWithSlug extends Location {
  slug: string
}

// Read locations from JSON
async function readLocations(): Promise<Record<string, Location>> {
  // Use dynamic import for JSON in server context
  const locationsModule = await import('../../data/locations.json')
  return locationsModule.default as Record<string, Location>
}

// Parse coordinate slug to lat/lon
function parseCoordinateSlug(slug: string): { lat: number; lon: number } | null {
  const match = slug.match(/^(-?\d+\.\d+)_(-?\d+\.\d+)$/)
  if (!match) return null
  return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) }
}

// getLocationBySlug - returns location or throws notFound
export const getLocationBySlug = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: slug }): Promise<LocationWithSlug> => {
    const locations = await readLocations()

    // First check predefined locations
    const location = locations[slug]
    if (location) {
      return { slug, ...location }
    }

    // Check if it's a coordinate-based slug (format: lat_lon)
    const coords = parseCoordinateSlug(slug)
    if (coords) {
      // Reverse geocode to get name
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'nimbi.gr Weather App' },
      })

      if (res.ok) {
        try {
          const data = await res.json()
          const name = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || 'Unknown'
          const country = data.address?.country_code?.toUpperCase() || 'XX'

          return {
            slug,
            name,
            lat: coords.lat,
            lon: coords.lon,
            country,
          }
        } catch {
          // JSON parse failed, fall through to notFound
        }
      }
    }

    throw notFound()
  })

// getAllLocations - for quick picks on home page
export const getAllLocations = createServerFn().handler(
  async (): Promise<Record<string, Location>> => {
    return await readLocations()
  }
)

// Helper to generate a URL-friendly slug from location name and country
function generateSlug(name: string, countryCode: string): string {
  const normalizedName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-|-$/g, '') // Trim leading/trailing hyphens
  return `${normalizedName}-${countryCode.toLowerCase()}`
}

// createLocationFromCoords - reverse geocode and create/get location
export const createLocationFromCoords = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ lat: z.number(), lon: z.number() }))
  .handler(async ({ data: { lat, lon } }): Promise<{ slug: string }> => {
    // 1. Reverse geocode to get name/country
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'nimbi.gr Weather App' },
    })

    if (!res.ok) {
      throw new Error(`Reverse geocoding API error: ${res.statusText}`)
    }

    const data = await res.json()
    const name =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      'Unknown'
    const countryCode = data.address?.country_code?.toUpperCase() || 'XX'

    // 2. Generate slug
    const slug = generateSlug(name, countryCode)

    // 3. Check if already exists in our predefined locations
    const locations = await readLocations()

    // If location exists, return it
    if (locations[slug]) {
      return { slug }
    }

    // For new locations, we return the slug but don't persist
    // (locations.json is static - dynamic locations use coordinates in URL)
    // The observatory page will handle coords-based lookups
    return { slug: `${lat.toFixed(4)}_${lon.toFixed(4)}` }
  })
