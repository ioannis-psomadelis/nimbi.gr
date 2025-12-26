# Weekly Outlook - Smart Weather Narrative Generator

## Overview

A rule-based system that analyzes the 7-day forecast from all 5 weather models and generates human-readable summaries with ECMWF HD as the reference model.

**Key Decisions:**

| Aspect | Decision |
|--------|----------|
| Approach | Rule-based templates (no AI/LLM) |
| Primary model | ECMWF HD (show others for comparison) |
| Time range | 7 days with day-by-day breakdown |
| UI | Floating widget (bottom-right) → Modal |
| Languages | English + Greek (i18n) |
| Confidence | Show model spread explicitly |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Data Flow                          │
├─────────────────────────────────────────────────────┤
│  Weather Data (5 models from Open-Meteo)            │
│         ↓                                           │
│  Forecast Analyzer                                  │
│  - Compare models against ECMWF HD                  │
│  - Detect patterns (trends, fronts, events)         │
│  - Calculate agreement scores                       │
│         ↓                                           │
│  Narrative Generator                                │
│  - Select templates based on conditions             │
│  - Inject dynamic values (temps, dates, models)     │
│  - Output in user's language (EN/EL)                │
│         ↓                                           │
│  UI Layer                                           │
│  - Floating widget (bottom-right)                   │
│  - Modal with formatted forecast                    │
└─────────────────────────────────────────────────────┘
```

**Files to create:**

```
src/
├── lib/
│   └── forecast/
│       ├── analyzer.ts        # Model comparison logic
│       ├── narrative.ts       # Template engine
│       ├── templates/
│       │   ├── en.ts          # English templates
│       │   └── el.ts          # Greek templates
│       └── types.ts           # Forecast types
└── components/
    └── features/
        └── weekly-outlook/
            ├── index.ts
            ├── widget.tsx     # Floating button
            ├── modal.tsx      # Full forecast modal
            └── day-card.tsx   # Individual day display
```

---

## Forecast Analyzer

### Daily Summary Structure

```typescript
interface DayForecast {
  date: Date
  tempHigh: number
  tempLow: number
  precipTotal: number
  precipHours: number      // hours with precip > 0.1mm
  dominantCondition: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
  windMax: number
  pressureTrend: 'rising' | 'falling' | 'stable'
}

