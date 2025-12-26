# Nimbus - Weather Model Comparison App

> Design Document | December 26, 2025

## Overview

Nimbus is a clean, modern weather data visualization app that lets users compare forecasts from major meteorological models (GFS, ECMWF, GEM, UKMO) in a unified interface.

### Target Audience

- **Primary:** Weather enthusiasts and hobbyists wanting model comparison
- **Secondary:** General public seeking accessible weather data
- **Bonus:** Professional meteorologists needing quick multi-model views

### Core Features

1. **Model Comparison** - Side-by-side views of different models for the same location
2. **Run Browser** - Navigate through forecast runs (00z, 06z, 12z, 18z) with timeline
3. **Location-Focused** - Pick a location, see all model predictions aggregated

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│           TanStack Start Application            │
├─────────────────────────────────────────────────┤
│  UI Layer                                       │
│  ├── Location Picker (Leaflet map)              │
│  ├── Model Comparison View                      │
│  ├── Run Selector (timeline)                    │
│  └── Charts (Recharts)                          │
├─────────────────────────────────────────────────┤
│  Data Layer (TanStack Query)                    │
│  ├── Model data caching (stale-while-revalidate)│
│  ├── Run metadata                               │
│  └── User locations (localStorage)              │
├─────────────────────────────────────────────────┤
│  External                                       │
│  └── Open-Meteo API                             │
└─────────────────────────────────────────────────┘
```

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Home - Europe map, location search, saved spots |
| `/compare/:lat/:lon` | Main comparison view for a location |
| `/settings` | User preferences (units, models, theme) |

---

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | TanStack Start |
| Routing | TanStack Router |
| Data Fetching | TanStack Query |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Maps | Leaflet + react-leaflet |
| Validation | Zod |
| Testing | Vitest + Testing Library |

### Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",
    "@tanstack/react-router": "^1.x",
    "@tanstack/start": "^1.x",
    "react": "^19.x",
    "recharts": "^2.x",
    "react-leaflet": "^4.x",
    "leaflet": "^1.x",
    "zod": "^3.x",
    "clsx": "^2.x",
    "tailwindcss": "^4.x"
  },
  "devDependencies": {
    "vitest": "^2.x",
    "@testing-library/react": "^16.x",
    "msw": "^2.x",
    "typescript": "^5.x"
  }
}
```

---

## Data Source: Open-Meteo API

### Endpoints

```
GET https://api.open-meteo.com/v1/gfs?latitude={lat}&longitude={lon}&hourly=...
GET https://api.open-meteo.com/v1/ecmwf?latitude={lat}&longitude={lon}&hourly=...
GET https://api.open-meteo.com/v1/gem?latitude={lat}&longitude={lon}&hourly=...
GET https://api.open-meteo.com/v1/ukmo?latitude={lat}&longitude={lon}&hourly=...
```

### Weather Variables

| Variable | Display Name | Chart Type |
|----------|--------------|------------|
| `temperature_2m` | Temperature | Line |
| `precipitation` | Precipitation | Bar |
| `wind_speed_10m` | Wind Speed | Line |
| `wind_direction_10m` | Wind Direction | Compass |
| `cloud_cover` | Cloud Cover | Area |
| `pressure_msl` | Pressure | Line |

### Caching Strategy

```typescript
useQueries({
  queries: models.map(model => ({
    queryKey: ['forecast', model, lat, lon],
    queryFn: () => fetchModelData(model, lat, lon),
    staleTime: 1000 * 60 * 30,  // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  }))
})
```

---

## UI Design

### Visual Style

- **Theme:** Dark mode with glassmorphism elements
- **Inspiration:** Windy.com meets modern UI

### Color Palette

