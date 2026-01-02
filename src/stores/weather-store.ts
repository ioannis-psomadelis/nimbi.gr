import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { cookieStorage } from './storage'
import { trackEvent } from '../lib/posthog'
import { MODEL_CONFIG, MODELS, type ModelId } from '../types/models'
import {
  CHART_PARAMS,
  type ChartParamId,
  type ChartScope,
  type MeteocielRegion,
} from '../lib/utils/runs'

export type Region = 'europe' | 'greece' | 'atlantic'

export interface ModelRun {
  id: string
  date: string
  hour: number
}

// Helper function to validate param for a given scope
function validateParam(param: ChartParamId, scope: ChartScope): ChartParamId {
  const paramConfig = CHART_PARAMS.find((p) => p.id === param)
  if (scope === 'regional' && paramConfig?.meteocielMode === null) {
    return 'mslp'
  }
  return param
}

// Get the first model with regional support
function getFirstRegionalModel(): ModelId {
  const model = MODELS.find((m) => MODEL_CONFIG[m].hasRegional)
  return model ?? 'ecmwf-hres'
}

interface WeatherState {
  // Persisted
  selectedModel: ModelId

  // Transient (not persisted - resets on page load)
  selectedRun: ModelRun | null
  selectedRegion: Region
  selectedScope: ChartScope
  selectedMeteocielRegion: MeteocielRegion
  selectedParam: ChartParamId
  forecastHour: number

  // Actions
  setSelectedModel: (model: ModelId) => void
  setSelectedRun: (run: ModelRun | null) => void
  setSelectedRegion: (region: Region) => void
  setSelectedScope: (scope: ChartScope) => void
  setSelectedMeteocielRegion: (region: MeteocielRegion) => void
  setSelectedParam: (param: ChartParamId) => void
  setForecastHour: (hour: number) => void
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      // Persisted default
      selectedModel: 'ecmwf-hres',

      // Transient defaults
      selectedRun: null,
      selectedRegion: 'europe',
      selectedScope: 'europe',
      selectedMeteocielRegion: 'greece',
      selectedParam: 'mslp',
      forecastHour: 0,

      // Actions
      setSelectedModel: (selectedModel) => {
        const previousModel = get().selectedModel
        const currentScope = get().selectedScope
        const currentParam = get().selectedParam
        trackEvent('model_changed', { model: selectedModel, previousModel })

        // If switching to a model without regional support and currently on regional scope,
        // switch to europe scope
        const modelConfig = MODEL_CONFIG[selectedModel]
        if (currentScope === 'regional' && !modelConfig.hasRegional) {
          // Also validate param for the new scope
          const validatedParam = validateParam(currentParam, 'europe')
          set({ selectedModel, selectedScope: 'europe', selectedParam: validatedParam })
        } else {
          set({ selectedModel })
        }
      },
      setSelectedRun: (selectedRun) => {
        if (selectedRun) {
          trackEvent('run_changed', { run: selectedRun.id })
        }
        set({ selectedRun })
      },
      setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
      setSelectedScope: (selectedScope) => {
        const currentModel = get().selectedModel
        const currentParam = get().selectedParam
        const modelConfig = MODEL_CONFIG[currentModel]

        // If switching to regional but model doesn't support it, switch to first model with regional support
        if (selectedScope === 'regional' && !modelConfig.hasRegional) {
          const newModel = getFirstRegionalModel()
          // Also validate param for regional scope
          const validatedParam = validateParam(currentParam, 'regional')
          set({ selectedScope, selectedModel: newModel, selectedParam: validatedParam })
        } else {
          // Validate param for new scope
          const validatedParam = validateParam(currentParam, selectedScope)
          set({ selectedScope, selectedParam: validatedParam })
        }
      },
      setSelectedMeteocielRegion: (selectedMeteocielRegion) =>
        set({ selectedMeteocielRegion }),
      setSelectedParam: (selectedParam) => {
        const currentScope = get().selectedScope

        // If selecting TT-only param while on regional scope, switch to europe scope
        const paramConfig = CHART_PARAMS.find((p) => p.id === selectedParam)
        if (currentScope === 'regional' && paramConfig?.meteocielMode === null) {
          set({ selectedParam, selectedScope: 'europe' })
        } else {
          set({ selectedParam })
        }
      },
      setForecastHour: (forecastHour) => set({ forecastHour }),
    }),
    {
      name: 'weather',
      storage: cookieStorage,
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        // Only persist model selection, rest is transient
      }),
    }
  )
)

// Selector hooks
export const useSelectedModel = () => useWeatherStore((s) => s.selectedModel)
export const useSelectedRun = () => useWeatherStore((s) => s.selectedRun)
export const useSelectedRegion = () => useWeatherStore((s) => s.selectedRegion)
export const useSelectedScope = () => useWeatherStore((s) => s.selectedScope)
export const useSelectedMeteocielRegion = () =>
  useWeatherStore((s) => s.selectedMeteocielRegion)
export const useSelectedParam = () => useWeatherStore((s) => s.selectedParam)
export const useForecastHour = () => useWeatherStore((s) => s.forecastHour)

// Pre-computed stable arrays for derived selectors
const ALL_MODELS = [...MODELS]
const REGIONAL_MODELS = MODELS.filter((m) => MODEL_CONFIG[m].hasRegional)
const ALL_PARAMS = [...CHART_PARAMS]
// Regional params: include params with Meteociel OR Wetterzentrale support
const REGIONAL_PARAMS = CHART_PARAMS.filter((p) => p.meteocielMode !== null || p.wetterzenParam !== null)

// Derived selectors - return stable references to avoid infinite loops
export const useAvailableModels = () =>
  useWeatherStore(
    useShallow((s) => (s.selectedScope === 'europe' ? ALL_MODELS : REGIONAL_MODELS))
  )

export const useAvailableParams = () =>
  useWeatherStore(
    useShallow((s) => (s.selectedScope === 'europe' ? ALL_PARAMS : REGIONAL_PARAMS))
  )

export const useCanSwitchToRegional = () =>
  useWeatherStore((s) => {
    return MODEL_CONFIG[s.selectedModel].hasRegional
  })
