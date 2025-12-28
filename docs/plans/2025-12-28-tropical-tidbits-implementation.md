# Tropical Tidbits Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate chart images to Tropical Tidbits as primary source, add 3 new models (EC-AIFS, GEFS, EPS), expand to 11 parameters.

**Architecture:** Hybrid provider system - TT for Europe-wide charts, Meteociel/Wetterzentrale fallback for country zooms. Store validates state transitions to prevent invalid combinations.

**Tech Stack:** React 19, Zustand, TanStack Router, TypeScript, Vitest

---

## Task 1: Add Tropical Tidbits URL Builder

**Files:**
- Create: `src/lib/utils/tropicaltidbits.ts`
- Test: `tests/unit/tropicaltidbits.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/tropicaltidbits.test.ts
import { describe, it, expect } from 'vitest'
import { buildTropicalTidbitsUrl, TT_MODEL_CODES } from '../../src/lib/utils/tropicaltidbits'

describe('buildTropicalTidbitsUrl', () => {
  it('builds correct URL for GFS model', () => {
    const url = buildTropicalTidbitsUrl('gfs', '2025122800', 'mslp', 0)
    expect(url).toBe('https://www.tropicaltidbits.com/analysis/models/gfs/2025122800/gfs_mslp_pcpn_frzn_eu_1.png')
  })

  it('builds correct URL for ECMWF model', () => {
    const url = buildTropicalTidbitsUrl('ecmwf-hres', '2025122812', 't2m', 6)
    expect(url).toBe('https://www.tropicaltidbits.com/analysis/models/ecmwf/2025122812/ecmwf_T2m_eu_2.png')
  })

  it('calculates frame number from forecast hour', () => {
    // Frame 1 = hour 0, Frame 2 = hour 6, Frame 3 = hour 12
    const url = buildTropicalTidbitsUrl('gfs', '2025122800', 'mslp', 24)
    expect(url).toContain('_eu_5.png') // 24/6 + 1 = 5
  })
})

describe('TT_MODEL_CODES', () => {
  it('maps ecmwf-hres to ecmwf', () => {
    expect(TT_MODEL_CODES['ecmwf-hres']).toBe('ecmwf')
  })

  it('maps gem to cmc', () => {
    expect(TT_MODEL_CODES['gem']).toBe('cmc')
  })

  it('returns null for arpege (not on TT)', () => {
    expect(TT_MODEL_CODES['arpege']).toBeNull()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/tropicaltidbits.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```typescript
// src/lib/utils/tropicaltidbits.ts
import type { ModelId } from '../../types/models'

export const TT_MODEL_CODES: Record<ModelId, string | null> = {
  'gfs': 'gfs',
  'ecmwf-hres': 'ecmwf',
  'icon': 'icon',
  'gem': 'cmc',
  'ukmo': 'ukmo',
  'arpege': null,
  'ec-aifs': 'ecmwf-aifs',
  'gefs': 'gefs',
  'eps': 'eps',
}

// Map our param IDs to TT param codes
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

