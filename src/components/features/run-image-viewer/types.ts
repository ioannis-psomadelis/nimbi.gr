import { type ModelId } from '../../../types/models'
import type { ChartParamId } from '../../../lib/utils/runs'

// Model-specific hour step configuration
export const MODEL_HOUR_CONFIG: Record<ModelId, { step: number; min: number; max: number }> = {
  'ecmwf-hres': { step: 6, min: 6, max: 240 },
  icon: { step: 3, min: 3, max: 180 },      // ICON runs up to 180h, 3h steps
  arpege: { step: 3, min: 3, max: 102 },    // ARPEGE runs up to 102h, 3h steps
  gfs: { step: 6, min: 6, max: 240 },
  gem: { step: 6, min: 6, max: 240 },
  ukmo: { step: 6, min: 6, max: 144 },
  'ec-aifs': { step: 6, min: 6, max: 240 }, // EC-AIFS similar to ECMWF
  gefs: { step: 6, min: 6, max: 384 },      // GEFS ensemble runs up to 16 days
  eps: { step: 6, min: 6, max: 360 },       // EPS ensemble runs up to 15 days
}

// Snap hour to nearest valid step for a model
export function snapToValidHour(hour: number, model: ModelId): number {
  const config = MODEL_HOUR_CONFIG[model]
  const snapped = Math.round(hour / config.step) * config.step
  return Math.max(config.min, Math.min(config.max, snapped))
}

// Helper to get translation keys for chart parameters (new string-based IDs)
export const getParamTranslations = (id: ChartParamId) => {
  const keys: Record<ChartParamId, { label: string; short: string; desc: string; info: string; usage: string }> = {
    'mslp': { label: 'paramPressure', short: 'paramPressureShort', desc: 'paramPressureDesc', info: 'paramPressureInfo', usage: 'paramPressureUsage' },
    't2m': { label: 'paramTemp2m', short: 'paramTemp2mShort', desc: 'paramTemp2mDesc', info: 'paramTemp2mInfo', usage: 'paramTemp2mUsage' },
    't850': { label: 'paramTemp850', short: 'paramTemp850Short', desc: 'paramTemp850Desc', info: 'paramTemp850Info', usage: 'paramTemp850Usage' },
    'wind': { label: 'paramWind', short: 'paramWindShort', desc: 'paramWindDesc', info: 'paramWindInfo', usage: 'paramWindUsage' },
    'jet': { label: 'paramJet', short: 'paramJetShort', desc: 'paramJetDesc', info: 'paramJetInfo', usage: 'paramJetUsage' },
    'z500': { label: 'paramZ500', short: 'paramZ500Short', desc: 'paramZ500Desc', info: 'paramZ500Info', usage: 'paramZ500Usage' },
    'cape': { label: 'paramCape', short: 'paramCapeShort', desc: 'paramCapeDesc', info: 'paramCapeInfo', usage: 'paramCapeUsage' },
    'precip24': { label: 'paramPrecip', short: 'paramPrecipShort', desc: 'paramPrecipDesc', info: 'paramPrecipInfo', usage: 'paramPrecipUsage' },
    'snow': { label: 'paramSnow', short: 'paramSnowShort', desc: 'paramSnowDesc', info: 'paramSnowInfo', usage: 'paramSnowUsage' },
    'pwat': { label: 'paramPwat', short: 'paramPwatShort', desc: 'paramPwatDesc', info: 'paramPwatInfo', usage: 'paramPwatUsage' },
    'ir': { label: 'paramIr', short: 'paramIrShort', desc: 'paramIrDesc', info: 'paramIrInfo', usage: 'paramIrUsage' },
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
