import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchModelData, buildModelUrl } from '../../src/lib/api/weather'

describe('buildModelUrl', () => {
  it('builds correct URL for GFS model', () => {
    const url = buildModelUrl('gfs', 37.98, 23.73)
    expect(url).toContain('api.open-meteo.com/v1/gfs')
    expect(url).toContain('latitude=37.98')
    expect(url).toContain('longitude=23.73')
    expect(url).toContain('temperature_2m')
  })
})

describe('fetchModelData', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('fetches and validates model data', async () => {
    const mockResponse = {
      latitude: 37.98,
      longitude: 23.73,
      generationtime_ms: 0.5,
      utc_offset_seconds: 0,
      hourly: {
        time: ['2025-12-26T00:00'],
        temperature_2m: [10],
        precipitation: [0],
        wind_speed_10m: [5],
        cloud_cover: [20],
        pressure_msl: [1013],
      },
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchModelData('gfs', 37.98, 23.73)
    expect(result.latitude).toBe(37.98)
    expect(result.hourly.temperature_2m).toEqual([10])
  })

  it('throws on invalid response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ invalid: 'data' }),
    })

    await expect(fetchModelData('gfs', 0, 0)).rejects.toThrow()
  })
})