export function buildTropicalTidbitsUrl(
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
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/tropicaltidbits.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/utils/tropicaltidbits.ts tests/unit/tropicaltidbits.test.ts
git commit -m "feat: add Tropical Tidbits URL builder"
```

---

## Task 2: Update Model Types with New Models

**Files:**
- Modify: `src/types/models.ts`
- Test: `tests/unit/models.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/models.test.ts
import { describe, it, expect } from 'vitest'
import { MODELS, MODEL_CONFIG, MODEL_GROUPS, getModelGroup } from '../../src/types/models'

describe('MODELS', () => {
  it('includes new ensemble models', () => {
    expect(MODELS).toContain('ec-aifs')
    expect(MODELS).toContain('gefs')
    expect(MODELS).toContain('eps')
  })
})

describe('MODEL_GROUPS', () => {
  it('has high-res group with deterministic models', () => {
    expect(MODEL_GROUPS['high-res']).toContain('ecmwf-hres')
    expect(MODEL_GROUPS['high-res']).toContain('ec-aifs')
  })

  it('has ensemble group with ensemble models', () => {
    expect(MODEL_GROUPS['ensemble']).toContain('gefs')
    expect(MODEL_GROUPS['ensemble']).toContain('eps')
  })
})

describe('getModelGroup', () => {
  it('returns high-res for deterministic models', () => {
    expect(getModelGroup('ecmwf-hres')).toBe('high-res')
    expect(getModelGroup('gfs')).toBe('high-res')
  })

  it('returns ensemble for ensemble models', () => {
    expect(getModelGroup('gefs')).toBe('ensemble')
    expect(getModelGroup('eps')).toBe('ensemble')
  })
})

describe('MODEL_CONFIG', () => {
  it('has config for new models', () => {
    expect(MODEL_CONFIG['ec-aifs']).toBeDefined()
    expect(MODEL_CONFIG['ec-aifs'].name).toBe('EC-AIFS')
    expect(MODEL_CONFIG['gefs'].hasRegional).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/models.test.ts`
Expected: FAIL with "ec-aifs" not in MODELS

**Step 3: Write minimal implementation**

```typescript
// src/types/models.ts
export const MODELS = [
  'ecmwf-hres', 'icon', 'arpege', 'gfs', 'gem', 'ukmo',
  'ec-aifs', 'gefs', 'eps'
] as const

export type ModelId = (typeof MODELS)[number]

export const MODEL_GROUPS = {
  'high-res': ['ecmwf-hres', 'icon', 'arpege', 'gfs', 'gem', 'ukmo', 'ec-aifs'],
  'ensemble': ['gefs', 'eps'],
} as const

export type ModelGroupId = keyof typeof MODEL_GROUPS

export function getModelGroup(model: ModelId): ModelGroupId {
  if ((MODEL_GROUPS['ensemble'] as readonly string[]).includes(model)) {
    return 'ensemble'
  }
  return 'high-res'
}

export type ChartProvider = 'meteociel' | 'wetterzentrale' | 'tropicaltidbits'
export type DataProvider = 'open-meteo'

export interface ModelConfig {
  name: string
  color: string
  description: string
  hasRegional: boolean
  chartProvider: ChartProvider
  dataProvider: DataProvider
  resolution: string
  updateTimes: string
  forecastLength: string
}

export const MODEL_CONFIG: Record<ModelId, ModelConfig> = {
  'ecmwf-hres': {
    name: 'ECMWF HD',
    color: '#dc2626',
    description: 'ECMWF High Resolution - European Centre for Medium-Range Weather Forecasts',
    hasRegional: true,
    chartProvider: 'tropicaltidbits',
    dataProvider: 'open-meteo',
    resolution: '0.25° (~25km)',
    updateTimes: '00z, 12z',
    forecastLength: '10 days',
  },
  icon: {
    name: 'ICON',
    color: '#8b5cf6',
    description: 'ICON - German Weather Service (DWD) Icosahedral Nonhydrostatic Model',
    hasRegional: true,
    chartProvider: 'tropicaltidbits',
    dataProvider: 'open-meteo',
    resolution: '0.125° (~13km)',
    updateTimes: '00z, 06z, 12z, 18z',
    forecastLength: '7 days',
  },
  arpege: {
    name: 'ARPEGE',
    color: '#06b6d4',
    description: 'ARPEGE - Météo-France Global Spectral Model',
    hasRegional: true,
    chartProvider: 'wetterzentrale',
    dataProvider: 'open-meteo',
    resolution: '0.1° (~10km) over Europe',
    updateTimes: '00z, 06z, 12z, 18z',
    forecastLength: '4 days',
  },
  gfs: {
    name: 'GFS',
    color: '#3b82f6',
    description: 'GFS - US Global Forecast System (NOAA/NCEP)',
    hasRegional: false,
    chartProvider: 'tropicaltidbits',
    dataProvider: 'open-meteo',
    resolution: '0.25° (~25km)',
    updateTimes: '00z, 06z, 12z, 18z',
    forecastLength: '16 days',
  },
  gem: {
    name: 'GEM',
    color: '#22c55e',
    description: 'GEM - Canadian Global Environmental Multiscale Model',
    hasRegional: false,
    chartProvider: 'tropicaltidbits',
    dataProvider: 'open-meteo',
    resolution: '0.25° (~25km)',
    updateTimes: '00z, 12z',
    forecastLength: '10 days',
  },
  ukmo: {
    name: 'UKMO',
    color: '#f59e0b',
    description: 'UKMO - UK Met Office Unified Model',
    hasRegional: false,
    chartProvider: 'tropicaltidbits',
    dataProvider: 'open-meteo',
    resolution: '0.1° (~10km)',
    updateTimes: '00z, 12z',
    forecastLength: '7 days',
  },
  'ec-aifs': {
    name: 'EC-AIFS',
    color: '#e11d48',
    description: 'ECMWF Artificial Intelligence Forecast System',
    hasRegional: false,
    chartProvider: 'tropicaltidbits',
    dataProvider: 'open-meteo',
    resolution: '0.25° (~25km)',
    updateTimes: '00z, 12z',
    forecastLength: '10 days',
  },
  gefs: {
    name: 'GEFS',
    color: '#7c3aed',
    description: 'Global Ensemble Forecast System (31 members)',
    hasRegional: false,
    chartProvider: 'tropicaltidbits',
    dataProvider: 'open-meteo',
    resolution: '0.5° (~50km)',
    updateTimes: '00z, 06z, 12z, 18z',
    forecastLength: '16 days',
  },
  eps: {
    name: 'EPS',
    color: '#db2777',
    description: 'ECMWF Ensemble Prediction System (51 members)',
    hasRegional: false,
    chartProvider: 'tropicaltidbits',
    dataProvider: 'open-meteo',
    resolution: '0.4° (~40km)',
    updateTimes: '00z, 12z',
    forecastLength: '15 days',
  },
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/models.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/models.ts tests/unit/models.test.ts
git commit -m "feat: add EC-AIFS, GEFS, EPS models with groups"
```

---

## Task 3: Update Chart Parameters

**Files:**
- Modify: `src/lib/utils/runs.ts`
- Test: `tests/unit/runs.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/runs.test.ts (add to existing)
import { describe, it, expect } from 'vitest'
import { CHART_PARAMS, getAvailableParams } from '../../src/lib/utils/runs'

describe('CHART_PARAMS', () => {
  it('has 11 parameters', () => {
    expect(CHART_PARAMS.length).toBe(11)
  })

  it('includes TT-only params with null meteocielMode', () => {
    const cape = CHART_PARAMS.find(p => p.id === 'cape')
    expect(cape?.meteocielMode).toBeNull()
    expect(cape?.ttCode).toBe('cape')
  })

  it('includes core params with meteocielMode', () => {
    const mslp = CHART_PARAMS.find(p => p.id === 'mslp')
    expect(mslp?.meteocielMode).toBe(0)
    expect(mslp?.ttCode).toBe('mslp_pcpn_frzn')
  })
})

describe('getAvailableParams', () => {
  it('returns all params for europe scope', () => {
    const params = getAvailableParams('europe')
    expect(params.length).toBe(11)
  })

  it('returns only meteociel-compatible params for regional scope', () => {
    const params = getAvailableParams('regional')
    expect(params.length).toBe(5) // mslp, t2m, t850, wind, jet
    expect(params.every(p => p.meteocielMode !== null)).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/runs.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Update `src/lib/utils/runs.ts`:

```typescript
// Add to src/lib/utils/runs.ts

export const CHART_SCOPES = ['europe', 'regional'] as const
export type ChartScope = (typeof CHART_SCOPES)[number]

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
    info: 'The forecasted air temperature at 2 meters above ground level - what you would feel outside.',
  },
  {
    id: 't850',
    ttCode: 'T850',
    meteocielMode: 1,
    label: 'Temp 850',
    shortLabel: 'T850',
    description: 'Temperature at 850hPa (~1500m)',
    info: 'Temperature at approximately 1,500 meters above sea level. Useful for tracking air masses and predicting precipitation type.',
  },
  {
    id: 'wind',
    ttCode: 'mslp_wind',
    meteocielMode: 14,
    label: 'Wind',
    shortLabel: 'Wind',
    description: 'MSLP & 10m Wind',
    info: 'Wind speed and direction at 10 meters above ground level with surface pressure.',
  },
  {
    id: 'jet',
    ttCode: 'uv250',
    meteocielMode: 5,
    label: 'Jet Stream',
    shortLabel: 'Jet',
    description: '250mb Wind (Jet Stream)',
    info: 'The jet stream at high altitude. It steers weather systems and separates air masses.',
  },
  // TT-only params (meteocielMode: null)
  {
    id: 'z500',
    ttCode: 'z500_vort',
    meteocielMode: null,
    label: '500mb Heights',
    shortLabel: 'Z500',
    description: '500mb Height & Vorticity',
    info: 'Mid-level atmospheric pattern showing troughs and ridges that drive weather systems.',
  },
  {
    id: 'cape',
    ttCode: 'cape',
    meteocielMode: null,
    label: 'CAPE',
    shortLabel: 'CAPE',
    description: 'Surface-Based CAPE (Thunderstorm potential)',
    info: 'Convective Available Potential Energy - indicates thunderstorm potential. Higher values mean stronger storms possible.',
  },
  {
    id: 'precip24',
    ttCode: 'apcpn24',
    meteocielMode: null,
    label: 'Precip 24h',
    shortLabel: 'Precip',
    description: '24-hour Accumulated Precipitation',
    info: 'Total precipitation accumulated over 24 hours in millimeters.',
  },
  {
    id: 'snow',
    ttCode: 'asnow',
    meteocielMode: null,
    label: 'Snowfall',
    shortLabel: 'Snow',
    description: 'Total Snowfall (10:1 SLR)',
    info: 'Accumulated snowfall using 10:1 snow-to-liquid ratio.',
  },
  {
    id: 'pwat',
    ttCode: 'mslp_pwat',
    meteocielMode: null,
    label: 'PWAT',
    shortLabel: 'PWAT',
    description: 'Precipitable Water',
    info: 'Total water vapor in the atmospheric column. High values indicate potential for heavy precipitation.',
  },
  {
    id: 'ir',
    ttCode: 'ir',
    meteocielMode: null,
    label: 'Satellite',
    shortLabel: 'IR',
    description: 'Simulated IR Satellite',
    info: 'Model-simulated infrared satellite imagery showing cloud tops.',
  },
] as const

export type ChartParamId = (typeof CHART_PARAMS)[number]['id']

export function getAvailableParams(scope: ChartScope) {
  if (scope === 'europe') {
    return CHART_PARAMS
  }
  return CHART_PARAMS.filter(p => p.meteocielMode !== null)
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/runs.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/utils/runs.ts tests/unit/runs.test.ts
git commit -m "feat: expand chart params to 11 with TT codes"
```

---

## Task 4: Update Unified buildChartUrl Function

**Files:**
- Modify: `src/lib/utils/runs.ts`
- Test: `tests/unit/runs.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/runs.test.ts (add to existing)
describe('buildChartUrl', () => {
  it('uses TT for europe scope', () => {
    const url = buildChartUrl('gfs', '2025122800', 'mslp', 6, 'europe', { lat: 38, lon: 23 })
    expect(url).toContain('tropicaltidbits.com')
  })

  it('uses Meteociel for regional scope with supported model', () => {
    const url = buildChartUrl('ecmwf-hres', '2025122800', 'mslp', 6, 'regional', { lat: 38, lon: 23 }, 'greece')
    expect(url).toContain('meteociel.fr')
    expect(url).toContain('ecmwfgr')
  })

  it('forces europe scope for TT-only params', () => {
    const url = buildChartUrl('gfs', '2025122800', 'cape', 6, 'regional', { lat: 38, lon: 23 })
    expect(url).toContain('tropicaltidbits.com')
  })

  it('falls back to Wetterzentrale for ARPEGE (not on TT)', () => {
    const url = buildChartUrl('arpege', '2025122800', 'mslp', 6, 'europe', { lat: 48, lon: 2 })
    expect(url).toContain('wetterzentrale.de')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/runs.test.ts`
Expected: FAIL

**Step 3: Update implementation**

```typescript
// src/lib/utils/runs.ts - update buildChartUrl function

import { buildTropicalTidbitsUrl, TT_MODEL_CODES } from './tropicaltidbits'

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

  // Select provider
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
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/runs.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/utils/runs.ts
git commit -m "feat: integrate TT into unified buildChartUrl"
```

---

## Task 5: Update Weather Store with Scope & Validation

**Files:**
- Modify: `src/stores/weather-store.ts`
- Test: `tests/unit/weather-store.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/weather-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useWeatherStore } from '../../src/stores/weather-store'

describe('weather store', () => {
  beforeEach(() => {
    useWeatherStore.setState({
      selectedModel: 'ecmwf-hres',
      selectedScope: 'europe',
      selectedParam: 'mslp',
    })
  })

  describe('setSelectedModel', () => {
    it('switches to europe scope when selecting ensemble model', () => {
      useWeatherStore.getState().setSelectedScope('regional')
      useWeatherStore.getState().setSelectedModel('gefs')

      expect(useWeatherStore.getState().selectedScope).toBe('europe')
    })

    it('keeps scope when selecting model with regional support', () => {
      useWeatherStore.getState().setSelectedScope('regional')
      useWeatherStore.getState().setSelectedModel('icon')

      expect(useWeatherStore.getState().selectedScope).toBe('regional')
    })
  })

  describe('setSelectedScope', () => {
    it('switches to fallback model when regional scope not supported', () => {
      useWeatherStore.getState().setSelectedModel('gefs')
      useWeatherStore.getState().setSelectedScope('regional')

      expect(useWeatherStore.getState().selectedModel).toBe('ecmwf-hres')
    })

    it('switches param to mslp when TT-only param in regional scope', () => {
      useWeatherStore.getState().setSelectedParam('cape')
      useWeatherStore.getState().setSelectedScope('regional')

      expect(useWeatherStore.getState().selectedParam).toBe('mslp')
    })
  })

  describe('setSelectedParam', () => {
    it('switches to europe scope when selecting TT-only param', () => {
      useWeatherStore.getState().setSelectedScope('regional')
      useWeatherStore.getState().setSelectedParam('cape')

      expect(useWeatherStore.getState().selectedScope).toBe('europe')
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/weather-store.test.ts`
Expected: FAIL

**Step 3: Update implementation**

```typescript
// src/stores/weather-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cookieStorage } from './storage'
import { trackEvent } from '../lib/posthog'
import { MODEL_CONFIG, MODELS, type ModelId } from '../types/models'
import { CHART_PARAMS, CHART_SCOPES, type ChartParamId, type ChartScope } from '../lib/utils/runs'
import type { MeteocielRegion } from '../lib/utils/runs'

export interface ModelRun {
  id: string
  date: string
  hour: number
}

interface WeatherState {
  // Persisted
  selectedModel: ModelId

  // Transient
  selectedRun: ModelRun | null
  selectedScope: ChartScope
  selectedMeteocielRegion: MeteocielRegion
  selectedParam: ChartParamId
  forecastHour: number

  // Actions
  setSelectedModel: (model: ModelId) => void
  setSelectedRun: (run: ModelRun | null) => void
  setSelectedScope: (scope: ChartScope) => void
  setSelectedMeteocielRegion: (region: MeteocielRegion) => void
  setSelectedParam: (param: ChartParamId) => void
  setForecastHour: (hour: number) => void
}

function validateParam(param: ChartParamId, scope: ChartScope): ChartParamId {
  const paramConfig = CHART_PARAMS.find(p => p.id === param)
  if (scope === 'regional' && paramConfig?.meteocielMode === null) {
    return 'mslp'
  }
  return param
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      // Persisted default
      selectedModel: 'ecmwf-hres',

      // Transient defaults
      selectedRun: null,
      selectedScope: 'europe',
      selectedMeteocielRegion: 'greece',
      selectedParam: 'mslp',
      forecastHour: 0,

      // Actions
      setSelectedModel: (model) => {
        const state = get()
        const config = MODEL_CONFIG[model]

        // Validate: if switching to model without regional support, switch to europe
        let newScope = state.selectedScope
        if (newScope === 'regional' && !config.hasRegional) {
          newScope = 'europe'
        }

        // Validate param for new scope
        const newParam = validateParam(state.selectedParam, newScope)

        const previousModel = state.selectedModel
        trackEvent('model_changed', {
          model,
          previousModel,
          scopeChanged: newScope !== state.selectedScope,
        })

        set({
          selectedModel: model,
          selectedScope: newScope,
          selectedParam: newParam,
        })
      },

      setSelectedRun: (selectedRun) => {
        if (selectedRun) {
          trackEvent('run_changed', { run: selectedRun.id })
        }
        set({ selectedRun })
      },

      setSelectedScope: (scope) => {
        const state = get()
        const config = MODEL_CONFIG[state.selectedModel]

        // Validate: if switching to regional but model doesn't support it
        if (scope === 'regional' && !config.hasRegional) {
          const fallbackModel = MODELS.find(m => MODEL_CONFIG[m].hasRegional) ?? 'ecmwf-hres'
          set({
            selectedScope: scope,
            selectedModel: fallbackModel,
            selectedParam: validateParam(state.selectedParam, scope),
          })
          return
        }

        set({
          selectedScope: scope,
          selectedParam: validateParam(state.selectedParam, scope),
        })
      },

      setSelectedMeteocielRegion: (region) => set({ selectedMeteocielRegion: region }),

      setSelectedParam: (param) => {
        const state = get()
        const paramConfig = CHART_PARAMS.find(p => p.id === param)

        // If TT-only param, force europe scope
        if (paramConfig?.meteocielMode === null && state.selectedScope === 'regional') {
          set({
            selectedParam: param,
            selectedScope: 'europe',
          })
          return
        }

        set({ selectedParam: param })
      },

      setForecastHour: (forecastHour) => set({ forecastHour }),
    }),
    {
      name: 'weather',
      storage: cookieStorage,
      partialize: (state) => ({
        selectedModel: state.selectedModel,
      }),
    }
  )
)

// Selector hooks
export const useSelectedModel = () => useWeatherStore((s) => s.selectedModel)
export const useSelectedRun = () => useWeatherStore((s) => s.selectedRun)
export const useSelectedScope = () => useWeatherStore((s) => s.selectedScope)
export const useSelectedMeteocielRegion = () => useWeatherStore((s) => s.selectedMeteocielRegion)
export const useSelectedParam = () => useWeatherStore((s) => s.selectedParam)
export const useForecastHour = () => useWeatherStore((s) => s.forecastHour)

// Derived selectors
export const useAvailableModels = () => useWeatherStore((s) => {
  if (s.selectedScope === 'europe') return [...MODELS]
  return MODELS.filter(m => MODEL_CONFIG[m].hasRegional)
})

export const useAvailableParams = () => useWeatherStore((s) => {
  if (s.selectedScope === 'europe') return [...CHART_PARAMS]
  return CHART_PARAMS.filter(p => p.meteocielMode !== null)
})

export const useCanSwitchToRegional = () => useWeatherStore((s) => {
  return MODEL_CONFIG[s.selectedModel].hasRegional
})
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/weather-store.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/stores/weather-store.ts tests/unit/weather-store.test.ts
git commit -m "feat: add scope validation to weather store"
```

---

## Task 6: Add i18n Translations

**Files:**
- Modify: `src/lib/i18n/en.ts`
- Modify: `src/lib/i18n/el.ts`

**Step 1: Add English translations**

```typescript
// src/lib/i18n/en.ts - add to existing translations
models: {
  groups: {
    'high-res': 'High Resolution',
    'ensemble': 'Ensemble',
  },
  names: {
    'ecmwf-hres': 'ECMWF HD',
    'icon': 'ICON',
    'arpege': 'ARPEGE',
    'gfs': 'GFS',
    'gem': 'GEM',
    'ukmo': 'UKMO',
    'ec-aifs': 'EC-AIFS',
    'gefs': 'GEFS',
    'eps': 'EPS',
  },
},
params: {
  mslp: 'Pressure & Precip',
  t2m: 'Temp 2m',
  t850: 'Temp 850',
  wind: 'Wind',
  jet: 'Jet Stream',
  z500: '500mb Heights',
  cape: 'CAPE',
  precip24: 'Precip 24h',
  snow: 'Snowfall',
  pwat: 'PWAT',
  ir: 'Satellite',
},
scope: {
  europe: 'Europe',
  regional: 'Regional',
},
```

**Step 2: Add Greek translations**

```typescript
// src/lib/i18n/el.ts - add to existing translations
models: {
  groups: {
    'high-res': 'Υψηλή Ανάλυση',
    'ensemble': 'Ensemble',
  },
  names: {
    'ecmwf-hres': 'ECMWF HD',
    'icon': 'ICON',
    'arpege': 'ARPEGE',
    'gfs': 'GFS',
    'gem': 'GEM',
    'ukmo': 'UKMO',
    'ec-aifs': 'EC-AIFS',
    'gefs': 'GEFS',
    'eps': 'EPS',
  },
},
params: {
  mslp: 'Πίεση & Υετός',
  t2m: 'Θερμ. 2m',
  t850: 'Θερμ. 850',
  wind: 'Άνεμος',
  jet: 'Jet Stream',
  z500: 'Ύψη 500mb',
  cape: 'CAPE',
  precip24: 'Υετός 24ω',
  snow: 'Χιονόπτωση',
  pwat: 'PWAT',
  ir: 'Δορυφόρος',
},
scope: {
  europe: 'Ευρώπη',
  regional: 'Περιφέρεια',
},
```

**Step 3: Commit**

```bash
git add src/lib/i18n/en.ts src/lib/i18n/el.ts
git commit -m "feat: add i18n for new models, params, scope"
```

---

## Task 7: Update Model Selector UI

**Files:**
- Modify: `src/components/features/model-selector.tsx` (or create if needed)

**Step 1: Locate and read current implementation**

Run: `find src -name "*model*" -type f`

**Step 2: Update component**

```tsx
// src/components/features/model-selector.tsx
import { MODEL_GROUPS, MODEL_CONFIG, type ModelId, type ModelGroupId } from '../../types/models'
import { useWeatherStore, useAvailableModels } from '../../stores/weather-store'
import { useTranslation } from '../../lib/i18n'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export function ModelSelector() {
  const { t } = useTranslation()
  const selectedModel = useWeatherStore((s) => s.selectedModel)
  const setSelectedModel = useWeatherStore((s) => s.setSelectedModel)
  const availableModels = useAvailableModels()

  return (
    <div className="space-y-3">
      {(Object.entries(MODEL_GROUPS) as [ModelGroupId, readonly ModelId[]][]).map(([groupId, models]) => (
        <div key={groupId}>
          <span className="text-xs text-muted-foreground mb-1.5 block">
            {t(`models.groups.${groupId}`)}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {models.map((modelId) => {
              const config = MODEL_CONFIG[modelId]
              const isAvailable = availableModels.includes(modelId)
              const isSelected = selectedModel === modelId

              return (
                <Button
                  key={modelId}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => setSelectedModel(modelId)}
                  className={cn(
                    'h-7 px-2 text-xs',
                    isSelected && 'ring-2 ring-offset-1',
                  )}
                  style={{
                    ...(isSelected && {
                      backgroundColor: config.color,
                      borderColor: config.color,
                    }),
                  }}
                >
                  {config.name}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/features/model-selector.tsx
git commit -m "feat: two-row grouped model selector"
```

---

## Task 8: Update Run Image Viewer

**Files:**
- Modify: `src/components/features/run-image-viewer/` (main component)

**Step 1: Read current implementation**

Run: `ls -la src/components/features/run-image-viewer/`

**Step 2: Update to use new buildChartUrl with scope**

Key changes:
- Import `useSelectedScope` from store
- Pass scope to `buildChartUrl`
- Add scope toggle UI
- Update attribution based on provider

**Step 3: Test manually**

Run: `pnpm dev`
- Verify TT images load for Europe scope
- Verify Meteociel images load for Regional scope
- Verify TT-only params auto-switch scope

**Step 4: Commit**

```bash
git add src/components/features/run-image-viewer/
git commit -m "feat: integrate TT provider in run image viewer"
```

---

## Task 9: Final Integration & Verification

**Step 1: Run full test suite**

Run: `pnpm test:run`
Expected: All tests pass

**Step 2: Run build**

Run: `pnpm build`
Expected: Build succeeds without errors

**Step 3: Manual QA checklist**

- [ ] Europe scope loads TT images for GFS, ECMWF, ICON, GEM
- [ ] Regional scope loads Meteociel images for ECMWF
- [ ] ARPEGE falls back to Wetterzentrale
- [ ] Ensemble models (GEFS, EPS) force Europe scope
- [ ] TT-only params (CAPE, snow) force Europe scope
- [ ] Model selector shows two rows
- [ ] Attribution shows correct provider

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Tropical Tidbits migration"
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | TT URL builder + tests | 10 min |
| 2 | Model types + new models | 10 min |
| 3 | Chart params expansion | 10 min |
| 4 | Unified buildChartUrl | 10 min |
| 5 | Store validation logic | 15 min |
| 6 | i18n translations | 5 min |
| 7 | Model selector UI | 10 min |
| 8 | Run image viewer update | 15 min |
| 9 | Integration & QA | 10 min |

**Total: ~95 minutes**