interface ModelComparison {
  day: Date
  ecmwfHd: DayForecast
  models: Record<ModelId, DayForecast>
  agreement: AgreementScore
}
```

### Agreement Scoring

| Models Agreeing | Score | Language Used |
|-----------------|-------|---------------|
| 5/5 | 100% | "will be", "expect" |
| 4/5 | 80% | "likely", "probable" |
| 3/5 | 60% | "chance of", "possible" |
| 2/5 or less | <50% | "uncertain", "models disagree" |

### Pattern Detection

- **Temperature trends** - Rising/falling over 3+ days
- **Front passages** - Sharp pressure drop + precip + wind increase
- **Stable periods** - High pressure, low precip, consistent temps
- **Uncertainty zones** - Days where models diverge significantly

### ECMWF HD Priority

When summarizing, always state ECMWF HD first, then compare others:

> "ECMWF HD shows X. GFS/GEM agree. UKMO differs with Y."

---

## Narrative Template System

### Template Structure

```typescript
const templates = {
  en: {
    dayIntro: "{day} will see {condition} with highs of {high}°C",
    precipLikely: "Rain expected, {amount}mm according to ECMWF HD",
    modelAgreement: "{agreeingModels} align on this forecast",
    modelDisagreement: "However, {differingModels} suggest {alternative}",
    trend: {
      warming: "A warming trend continues through {endDay}",
      cooling: "Temperatures drop heading into {endDay}",
      stable: "Conditions remain stable through the period"
    },
    confidence: {
      high: "High confidence in this outlook",
      medium: "Moderate confidence - some model variation",
      low: "Uncertainty ahead - models show different scenarios"
    }
  },
  el: {
    dayIntro: "{day} αναμένεται {condition} με μέγιστη {high}°C",
    precipLikely: "Αναμένονται βροχές, {amount}mm σύμφωνα με το ECMWF HD",
    modelAgreement: "{agreeingModels} συμφωνούν σε αυτήν την πρόβλεψη",
    modelDisagreement: "Ωστόσο, {differingModels} προτείνουν {alternative}",
    trend: {
      warming: "Η ανοδική τάση θερμοκρασίας συνεχίζεται μέχρι {endDay}",
      cooling: "Οι θερμοκρασίες πέφτουν καθώς πλησιάζει {endDay}",
      stable: "Οι συνθήκες παραμένουν σταθερές"
    },
    confidence: {
      high: "Υψηλή αξιοπιστία πρόβλεψης",
      medium: "Μέτρια αξιοπιστία - κάποιες διαφορές μεταξύ μοντέλων",
      low: "Αβεβαιότητα - τα μοντέλα δείχνουν διαφορετικά σενάρια"
    }
  }
}
```

### Narrative Flow (7-day structure)

1. **Opening** - Overall trend summary (1-2 sentences)
2. **Today/Tomorrow** - Detailed, high confidence
3. **Days 3-5** - Grouped by pattern (e.g., "Midweek brings...")
4. **Days 6-7** - Brief, note uncertainty if models diverge
5. **Closing** - Confidence statement + notable events

### Example Output

**English:**
> "A warm start to the week with temperatures reaching 24°C Tuesday. ECMWF HD shows a cold front arriving Thursday, bringing 12mm of rain - GFS agrees but UKMO delays it to Friday. Weekend outlook is uncertain with models diverging on timing."

**Greek:**
> "Ζεστή αρχή εβδομάδας με θερμοκρασίες έως 24°C την Τρίτη. Το ECMWF HD δείχνει ψυχρό μέτωπο την Πέμπτη με 12mm βροχής - το GFS συμφωνεί αλλά το UKMO το καθυστερεί για Παρασκευή. Αβέβαιο το Σαββατοκύριακο με διαφορές μεταξύ μοντέλων."

---

## UI Components

### Floating Widget (Bottom-Right)

```
┌─────────────────────────────┐
│  ☀️  24°C  →  🌧️  Thu      │
│     Weekly Outlook          │
└─────────────────────────────┘
```

**Features:**
- Shows current condition icon + temp
- Arrow → indicates upcoming change (if any)
- Subtle animation on weather changes
- Respects dark/light theme
- Mobile: slightly smaller, same position

### Modal Layout

```
┌────────────────────────────────────────────────────┐
│  Weekly Outlook                              ✕     │
│  📍 Athens, Greece                                 │
├────────────────────────────────────────────────────┤
│                                                    │
│  ☀️ Warm start, rain arrives Thursday             │
│                                                    │
│  ─────────────────────────────────────────────    │
│                                                    │
│  Today (Mon)     ☀️  24°C / 16°C                  │
│  Sunny and warm. All models agree.                 │
│                                                    │
│  Tuesday         ⛅  23°C / 15°C                   │
│  Increasing clouds. ECMWF HD and GFS align.        │
│                                                    │
│  Wednesday       🌥️  20°C / 14°C                  │
│  Cloudy, cooler. Front approaching.                │
│                                                    │
│  Thursday        🌧️  17°C / 13°C                  │
│  Rain likely (12mm). GFS agrees, UKMO delays.      │
│                                                    │
│  Fri - Sun       🌤️  18-20°C                      │
│  Gradual clearing. Models show some uncertainty.   │
│                                                    │
├────────────────────────────────────────────────────┤
│  ℹ️ Based on ECMWF HD • Updated 12:00 UTC         │
│  Confidence: ●●●○○ Moderate                        │
└────────────────────────────────────────────────────┘
```

**Features:**
- Clean day-by-day cards with icons
- Confidence indicator (dots or bar)
- Model source + last update time
- Smooth open/close animation
- Scrollable on mobile

---

## Edge Cases & Error Handling

### Missing Data Scenarios

| Scenario | Handling |
|----------|----------|
| ECMWF HD unavailable | Fall back to standard ECMWF, note in footer |
| Some models missing | Generate narrative with available models, list which are included |
| All data stale (>6hrs) | Show warning banner, still display last narrative |
| Location has no data | Hide widget entirely |

### Narrative Edge Cases

- **Extreme weather** - Special templates for heat waves, storms, freezing
- **Rapid changes** - Highlight sudden shifts (e.g., "Sharp 10°C drop Thursday")
- **All models agree** - Emphasize high confidence
- **Total disagreement** - Honest "Models are split - check back for updates"

### Data Freshness

- Narrative regenerates when new model run arrives
- Cache narrative for 30 minutes (matches React Query config)
- Show "Updated X minutes ago" in modal footer

### Performance

- Analyzer runs client-side (data already fetched)
- Memoize narrative output to avoid recalculation on re-renders
- Lazy-load modal content (only compute when opened)

---

## Testing Strategy

### Unit Tests

```typescript
// analyzer.test.ts
- calculateAgreementScore() with various model combinations
- detectTemperatureTrend() for rising/falling/stable
- identifyPrecipEvents() accuracy
- compareToPrimaryModel() ECMWF HD vs others

// narrative.test.ts
- template interpolation with edge values
- language switching (EN ↔ EL)
- day grouping logic (Days 3-5 bundling)
- confidence level text selection
```

### Integration Tests

```typescript
// weekly-outlook.test.tsx
- Widget renders with correct teaser
- Modal opens/closes properly
- Narrative displays for mock weather data
- Handles missing model gracefully
- Language respects i18n setting
```

### Test Data

- Create mock scenarios: sunny week, stormy period, mixed conditions
- Edge cases: all models agree, total disagreement, missing ECMWF HD

---

## Implementation Order

1. **Types & interfaces** - Define data structures
2. **Analyzer** - Model comparison and pattern detection
3. **Templates** - EN/EL narrative templates
4. **Narrative generator** - Template engine
5. **Widget component** - Floating button UI
6. **Modal component** - Full forecast display
7. **Integration** - Wire into compare page
8. **Tests** - Unit and integration tests
