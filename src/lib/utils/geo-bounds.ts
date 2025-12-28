/**
 * Geographic bounds checking utilities
 */

// Extended EU bounds (includes nearby regions for weather relevance)
// Covers: EU countries, UK, Norway, Iceland, parts of North Africa, Turkey
const EU_BOUNDS = {
  north: 72,    // Northern Norway/Svalbard
  south: 27,    // Canary Islands / North Africa coast
  west: -32,    // Azores
  east: 45,     // Eastern Turkey / Caucasus
}

/**
 * Check if coordinates are within the supported EU region
 */
export function isWithinEUBounds(lat: number, lon: number): boolean {
  return (
    lat >= EU_BOUNDS.south &&
    lat <= EU_BOUNDS.north &&
    lon >= EU_BOUNDS.west &&
    lon <= EU_BOUNDS.east
  )
}

/**
 * Get the EU bounds object
 */
export function getEUBounds() {
  return { ...EU_BOUNDS }
}

/**
 * Parse a coordinate-based slug (e.g., "40.7128_-74.0060") to lat/lon
 * Returns null if the slug is not in coordinate format
 */
export function parseCoordinateSlug(slug: string): { lat: number; lon: number } | null {
  const match = slug.match(/^(-?\d+(?:\.\d+)?)_(-?\d+(?:\.\d+)?)$/)
  if (!match) return null
  return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) }
}
