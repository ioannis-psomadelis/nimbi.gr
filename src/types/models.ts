export const MODELS = ['ecmwf-hres', 'icon', 'arpege', 'gfs', 'gem', 'ukmo'] as const

export type ModelId = (typeof MODELS)[number]

export type ChartProvider = 'meteociel' | 'wetterzentrale'
export type DataProvider = 'open-meteo'

export interface ModelConfig {
  name: string
  color: string
  description: string
  hasRegional: boolean
  chartProvider: ChartProvider
  dataProvider: DataProvider
  resolution: string
  updateTimes: string
  forecastLength: string
}

export const MODEL_CONFIG: Record<ModelId, ModelConfig> = {
  'ecmwf-hres': {
    name: 'ECMWF HD',
    color: '#dc2626',
    description: 'ECMWF High Resolution - European Centre for Medium-Range Weather Forecasts',
    hasRegional: true,
    chartProvider: 'meteociel',
    dataProvider: 'open-meteo',
    resolution: '0.25° (~25km)',
    updateTimes: '00z, 12z',
    forecastLength: '10 days',
  },
  icon: {
    name: 'ICON',
    color: '#8b5cf6',
    description: 'ICON - German Weather Service (DWD) Icosahedral Nonhydrostatic Model',
    hasRegional: true,
    chartProvider: 'wetterzentrale',
    dataProvider: 'open-meteo',
    resolution: '0.125° (~13km)',
    updateTimes: '00z, 06z, 12z, 18z',
    forecastLength: '7 days',
  },
  arpege: {
    name: 'ARPEGE',
    color: '#06b6d4',
    description: 'ARPEGE - Météo-France Global Spectral Model',
    hasRegional: true,
    chartProvider: 'wetterzentrale',
    dataProvider: 'open-meteo',
    resolution: '0.1° (~10km) over Europe',
    updateTimes: '00z, 06z, 12z, 18z',
    forecastLength: '4 days',
  },
  gfs: {
    name: 'GFS',
    color: '#3b82f6',
    description: 'GFS - US Global Forecast System (NOAA/NCEP)',
    hasRegional: false,
    chartProvider: 'meteociel',
    dataProvider: 'open-meteo',
    resolution: '0.25° (~25km)',
    updateTimes: '00z, 06z, 12z, 18z',
    forecastLength: '16 days',
  },
  gem: {
    name: 'GEM',
    color: '#22c55e',
    description: 'GEM - Canadian Global Environmental Multiscale Model',
    hasRegional: false,
    chartProvider: 'meteociel',
    dataProvider: 'open-meteo',
    resolution: '0.25° (~25km)',
    updateTimes: '00z, 12z',
    forecastLength: '10 days',
  },
  ukmo: {
    name: 'UKMO',
    color: '#f59e0b',
    description: 'UKMO - UK Met Office Unified Model',
    hasRegional: false,
    chartProvider: 'meteociel',
    dataProvider: 'open-meteo',
    resolution: '0.1° (~10km)',
    updateTimes: '00z, 12z',
    forecastLength: '7 days',
  },
}
