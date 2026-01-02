/**
 * Centralized chart parameter availability logic
 *
 * This module provides a single source of truth for which params are available
 * for each model/scope/provider combination.
 */

import { CHART_PARAMS, type ChartParamId, type ChartScope } from './runs'
import { type ModelId, MODEL_CONFIG } from '../../types/models'

/** Type for a single chart param */
export type ChartParam = (typeof CHART_PARAMS)[number]

export interface ParamAvailability {
  /** All params that should be shown in the UI */
  available: readonly ChartParam[]
  /** Param IDs that should be disabled (grayed out) */
  disabled: ChartParamId[]
  /** Default param to use if selected param is not available */
  defaultParam: ChartParamId
  /** Get the effective param (falls back to default if not available) */
  getEffectiveParam: (selectedParam: ChartParamId) => ChartParamId
}

/**
 * Get param availability for a model/scope combination
 *
 * This is the single source of truth for param availability.
 */
export function getParamAvailability(
  model: ModelId,
  scope: ChartScope
): ParamAvailability {
  const config = MODEL_CONFIG[model]
  const provider = config.chartProvider

  // Determine which params are disabled based on model and scope
  let disabled: ChartParamId[] = []

  if (model === 'ukmo') {
    // UKMO only has mode 21 (MSLP) on Meteociel
    disabled = ['t2m', 't850', 'wind', 'jet', 'z500', 'precip', 'cape', 'snow', 'pwat', 'ir']
  } else if (provider === 'wetterzentrale') {
    // Wetterzentrale supports: mslp, t850, t2m, wind, jet, precip, cape, snow
    // But NOT: z500, pwat, ir
    disabled = ['z500', 'pwat', 'ir']
  } else if (scope === 'regional') {
    // Meteociel regional: only params with meteocielMode
    // precip, cape, snow have no meteocielMode
    disabled = ['precip', 'cape', 'snow', 'z500', 'pwat', 'ir']
  }
  // Europe scope with TT: all params available

  // Determine available params based on scope and provider
  let available: readonly ChartParam[] = CHART_PARAMS
  if (scope === 'regional') {
    if (provider === 'wetterzentrale') {
      // Include params with meteocielMode OR wetterzenParam
      available = CHART_PARAMS.filter(p => p.meteocielMode !== null || p.wetterzenParam !== null)
    } else {
      // Meteociel: only params with meteocielMode
      available = CHART_PARAMS.filter(p => p.meteocielMode !== null)
    }
  }

  const defaultParam: ChartParamId = 'mslp'

  // Function to get effective param (with fallback)
  const getEffectiveParam = (selectedParam: ChartParamId): ChartParamId => {
    if (disabled.includes(selectedParam)) {
      return defaultParam
    }
    return selectedParam
  }

  return {
    available,
    disabled,
    defaultParam,
    getEffectiveParam,
  }
}

/**
 * Get params that are available for Wetterzentrale
 */
export const WETTERZENTRALE_PARAMS_LIST: ChartParamId[] = [
  'mslp', 't850', 't2m', 'wind', 'jet', 'precip', 'cape', 'snow'
]

/**
 * Get params that are available for Meteociel regional
 */
export const METEOCIEL_REGIONAL_PARAMS_LIST: ChartParamId[] = [
  'mslp', 't850', 't2m', 'wind', 'jet'
]
