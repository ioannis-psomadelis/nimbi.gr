import { type ModelId, MODEL_CONFIG } from '../../types/models'

// Model run times - which UTC hours each model runs at
export const MODEL_RUN_TIMES: Record<ModelId, number[]> = {
  'ecmwf-hres': [0, 12],
  icon: [0, 6, 12, 18],
  arpege: [0, 6, 12, 18],
  gfs: [0, 6, 12, 18],
  gem: [0, 12],
  ukmo: [0, 12],
  'ec-aifs': [0, 12],      // EC-AIFS runs at 00z and 12z like ECMWF
  gefs: [0, 6, 12, 18],    // GEFS runs 4x daily like GFS
  eps: [0, 12],            // EPS runs at 00z and 12z like ECMWF
}

// Regional chart support for Meteociel (ECMWF)
export type MeteocielRegion = 'europe' | 'greece' | 'france' | 'italy' | 'spain' | 'uk' | 'germany'

export const METEOCIEL_REGION_CONFIG: Record<MeteocielRegion, { name: string; nameKey: string; ecmwfCode: string; hresSuffix: string }> = {
  europe: { name: 'Europe', nameKey: 'europe', ecmwfCode: 'ECM', hresSuffix: '' },
  greece: { name: 'Greece', nameKey: 'greece', ecmwfCode: 'ECG', hresSuffix: 'gr' },
  france: { name: 'France', nameKey: 'france', ecmwfCode: 'ECF', hresSuffix: 'fr' },
  italy: { name: 'Italy', nameKey: 'italy', ecmwfCode: 'ECI', hresSuffix: 'it' },
  spain: { name: 'Spain', nameKey: 'spain', ecmwfCode: 'ECS', hresSuffix: 'sp' },
  uk: { name: 'United Kingdom', nameKey: 'uk', ecmwfCode: 'ECU', hresSuffix: 'uk' },
  germany: { name: 'Germany', nameKey: 'germany', ecmwfCode: 'ECA', hresSuffix: 'de' },
}

// Legacy alias for backward compatibility
export type ChartRegion = MeteocielRegion
export const REGION_CONFIG = METEOCIEL_REGION_CONFIG

// Get models that support regional charts
export function getRegionalModels(): ModelId[] {
  return Object.entries(MODEL_CONFIG)
    .filter(([, config]) => config.hasRegional)
    .map(([id]) => id as ModelId)
}

// Legacy constant for backward compatibility
export const REGIONAL_MODELS: ModelId[] = ['ecmwf-hres', 'icon', 'arpege']

export interface RunInfo {
  id: string        // YYYYMMDDHH
  date: Date
  hour: number      // 0, 6, 12, 18
  label: string     // "00z · Dec 26"
}

export function getLatestRun(): RunInfo {
  const now = new Date()
  const utcHour = now.getUTCHours()

  // Runs available ~5 hours after initialization
  let runHour: number
  let dayOffset = 0

  if (utcHour >= 17) {
    runHour = 12
  } else if (utcHour >= 11) {
    runHour = 6
  } else if (utcHour >= 5) {
    runHour = 0
  } else {
    runHour = 18
    dayOffset = -1
  }

  const runDate = new Date(now)
  runDate.setUTCDate(runDate.getUTCDate() + dayOffset)
  runDate.setUTCHours(runHour, 0, 0, 0)

  return formatRunInfo(runDate, runHour)
}

export function getNextRunTime(): { hours: number; minutes: number } {
  const now = new Date()
  const utcHour = now.getUTCHours()
  const utcMinutes = now.getUTCMinutes()

  // Runs available at ~05:00, ~11:00, ~17:00, ~23:00 UTC
  const availableTimes = [5, 11, 17, 23]

  // Find the next available time
  let nextHour = availableTimes.find(h => h > utcHour) ?? availableTimes[0]

  // Calculate hours and minutes until next run
  let hoursUntil = nextHour - utcHour
  if (hoursUntil <= 0) hoursUntil += 24 // Next day

  let minutesUntil = 60 - utcMinutes
  if (minutesUntil === 60) {
    minutesUntil = 0
  } else {
    hoursUntil -= 1
  }

  return { hours: hoursUntil, minutes: minutesUntil }
}

