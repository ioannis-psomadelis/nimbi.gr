export const MODELS = ['ecmwf-hres', 'gfs', 'gem', 'ukmo'] as const

export type ModelId = (typeof MODELS)[number]

export const MODEL_CONFIG: Record<ModelId, { name: string; color: string; description: string }> = {
  'ecmwf-hres': { name: 'ECMWF HD', color: '#dc2626', description: 'ECMWF High Resolution 0.25°' },
  gfs: { name: 'GFS', color: '#3b82f6', description: 'US Global Forecast System' },
  gem: { name: 'GEM', color: '#22c55e', description: 'Canadian Global Model' },
  ukmo: { name: 'UKMO', color: '#f59e0b', description: 'UK Met Office' },
}
