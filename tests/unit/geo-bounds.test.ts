import { describe, it, expect } from 'vitest'
import { isWithinEUBounds, parseCoordinateSlug, getEUBounds } from '../../src/lib/utils/geo-bounds'

describe('geo-bounds', () => {
  describe('isWithinEUBounds', () => {
    it('returns true for Athens, Greece', () => {
      expect(isWithinEUBounds(37.9838, 23.7275)).toBe(true)
    })

    it('returns true for London, UK', () => {
      expect(isWithinEUBounds(51.5074, -0.1278)).toBe(true)
    })

    it('returns true for Paris, France', () => {
      expect(isWithinEUBounds(48.8566, 2.3522)).toBe(true)
    })

    it('returns true for Stockholm, Sweden', () => {
      expect(isWithinEUBounds(59.3293, 18.0686)).toBe(true)
    })

    it('returns false for New York, US', () => {
      expect(isWithinEUBounds(40.7128, -74.0060)).toBe(false)
    })

    it('returns false for Tokyo, Japan', () => {
      expect(isWithinEUBounds(35.6762, 139.6503)).toBe(false)
    })

    it('returns false for Sydney, Australia', () => {
      expect(isWithinEUBounds(-33.8688, 151.2093)).toBe(false)
    })

    it('returns true for Azores (west boundary)', () => {
      expect(isWithinEUBounds(37.7833, -25.5333)).toBe(true)
    })

    it('returns true for Canary Islands (south boundary)', () => {
      expect(isWithinEUBounds(28.2916, -16.6291)).toBe(true)
    })

    it('returns true for northern Norway', () => {
      expect(isWithinEUBounds(70.6634, 23.6821)).toBe(true)
    })

    it('returns false for location too far north', () => {
      expect(isWithinEUBounds(80.0, 20.0)).toBe(false)
    })

    it('returns false for location too far south', () => {
      expect(isWithinEUBounds(20.0, 10.0)).toBe(false)
    })
  })

  describe('parseCoordinateSlug', () => {
    it('parses valid coordinate slug with decimals', () => {
      const result = parseCoordinateSlug('40.7128_-74.0060')
      expect(result).toEqual({ lat: 40.7128, lon: -74.006 })
    })

    it('parses coordinate slug with integer values', () => {
      const result = parseCoordinateSlug('40_-74')
      expect(result).toEqual({ lat: 40, lon: -74 })
    })

    it('parses negative latitude and longitude', () => {
      const result = parseCoordinateSlug('-33.8688_-70.6693')
      expect(result).toEqual({ lat: -33.8688, lon: -70.6693 })
    })

    it('returns null for named slug', () => {
      expect(parseCoordinateSlug('athens-gr')).toBeNull()
    })

    it('returns null for invalid format', () => {
      expect(parseCoordinateSlug('invalid')).toBeNull()
    })

    it('returns null for partial coordinate', () => {
      expect(parseCoordinateSlug('40.7128')).toBeNull()
    })

    it('returns null for wrong separator', () => {
      expect(parseCoordinateSlug('40.7128-74.0060')).toBeNull()
    })
  })

  describe('getEUBounds', () => {
    it('returns EU bounds object', () => {
      const bounds = getEUBounds()
      expect(bounds).toHaveProperty('north')
      expect(bounds).toHaveProperty('south')
      expect(bounds).toHaveProperty('east')
      expect(bounds).toHaveProperty('west')
    })

    it('returns a copy, not the original object', () => {
      const bounds1 = getEUBounds()
      const bounds2 = getEUBounds()
      expect(bounds1).not.toBe(bounds2)
      expect(bounds1).toEqual(bounds2)
    })
  })
})
