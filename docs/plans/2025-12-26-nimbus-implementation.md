# Nimbus Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a weather model comparison app that displays forecasts from GFS, ECMWF, GEM, and UKMO models with a dark glassmorphism UI.

**Architecture:** TanStack Start for the framework, TanStack Query for data fetching from Open-Meteo API, Recharts for visualizations, Leaflet for maps. localStorage for user preferences and saved locations.

**Tech Stack:** TanStack Start, TanStack Query, TanStack Router, Tailwind CSS v4, Recharts, Leaflet, Zod, Vitest

---

## Phase 1: Project Setup

### Task 1: Initialize TanStack Start Project

**Files:**
- Create: `package.json`
- Create: `app.config.ts`
- Create: `tsconfig.json`

**Step 1: Create TanStack Start project**

Run:
```bash
cd /Users/ipsomadelis/Desktop/Personal/projects/github/nimbus
npx create-tsrouter@latest . --template start --package-manager pnpm
```

Select options when prompted:
- Add TanStack Start: Yes
- Choose package manager: pnpm

**Step 2: Verify project created**

Run: `ls -la`
Expected: See `package.json`, `app.config.ts`, `app/` folder

**Step 3: Install dependencies**

Run: `pnpm install`
Expected: Dependencies installed successfully

**Step 4: Test dev server starts**

Run: `pnpm dev`
Expected: Server starts at http://localhost:3000

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: initialize TanStack Start project"
```

---

### Task 2: Configure Tailwind CSS v4

**Files:**
- Modify: `package.json`
- Create: `app/styles/globals.css`
- Modify: `app/routes/__root.tsx`

**Step 1: Install Tailwind v4**

Run:
```bash
pnpm add tailwindcss @tailwindcss/vite
```

**Step 2: Update Vite config for Tailwind**

Modify `app.config.ts` to include Tailwind plugin:

```typescript
import { defineConfig } from "@tanstack/react-start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**Step 3: Create global CSS with Tailwind and dark theme**

Create `app/styles/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: #0f1419;
  --color-surface: #1a1f26;
  --color-border: rgba(255, 255, 255, 0.1);

  --color-gfs: #3b82f6;
  --color-ecmwf: #ef4444;
  --color-gem: #22c55e;
  --color-ukmo: #f59e0b;
}

body {
  @apply bg-background text-white antialiased;
}

.glass {
  @apply bg-white/5 backdrop-blur-md border border-white/10 rounded-xl;
}
```

**Step 4: Import CSS in root**

Modify `app/routes/__root.tsx` to import the CSS:

```typescript
import '../styles/globals.css'
```

Add this import at the top of the file.

**Step 5: Verify Tailwind works**

Run: `pnpm dev`
Check: Page should have dark background (#0f1419)

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: configure Tailwind CSS v4 with dark theme"
```

---

### Task 3: Install Core Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install chart and map libraries**

Run:
```bash
pnpm add recharts react-leaflet leaflet zod clsx
pnpm add -D @types/leaflet
```

**Step 2: Verify dependencies installed**

Run: `pnpm list recharts react-leaflet zod`
Expected: Shows installed versions

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add recharts, leaflet, zod dependencies"
```

---

### Task 4: Set Up Testing Infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Modify: `package.json`

**Step 1: Install testing dependencies**

Run:
```bash
pnpm add -D vitest @testing-library/react @testing-library/dom jsdom @vitejs/plugin-react msw
```

**Step 2: Create Vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
```

**Step 3: Create test setup file**

Create `tests/setup.ts`:

```typescript
import '@testing-library/dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

**Step 4: Add test scripts to package.json**

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui"
  }
}
```

**Step 5: Create a simple passing test**

Create `tests/unit/example.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('setup', () => {
  it('works', () => {
    expect(1 + 1).toBe(2)
  })
})
```

**Step 6: Run tests**

Run: `pnpm test:run`
Expected: 1 test passes

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: set up Vitest testing infrastructure"
```

---

## Phase 2: API Layer

### Task 5: Define Types and Schemas

**Files:**
- Create: `app/types/models.ts`
- Create: `app/types/weather.ts`
- Create: `tests/unit/types.test.ts`

**Step 1: Write test for weather schema validation**

