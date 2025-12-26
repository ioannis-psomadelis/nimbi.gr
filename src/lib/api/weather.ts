import { WeatherResponseSchema, type WeatherResponse } from '../../types/weather'
import type { ModelId } from '../../types/models'

const HOURLY_PARAMS = [
  'temperature_2m',
  'precipitation',
  'wind_speed_10m',
  'cloud_cover',
  'pressure_msl',
].join(',')

// Model-specific API endpoints (UKMO uses generic forecast endpoint with models param)
const MODEL_API_CONFIG: Record<ModelId, { endpoint: string; modelParam?: string }> = {
  'ecmwf-hres': { endpoint: 'https://api.open-meteo.com/v1/ecmwf' },
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
