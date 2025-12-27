# nimbi.gr

A weather forecast comparison app that displays and compares multiple weather models side by side. Built with TanStack Start (React 19 + Nitro SSR).

## Features

- **Multi-model comparison**: Compare forecasts from ECMWF HD, GFS, GEM, and UKMO models
- **Interactive charts**: Temperature, precipitation, and wind comparison charts
- **Meteociel/Wetterzentrale integration**: View synoptic charts from external providers
- **Weekly outlook**: 7-day forecast with confidence indicators
- **Air quality**: Real-time air quality index display
- **Weather alerts**: Meteoalarm integration for European weather warnings
- **Location search**: Geocoding-powered search with saved locations
- **Pro mode**: Toggle between simplified and detailed views
- **i18n**: English and Greek language support
- **Dark mode**: System-aware theme with manual override

## Getting Started

```bash
pnpm install
pnpm dev
```

The app runs at http://localhost:3000

## Building For Production

```bash
pnpm build
```

Build outputs to `.output/` directory.

## Testing

```bash
pnpm test          # Watch mode
pnpm test:run      # Single run
```

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19 + Nitro SSR)
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) (React Query)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **i18n**: [i18next](https://www.i18next.com/) + react-i18next
- **Testing**: [Vitest](https://vitest.dev/) + Testing Library
- **UI Components**: shadcn/ui (Radix UI primitives)

## Project Structure

```
src/
├── routes/           # File-based routing (TanStack Router)
├── stores/           # Zustand state management
├── components/
│   ├── ui/           # shadcn/ui primitives
│   ├── features/     # Domain-specific components
│   ├── layout/       # Header, Footer
│   └── skeletons/    # Loading states
├── hooks/            # Custom React hooks
├── lib/
│   ├── api/          # External API clients (Open-Meteo)
│   ├── server/       # Server-only functions
│   ├── forecast/     # Forecast analysis & narrative generation
│   ├── utils/        # Utility functions
│   └── i18n/         # Translations
├── types/            # TypeScript definitions
└── data/             # Static data (locations.json)
```

## Weather Data Sources

- **Open-Meteo**: Hourly forecasts, air quality data
- **Meteociel**: Synoptic chart images (ECMWF HD)
- **Wetterzentrale**: Additional synoptic charts
- **Meteoalarm**: European weather warnings

## Deployment

The app is Railway-ready with a Dockerfile included. Build outputs to `.output/server/index.mjs`.

## License

Private project.