Create `tests/unit/schemas.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { WeatherResponseSchema, type WeatherResponse } from '../../app/types/weather'

describe('WeatherResponseSchema', () => {
  it('validates a correct response', () => {
    const validResponse = {
      latitude: 37.98,
      longitude: 23.73,
      generationtime_ms: 0.5,
      utc_offset_seconds: 0,
      hourly: {
        time: ['2025-12-26T00:00', '2025-12-26T01:00'],
        temperature_2m: [10, 11],
        precipitation: [0, 0.5],
        wind_speed_10m: [5, 6],
        cloud_cover: [20, 30],
        pressure_msl: [1013, 1014],
      },
    }

    const result = WeatherResponseSchema.safeParse(validResponse)
    expect(result.success).toBe(true)
  })

  it('rejects invalid response', () => {
    const invalidResponse = { latitude: 'invalid' }
    const result = WeatherResponseSchema.safeParse(invalidResponse)
    expect(result.success).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run`
Expected: FAIL - cannot find module weather

**Step 3: Create model types**

Create `app/types/models.ts`:

```typescript
export const MODELS = ['gfs', 'ecmwf', 'gem', 'ukmo'] as const

export type ModelId = (typeof MODELS)[number]

export const MODEL_CONFIG: Record<ModelId, { name: string; color: string; description: string }> = {
  gfs: { name: 'GFS', color: '#3b82f6', description: 'US Global Forecast System' },
  ecmwf: { name: 'ECMWF', color: '#ef4444', description: 'European Centre Model' },
  gem: { name: 'GEM', color: '#22c55e', description: 'Canadian Global Model' },
  ukmo: { name: 'UKMO', color: '#f59e0b', description: 'UK Met Office' },
}
```

**Step 4: Create weather schema**

Create `app/types/weather.ts`:

```typescript
import { z } from 'zod'

export const HourlyDataSchema = z.object({
  time: z.array(z.string()),
  temperature_2m: z.array(z.number()),
  precipitation: z.array(z.number()),
  wind_speed_10m: z.array(z.number()),
  cloud_cover: z.array(z.number()),
  pressure_msl: z.array(z.number()),
})

export const WeatherResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  hourly: HourlyDataSchema,
})

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>
export type HourlyData = z.infer<typeof HourlyDataSchema>
```

**Step 5: Run test to verify it passes**

Run: `pnpm test:run`
Expected: All tests pass

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add weather types and Zod schemas"
```

---

### Task 6: Create API Fetch Functions

**Files:**
- Create: `app/lib/api/weather.ts`
- Create: `tests/unit/api.test.ts`

**Step 1: Write test for fetchModelData**

Create `tests/unit/api.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchModelData, buildModelUrl } from '../../app/lib/api/weather'

describe('buildModelUrl', () => {
  it('builds correct URL for GFS model', () => {
    const url = buildModelUrl('gfs', 37.98, 23.73)
    expect(url).toContain('api.open-meteo.com/v1/gfs')
    expect(url).toContain('latitude=37.98')
    expect(url).toContain('longitude=23.73')
    expect(url).toContain('temperature_2m')
  })
})

describe('fetchModelData', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('fetches and validates model data', async () => {
    const mockResponse = {
      latitude: 37.98,
      longitude: 23.73,
      generationtime_ms: 0.5,
      utc_offset_seconds: 0,
      hourly: {
        time: ['2025-12-26T00:00'],
        temperature_2m: [10],
        precipitation: [0],
        wind_speed_10m: [5],
        cloud_cover: [20],
        pressure_msl: [1013],
      },
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchModelData('gfs', 37.98, 23.73)
    expect(result.latitude).toBe(37.98)
    expect(result.hourly.temperature_2m).toEqual([10])
  })

  it('throws on invalid response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ invalid: 'data' }),
    })

    await expect(fetchModelData('gfs', 0, 0)).rejects.toThrow()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run`
Expected: FAIL - cannot find weather module

**Step 3: Create API functions**

Create `app/lib/api/weather.ts`:

```typescript
import { WeatherResponseSchema, type WeatherResponse } from '../../types/weather'
import type { ModelId } from '../../types/models'

const HOURLY_PARAMS = [
  'temperature_2m',
  'precipitation',
  'wind_speed_10m',
  'cloud_cover',
  'pressure_msl',
].join(',')

const MODEL_ENDPOINTS: Record<ModelId, string> = {
  gfs: 'https://api.open-meteo.com/v1/gfs',
  ecmwf: 'https://api.open-meteo.com/v1/ecmwf',
  gem: 'https://api.open-meteo.com/v1/gem',
  ukmo: 'https://api.open-meteo.com/v1/ukmo',
}

export function buildModelUrl(model: ModelId, lat: number, lon: number): string {
  const base = MODEL_ENDPOINTS[model]
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: HOURLY_PARAMS,
    timezone: 'auto',
  })
  return `${base}?${params.toString()}`
}

