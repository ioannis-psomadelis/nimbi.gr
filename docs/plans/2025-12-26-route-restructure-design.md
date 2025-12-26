# Route Restructure & Component Split Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan.

## Overview

Restructure routes from `/compare/$lat/$lon` to `/observatory/$slug` with dynamic slug generation, plus split RunImageViewer into smaller components.

## Route Architecture

**Current:**
```
/                     → Home (search only)
/compare/$lat/$lon    → Observatory with raw coords
```

**New:**
```
/                     → Home (geolocation + search)
/observatory/$slug    → Main observatory page
```

**Examples:**
- `/observatory/athens-gr` → Athens, Greece
- `/observatory/london-gb` → London, UK
- `/observatory/thessaloniki-gr` → Thessaloniki, Greece

## Location System

### File Structure
```
src/
├── data/
│   └── locations.json         # Slug → coords mapping
├── lib/
│   └── server/
│       ├── locations.ts       # Server functions for location CRUD
│       └── geocode.ts         # Geocoding API wrapper
```

### locations.json Format
```json
{
  "athens-gr": {
    "name": "Athens",
    "nameLocal": "Αθήνα",
    "lat": 37.9838,
    "lon": 23.7275,
    "country": "GR",
    "createdAt": "2024-12-26"
  }
}
```

### Slug Generation Rules
1. Transliterate unicode → ASCII (`Θεσσαλονίκη` → `thessaloniki`)
2. Lowercase, replace spaces with hyphens
3. Append country code (`-gr`, `-us`, `-gb`)
4. Handle duplicates with state/region if needed

### Server Functions
```typescript
getLocationBySlug(slug)        // Returns location or throws notFound()
createLocation({ lat, lon })   // Geocodes, creates slug, saves, returns slug
searchLocations(query)         // Calls geocode API, returns candidates
generateSlug(name, countryCode) // Transliterates, formats "city-cc"
```

## Home Page & Geolocation UX

### Layout
```
┌─────────────────────────────────────────────┐
│  Header (logo, theme toggle, lang toggle)   │
├─────────────────────────────────────────────┤
│                                             │
│         Nimbus                              │
│     "Multi-model weather observatory"       │
│                                             │
│    ┌─────────────────────────────────┐     │
│    │  📍 Use my location             │     │  ← Primary CTA
│    └─────────────────────────────────┘     │
│                                             │
│    ┌─────────────────────────────────┐     │
│    │  🔍 Search for a city...        │     │  ← Always visible fallback
│    └─────────────────────────────────┘     │
│                                             │
│    ─── or explore ───                       │
│                                             │
│    [Athens] [London] [NYC] [Tokyo] [Paris]  │  ← Quick picks
│                                             │
└─────────────────────────────────────────────┘
```

### Geolocation Flow
1. Page loads → Check `navigator.permissions.query({ name: 'geolocation' })`
2. If `granted` → Auto-fetch location, show loader, redirect
3. If `prompt` → Wait for user to click button
4. If `denied` → Hide button, emphasize search

### Loading State
Full-page skeleton matching observatory layout with "Finding your location..." text.

## RunImageViewer Component Split

### New Structure
```
src/components/features/run-image-viewer/
├── index.tsx                 # Main orchestrator (state, layout)
├── param-selector.tsx        # Chart parameter tabs
├── region-selector.tsx       # Europe/Greece toggle
├── forecast-time-bar.tsx     # Date/time display
├── image-display.tsx         # Image with loading/error
├── hour-slider.tsx           # Slider + prev/next
└── types.ts                  # Shared types & constants
```

### Component Responsibilities

| Component | State Owned | Props Received |
|-----------|-------------|----------------|
| `index.tsx` | selectedParam, forecastHour, selectedRegion | model, runId, lat, lon |
| `param-selector` | none | params, selected, onChange |
| `region-selector` | none | regions, selected, onChange |
| `forecast-time-bar` | none | runId, forecastHour |
| `image-display` | isLoading, hasError | url, onRetry |
| `hour-slider` | none | value, min, max, step, onChange |

## Tech Stack

- **TanStack Start** server functions for data fetching
- **Zod** for input validation
- **Open-Meteo Geocoding API** for location search
- **transliteration** npm package for unicode → ASCII
