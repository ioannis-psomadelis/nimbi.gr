import { describe, it, expect } from 'vitest'
import { WeatherResponseSchema } from '../../src/types/weather'

describe('WeatherResponseSchema', () => {
  it('validates a correct response', () => {
    const validResponse = {
      latitude: 37.98,
      longitude: 23.73,
      generationtime_ms: 0.5,
      utc_offset_seconds: 0,
      hourly: {
        time: ['2025-12-26T00:00', '2025-12-26T01:00'],
        temperature_2m: [10, 11],
        precipitation: [0, 0.5],
        wind_speed_10m: [5, 6],
        cloud_cover: [20, 30],
        pressure_msl: [1013, 1014],
      },
    }

    const result = WeatherResponseSchema.safeParse(validResponse)
    expect(result.success).toBe(true)
  })

  it('rejects invalid response', () => {
    const invalidResponse = { latitude: 'invalid' }
    const result = WeatherResponseSchema.safeParse(invalidResponse)
    expect(result.success).toBe(false)
  })
})