export async function fetchModelData(
  model: ModelId,
  lat: number,
  lon: number
): Promise<WeatherResponse> {
  const url = buildModelUrl(model, lat, lon)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${model}: ${response.statusText}`)
  }

  const data = await response.json()
  return WeatherResponseSchema.parse(data)
}
```

**Step 4: Run tests to verify they pass**

Run: `pnpm test:run`
Expected: All tests pass

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Open-Meteo API fetch functions"
```

---

### Task 7: Create TanStack Query Hooks

**Files:**
- Create: `app/lib/hooks/use-model-data.ts`
- Modify: `app/routes/__root.tsx`

**Step 1: Set up QueryClient in root**

Modify `app/routes/__root.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import '../styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes
      gcTime: 1000 * 60 * 60 * 2, // 2 hours
    },
  },
})

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </QueryClientProvider>
  ),
})
```

**Step 2: Create useModelData hook**

Create `app/lib/hooks/use-model-data.ts`:

```typescript
import { useQueries } from '@tanstack/react-query'
import { fetchModelData } from '../api/weather'
import { MODELS, type ModelId } from '../../types/models'
import type { WeatherResponse } from '../../types/weather'

export interface ModelDataResult {
  model: ModelId
  data: WeatherResponse | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
}

export function useModelData(lat: number, lon: number): ModelDataResult[] {
  const queries = useQueries({
    queries: MODELS.map((model) => ({
      queryKey: ['forecast', model, lat, lon] as const,
      queryFn: () => fetchModelData(model, lat, lon),
      enabled: lat !== 0 && lon !== 0,
    })),
  })

  return queries.map((query, index) => ({
    model: MODELS[index],
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }))
}
```

**Step 3: Verify app still builds**

Run: `pnpm dev`
Expected: App runs without errors

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add TanStack Query setup and useModelData hook"
```

---

## Phase 3: UI Components

### Task 8: Create Base UI Components

**Files:**
- Create: `app/components/ui/card.tsx`
- Create: `app/components/ui/button.tsx`
- Create: `tests/components/card.test.tsx`

**Step 1: Write test for Card component**

Create `tests/components/card.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../../app/components/ui/card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Test content</Card>)
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('applies glass class', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content').parentElement
    expect(card?.className).toContain('glass')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run`
Expected: FAIL - cannot find card module

**Step 3: Create Card component**

Create `app/components/ui/card.tsx`:

```typescript
import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('glass p-4', className)}>
      {children}
    </div>
  )
}
```

**Step 4: Create Button component**

Create `app/components/ui/button.tsx`:

```typescript
import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-blue-500 hover:bg-blue-600 text-white',
        variant === 'secondary' && 'bg-white/10 hover:bg-white/20 text-white',
        variant === 'ghost' && 'hover:bg-white/5 text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Step 5: Run tests**

Run: `pnpm test:run`
Expected: All tests pass

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Card and Button UI components"
```

---

### Task 9: Create ModelCard Component

**Files:**
- Create: `app/components/features/model-card.tsx`
- Create: `tests/components/model-card.test.tsx`

**Step 1: Write test for ModelCard**

Create `tests/components/model-card.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModelCard } from '../../app/components/features/model-card'

describe('ModelCard', () => {
  it('displays model name', () => {
    render(<ModelCard model="gfs" temperature={15} isLoading={false} />)
    expect(screen.getByText('GFS')).toBeInTheDocument()
  })

  it('displays temperature', () => {
    render(<ModelCard model="ecmwf" temperature={22} isLoading={false} />)
    expect(screen.getByText('22°C')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<ModelCard model="gem" isLoading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run`
Expected: FAIL - cannot find model-card module

**Step 3: Create ModelCard component**

Create `app/components/features/model-card.tsx`:

```typescript
import { Card } from '../ui/card'
import { MODEL_CONFIG, type ModelId } from '../../types/models'

interface ModelCardProps {
  model: ModelId
  temperature?: number
  isLoading: boolean
  isError?: boolean
}

export function ModelCard({ model, temperature, isLoading, isError }: ModelCardProps) {
  const config = MODEL_CONFIG[model]

  return (
    <Card className="min-w-[140px]">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <span className="font-semibold">{config.name}</span>
      </div>

      {isLoading ? (
        <p className="text-2xl text-white/50">Loading...</p>
      ) : isError ? (
        <p className="text-2xl text-red-400">Error</p>
      ) : (
        <p className="text-3xl font-bold">
          {temperature !== undefined ? `${Math.round(temperature)}°C` : '--'}
        </p>
      )}
    </Card>
  )
}
```

