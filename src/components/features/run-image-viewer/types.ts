import { type ModelId } from '../../../types/models'
import type { ChartParamId } from '../../../lib/utils/runs'

// Model-specific hour step configuration
export const MODEL_HOUR_CONFIG: Record<ModelId, { step: number; min: number; max: number }> = {
  'ecmwf-hres': { step: 6, min: 6, max: 240 },
  gfs: { step: 6, min: 6, max: 240 },
  gem: { step: 6, min: 6, max: 240 },
  ukmo: { step: 6, min: 6, max: 144 },
}

// Snap hour to nearest valid step for a model
export function snapToValidHour(hour: number, model: ModelId): number {
  const config = MODEL_HOUR_CONFIG[model]
  const snapped = Math.round(hour / config.step) * config.step
  return Math.max(config.min, Math.min(config.max, snapped))
}

// Helper to get translation keys for chart parameters
export const getParamTranslations = (id: ChartParamId) => {
  const keys: Record<ChartParamId, { label: string; short: string; desc: string; info: string; usage: string }> = {
    '0': { label: 'paramPressure', short: 'paramPressureShort', desc: 'paramPressureDesc', info: 'paramPressureInfo', usage: 'paramPressureUsage' },
    '9': { label: 'paramTemp2m', short: 'paramTemp2mShort', desc: 'paramTemp2mDesc', info: 'paramTemp2mInfo', usage: 'paramTemp2mUsage' },
    '1': { label: 'paramTemp850', short: 'paramTemp850Short', desc: 'paramTemp850Desc', info: 'paramTemp850Info', usage: 'paramTemp850Usage' },
    '2': { label: 'paramPrecip', short: 'paramPrecipShort', desc: 'paramPrecipDesc', info: 'paramPrecipInfo', usage: 'paramPrecipUsage' },
    '14': { label: 'paramWind', short: 'paramWindShort', desc: 'paramWindDesc', info: 'paramWindInfo', usage: 'paramWindUsage' },
    '5': { label: 'paramJet', short: 'paramJetShort', desc: 'paramJetDesc', info: 'paramJetInfo', usage: 'paramJetUsage' },
  }
  return keys[id]
}

export interface RunImageViewerProps {
  runId: string
  model: ModelId
  latitude?: number
  longitude?: number
  onForecastHourChange?: (hour: number) => void
  forecastHourRef?: React.MutableRefObject<{ goToPrevious: () => void; goToNext: () => void } | null>
}

export interface ForecastDateTime {
  short: string
  weekday: string
  date: string
  time: string
}
