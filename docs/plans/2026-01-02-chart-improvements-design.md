# Chart System Improvements Design

**Date:** 2026-01-02
**Status:** Draft

## Overview

Comprehensive improvements to the model chart system covering architecture cleanup, UX enhancements, and new features.

---

## 1. Architecture: Consolidate Param Logic

### Problem

Param availability logic is spread across 3+ locations:
- `modeToWetterzenParam()` in `runs.ts`
- `effectiveParam` useMemo in `index.tsx`
- `disabledParams` array in `index.tsx`
- `CHART_PARAMS` with `meteocielMode` in `runs.ts`

### Solution

Create a single source of truth:

```typescript
// src/lib/utils/chart-params.ts

interface ParamAvailability {
  available: ChartParamId[]
  disabled: ChartParamId[]
  defaultParam: ChartParamId
}

export function getParamAvailability(
  model: ModelId,
  scope: ChartScope,
  chartProvider: ChartProvider
): ParamAvailability {
  // All logic consolidated here
}
```

### Implementation

1. Create `src/lib/utils/chart-params.ts`
2. Move all param logic into single function
3. Update `run-image-viewer/index.tsx` to use new function
4. Remove scattered logic from other files
5. Add unit tests for all model/scope combinations

---

## 2. UX: Error Handling for 404s

### Problem

When a chart URL returns 404 (run not ready, hour not available), users see broken image.

### Solution

Enhance `ImageDisplay` component:

```typescript
// States: loading | loaded | error | not-available

const [imageState, setImageState] = useState<ImageState>('loading')

<img
  onLoad={() => setImageState('loaded')}
  onError={() => setImageState('error')}
/>

{imageState === 'error' && (
  <div className="error-state">
    <p>Chart not available</p>
    <Button onClick={retry}>Try again</Button>
    <Button onClick={tryPreviousRun}>Try previous run</Button>
  </div>
)}
```

### Fallback Strategy

1. Show error message with retry button
2. Offer to try previous run (00z → previous day's 12z)
3. After 3 retries, show "Chart unavailable" permanently

---

## 3. UX: Preload Adjacent Hours

### Problem

Navigating between hours has noticeable image load delay.

### Solution

Preload ±1 step images in background:

```typescript
// In HourSlider or parent component
useEffect(() => {
  const prevHour = Math.max(hourConfig.min, forecastHour - hourConfig.step)
  const nextHour = Math.min(hourConfig.max, forecastHour + hourConfig.step)

  // Preload adjacent images
  const prevImg = new Image()
  prevImg.src = buildChartUrl(model, runId, param, prevHour, scope, coords)

  const nextImg = new Image()
  nextImg.src = buildChartUrl(model, runId, param, nextHour, scope, coords)
}, [forecastHour, model, runId, param, scope])
```

### Considerations

- Only preload if user is idle (debounce rapid navigation)
- Limit to ±1 step to avoid excessive requests
- Consider using `<link rel="prefetch">` for better browser caching

---

## 4. Feature: Add Precipitation to Regional (Wetterzentrale)

### Current State

Wetterzentrale supports param 4 (precipitation) but it's not mapped.

### Solution

Update `wetterzentrale.ts` and `runs.ts`:

```typescript
// wetterzentrale.ts - already done
PRECIP: 4,  // Precipitation

// runs.ts - add to modeToWetterzenParam
// Need to map a Meteociel mode to precip

// Problem: No direct Meteociel mode for precipitation
// Solution: Create synthetic mapping or add precip as regional-only param
```

### Challenge

Meteociel modes don't have a direct precipitation param that maps to Wetterzentrale's param 4. Options:

**Option A:** Add precipitation as Wetterzentrale-only param (regional scope only)
**Option B:** Map mode 0 (MSLP) to show both MSLP + precip on Wetterzentrale

Recommendation: **Option A** - cleaner separation

---

## 5. Feature: Animation/Loop Mode

### Design

Add play controls to cycle through forecast hours automatically.

```typescript
interface AnimationState {
  isPlaying: boolean
  speed: 1000 | 2000 | 3000  // ms per frame
  direction: 'forward' | 'backward'
}

// New component: AnimationControls
<AnimationControls
  isPlaying={isPlaying}
  onToggle={() => setIsPlaying(!isPlaying)}
  speed={speed}
  onSpeedChange={setSpeed}
/>
```

### UI

```
[|◀] [▶/❚❚] [▶|]  Speed: [1x] [2x] [3x]
```

- Skip to start
- Play/Pause toggle
- Skip to end
- Speed selector

### Implementation

1. Add animation state to component
2. Create `AnimationControls` component
3. Use `setInterval` controlled by play state
4. Preload all frames when animation starts
5. Loop back to start when reaching end

---

## 6. Feature: Chart Comparison View

### Design

Side-by-side view comparing same param from 2 models.

```
┌─────────────────┬─────────────────┐
│    ECMWF HD     │      GFS        │
│   [MSLP chart]  │  [MSLP chart]   │
│                 │                 │
└─────────────────┴─────────────────┘
        Hour: 24    [◀] [▶]
```

### Implementation

1. Add "Compare" toggle button
2. When enabled, show model selector for second model
3. Render two `ImageDisplay` components side-by-side
4. Sync hour slider between both
5. Mobile: Stack vertically instead of side-by-side

### Considerations

- Only allow comparison of models with same param available
- Share single hour slider
- Consider swipe gesture on mobile to switch between models

---

## 7. Feature: Historical Runs

### Design

Dropdown to select from recent runs (past 2-3 days).

```typescript
// Get available runs for model
function getAvailableRuns(model: ModelId, count: number): RunInfo[] {
  // Returns last N runs based on model's run schedule
}

// UI: Dropdown in header
<Select value={selectedRun} onChange={setSelectedRun}>
  {availableRuns.map(run => (
    <Option key={run.id} value={run.id}>
      {run.label} {/* "00z · Jan 2" */}
    </Option>
  ))}
</Select>
```

### Implementation

1. Extend `getPreviousRuns()` to return more runs
2. Add run selector dropdown to `RunImageViewer`
3. Validate selected run has charts available (404 check)
4. Default to latest available run

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. Add precipitation to Wetterzentrale regional
2. Error handling for 404s
3. Consolidate param logic

### Phase 2: UX Polish (2-3 days)
4. Preload adjacent hours
5. Historical runs selector

### Phase 3: Major Features (3-5 days)
6. Animation/loop mode
7. Chart comparison view

---

## Success Criteria

- [ ] All models show appropriate charts without broken images
- [ ] Param selection is consistent and predictable
- [ ] Navigation between hours feels instant (<100ms perceived)
- [ ] Users can compare models side-by-side
- [ ] Users can view historical runs
- [ ] Animation loops smoothly without flicker

---

## Decisions

1. **Animation**: Load on-demand (no preloading) - lighter bandwidth, accept some stutter
2. **Historical runs**: 3 days (~12-24 runs depending on model)
3. **Comparison view**: Same param for both models (simpler, more useful for comparison)