**Step 4: Run tests**

Run: `pnpm test:run`
Expected: All tests pass

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ModelCard component"
```

---

### Task 10: Create ComparisonChart Component

**Files:**
- Create: `app/components/features/comparison-chart.tsx`
- Create: `app/lib/utils/chart-data.ts`

**Step 1: Create chart data utility**

Create `app/lib/utils/chart-data.ts`:

```typescript
import type { WeatherResponse } from '../../types/weather'
import type { ModelId } from '../../types/models'

export interface ChartDataPoint {
  time: string
  [key: string]: number | string
}

export function transformToChartData(
  models: { model: ModelId; data: WeatherResponse | undefined }[],
  variable: 'temperature_2m' | 'precipitation' | 'wind_speed_10m' | 'pressure_msl'
): ChartDataPoint[] {
  const firstValidModel = models.find((m) => m.data)
  if (!firstValidModel?.data) return []

  const times = firstValidModel.data.hourly.time

  return times.map((time, index) => {
    const point: ChartDataPoint = {
      time: new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        day: 'numeric',
        month: 'short',
      }),
    }

    models.forEach(({ model, data }) => {
      if (data) {
        point[model] = data.hourly[variable][index]
      }
    })

    return point
  })
}
```

**Step 2: Create ComparisonChart component**

Create `app/components/features/comparison-chart.tsx`:

```typescript
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '../ui/card'
import { MODEL_CONFIG, MODELS } from '../../types/models'
import { transformToChartData, type ChartDataPoint } from '../../lib/utils/chart-data'
import type { WeatherResponse } from '../../types/weather'
import type { ModelId } from '../../types/models'

interface ComparisonChartProps {
  models: { model: ModelId; data: WeatherResponse | undefined }[]
  variable: 'temperature_2m' | 'precipitation' | 'wind_speed_10m' | 'pressure_msl'
  title: string
  unit: string
}

