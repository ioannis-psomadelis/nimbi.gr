# Pro Mode Toggle Design

## Overview

A header toggle that switches between Simple Mode (casual users) and Pro Mode (weather enthusiasts). Persisted via SSR cookie for seamless experience.

## Mode Definitions

| Aspect | Simple Mode | Pro Mode |
|--------|-------------|----------|
| **Models fetched** | ECMWF HD only (1) | All 5 models |
| **Model cards** | Single temp display | 5 clickable cards |
| **Charts** | None | Comparison charts (temp, precip, wind) |
| **Meteociel** | Hidden | Full image viewer + run selector |
| **Weekly Outlook** | ECMWF HD narrative | Multi-model with agreement |
| **Sidebar** | Location only | Location + model info |
| **Target user** | Casual "what's the weather?" | Enthusiast/meteorologist |

**Cookie:** `pro-mode`
- Values: `"true"` | `"false"`
- Default: `"false"` (Simple Mode)
- Read server-side in route loader
- Soft reload on toggle change

---

## Header UI

### Desktop
```
┌─────────────────────────────────────────────────────────────────────┐
│ [nimbi.gr]  Weather Observatory    [Search...____]    Pro[○━━] 🌙 EN│
│                                    (max-w-xs)                       │
└─────────────────────────────────────────────────────────────────────┘
                                         ↓ (full width dropdown)
                              ┌────────────────────────────────────────┐
                              │ 📍 Athens, Greece                      │
                              │ 📍 Thessaloniki, Greece                │
                              └────────────────────────────────────────┘
```

### Mobile
```
┌─────────────────────────────────────┐
│ [nimbi.gr]  [🔍]  Pro[○] 🌙 🇬🇧    │
└─────────────────────────────────────┘
        ↓ (expands to full-width search)
┌─────────────────────────────────────┐
│ [← ] [Search location...________]   │
├─────────────────────────────────────┤
│ 📍 Athens, Greece                   │
│ 📍 Thessaloniki, Greece             │
└─────────────────────────────────────┘
```

### Header Changes
- Search input: `max-w-xs` on desktop, full-width on mobile
- Search results: Always full-width dropdown
- "Weather Observatory" text: Hidden on mobile (`hidden md:block`)
- Language selector: Flag only on mobile, "EN/EL" text on desktop
- Pro toggle: Compact on mobile (smaller switch, no label)

---

## Simple Mode Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
├────────────────┬────────────────────────────────────────────────┤
│                │                                                │
│   SIDEBAR      │   HERO: Current Weather                        │
│   (minimal)    │   ┌─────────────────────────────────────────┐  │
│                │   │  ☀️  24°C                                │  │
│   📍 Athens    │   │  Sunny · Feels like 26°                 │  │
│   🇬🇷 Greece   │   │  Wind: 12 km/h · Humidity: 45%          │  │
│                │   └─────────────────────────────────────────┘  │
│   ───────────  │                                                │
│                │   7-DAY FORECAST (ECMWF HD only)               │
│   Saved        │   ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐  │
│   Locations    │   │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │  │
│                │   │ ☀️  │ ⛅  │ 🌧️ │ 🌧️ │ ⛅  │ ☀️  │ ☀️  │  │
│   ───────────  │   │ 24° │ 22° │ 18° │ 17° │ 20° │ 23° │ 24° │  │
│                │   └─────┴─────┴─────┴─────┴─────┴─────┴─────┘  │
│   Weekly       │                                                │
│   Outlook      │   (No comparison charts)                       │
│   [trigger]    │   (No Meteociel images)                        │
│                │   (No model selector)                          │
├────────────────┴────────────────────────────────────────────────┤
│ FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘
```

### What's removed in Simple Mode:
- Model cards grid (5 cards → single hero)
- Comparison charts section
- Meteociel image viewer
- Run selector
- Model legend

### What stays:
- Sidebar with location + saved locations
- Weekly Outlook trigger (ECMWF HD only narrative)
- Clean 7-day forecast row

---

## Data Flow

### SSR Request Flow
```
1. User visits /observatory/athens-gr
2. Server reads `pro-mode` cookie
3. Route loader fetches:
   - Simple: fetchModelData('ecmwf-hres', lat, lon)  → 1 call
   - Pro:    MODELS.map(m => fetchModelData(m, ...)) → 5 calls
4. SSR renders appropriate layout
```

### Toggle Switch Flow
```
1. User clicks Pro toggle
2. Client updates cookie: document.cookie = 'pro-mode=true'
3. Call router.invalidate() for soft reload
4. Loader re-runs with new cookie value
5. Page re-renders with new mode
```

---

## Files to Create/Modify

| File | Changes |
|------|---------|
| `src/lib/server/storage.ts` | Add `getServerProMode()` |
| `src/lib/storage.ts` | Add `saveProMode()`, `getProMode()` |
| `src/components/layout/header.tsx` | Add Pro toggle, mobile tweaks |
| `src/components/ui/pro-toggle.tsx` | New toggle component |
| `src/components/features/simple-mode/` | New simple mode components |
| `src/routes/observatory.$slug.tsx` | Conditional rendering based on mode |

---

## Component Details

### Pro Toggle Component
```tsx
// Desktop: labeled switch
[Pro ○━━━━━●]  // off → on

// Mobile: compact, no label
[○━●]
```

- Uses Radix Switch primitive
- Reads initial state from SSR prop (avoids hydration mismatch)
- On change: set cookie + `router.invalidate()`

### Simple Mode Components

| Component | Purpose |
|-----------|---------|
| `SimpleHero` | Large current temp + conditions (replaces model cards) |
| `SimpleForecast` | 7-day horizontal row (replaces comparison charts) |

### Observatory Page Logic
```tsx
function ObservatoryPage() {
  const { proMode, modelData } = Route.useLoaderData()

  return proMode ? (
    <ProModeLayout modelData={modelData} />   // Current full layout
  ) : (
    <SimpleModeLayout modelData={modelData} /> // New clean layout
  )
}
```

### Loader Change
```tsx
const proMode = await getServerProMode()
const modelsToFetch = proMode ? MODELS : ['ecmwf-hres']
```

---

## Implementation Order

1. Cookie helpers (server + client)
2. Pro toggle component
3. Header updates (toggle + mobile tweaks)
4. Simple mode layout components
5. Observatory page conditional rendering
6. Loader conditional fetching
