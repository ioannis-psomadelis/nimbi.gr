import type { ModelId } from '../../types/models'

/**
 * Tropical Tidbits model code mappings
 * Maps our internal model IDs to Tropical Tidbits URL codes
 * null = model not available on Tropical Tidbits
 */
export const TT_MODEL_CODES: Record<ModelId, string | null> = {
  'gfs': 'gfs',
  'ecmwf-hres': 'ecmwf',
  'icon': 'icon',
  'gem': 'cmc',
  'ukmo': 'ukmo',
  'arpege': null, // ARPEGE is not available on Tropical Tidbits
  'ec-aifs': 'ecmwf-aifs',
  'gefs': 'gefs',
  'eps': 'eps',
}

/**
 * Map our param IDs to Tropical Tidbits param codes
 * TT uses specific naming conventions for their chart parameters
 */
const TT_PARAM_CODES: Record<string, string> = {
  'mslp': 'mslp_pcpn_frzn',
  't2m': 'T2m',
  't850': 'T850',
  'wind': 'mslp_wind',
  'jet': 'uv250',
  'z500': 'z500_vort',
  'cape': 'cape',
  'precip24': 'apcpn24',
  'snow': 'asnow',
  'pwat': 'mslp_pwat',
  'ir': 'ir',
}

/**
 * Build the direct Tropical Tidbits URL (for reference/debugging)
 */
export function buildDirectTropicalTidbitsUrl(
  model: ModelId,
  runId: string,
  param: string,
  forecastHour: number,
): string {
  const modelCode = TT_MODEL_CODES[model]
  if (!modelCode) {
    throw new Error(`Model ${model} not available on Tropical Tidbits`)
  }

  const ttParam = TT_PARAM_CODES[param] ?? 'mslp_pcpn_frzn'
  const frame = Math.floor(forecastHour / 6) + 1

  return `https://www.tropicaltidbits.com/analysis/models/${modelCode}/${runId}/${modelCode}_${ttParam}_eu_${frame}.png`
}

/**
 * Build a Tropical Tidbits chart URL via our proxy
 *
 * TT has hotlink protection, so we proxy images through our server.
 * The proxy adds the required Referer header.
 *
 * @param model - The model ID from our system
 * @param runId - The run ID in format YYYYMMDDHH (e.g., "2025122800")
 * @param param - The parameter code (e.g., "mslp", "t2m", "t850")
 * @param forecastHour - The forecast hour (0, 6, 12, 18, 24, ...)
 * @returns The proxied URL to fetch the Tropical Tidbits chart image
 * @throws Error if the model is not available on Tropical Tidbits
 */
export function buildTropicalTidbitsUrl(
  model: ModelId,
  runId: string,
  param: string,
  forecastHour: number,
): string {
  const directUrl = buildDirectTropicalTidbitsUrl(model, runId, param, forecastHour)

  // Return proxied URL
  return `/api/chart-image?url=${encodeURIComponent(directUrl)}`
}
