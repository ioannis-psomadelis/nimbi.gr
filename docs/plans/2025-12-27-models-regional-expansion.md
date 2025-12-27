# Models & Regional Expansion Design

**Date:** 2025-12-27
**Status:** Approved

## Overview

Expand nimbi.gr with new weather models (ICON, ARPEGE) featuring regional chart support, limit search to EU, and fix run selection bugs.

---

## New Features

### 1. New Models: ICON & ARPEGE

```typescript
export const MODELS = [
  'ecmwf-hres',  // Europe + Regional (Meteociel)
  'icon',        // Europe + Regional (Wetterzentrale)
  'arpege',      // Europe + Regional (Wetterzentrale)
  'gfs',         // Europe only
  'gem',         // Europe only
  'ukmo',        // Europe only
] as const

export const MODEL_CONFIG = {
  'ecmwf-hres': {
    name: 'ECMWF HD',
    color: '#dc2626',
    hasRegional: true,
    chartProvider: 'meteociel',
    dataProvider: 'open-meteo',
  },
  'icon': {
    name: 'ICON',
    color: '#8b5cf6',
    hasRegional: true,
    chartProvider: 'wetterzentrale',
    dataProvider: 'open-meteo', // dwd_icon
  },
  'arpege': {
    name: 'ARPEGE',
    color: '#06b6d4',
    hasRegional: true,
    chartProvider: 'wetterzentrale',
    dataProvider: 'open-meteo', // meteofrance_arpege
  },
  'gfs': {
    name: 'GFS',
    color: '#3b82f6',
    hasRegional: false,
    chartProvider: 'meteociel',
    dataProvider: 'open-meteo',
  },
  'gem': {
    name: 'GEM',
    color: '#22c55e',
    hasRegional: false,
    chartProvider: 'meteociel',
    dataProvider: 'open-meteo',
  },
  'ukmo': {
    name: 'UKMO',
    color: '#f59e0b',
    hasRegional: false,
    chartProvider: 'meteociel',
    dataProvider: 'open-meteo',
  },
}
```

### 2. Region Toggle UI

Top of chart viewer:
- **Europe** = Continent-wide charts (all models)
- **Regional** = Zoomed regional charts (models with `hasRegional: true` only)
- Auto-detects user's region (Greece, Italy/Balkans, France, etc.)
- Models without regional support show disabled when Regional selected

### 3. Model Info Tooltips

- Desktop: Hover tooltip or click info icon
- Mobile: Bottom sheet modal
- Shows: Provider, resolution, update times, forecast length, regional coverage, best use cases

### 4. EU Search Restriction

Server-side filtering to EU + extended coverage:

```typescript
const EU_COUNTRY_CODES = [
  // EU Members
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // Extended coverage
  'NO', 'CH', 'GB', 'IS', 'TR',
  // Balkans
  'AL', 'BA', 'ME', 'MK', 'RS', 'XK'
]
```

### 5. Forecast Integration

Add ICON & ARPEGE to forecast calculations:
- Weather data from Open-Meteo (`dwd-icon`, `meteofrance`)
- 6 models total for agreement scoring
- ECMWF remains reference model

---

## Bug Fixes

### Bug 1: Selection Resets on Fail

**Problem:** When chart image fails to load, model selection resets.

**Fix:** Keep selection, show error overlay on failed image instead. Offer "Try previous run" button.

### Bug 2: ECMWF 18z/6z Fails

**Problem:** Run selector shows 18z/06z for ECMWF which doesn't support them.

**Fix:** Filter run selector by model's valid runs:

```typescript
const MODEL_RUN_TIMES: Record<ModelId, number[]> = {
  'ecmwf-hres': [0, 12],
  'icon': [0, 6, 12, 18],
  'arpege': [0, 6, 12, 18],
  'gfs': [0, 6, 12, 18],
  'gem': [0, 12],
  'ukmo': [0, 12],
}
```

---

## Wetterzentrale Integration

### Region Codes

| Region | Code | Coverage |
|--------|------|----------|
| Europe | EU | Continent |
| Central Europe | ME | Germany, Austria, Switzerland, Poland, Czechia |
| Italy/Balkans | IT | Italy, Greece, Albania, Serbia, Croatia, etc. |
| France | FR | France |
| Spain | SP | Spain, Portugal |
| United Kingdom | UK | UK, Ireland |
| Denmark | DK | Denmark |
| Scandinavia | SC | Norway, Sweden, Finland |
| Netherlands | NL | Netherlands, Belgium |
| Turkey | TR | Turkey, Middle East |

### URL Pattern

```
https://www.wetterzentrale.de/maps/{MODEL}OP{REGION}{RUN}_{HOUR}_{PARAM}.png
```

Examples:
- `ICOOPIT06_12_2.png` = ICON, Italy/Balkans, 06z, hour 12, 850hPa temp
- `ARPOPUK00_24_1.png` = ARPEGE, UK, 00z, hour 24, MSLP

### Parameters

| Code | Parameter |
|------|-----------|
| 1 | MSLP (Pressure) |
| 2 | 850 hPa Temperature |
| 3 | Precipitation (TBD) |
| 4 | 2m Temperature (TBD) |

---

## New Hook: useModelRuns

```typescript
interface ModelRunInfo {
  runTimes: number[]
  latestRun: Run
  previousRuns: Run[]
  isRunAvailable: (hour: number) => boolean
  getNearestValidRun: (hour: number) => number
}

export function useModelRuns(model: ModelId): ModelRunInfo
```

### Test Coverage

- `runTimes` returns correct values per model
- `isRunAvailable` validates run times
- `getNearestValidRun` finds closest valid run
- `latestRun` accounts for 5h processing delay

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/use-model-runs.ts` | Hook for model run times & availability |
| `src/hooks/use-model-runs.test.ts` | Tests for runs hook |
| `src/lib/utils/wetterzentrale.ts` | Region detection & URL builder |

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/models.ts` | Add ICON, ARPEGE, hasRegional, chartProvider |
| `src/lib/api/weather.ts` | Add ICON & ARPEGE API endpoints |
| `src/lib/utils/runs.ts` | Add MODEL_RUN_TIMES constant |
| `src/lib/server/geocode.ts` | Server-side EU country filtering |
| `src/lib/forecast/analyzer.ts` | Add ICON & ARPEGE to scoring |
| `src/components/layout/header.tsx` | EU search hint |
| `src/components/features/run-selector.tsx` | Filter runs by model |
| `src/components/features/run-image-viewer/` | Region toggle, model info, error handling |

---

## Implementation Order

1. **Phase 1: Core Types & Data**
   - Update `models.ts` with new models
   - Add `MODEL_RUN_TIMES` to `runs.ts`
   - Create `wetterzentrale.ts` URL builder

2. **Phase 2: Hooks & Tests**
   - Create `use-model-runs.ts` hook
   - Write tests for hook

3. **Phase 3: API Integration**
   - Add ICON & ARPEGE to weather API
   - Update forecast analyzer

4. **Phase 4: Search Restriction**
   - Add server-side EU filtering
   - Update search UI hint

5. **Phase 5: UI Components**
   - Region toggle component
   - Model info tooltip/sheet
   - Run selector filtering
   - Error state handling (no reset)

6. **Phase 6: Testing & Polish**
   - Integration testing
   - Edge cases (failed images, unavailable runs)
