# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server on port 3000
pnpm build            # Build for production (outputs to .output/)
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test -- tests/unit/runs.test.ts  # Run single test file
```

## Architecture

**nimbi.gr** is a weather forecast comparison app built with TanStack Start (React 19 + Nitro SSR).

### Core Data Flow

1. **Routes** (`src/routes/`) use TanStack Router file-based routing with server loaders
2. **Server Functions** (`src/lib/server/`) run on server via `createServerFn()` - handle geocoding, location lookup, cookies, weather alerts
3. **API Layer** (`src/lib/api/`) fetches data from Open-Meteo for weather, air quality, and alerts
4. **Zustand Stores** (`src/stores/`) manage client-side state with cookie persistence
5. **Chart URLs** (`src/lib/utils/runs.ts`) builds Meteociel chart image URLs with model/run/hour/region params

### Directory Structure

```
src/
├── routes/                  # TanStack Router file-based routes
│   ├── __root.tsx          # Root layout with theme/language hydration
│   ├── index.tsx           # Home page with search, geolocation
│   └── observatory.$slug.tsx # Main forecast view
├── stores/                  # Zustand state management
│   ├── preferences-store.ts # Theme, language, pro mode
│   ├── locations-store.ts   # Saved locations, recent searches
│   ├── weather-store.ts     # Selected model, run, region, param, hour
│   ├── ui-store.ts          # Sidebar, weekly outlook modal state
│   └── storage.ts           # Cookie-based persistence middleware
├── components/
│   ├── ui/                  # shadcn/ui primitives (Button, Dialog, Tooltip, etc.)
│   ├── features/            # Domain components
│   │   ├── weekly-outlook/  # 7-day forecast modal/widget
│   │   ├── run-image-viewer/ # Meteociel/Wetterzentrale chart viewer
│   │   ├── simple-mode/     # Simplified weather view for non-pro users
│   │   ├── model-card.tsx   # Weather model comparison card
│   │   ├── comparison-chart.tsx # Multi-model temperature chart
│   │   ├── search-modal.tsx # Location search with geocoding
│   │   ├── air-quality.tsx  # Air quality index display
│   │   └── weather-alerts.tsx # Meteoalarm warnings
│   ├── layout/              # Header, Footer, NavigationLoader
│   └── skeletons/           # Loading states
├── hooks/                   # Custom React hooks
│   ├── use-model-runs.ts    # Fetches available model runs
│   ├── use-keyboard-shortcuts.ts # Global keyboard navigation
│   ├── use-mobile.ts        # Mobile detection
│   └── use-theme-effect.ts  # Theme class application
├── lib/
│   ├── api/                 # External API clients
│   │   ├── weather.ts       # Open-Meteo weather forecasts
│   │   ├── air-quality.ts   # Open-Meteo air quality
│   │   └── alerts.ts        # Weather alerts client
│   ├── server/              # Server-only functions
│   │   ├── geocode.ts       # Location geocoding
│   │   ├── locations.ts     # Predefined location lookup
│   │   ├── language.ts      # i18n cookie handling
│   │   ├── storage.ts       # Cookie storage utilities
│   │   └── meteoalarm.ts    # European weather alerts
│   ├── forecast/            # Forecast analysis
│   │   ├── analyzer.ts      # Weather pattern detection
│   │   ├── narrative.ts     # Human-readable forecast generation
│   │   ├── use-weekly-outlook.ts # Weekly forecast hook
│   │   └── templates/       # i18n narrative templates (en, el)
│   ├── utils/               # Utility functions
│   │   ├── runs.ts          # Model run timing, Meteociel URLs
│   │   ├── wetterzentrale.ts # Wetterzentrale chart URLs
│   │   ├── chart-data.ts    # Recharts data formatting
│   │   └── debounce.ts      # Debounce utility
│   ├── i18n/                # Internationalization
│   └── query-client.ts      # React Query configuration
├── types/                   # TypeScript definitions
│   ├── models.ts            # Weather model definitions
│   └── weather.ts           # Weather data types
└── data/
    └── locations.json       # Predefined locations
```

### Route Structure

- `/` - Home page with search, geolocation, quick-pick locations
- `/observatory/$slug` - Main forecast view. Slug is either a predefined location key or `lat_lon` coords

### Key Concepts

**Weather Models**: Defined in `src/types/models.ts`. Each model has a color, name, and Open-Meteo endpoint. Supports ECMWF HD, GFS, GEM, UKMO.

**Runs**: Model runs (00z, 06z, 12z, 18z) - when forecasts are generated. `src/lib/utils/runs.ts` handles run timing, URL building for Meteociel charts, and region detection.

**Regions**: ECMWF HD supports regional charts (Greece, France, Italy, Spain, UK, Germany). Auto-detected from coordinates.

**i18n**: English and Greek (`src/lib/i18n/`). Language stored in cookie, loaded server-side.

**Pro Mode**: Toggle between simple weather view (non-pro) and full model comparison (pro).

### State Management (Zustand)

All client state uses Zustand stores with cookie persistence:

- **preferences-store**: Theme (light/dark/system), language (en/el), pro mode
- **locations-store**: Saved locations, recent searches (max 5)
- **weather-store**: Selected model, run, region, chart param, forecast hour
- **ui-store**: Sidebar open state, weekly outlook modal

Stores are SSR-safe - initial values load from cookies server-side, then hydrate client-side.

## Testing

Tests in `tests/` directory. Setup in `tests/setup.ts` using jsdom + @testing-library/react.

```bash
pnpm test -- --reporter=verbose  # Verbose output
```

## Deployment

Railway-ready with Dockerfile. Build outputs to `.output/server/index.mjs`.
