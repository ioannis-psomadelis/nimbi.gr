// Re-export all stores for convenient imports
export {
  usePreferencesStore,
  useTheme,
  useLanguage,
  useProMode,
  type Theme,
  type ResolvedTheme,
  type Language,
} from './preferences-store'

export {
  useLocationsStore,
  useSavedLocations,
  useRecentSearches,
  type SavedLocation,
  type RecentSearch,
} from './locations-store'

export {
  useWeatherStore,
  useSelectedModel,
  useSelectedRun,
  useSelectedRegion,
  useSelectedParam,
  useForecastHour,
  type Region,
  type ChartParam,
  type ModelRun,
} from './weather-store'

export {
  useUIStore,
  useSidebarOpen,
  useSidebarMobileOpen,
  useWeeklyOutlookOpen,
} from './ui-store'
