import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cookieStorage } from './storage'
import { trackEvent } from '../lib/posthog'
import type { ModelId } from '../types/models'

export type Region = 'europe' | 'greece' | 'atlantic'
export type ChartParam = 'z500_t850' | 'precip' | 'wind' | 'cape' | 't2m'

export interface ModelRun {
  id: string
  date: string
  hour: number
}

interface WeatherState {
  // Persisted
  selectedModel: ModelId

  // Transient (not persisted - resets on page load)
  selectedRun: ModelRun | null
  selectedRegion: Region
  selectedParam: ChartParam
  forecastHour: number

  // Actions
  setSelectedModel: (model: ModelId) => void
  setSelectedRun: (run: ModelRun | null) => void
  setSelectedRegion: (region: Region) => void
  setSelectedParam: (param: ChartParam) => void
  setForecastHour: (hour: number) => void
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set) => ({
      // Persisted default
      selectedModel: 'ecmwf-hres',

      // Transient defaults
      selectedRun: null,
      selectedRegion: 'europe',
      selectedParam: 'z500_t850',
      forecastHour: 0,

      // Actions
      setSelectedModel: (selectedModel) => {
        const previousModel = useWeatherStore.getState().selectedModel
        trackEvent('model_changed', { model: selectedModel, previousModel })
        set({ selectedModel })
      },
      setSelectedRun: (selectedRun) => {
        if (selectedRun) {
          trackEvent('run_changed', { run: selectedRun.id })
        }
        set({ selectedRun })
      },
      setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
      setSelectedParam: (selectedParam) => set({ selectedParam }),
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
export const useSelectedParam = () => useWeatherStore((s) => s.selectedParam)
export const useForecastHour = () => useWeatherStore((s) => s.forecastHour)
