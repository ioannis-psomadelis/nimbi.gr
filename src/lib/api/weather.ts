import { queryOptions } from '@tanstack/react-query'
import { WeatherResponseSchema, type WeatherResponse } from '../../types/weather'
import type { ModelId } from '../../types/models'
import { MODELS } from '../../types/models'

const HOURLY_PARAMS = [
  'temperature_2m',
  'precipitation',
  'wind_speed_10m',
  'cloud_cover',
  'pressure_msl',
  'precipitation_probability',
  'apparent_temperature',
  'uv_index',
  'weather_code',
].join(',')

const DAILY_PARAMS = ['sunrise', 'sunset'].join(',')

// Model-specific API endpoints
// UKMO uses generic forecast endpoint with models param
// ICON uses DWD API, ARPEGE uses Météo-France API
const MODEL_API_CONFIG: Record<ModelId, { endpoint: string; modelParam?: string }> = {
  'ecmwf-hres': { endpoint: 'https://api.open-meteo.com/v1/ecmwf' },
  icon: { endpoint: 'https://api.open-meteo.com/v1/dwd-icon' },
  arpege: { endpoint: 'https://api.open-meteo.com/v1/meteofrance' },
  gfs: { endpoint: 'https://api.open-meteo.com/v1/gfs' },
  gem: { endpoint: 'https://api.open-meteo.com/v1/gem' },
  ukmo: { endpoint: 'https://api.open-meteo.com/v1/forecast', modelParam: 'ukmo_seamless' },
}

export function buildModelUrl(model: ModelId, lat: number, lon: number): string {
  const config = MODEL_API_CONFIG[model]
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: HOURLY_PARAMS,
    daily: DAILY_PARAMS,
    timezone: 'auto',
  })
  // UKMO requires the models parameter
  if (config.modelParam) {
    params.set('models', config.modelParam)
  }
  return `${config.endpoint}?${params.toString()}`
}

export async function fetchModelData(
  model: ModelId,
  lat: number,
  lon: number
): Promise<WeatherResponse> {
  const url = buildModelUrl(model, lat, lon)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${model}: ${response.statusText}`)
  }

  const data = await response.json()
  return WeatherResponseSchema.parse(data)
}

// Query options for all models (pro mode) or just ECMWF (simple mode)
export function allModelsQueryOptions(lat: number, lon: number, proMode: boolean) {
  const modelsToFetch = proMode ? MODELS : (['ecmwf-hres'] as const)

  return queryOptions({
    queryKey: ['weather', 'all', lat, lon, proMode],
    queryFn: async () => {
      const results = await Promise.allSettled(
        modelsToFetch.map((model) => fetchModelData(model, lat, lon))
      )
      const modelData: Record<ModelId, WeatherResponse | null> = {} as Record<ModelId, WeatherResponse | null>
      modelsToFetch.forEach((model, index) => {
        const result = results[index]
        modelData[model] = result.status === 'fulfilled' ? result.value : null
      })
      return modelData
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - keep data fresh during navigation
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache
  })
}
