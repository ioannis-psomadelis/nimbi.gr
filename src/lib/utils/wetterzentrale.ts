// Wetterzentrale chart integration for multiple models
// Supports: GFS, GEM, UKMO, ICON, ARPEGE with regional charts

export type WetterzenModel = 'gfs' | 'gem' | 'ukmo' | 'icon' | 'arpege'

// Region codes for Wetterzentrale
export type WetterzenRegionCode = 'EU' | 'ME' | 'IT' | 'FR' | 'SP' | 'UK' | 'DK' | 'SC' | 'NL' | 'TR'

export interface WetterzenRegion {
  code: WetterzenRegionCode
  name: string
  nameKey: string
}

// Wetterzentrale regional coverage
export const WETTERZENTRALE_REGIONS: Record<WetterzenRegionCode, WetterzenRegion> = {
  EU: { code: 'EU', name: 'Europe', nameKey: 'europe' },
  ME: { code: 'ME', name: 'Central Europe', nameKey: 'central_europe' },
  IT: { code: 'IT', name: 'Italy/Balkans', nameKey: 'balkans' },
  FR: { code: 'FR', name: 'France', nameKey: 'france' },
  SP: { code: 'SP', name: 'Spain/Portugal', nameKey: 'spain' },
  UK: { code: 'UK', name: 'United Kingdom', nameKey: 'uk' },
  DK: { code: 'DK', name: 'Denmark', nameKey: 'denmark' },
  SC: { code: 'SC', name: 'Scandinavia', nameKey: 'scandinavia' },
  NL: { code: 'NL', name: 'Netherlands/Belgium', nameKey: 'netherlands' },
  TR: { code: 'TR', name: 'Turkey/Middle East', nameKey: 'turkey' },
}

// Wetterzentrale chart parameters
// Based on: https://www.wetterzentrale.de/de/topkarten.php
export const WETTERZENTRALE_PARAMS = {
  Z500: 1,       // 500 hPa Geopotential Height (synoptic overview)
  TEMP_850: 2,   // 850 hPa Temperature
  WIND_850: 3,   // 850 hPa Streamlines/Wind
  PRECIP: 4,     // Precipitation
  TEMP_2M: 5,    // 2m Temperature
  CAPE: 11,      // CAPE/Lifted Index
  SNOW: 25,      // Total Snow Depth
} as const

export type WetterzenParamCode = typeof WETTERZENTRALE_PARAMS[keyof typeof WETTERZENTRALE_PARAMS]

// Model URL prefixes for Wetterzentrale
// URL pattern: https://www.wetterzentrale.de/maps/{PREFIX}OP{REGION}{RUN}_{HOUR}_{PARAM}.png
const MODEL_PREFIX: Record<WetterzenModel, string> = {
  gfs: 'GFS',
  gem: 'GEM',
  ukmo: 'UKM',
  icon: 'ICO',
  arpege: 'ARP',
}

/**
 * Detect the best Wetterzentrale regional code based on coordinates
 */
export function detectWetterzenRegion(lat: number, lon: number): WetterzenRegionCode {
  // Greece/Balkans (IT region in Wetterzentrale)
  if (lat >= 34 && lat <= 47 && lon >= 13 && lon <= 30) return 'IT'

  // Turkey/Middle East
  if (lat >= 34 && lat <= 42 && lon >= 26 && lon <= 45) return 'TR'

  // Italy (IT region covers both)
  if (lat >= 36 && lat <= 47 && lon >= 6 && lon <= 19) return 'IT'

  // France
  if (lat >= 41 && lat <= 51 && lon >= -5 && lon <= 10) return 'FR'

  // Spain/Portugal
  if (lat >= 35 && lat <= 44 && lon >= -10 && lon <= 5) return 'SP'

  // UK/Ireland
  if (lat >= 49 && lat <= 61 && lon >= -11 && lon <= 2) return 'UK'

  // Netherlands/Belgium
  if (lat >= 50 && lat <= 54 && lon >= 2 && lon <= 8) return 'NL'

  // Denmark
  if (lat >= 54 && lat <= 58 && lon >= 7 && lon <= 16) return 'DK'

  // Scandinavia (Norway, Sweden, Finland)
  if (lat >= 55 && lat <= 72 && lon >= 4 && lon <= 32) return 'SC'

  // Central Europe (Germany, Austria, Switzerland, Poland, Czechia)
  if (lat >= 45 && lat <= 56 && lon >= 5 && lon <= 20) return 'ME'

  // Default to Europe-wide
  return 'EU'
}

/**
 * Build Wetterzentrale chart URL for ICON or ARPEGE
 *
 * URL Pattern: https://www.wetterzentrale.de/maps/{MODEL}OP{REGION}{RUN}_{HOUR}_{PARAM}.png
 * Example: ICOOPIT06_12_2.png = ICON, Italy/Balkans, 06z, hour 12, 850hPa temp
 */
export function buildWetterzenUrl(
  model: WetterzenModel,
  region: WetterzenRegionCode,
  runHour: number,
  forecastHour: number,
  param: WetterzenParamCode
): string {
  const prefix = MODEL_PREFIX[model]
  const runStr = String(runHour).padStart(2, '0')

  return `https://www.wetterzentrale.de/maps/${prefix}OP${region}${runStr}_${forecastHour}_${param}.png`
}

/**
 * Get all available regional codes for display
 */
export function getWetterzenRegionalCodes(): WetterzenRegionCode[] {
  return Object.keys(WETTERZENTRALE_REGIONS).filter(code => code !== 'EU') as WetterzenRegionCode[]
}