export function getPreviousRuns(count: number = 4): RunInfo[] {
  const latest = getLatestRun()
  const runs: RunInfo[] = []

  let currentDate = new Date(latest.date)
  let currentHour = latest.hour

  for (let i = 0; i < count; i++) {
    // Go back 6 hours
    currentHour -= 6
    if (currentHour < 0) {
      currentHour = 18
      currentDate.setUTCDate(currentDate.getUTCDate() - 1)
    }

    runs.push(formatRunInfo(new Date(currentDate), currentHour))
  }

  return runs
}

export function formatRunInfo(date: Date, hour: number): RunInfo {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hourStr = String(hour).padStart(2, '0')

  const monthName = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
  const dayNum = date.getUTCDate()

  return {
    id: `${year}${month}${day}${hourStr}`,
    date,
    hour,
    label: `${hourStr}z · ${monthName} ${dayNum}`,
  }
}

export function detectRegion(lat: number, lon: number): string {
  // Europe
  if (lat >= 35 && lat <= 72 && lon >= -12 && lon <= 45) {
    return 'europe'
  }
  // Continental US
  if (lat >= 24 && lat <= 50 && lon >= -130 && lon <= -60) {
    return 'us'
  }
  // Default to North America
  return 'namer'
}

// Detect the best country-specific region based on coordinates
export function detectBestRegion(lat: number, lon: number): ChartRegion {
  // Greece
  if (lat >= 34 && lat <= 42 && lon >= 19 && lon <= 30) return 'greece'
  // Italy
  if (lat >= 36 && lat <= 47 && lon >= 6 && lon <= 19) return 'italy'
  // Spain
  if (lat >= 36 && lat <= 44 && lon >= -10 && lon <= 5) return 'spain'
  // France
  if (lat >= 41 && lat <= 51 && lon >= -5 && lon <= 10) return 'france'
  // UK
  if (lat >= 49 && lat <= 61 && lon >= -11 && lon <= 2) return 'uk'
  // Germany
  if (lat >= 47 && lat <= 55 && lon >= 5 && lon <= 16) return 'germany'
  // Default Europe
  return 'europe'
}

// Chart scopes - Europe-wide or Regional zoom
export const CHART_SCOPES = ['europe', 'regional'] as const

// Meteociel chart parameters with detailed info for tooltips/modals
// Core params are mapped to both Tropical Tidbits and Meteociel
// TT-only params have meteocielMode: null
export const CHART_PARAMS = [
  // Core (mapped to both TT and Meteociel)
  {
    id: 'mslp',
    ttCode: 'mslp_pcpn_frzn',
    meteocielMode: 0,
    label: 'Pressure & Precip',
    shortLabel: 'MSLP',
    description: 'Mean Sea Level Pressure & Precipitation (Rain/Frozen)',
    info: 'Shows surface pressure patterns combined with precipitation. High pressure areas typically bring clear weather, while low pressure areas are associated with storms.',
  },
  {
    id: 't2m',
    ttCode: 'T2m',
    meteocielMode: 9,
    label: 'Temp 2m',
    shortLabel: 'T2m',
    description: 'Temperature at 2 meters',
    info: 'The forecasted air temperature at 2 meters above ground level.',
  },
  {
    id: 't850',
    ttCode: 'T850',
    meteocielMode: 1,
    label: 'Temp 850',
    shortLabel: 'T850',
    description: 'Temperature at 850hPa (~1500m)',
    info: 'Temperature at approximately 1,500 meters above sea level.',
  },
  {
    id: 'wind',
    ttCode: 'mslp_wind',
    meteocielMode: 14,
    label: 'Wind',
    shortLabel: 'Wind',
    description: 'MSLP & 10m Wind',
    info: 'Wind speed and direction at 10 meters above ground level.',
  },
  {
    id: 'jet',
    ttCode: 'uv250',
    meteocielMode: 5,
    label: 'Jet Stream',
    shortLabel: 'Jet',
    description: '250mb Wind (Jet Stream)',
    info: 'The jet stream at high altitude.',
  },
  // TT-only params (meteocielMode: null)
  {
    id: 'z500',
    ttCode: 'z500_vort',
    meteocielMode: null,
    label: '500mb Heights',
    shortLabel: 'Z500',
    description: '500mb Height & Vorticity',
    info: 'Mid-level atmospheric pattern.',
  },
  {
    id: 'cape',
    ttCode: 'cape',
    meteocielMode: null,
    label: 'CAPE',
    shortLabel: 'CAPE',
    description: 'Surface-Based CAPE (Thunderstorm potential)',
    info: 'Indicates thunderstorm potential.',
  },
  {
    id: 'precip24',
    ttCode: 'apcpn24',
    meteocielMode: null,
    label: 'Precip 24h',
    shortLabel: 'Precip',
    description: '24-hour Accumulated Precipitation',
    info: 'Total precipitation over 24 hours.',
  },
  {
    id: 'snow',
    ttCode: 'asnow',
    meteocielMode: null,
    label: 'Snowfall',
    shortLabel: 'Snow',
    description: 'Total Snowfall (10:1 SLR)',
    info: 'Accumulated snowfall.',
  },
  {
    id: 'pwat',
    ttCode: 'mslp_pwat',
    meteocielMode: null,
    label: 'PWAT',
    shortLabel: 'PWAT',
    description: 'Precipitable Water',
    info: 'Total water vapor in atmosphere.',
  },
  {
    id: 'ir',
    ttCode: 'ir',
    meteocielMode: null,
    label: 'Satellite',
    shortLabel: 'IR',
    description: 'Simulated IR Satellite',
    info: 'Model-simulated infrared satellite.',
  },
] as const

