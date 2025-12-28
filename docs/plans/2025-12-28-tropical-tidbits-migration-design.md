# Tropical Tidbits Migration Design

## Overview

Migrate weather chart images from Meteociel/Wetterzentrale to Tropical Tidbits as the primary source for Europe-wide charts, while keeping existing providers as fallback for country-level regional zooms.

## Goals

1. **Better image quality** - TT charts are higher resolution
2. **More reliable** - TT has better uptime than Meteociel
3. **More models** - Add EC-AIFS, GEFS, EPS
4. **More parameters** - Expand from 6 to 11 chart types

## Architecture

### Provider Hierarchy

```
Primary: Tropical Tidbits (Europe-wide)
├── Models: GFS, ECMWF, ICON, GEM, UKMO, EC-AIFS, GEFS, EPS
├── Scope: 'europe'
└── 11 parameters

Fallback: Meteociel/Wetterzentrale (country zooms)
├── Models: ECMWF, ICON, ARPEGE only
├── Scope: 'regional'
├── Regions: greece, france, italy, spain, uk, germany
└── 6 parameters (subset)
```

### URL Patterns

**Tropical Tidbits:**
```
https://www.tropicaltidbits.com/analysis/models/{model}/{runId}/{model}_{param}_{region}_{frame}.png
```

Example: `gfs/2025122800/gfs_mslp_pcpn_frzn_eu_1.png`

**Meteociel (unchanged):**
```
https://modeles16.meteociel.fr/modeles/gfs/runs/{runId}/gfs-{mode}-{hour}.png
```

## Type Definitions

### Scopes

```typescript
export const CHART_SCOPES = ['europe', 'regional'] as const
export type ChartScope = (typeof CHART_SCOPES)[number]
```

### Models

```typescript
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
```

### New Model Configs

```typescript
'ec-aifs': {
  name: 'EC-AIFS',
  color: '#e11d48',
  description: 'ECMWF Artificial Intelligence Forecast System',
  hasRegional: false,
  europeProvider: 'tropicaltidbits',
  regionalProvider: null,
  resolution: '0.25° (~25km)',
  updateTimes: '00z, 12z',
  forecastLength: '10 days',
},

'gefs': {
  name: 'GEFS',
  color: '#7c3aed',
  description: 'Global Ensemble Forecast System (31 members)',
  hasRegional: false,
  europeProvider: 'tropicaltidbits',
  regionalProvider: null,
  resolution: '0.5° (~50km)',
  updateTimes: '00z, 06z, 12z, 18z',
  forecastLength: '16 days',
},

'eps': {
  name: 'EPS',
  color: '#db2777',
  description: 'ECMWF Ensemble Prediction System (51 members)',
  hasRegional: false,
  europeProvider: 'tropicaltidbits',
  regionalProvider: null,
  resolution: '0.4° (~40km)',
  updateTimes: '00z, 12z',
  forecastLength: '15 days',
},
```

### Parameters

```typescript
export const CHART_PARAMS = [
  // Core (mapped to both TT and Meteociel)
  { id: 'mslp', ttCode: 'mslp_pcpn_frzn', meteocielMode: 0, label: 'Pressure & Precip', shortLabel: 'MSLP' },
  { id: 't2m', ttCode: 'T2m', meteocielMode: 9, label: 'Temp 2m', shortLabel: 'T2m' },
  { id: 't850', ttCode: 'T850', meteocielMode: 1, label: 'Temp 850', shortLabel: 'T850' },
  { id: 'wind', ttCode: 'mslp_wind', meteocielMode: 14, label: 'Wind', shortLabel: 'Wind' },
  { id: 'jet', ttCode: 'uv250', meteocielMode: 5, label: 'Jet Stream', shortLabel: 'Jet' },

  // TT-only (meteocielMode: null)
  { id: 'z500', ttCode: 'z500_vort', meteocielMode: null, label: '500mb Heights', shortLabel: 'Z500' },
  { id: 'cape', ttCode: 'cape', meteocielMode: null, label: 'CAPE', shortLabel: 'CAPE' },
  { id: 'precip24', ttCode: 'apcpn24', meteocielMode: null, label: 'Precip 24h', shortLabel: 'Precip' },
  { id: 'snow', ttCode: 'asnow', meteocielMode: null, label: 'Snowfall', shortLabel: 'Snow' },
  { id: 'pwat', ttCode: 'mslp_pwat', meteocielMode: null, label: 'PWAT', shortLabel: 'PWAT' },
  { id: 'ir', ttCode: 'ir', meteocielMode: null, label: 'Satellite', shortLabel: 'IR' },
] as const

export type ChartParamId = (typeof CHART_PARAMS)[number]['id']
```