| Element | Color |
|---------|-------|
| Background | `#0f1419` |
| Cards | `rgba(255,255,255,0.05)` + backdrop blur |
| GFS | `#3b82f6` (blue) |
| ECMWF | `#ef4444` (red) |
| GEM | `#22c55e` (green) |
| UKMO | `#f59e0b` (amber) |

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Header: Logo | Location Search | Run Selector | Settings│
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  Sidebar   │              Main Content                   │
│  ─────────│                                             │
│  Saved     │   ┌─────────────────────────────────────┐  │
│  Locations │   │  Model Cards (glassmorphism)        │  │
│            │   │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───┐│  │
│  • Athens  │   │  │ GFS   │ │ECMWF  │ │ GEM   │ │UKM││  │
│  • Paris   │   │  │ 2°C   │ │ 3°C   │ │ 2°C   │ │3°C││  │
│            │   │  └───────┘ └───────┘ └───────┘ └───┘│  │
│            │   └─────────────────────────────────────┘  │
│            │                                             │
│            │   ┌─────────────────────────────────────┐  │
│            │   │  Comparison Charts                  │  │
│            │   │  [Temp] [Precip] [Wind] [Pressure]  │  │
│            │   │  📈 Multi-line overlay              │  │
│            │   └─────────────────────────────────────┘  │
│            │                                             │
│            │   ┌─────────────────────────────────────┐  │
│            │   │  Mini Map (current location)        │  │
│            │   └─────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────┘
```

### Components

| Component | Purpose |
|-----------|---------|
| `ModelCard` | Summary card per model (temp, conditions) |
| `ComparisonChart` | Multi-line chart overlaying all models |
| `RunTimeline` | Slider for 00z, 06z, 12z, 18z runs |
| `LocationMap` | Leaflet map for location selection |
| `SavedLocations` | Sidebar list of user's saved places |

### Glassmorphism Utility

```css
.glass {
  @apply bg-white/5 backdrop-blur-md border border-white/10 rounded-xl;
}
```

---

## User Data Storage

### localStorage Structure

```typescript
interface UserData {
  savedLocations: {
    id: string
    name: string        // "Athens, Greece"
    lat: number
    lon: number
    isDefault: boolean
  }[]
  preferences: {
    units: 'metric' | 'imperial'
    defaultModels: string[]
    chartType: 'overlay' | 'split'
  }
}
```

### User Flows

1. **First Visit:** Europe map centered, prompt for location
2. **Save Location:** Click map or search → save to sidebar
3. **Daily Use:** Opens default location, quick switch between saved spots

---

## Project Structure

```
nimbus/
├── app/
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── compare.$lat.$lon.tsx
│   │   └── settings.tsx
│   ├── components/
│   │   ├── ui/                    # Button, Card, Input, etc.
│   │   └── features/              # ModelCard, Chart, Map
│   ├── lib/
│   │   ├── api/                   # Open-Meteo fetch functions
│   │   ├── hooks/                 # useModelData, useLocations
│   │   ├── utils/                 # formatTemperature, etc.
│   │   └── constants/             # Model configs, colors
│   ├── types/                     # Shared TypeScript types
│   └── styles/
│       └── globals.css
├── tests/
│   ├── unit/
│   ├── components/
│   └── integration/
├── docs/
│   └── plans/
├── public/
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## Best Practices

### Type Safety

- Zod schemas for all API responses
- Strict TypeScript config
- Validate at API boundaries

```typescript
const ModelResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    precipitation: z.array(z.number()),
  }),
})
```

### Performance

- Parallel fetching with `useQueries`
- Lazy load charts and map components
- Prefetch on hover for saved locations
- Memoize expensive chart transformations

### Testing

| Layer | Focus | Tool |
|-------|-------|------|
| Utils | Pure functions | Vitest |
| API | Schema validation, errors | Vitest + MSW |
| Components | Rendering, interactions | Testing Library |
| E2E | Critical flows | Playwright (later) |

---

## MVP Scope

### Included

- 4 models: GFS, ECMWF, GEM, UKMO
- Europe default focus
- Location save/load (localStorage)
- Temperature, precipitation, wind, pressure charts
- Dark theme with glassmorphism
- Run timeline (latest runs)

### Deferred

- User accounts / cloud sync
- Mobile app
- Additional models
- Historical data comparison
- Notifications / alerts

---

## Next Steps

1. Initialize TanStack Start project
2. Set up Tailwind v4 with dark theme
3. Build location picker (map + search)
4. Implement Open-Meteo API integration
5. Create model comparison UI
6. Add chart components
7. Implement localStorage persistence
8. Testing and polish