export type ChartParamId = (typeof CHART_PARAMS)[number]['id']

export function getAvailableParams(scope: (typeof CHART_SCOPES)[number]) {
  if (scope === 'europe') {
    return CHART_PARAMS
  }
  return CHART_PARAMS.filter(p => p.meteocielMode !== null)
}

// Model-specific URL patterns from Meteociel
// GFS: https://modeles16.meteociel.fr/modeles/gfs/runs/{runId}/gfs-{mode}-{hour}.png
// ECMWF: https://www.meteociel.fr/modeles/ecmwf/runs/{runId}/ECM1-{hour}.GIF
// GEM: https://modeles16.meteociel.fr/modeles/gem/run/gem-{mode}-{hour}.png
// UKMO: https://www.meteociel.fr/ukmo/runs/{runId}/UW6-{hour}.GIF

// UKMO mode mappings
const UKMO_MODE_MAP: Record<number, string> = {
  0: 'UW6',   // Pressure/500hPa
  9: 'UW0',   // Temp 2m
  1: 'UW2',   // Temp 850
  2: 'UW3',   // Precip
  14: 'UW4',  // Wind
  5: 'UW5',   // Jet stream
}

// Models that only run at 00z and 12z (not 06z and 18z)
// Derived from MODEL_RUN_TIMES
const TWICE_DAILY_MODELS: ModelId[] = Object.entries(MODEL_RUN_TIMES)
  .filter(([, times]) => times.length === 2 && times.includes(0) && times.includes(12))
  .map(([id]) => id as ModelId)

/**
 * Get the appropriate run ID for models that only have 00z and 12z runs.
 * Maps 06z -> 00z and 18z -> 12z for ECMWF and UKMO.
 */
function getModelRunId(model: ModelId, runId: string): string {
  if (!TWICE_DAILY_MODELS.includes(model)) {
    return runId
  }

  // Extract hour from runId (last 2 characters: YYYYMMDDHH)
  const hour = parseInt(runId.slice(-2), 10)

  // Map 06z -> 00z and 18z -> 12z
  if (hour === 6) {
    return runId.slice(0, -2) + '00'
  } else if (hour === 18) {
    return runId.slice(0, -2) + '12'
  }

  return runId
}

// Derive ChartScope type from CHART_SCOPES constant
export type ChartScope = (typeof CHART_SCOPES)[number]