### TT Model Codes

```typescript
export const TT_MODEL_CODES: Record<ModelId, string | null> = {
  'gfs': 'gfs',
  'ecmwf-hres': 'ecmwf',
  'icon': 'icon',
  'gem': 'cmc',
  'ukmo': 'ukmo',
  'ec-aifs': 'ecmwf-aifs',
  'gefs': 'gefs',
  'eps': 'eps',
  'arpege': null,  // Not available on TT
}
```

## URL Builder

```typescript
export function buildTropicalTidbitsUrl(
  model: ModelId,
  runId: string,
  param: ChartParamId,
  forecastHour: number,
): string {
  const modelCode = TT_MODEL_CODES[model]
  const paramConfig = CHART_PARAMS.find(p => p.id === param)
  const ttParam = paramConfig?.ttCode ?? 'mslp_pcpn_frzn'
  const frame = Math.floor(forecastHour / 6) + 1

  return `https://www.tropicaltidbits.com/analysis/models/${modelCode}/${runId}/${modelCode}_${ttParam}_eu_${frame}.png`
}
```

## Store Updates

### State Shape

```typescript
interface WeatherState {
  selectedModel: ModelId
  selectedRun: ModelRun | null
  selectedScope: ChartScope
  selectedMeteocielRegion: MeteocielRegion
  selectedParam: ChartParamId
  forecastHour: number
}
```

### Validation Rules

| Action | Validation |
|--------|------------|
| Select ensemble model (GEFS/EPS) | Auto-switch to `europe` scope |
| Select regional scope | If model doesn't support, switch to ECMWF |
| Select TT-only param (CAPE, snow) | Auto-switch to `europe` scope |
| Switch to regional scope | Filter out TT-only params, fallback to `mslp` |

### Derived Selectors

```typescript
export const useAvailableModels = () => useWeatherStore((s) => {
  if (s.selectedScope === 'europe') return MODELS
  return MODELS.filter(m => MODEL_CONFIG[m].hasRegional)
})

export const useAvailableParams = () => useWeatherStore((s) => {
  if (s.selectedScope === 'europe') return CHART_PARAMS
  return CHART_PARAMS.filter(p => p.meteocielMode !== null)
})
```

## UI Changes

### Model Selector - Two Row Layout

```
┌─────────────────────────────────────────────────────────┐
│ High Resolution                                         │
│ ┌──────┐ ┌──────┐ ┌───────┐ ┌─────┐ ┌─────┐ ┌────────┐ │
│ │ECMWF │ │ ICON │ │ARPEGE │ │ GFS │ │ GEM │ │EC-AIFS │ │
│ └──────┘ └──────┘ └───────┘ └─────┘ └─────┘ └────────┘ │
├─────────────────────────────────────────────────────────┤
│ Ensemble                                                │
│ ┌──────┐ ┌─────┐                                        │
│ └──────┘ └─────┘                                        │
└─────────────────────────────────────────────────────────┘
```

### Parameter Groups

```typescript
export const PARAM_GROUPS = [
  { label: 'Synoptic', params: ['mslp', 'z500', 'jet'] },
  { label: 'Temperature', params: ['t2m', 't850'] },
  { label: 'Precipitation', params: ['precip24', 'snow', 'pwat'] },
  { label: 'Convection', params: ['cape'] },
  { label: 'Other', params: ['wind', 'ir'] },
] as const
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/models.ts` | Add 3 new models, `MODEL_GROUPS`, `getModelGroup()` |
| `src/lib/utils/runs.ts` | Update `CHART_PARAMS`, update `buildChartUrl()` |
| `src/lib/utils/tropicaltidbits.ts` | **New** - TT URL builder, model codes |
| `src/stores/weather-store.ts` | Add `ChartScope`, validation, selectors |
| `src/components/features/run-image-viewer/` | Use new param/scope system |
| `src/components/features/model-selector.tsx` | Two-row grouped layout |
| `src/lib/i18n/en.ts` / `el.ts` | Translations for new models, params |

## Trade-offs

- **No country zooms on TT**: Regional scope falls back to Meteociel/Wetterzentrale
- **ARPEGE not on TT**: Always uses Wetterzentrale
- **TT-only params**: Not available in regional scope (auto-fallback to MSLP)

## Open Questions

- [ ] Verify TT frame-to-hour mappings for each model (6h vs 12h intervals)
- [ ] Confirm UKMO and GEM availability on TT
- [ ] Test ensemble model URL patterns
