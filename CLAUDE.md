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
2. **Server Functions** (`src/lib/server/`) run on server via `createServerFn()` - handle geocoding, location lookup, cookies
3. **API Layer** (`src/lib/api/weather.ts`) fetches hourly forecasts from Open-Meteo for 4 models (ECMWF HD, GFS, GEM, UKMO)
4. **Chart URLs** (`src/lib/utils/runs.ts`) builds Meteociel chart image URLs with model/run/hour/region params

### Route Structure

- `/` - Home page with search, geolocation, quick-pick locations
- `/observatory/$slug` - Main forecast view. Slug is either a predefined location key or `lat_lon` coords

### Key Concepts

**Weather Models**: Defined in `src/types/models.ts`. Each model has a color, name, and Open-Meteo endpoint.

**Runs**: Model runs (00z, 06z, 12z, 18z) - when forecasts are generated. `src/lib/utils/runs.ts` handles run timing, URL building for Meteociel charts, and region detection.

**Regions**: ECMWF HD supports regional charts (Greece, France, Italy, Spain, UK, Germany). Auto-detected from coordinates.

**i18n**: English and Greek (`src/lib/i18n/`). Language stored in cookie, loaded server-side.

### Component Organization

- `src/components/ui/` - shadcn/ui primitives (Button, Dialog, Tooltip, Sidebar)
- `src/components/features/` - Domain components (ModelCard, RunSelector, RunImageViewer, ComparisonChart)
- `src/components/layout/` - Header, Footer, NavigationLoader
- `src/components/skeletons/` - Loading states

### State Management

- Theme/language: Cookies + localStorage, hydrated SSR-safe via inline scripts in `__root.tsx`
- Model selection: Cookie-persisted, loaded in route loader
- Saved locations: Cookie-based
- React Query: 30min stale time for weather data

## Testing

Tests in `tests/` directory. Setup in `tests/setup.ts` using jsdom + @testing-library/react.

```bash
pnpm test -- --reporter=verbose  # Verbose output
```

## Deployment

Railway-ready with Dockerfile. Build outputs to `.output/server/index.mjs`.