// Build Meteociel chart URL for supported models (ECMWF, GFS, GEM, UKMO)
export function buildMeteocielUrl(
  model: ModelId,
  runId: string,
  mode: number,
  forecastHour: number,
  region: ChartRegion = 'europe'
): string {
  const regionConfig = REGION_CONFIG[region]

  switch (model) {
    case 'gfs':
      // GFS only supports Europe (regional URLs are protected)
      return `https://modeles16.meteociel.fr/modeles/gfs/runs/${runId}/gfs-${mode}-${forecastHour}.png`

    case 'ecmwf-hres': {
      // ECMWF HRES 0.25° - regional suffix in filename (ecmwf, ecmwfgr, ecmwffr, etc.)
      // URL: https://modeles3.meteociel.fr/modeles/ecmwf/runs/{runId}/ecmwf{suffix}-{mode}-{hour}.png
      const hresRunId = getModelRunId('ecmwf-hres', runId)
      const suffix = regionConfig.hresSuffix
      return `https://modeles3.meteociel.fr/modeles/ecmwf/runs/${hresRunId}/ecmwf${suffix}-${mode}-${forecastHour}.png`
    }

    case 'gem':
      // GEM only supports Europe
      return `https://modeles16.meteociel.fr/modeles/gem/run/gem-${mode}-${forecastHour}.png`

    case 'ukmo': {
      // UKMO only supports Europe
      const ukmoRunId = getModelRunId('ukmo', runId)
      const ukmoCode = UKMO_MODE_MAP[mode] || 'UW6'
      return `https://www.meteociel.fr/ukmo/runs/${ukmoRunId}/${ukmoCode}-${forecastHour}.GIF`
    }

    default:
      return `https://modeles16.meteociel.fr/modeles/gfs/runs/${runId}/gfs-${mode}-${forecastHour}.png`
  }
}

// Import Wetterzentrale utilities
import {
  buildWetterzenUrl,
  detectWetterzenRegion,
  WETTERZENTRALE_PARAMS,
  type WetterzenRegionCode,
  type WetterzenParamCode,
} from './wetterzentrale'

// Import Tropical Tidbits utilities
import { buildTropicalTidbitsUrl, TT_MODEL_CODES } from './tropicaltidbits'

// Map Meteociel mode to Wetterzentrale param
function modeToWetterzenParam(mode: number): WetterzenParamCode {
  // Mode 0 = MSLP (Pressure), Mode 1 = 850hPa Temp
  // Wetterzentrale: 1 = MSLP, 2 = 850 hPa Temp
  switch (mode) {
    case 0: return WETTERZENTRALE_PARAMS.MSLP
    case 1: return WETTERZENTRALE_PARAMS.TEMP_850
    default: return WETTERZENTRALE_PARAMS.MSLP
  }
}

// Build chart URL for any model based on scope
export function buildChartUrl(
  model: ModelId,
  runId: string,
  param: ChartParamId,
  forecastHour: number,
  scope: ChartScope,
  coords: { lat: number; lon: number },
  meteocielRegion?: MeteocielRegion,
): string {
  const config = MODEL_CONFIG[model]
  const paramConfig = CHART_PARAMS.find(p => p.id === param)

  // TT-only params force Europe scope
  const effectiveScope = paramConfig?.meteocielMode === null ? 'europe' : scope

  // Select provider based on scope
  if (effectiveScope === 'europe') {
    // Check if model is available on TT
    if (TT_MODEL_CODES[model]) {
      return buildTropicalTidbitsUrl(model, runId, param, forecastHour)
    }
    // Fallback for models not on TT (e.g., arpege)
    if (config.chartProvider === 'wetterzentrale') {
      const runHour = parseInt(runId.slice(-2), 10)
      const wetterzenRegion = 'EU' as WetterzenRegionCode
      const wetterzenParam = modeToWetterzenParam(paramConfig?.meteocielMode ?? 0)
      return buildWetterzenUrl(model as 'icon' | 'arpege', wetterzenRegion, runHour, forecastHour, wetterzenParam)
    }
    return buildMeteocielUrl(model, runId, paramConfig?.meteocielMode ?? 0, forecastHour, 'europe')
  }

  // Regional scope - use legacy providers
  if (config.chartProvider === 'wetterzentrale') {
    const runHour = parseInt(runId.slice(-2), 10)
    const wetterzenRegion = detectWetterzenRegion(coords.lat, coords.lon)
    const wetterzenParam = modeToWetterzenParam(paramConfig?.meteocielMode ?? 0)
    return buildWetterzenUrl(model as 'icon' | 'arpege', wetterzenRegion, runHour, forecastHour, wetterzenParam)
  }

  const region = meteocielRegion ?? detectBestRegion(coords.lat, coords.lon)
  return buildMeteocielUrl(model, runId, paramConfig?.meteocielMode ?? 0, forecastHour, region)
}

// Get chart provider attribution for a model
export function getChartAttribution(model: ModelId): { name: string; url: string } {
  const config = MODEL_CONFIG[model]
  if (config.chartProvider === 'wetterzentrale') {
    return { name: 'Wetterzentrale.de', url: 'https://www.wetterzentrale.de' }
  }
  return { name: 'Meteociel.fr', url: 'https://www.meteociel.fr' }
}
