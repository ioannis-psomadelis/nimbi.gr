import { type ModelId } from '../../types/models'

// Regional chart support for Meteociel
export type ChartRegion = 'europe' | 'greece' | 'france' | 'italy' | 'spain' | 'uk' | 'germany'

export const REGION_CONFIG: Record<ChartRegion, { name: string; nameKey: string; ecmwfCode: string; hresSuffix: string }> = {
  europe: { name: 'Europe', nameKey: 'europe', ecmwfCode: 'ECM', hresSuffix: '' },
  greece: { name: 'Greece', nameKey: 'greece', ecmwfCode: 'ECG', hresSuffix: 'gr' },
  france: { name: 'France', nameKey: 'france', ecmwfCode: 'ECF', hresSuffix: 'fr' },
  italy: { name: 'Italy', nameKey: 'italy', ecmwfCode: 'ECI', hresSuffix: 'it' },
  spain: { name: 'Spain', nameKey: 'spain', ecmwfCode: 'ECS', hresSuffix: 'sp' },
  uk: { name: 'United Kingdom', nameKey: 'uk', ecmwfCode: 'ECU', hresSuffix: 'uk' },
  germany: { name: 'Germany', nameKey: 'germany', ecmwfCode: 'ECA', hresSuffix: 'de' },
}

// Models that support regional charts
export const REGIONAL_MODELS: ModelId[] = ['ecmwf-hres']

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

function formatRunInfo(date: Date, hour: number): RunInfo {
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

// Meteociel chart parameters with detailed info for tooltips/modals
// GFS URL pattern: https://modeles16.meteociel.fr/modeles/gfs/runs/{runId}/gfs-{mode}-{hour}.png
export const CHART_PARAMS = [
  {
    id: '0',
    mode: 0,
    label: 'Pressure',
    shortLabel: 'MSLP',
    description: 'Mean Sea Level Pressure & 500hPa Geopotential',
    info: 'Shows surface pressure patterns (highs and lows) combined with the 500hPa geopotential height. This helps identify weather systems, fronts, and the overall atmospheric flow pattern. High pressure areas typically bring clear weather, while low pressure areas are associated with storms and precipitation.',
  },
  {
    id: '9',
    mode: 9,
    label: 'Temp 2m',
    shortLabel: 'T2m',
    description: 'Temperature at 2 meters',
    info: 'The forecasted air temperature at 2 meters above ground level - what you would feel outside. This is the standard height for measuring air temperature and is most relevant for daily weather conditions.',
  },
  {
    id: '1',
    mode: 1,
    label: 'Temp 850',
    shortLabel: 'T850',
    description: 'Temperature at 850hPa (~1500m altitude)',
    info: 'Temperature at the 850hPa pressure level, approximately 1,500 meters above sea level. This eliminates terrain effects and is useful for tracking air masses, identifying warm/cold fronts, and predicting precipitation type (rain vs snow).',
  },
  {
    id: '2',
    mode: 2,
    label: 'Precip',
    shortLabel: 'Rain',
    description: 'Accumulated Precipitation',
    info: 'Total precipitation accumulation including rain, snow, sleet, and other forms. Values are typically shown as millimeters of liquid water equivalent. Higher values indicate more intense precipitation events.',
  },
  {
    id: '14',
    mode: 14,
    label: 'Wind',
    shortLabel: 'Wind',
    description: 'Wind Speed at 10 meters',
    info: 'Wind speed and direction at 10 meters above ground level - the standard measurement height for surface winds. Arrows or barbs show direction, while colors indicate speed intensity. Important for understanding storm impacts and general weather conditions.',
  },
  {
    id: '5',
    mode: 5,
    label: 'Jet Stream',
    shortLabel: 'Jet',
    description: 'Upper-level Jet Stream',
    info: 'The jet stream is a fast-flowing river of air at high altitude (around 30,000-40,000 feet). It steers weather systems and separates air masses. Strong jet streams are associated with active weather patterns, while weak or split jets can lead to blocking patterns.',
  },
] as const

export type ChartParamId = typeof CHART_PARAMS[number]['id']

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

// Models that only run at 00z and 12z (not 06z and 18z like GFS/GEM)
const TWICE_DAILY_MODELS: ModelId[] = ['ecmwf-hres', 'ukmo']

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

// Build Meteociel chart URL for any supported model
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