export function ComparisonChart({ models, variable, title, unit }: ComparisonChartProps) {
  const chartData = transformToChartData(models, variable)

  if (chartData.length === 0) {
    return (
      <Card>
        <p className="text-white/50 text-center py-8">No data available</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="time"
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            unit={unit}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f26',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {MODELS.map((model) => (
            <Line
              key={model}
              type="monotone"
              dataKey={model}
              name={MODEL_CONFIG[model].name}
              stroke={MODEL_CONFIG[model].color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
```

**Step 3: Verify app builds**

Run: `pnpm dev`
Expected: No errors

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add ComparisonChart component with Recharts"
```

---

## Phase 4: Routes and Pages

### Task 11: Create Home Page with Location Search

**Files:**
- Modify: `app/routes/index.tsx`
- Create: `app/components/features/location-search.tsx`

**Step 1: Create LocationSearch component**

Create `app/components/features/location-search.tsx`:

```typescript
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'

interface SearchResult {
  name: string
  lat: number
  lon: number
  country: string
}

export function LocationSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsSearching(true)

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`
      )
      const data = await res.json()
      setResults(
        data.results?.map((r: any) => ({
          name: r.name,
          lat: r.latitude,
          lon: r.longitude,
          country: r.country,
        })) || []
      )
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectLocation = (result: SearchResult) => {
    navigate({
      to: '/compare/$lat/$lon',
      params: { lat: result.lat.toString(), lon: result.lon.toString() },
    })
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for a city..."
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? '...' : 'Search'}
        </Button>
      </div>

      {results.length > 0 && (
        <ul className="mt-2 glass divide-y divide-white/10">
          {results.map((result, index) => (
            <li key={index}>
              <button
                onClick={() => selectLocation(result)}
                className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-medium">{result.name}</span>
                <span className="text-white/50 ml-2">{result.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

**Step 2: Update home page**

Modify `app/routes/index.tsx`:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { LocationSearch } from '../components/features/location-search'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-2">Nimbus</h1>
      <p className="text-white/60 mb-8">Compare weather models in one view</p>
      <LocationSearch />
    </div>
  )
}
```

**Step 3: Verify home page works**

Run: `pnpm dev`
Expected: See Nimbus title with search box at http://localhost:3000

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add home page with location search"
```

---

### Task 12: Create Compare Route

**Files:**
- Create: `app/routes/compare.$lat.$lon.tsx`

**Step 1: Create the compare route**

Create `app/routes/compare.$lat.$lon.tsx`:

```typescript
import { createFileRoute, Link } from '@tanstack/react-router'
import { useModelData } from '../lib/hooks/use-model-data'
import { ModelCard } from '../components/features/model-card'
import { ComparisonChart } from '../components/features/comparison-chart'
import { MODELS } from '../types/models'

export const Route = createFileRoute('/compare/$lat/$lon')({
  component: ComparePage,
})

function ComparePage() {
  const { lat, lon } = Route.useParams()
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lon)

  const modelResults = useModelData(latitude, longitude)

  const getCurrentTemperature = (index: number) => {
    const result = modelResults[index]
    if (!result.data) return undefined
    return result.data.hourly.temperature_2m[0]
  }

  const chartModels = modelResults.map((r) => ({ model: r.model, data: r.data }))

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <Link to="/" className="text-white/50 hover:text-white transition-colors">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            Forecast Comparison
          </h1>
          <p className="text-white/60">
            {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E
          </p>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Current Conditions</h2>
        <div className="flex flex-wrap gap-4">
          {MODELS.map((model, index) => (
            <ModelCard
              key={model}
              model={model}
              temperature={getCurrentTemperature(index)}
              isLoading={modelResults[index].isLoading}
              isError={modelResults[index].isError}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <ComparisonChart
          models={chartModels}
          variable="temperature_2m"
          title="Temperature"
          unit="°C"
        />
        <ComparisonChart
          models={chartModels}
          variable="precipitation"
          title="Precipitation"
          unit="mm"
        />
        <ComparisonChart
          models={chartModels}
          variable="wind_speed_10m"
          title="Wind Speed"
          unit="km/h"
        />
      </section>
    </div>
  )
}
```

**Step 2: Test the full flow**

Run: `pnpm dev`
1. Go to http://localhost:3000
2. Search for "Athens"
3. Click result
4. Should navigate to /compare/37.98/23.73 and show model cards + charts

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add compare route with model cards and charts"
```

---

## Phase 5: User Features

### Task 13: Add localStorage for Saved Locations

**Files:**
- Create: `app/lib/storage.ts`
- Create: `tests/unit/storage.test.ts`

**Step 1: Write test for storage**

Create `tests/unit/storage.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { saveLocation, getSavedLocations, removeLocation } from '../../app/lib/storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and retrieves locations', () => {
    saveLocation({ id: '1', name: 'Athens', lat: 37.98, lon: 23.73, isDefault: true })
    const locations = getSavedLocations()
    expect(locations).toHaveLength(1)
    expect(locations[0].name).toBe('Athens')
  })

  it('removes a location', () => {
    saveLocation({ id: '1', name: 'Athens', lat: 37.98, lon: 23.73, isDefault: false })
    saveLocation({ id: '2', name: 'Paris', lat: 48.85, lon: 2.35, isDefault: false })
    removeLocation('1')
    const locations = getSavedLocations()
    expect(locations).toHaveLength(1)
    expect(locations[0].name).toBe('Paris')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run`
Expected: FAIL - cannot find storage module

**Step 3: Create storage module**

Create `app/lib/storage.ts`:

```typescript
export interface SavedLocation {
  id: string
  name: string
  lat: number
  lon: number
  isDefault: boolean
}

export interface UserPreferences {
  units: 'metric' | 'imperial'
  defaultModels: string[]
}

const LOCATIONS_KEY = 'nimbus_locations'
const PREFERENCES_KEY = 'nimbus_preferences'

export function getSavedLocations(): SavedLocation[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(LOCATIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveLocation(location: SavedLocation): void {
  const locations = getSavedLocations()
  const existing = locations.findIndex((l) => l.id === location.id)

  if (existing >= 0) {
    locations[existing] = location
  } else {
    locations.push(location)
  }

  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations))
}

export function removeLocation(id: string): void {
  const locations = getSavedLocations().filter((l) => l.id !== id)
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations))
}

export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return { units: 'metric', defaultModels: ['gfs', 'ecmwf', 'gem', 'ukmo'] }
  }
  const stored = localStorage.getItem(PREFERENCES_KEY)
  return stored
    ? JSON.parse(stored)
    : { units: 'metric', defaultModels: ['gfs', 'ecmwf', 'gem', 'ukmo'] }
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
}
```

**Step 4: Run tests**

Run: `pnpm test:run`
Expected: All tests pass

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add localStorage for saved locations"
```

---

### Task 14: Add SavedLocations Sidebar Component

**Files:**
- Create: `app/components/features/saved-locations.tsx`
- Modify: `app/routes/compare.$lat.$lon.tsx`

**Step 1: Create SavedLocations component**

Create `app/components/features/saved-locations.tsx`:

```typescript
import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { getSavedLocations, saveLocation, removeLocation, type SavedLocation } from '../../lib/storage'

interface SavedLocationsProps {
  currentLat?: number
  currentLon?: number
  currentName?: string
}

export function SavedLocations({ currentLat, currentLon, currentName }: SavedLocationsProps) {
  const [locations, setLocations] = useState<SavedLocation[]>([])

  useEffect(() => {
    setLocations(getSavedLocations())
  }, [])

  const handleSaveCurrent = () => {
    if (currentLat === undefined || currentLon === undefined) return

    const newLocation: SavedLocation = {
      id: `${currentLat}-${currentLon}`,
      name: currentName || `${currentLat.toFixed(2)}, ${currentLon.toFixed(2)}`,
      lat: currentLat,
      lon: currentLon,
      isDefault: locations.length === 0,
    }

    saveLocation(newLocation)
    setLocations(getSavedLocations())
  }

  const handleRemove = (id: string) => {
    removeLocation(id)
    setLocations(getSavedLocations())
  }

  const isCurrentSaved = locations.some(
    (l) => l.lat === currentLat && l.lon === currentLon
  )

  return (
    <Card className="w-64">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Saved Locations</h3>
        {!isCurrentSaved && currentLat && (
          <Button variant="ghost" onClick={handleSaveCurrent} className="text-sm">
            + Save
          </Button>
        )}
      </div>

      {locations.length === 0 ? (
        <p className="text-white/50 text-sm">No saved locations</p>
      ) : (
        <ul className="space-y-2">
          {locations.map((location) => (
            <li key={location.id} className="flex items-center justify-between">
              <Link
                to="/compare/$lat/$lon"
                params={{ lat: location.lat.toString(), lon: location.lon.toString() }}
                className="text-sm hover:text-blue-400 transition-colors truncate flex-1"
              >
                {location.name}
              </Link>
              <button
                onClick={() => handleRemove(location.id)}
                className="text-white/30 hover:text-red-400 ml-2"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
```

**Step 2: Add sidebar to compare page**

Update `app/routes/compare.$lat.$lon.tsx` to include the sidebar:

Add import at top:
```typescript
import { SavedLocations } from '../components/features/saved-locations'
```

Wrap content in a flex layout with sidebar:
```typescript
function ComparePage() {
  // ... existing code ...

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 p-4 border-r border-white/10">
        <Link to="/" className="text-xl font-bold block mb-6">Nimbus</Link>
        <SavedLocations
          currentLat={latitude}
          currentLon={longitude}
        />
      </aside>

      <main className="flex-1 p-6">
        {/* Move existing header and sections here */}
      </main>
    </div>
  )
}
```

**Step 3: Test saving locations**

Run: `pnpm dev`
1. Navigate to a location
2. Click "Save" button
3. Location should appear in sidebar
4. Should persist on page refresh

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add saved locations sidebar with localStorage"
```

---

## Phase 6: Polish

### Task 15: Add Loading States and Error Handling

**Files:**
- Create: `app/components/ui/skeleton.tsx`
- Modify: `app/routes/compare.$lat.$lon.tsx`

**Step 1: Create Skeleton component**

Create `app/components/ui/skeleton.tsx`:

```typescript
import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-white/10 rounded',
        className
      )}
    />
  )
}
```

**Step 2: Add error boundary handling**

Add to compare page - show user-friendly error state when all models fail.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add loading skeletons and error handling"
```

---

### Task 16: Final Testing and Cleanup

**Step 1: Run all tests**

Run: `pnpm test:run`
Expected: All tests pass

**Step 2: Type check**

Run: `pnpm tsc --noEmit`
Expected: No type errors

**Step 3: Build for production**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and type fixes"
```

---

## Summary

After completing all tasks, Nimbus will have:

- **Home page** with location search using Open-Meteo geocoding
- **Compare page** showing 4 weather models side-by-side
- **Model cards** displaying current temperature per model
- **Comparison charts** for temperature, precipitation, wind
- **Saved locations** persisted in localStorage
- **Dark glassmorphism UI** with Tailwind v4
- **Type-safe API** with Zod validation
- **Tests** for utilities, schemas, and components

Total: ~16 tasks, each 5-15 minutes
