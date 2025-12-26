# UI Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Nimbus with a "Storm Observatory" aesthetic: header with autocomplete search, run selector, run image viewer from Tropical Tidbits, and refined dark UI.

**Architecture:** Update global styles with new design system, create Header component with autocomplete, add RunSelector and RunImageViewer components, integrate into compare page, remove TanStack demo routes.

**Tech Stack:** TanStack Start, TanStack Router, shadcn/ui, Tailwind CSS v4, Google Fonts

---

## Phase 1: Cleanup & Design System

### Task 1: Remove Demo Routes

**Files:**
- Delete: `src/routes/demo/` (entire folder)

**Step 1: Delete demo folder**

Run:
```bash
cd /Users/ipsomadelis/Desktop/Personal/projects/github/nimbus
rm -rf src/routes/demo
```

**Step 2: Verify route tree regenerates**

Run: `pnpm dev` (briefly, then stop)
Expected: No errors, demo routes gone from routeTree.gen.ts

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove TanStack Start demo routes"
```

---

### Task 2: Update Design System

**Files:**
- Modify: `src/styles.css`

**Step 1: Update styles with new design system**

Replace content of `src/styles.css` with:

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

@theme {
  /* Atmospheric Darks */
  --color-void: #05080d;
  --color-abyss: #0a0f18;
  --color-deep: #0f1419;
  --color-surface: #151c25;
  --color-elevated: #1c2530;

  /* Model Colors */
  --color-gfs: #3b9eff;
  --color-ecmwf: #ff5757;
  --color-gem: #4ade80;
  --color-ukmo: #fbbf24;

  /* Accent */
  --color-accent: #3b9eff;
  --color-accent-glow: rgba(59, 158, 255, 0.15);

  /* Font families */
  --font-display: 'JetBrains Mono', monospace;
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}

body {
  font-family: var(--font-body);
  background:
    radial-gradient(ellipse at 20% 0%, rgba(59, 158, 255, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(251, 191, 36, 0.04) 0%, transparent 50%),
    var(--color-void);
  color: #f0f4f8;
  -webkit-font-smoothing: antialiased;
}

/* Glass Panel */
.glass {
  background: rgba(15, 20, 26, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.03),
    0 20px 40px rgba(0, 0, 0, 0.4);
}

.glass-subtle {
  background: rgba(15, 20, 26, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 0.75rem;
}

/* Glow Effects */
.glow-accent {
  box-shadow: 0 0 20px var(--color-accent-glow), 0 0 40px var(--color-accent-glow);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px var(--color-accent-glow); }
  50% { box-shadow: 0 0 30px var(--color-accent-glow), 0 0 50px var(--color-accent-glow); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Staggered children */
.stagger > * {
  animation: fadeIn 0.4s ease-out backwards;
}
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 50ms; }
.stagger > *:nth-child(3) { animation-delay: 100ms; }
.stagger > *:nth-child(4) { animation-delay: 150ms; }
.stagger > *:nth-child(5) { animation-delay: 200ms; }

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

**Step 2: Verify styles apply**

Run: `pnpm dev`
Check: Background should have subtle gradient, fonts should load

**Step 3: Commit**

```bash
git add -A
git commit -m "style: update design system with Storm Observatory theme"
```

---

## Phase 2: Header Component

### Task 3: Create Header Component

**Files:**
- Create: `src/components/layout/header.tsx`

**Step 1: Create header component**

Create `src/components/layout/header.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'

interface SearchResult {
  name: string
  lat: number
  lon: number
  country: string
  admin1?: string
}

export function Header() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    // Debounce search
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`
        )
        const data = await res.json()
        const mapped = data.results?.map((r: any) => ({
          name: r.name,
          lat: r.latitude,
          lon: r.longitude,
          country: r.country,
          admin1: r.admin1,
        })) || []
        setResults(mapped)
        setIsOpen(mapped.length > 0)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutRef.current)
  }, [query])

  const selectResult = (result: SearchResult) => {
    setQuery('')
    setIsOpen(false)
    navigate({
      to: '/compare/$lat/$lon',
      params: { lat: result.lat.toString(), lon: result.lon.toString() },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      selectResult(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 glass-subtle border-b border-white/5">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">☁️</span>
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Nimbus
          </span>
        </Link>

        {/* Search */}
        <div className="relative w-full max-w-md mx-8">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 150)}
              placeholder="Search location..."
              className="w-full pl-10 pr-4 h-10 bg-white/5 border-white/10 rounded-full text-sm placeholder:text-white/40 focus:border-accent focus:ring-1 focus:ring-accent/50"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass overflow-hidden animate-fade-in">
              {results.map((result, index) => (
                <button
                  key={`${result.lat}-${result.lon}`}
                  onClick={() => selectResult(result)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                    index === selectedIndex
                      ? 'bg-accent/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div>
                    <span className="font-medium">{result.name}</span>
                    {result.admin1 && (
                      <span className="text-white/40 ml-1">{result.admin1},</span>
                    )}
                  </div>
                  <span className="text-white/40 text-sm">{result.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings (placeholder) */}
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <svg
            className="w-5 h-5 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
```

**Step 2: Verify it builds**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Header component with autocomplete search"
```

---

### Task 4: Integrate Header into Root Layout

**Files:**
- Modify: `src/routes/__root.tsx`

**Step 1: Update root to include Header**

Read the current file, then update to add Header:

Add import at top:
```tsx
import { Header } from '../components/layout/header'
```

Update the component to include Header and add padding for fixed header:

The root component should render:
```tsx
<QueryClientProvider client={queryClient}>
  <Header />
  <div className="pt-16 min-h-screen">
    <Outlet />
  </div>
</QueryClientProvider>
```

**Step 2: Update home page to remove duplicate title if needed**

Check `src/routes/index.tsx` and simplify since header now has branding.

**Step 3: Verify with dev server**

Run: `pnpm dev`
Check: Header appears at top with search bar

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: integrate Header into root layout"
```

---

## Phase 3: Run Selector & Image Viewer

### Task 5: Create Run Utilities

**Files:**
- Create: `src/lib/utils/runs.ts`

**Step 1: Create run utility functions**

Create `src/lib/utils/runs.ts`:

```typescript
export interface RunInfo {
  id: string        // YYYYMMDDHH
  date: Date
  hour: number      // 0, 6, 12, 18
  label: string     // "00z · Dec 26"
}

export function getLatestRun(): RunInfo {
  const now = new Date()
  const utcHour = now.getUTCHours()

  // Runs available ~5 hours after initialization
  let runHour: number
  let dayOffset = 0

  if (utcHour >= 17) {
    runHour = 12
  } else if (utcHour >= 11) {
    runHour = 6
  } else if (utcHour >= 5) {
    runHour = 0
  } else {
    runHour = 18
    dayOffset = -1
  }

  const runDate = new Date(now)
  runDate.setUTCDate(runDate.getUTCDate() + dayOffset)
  runDate.setUTCHours(runHour, 0, 0, 0)

  return formatRunInfo(runDate, runHour)
}

export function getPreviousRuns(count: number = 4): RunInfo[] {
  const latest = getLatestRun()
  const runs: RunInfo[] = []

  let currentDate = new Date(latest.date)
  let currentHour = latest.hour

  for (let i = 0; i < count; i++) {
    // Go back 6 hours
    currentHour -= 6
    if (currentHour < 0) {
      currentHour = 18
      currentDate.setUTCDate(currentDate.getUTCDate() - 1)
    }

    runs.push(formatRunInfo(new Date(currentDate), currentHour))
  }

  return runs
}

function formatRunInfo(date: Date, hour: number): RunInfo {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hourStr = String(hour).padStart(2, '0')

  const monthName = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
  const dayNum = date.getUTCDate()

  return {
    id: `${year}${month}${day}${hourStr}`,
    date,
    hour,
    label: `${hourStr}z · ${monthName} ${dayNum}`,
  }
}

export function detectRegion(lat: number, lon: number): string {
  // Europe
  if (lat >= 35 && lat <= 72 && lon >= -12 && lon <= 45) {
    return 'europe'
  }
  // Continental US
  if (lat >= 24 && lat <= 50 && lon >= -130 && lon <= -60) {
    return 'us'
  }
  // Default to North America
  return 'namer'
}

export const CHART_PARAMS = [
  { id: 'mslp_pcpn_frzn', label: 'Pressure', shortLabel: 'MSLP' },
  { id: 'T850', label: 'Temp 850mb', shortLabel: '850' },
  { id: 'apcpn', label: 'Precipitation', shortLabel: 'Precip' },
  { id: '10mwind', label: 'Wind', shortLabel: 'Wind' },
] as const

export type ChartParam = typeof CHART_PARAMS[number]['id']

export function buildChartUrl(
  model: string,
  runId: string,
  param: string,
  region: string,
  hour: number
): string {
  return `https://www.tropicaltidbits.com/analysis/models/${model}/${runId}/${model}_${param}_${region}_${hour}.png`
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add run detection and chart URL utilities"
```

---

### Task 6: Create Run Selector Component

**Files:**
- Create: `src/components/features/run-selector.tsx`

**Step 1: Create run selector component**

Create `src/components/features/run-selector.tsx`:

```tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MODEL_CONFIG, MODELS, type ModelId } from '../../types/models'
import { type RunInfo } from '../../lib/utils/runs'

interface RunSelectorProps {
  selectedModel: ModelId
  onModelChange: (model: ModelId) => void
  currentRun: RunInfo
  previousRuns: RunInfo[]
  selectedRun: RunInfo
  onRunChange: (run: RunInfo) => void
}

export function RunSelector({
  selectedModel,
  onModelChange,
  currentRun,
  previousRuns,
  selectedRun,
  onRunChange,
}: RunSelectorProps) {
  const allRuns = [currentRun, ...previousRuns]

  return (
    <Card className="glass">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Model Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Model</label>
            <div className="flex gap-1">
              {MODELS.map((model) => (
                <Button
                  key={model}
                  variant={selectedModel === model ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onModelChange(model)}
                  className={`relative ${
                    selectedModel === model
                      ? 'bg-white/10 border border-white/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: MODEL_CONFIG[model].color }}
                  />
                  {MODEL_CONFIG[model].name}
                </Button>
              ))}
            </div>
          </div>

          {/* Run Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Run</label>
            <div className="flex gap-1 overflow-x-auto">
              {allRuns.map((run, index) => (
                <Button
                  key={run.id}
                  variant={selectedRun.id === run.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onRunChange(run)}
                  className={`whitespace-nowrap ${
                    selectedRun.id === run.id
                      ? 'bg-accent/20 border border-accent/40 text-accent'
                      : 'hover:bg-white/5'
                  } ${index === 0 ? 'font-medium' : ''}`}
                >
                  <span style={{ fontFamily: 'var(--font-display)' }}>
                    {run.label}
                  </span>
                  {index === 0 && (
                    <span className="ml-2 text-[10px] bg-accent/20 px-1.5 py-0.5 rounded text-accent">
                      Latest
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add RunSelector component"
```

---

### Task 7: Create Run Image Viewer Component

**Files:**
- Create: `src/components/features/run-image-viewer.tsx`

**Step 1: Create image viewer component**

Create `src/components/features/run-image-viewer.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { CHART_PARAMS, buildChartUrl, type ChartParam } from '../../lib/utils/runs'
import type { ModelId } from '../../types/models'

interface RunImageViewerProps {
  model: ModelId
  runId: string
  region: string
}

export function RunImageViewer({ model, runId, region }: RunImageViewerProps) {
  const [selectedParam, setSelectedParam] = useState<ChartParam>('mslp_pcpn_frzn')
  const [hour, setHour] = useState(24)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const imageUrl = buildChartUrl(model, runId, selectedParam, region, hour)

  const maxHours = model === 'gfs' ? 384 : 240
  const hourStep = 3

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleParamChange = (param: ChartParam) => {
    setSelectedParam(param)
    setIsLoading(true)
    setHasError(false)
  }

  const handleHourChange = (newHour: number) => {
    setHour(newHour)
    setIsLoading(true)
    setHasError(false)
  }

  const formatHourLabel = (h: number) => {
    if (h === 0) return 'Analysis'
    return `+${h}h`
  }

  return (
    <Card className="glass">
      <CardContent className="p-4 space-y-4">
        {/* Parameter Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit">
          {CHART_PARAMS.map((param) => (
            <Button
              key={param.id}
              variant="ghost"
              size="sm"
              onClick={() => handleParamChange(param.id)}
              className={`${
                selectedParam === param.id
                  ? 'bg-accent text-white shadow-lg'
                  : 'hover:bg-white/10'
              }`}
            >
              {param.label}
            </Button>
          ))}
        </div>

        {/* Image Container */}
        <div className="relative aspect-video bg-black/20 rounded-xl overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}

          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Chart not available</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setIsLoading(true); setHasError(false); }}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : (
            <img
              key={imageUrl}
              src={imageUrl}
              alt={`${model.toUpperCase()} ${selectedParam} forecast`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>

        {/* Hour Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/40">Forecast Hour</span>
            <span
              className="font-medium text-accent"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatHourLabel(hour)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={maxHours}
            step={hourStep}
            value={hour}
            onChange={(e) => handleHourChange(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-accent
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-accent/30
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-accent
              [&::-moz-range-thumb]:border-0"
          />

          <div className="flex justify-between text-xs text-white/30">
            <span>0h</span>
            <span>{maxHours}h</span>
          </div>
        </div>

        {/* Attribution */}
        <p className="text-xs text-white/30 text-center">
          Charts by{' '}
          <a
            href="https://www.tropicaltidbits.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent/60 hover:text-accent transition-colors"
          >
            Tropical Tidbits
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add RunImageViewer component with hour slider"
```

---

## Phase 4: Update Compare Page

### Task 8: Update Compare Page Layout

**Files:**
- Modify: `src/routes/compare.$lat.$lon.tsx`

**Step 1: Update compare page with new components**

Rewrite `src/routes/compare.$lat.$lon.tsx` to integrate all new components:

```tsx
import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useModelData } from '../lib/hooks/use-model-data'
import { ModelCard } from '../components/features/model-card'
import { ComparisonChart } from '../components/features/comparison-chart'
import { SavedLocations } from '../components/features/saved-locations'
import { RunSelector } from '../components/features/run-selector'
import { RunImageViewer } from '../components/features/run-image-viewer'
import { MODELS, type ModelId } from '../types/models'
import { getLatestRun, getPreviousRuns, detectRegion } from '../lib/utils/runs'

export const Route = createFileRoute('/compare/$lat/$lon')({
  component: ComparePage,
})

function ComparePage() {
  const { lat, lon } = Route.useParams()
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lon)

  // Run state
  const [selectedModel, setSelectedModel] = useState<ModelId>('gfs')
  const currentRun = getLatestRun()
  const previousRuns = getPreviousRuns(4)
  const [selectedRun, setSelectedRun] = useState(currentRun)
  const region = detectRegion(latitude, longitude)

  // Model data
  const modelResults = useModelData(latitude, longitude)

  const getCurrentTemperature = (index: number) => {
    const result = modelResults[index]
    if (!result.data) return undefined
    return result.data.hourly.temperature_2m[0]
  }

  const chartModels = modelResults.map((r) => ({ model: r.model, data: r.data }))

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 p-4 border-r border-white/5 flex flex-col gap-4">
        <SavedLocations
          currentLat={latitude}
          currentLon={longitude}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Location Header */}
        <header>
          <p className="text-white/40 text-sm mb-1">Forecast for</p>
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E
          </h1>
        </header>

        {/* Model Cards */}
        <section>
          <h2 className="text-sm text-white/40 uppercase tracking-wider mb-3">
            Current Conditions
          </h2>
          <div className="flex flex-wrap gap-4 stagger">
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

        {/* Run Selector */}
        <section>
          <h2 className="text-sm text-white/40 uppercase tracking-wider mb-3">
            Model Run
          </h2>
          <RunSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            currentRun={currentRun}
            previousRuns={previousRuns}
            selectedRun={selectedRun}
            onRunChange={setSelectedRun}
          />
        </section>

        {/* Run Images */}
        <section>
          <h2 className="text-sm text-white/40 uppercase tracking-wider mb-3">
            Forecast Charts
          </h2>
          <RunImageViewer
            model={selectedModel}
            runId={selectedRun.id}
            region={region}
          />
        </section>

        {/* Comparison Charts */}
        <section>
          <h2 className="text-sm text-white/40 uppercase tracking-wider mb-3">
            Model Comparison
          </h2>
          <div className="space-y-4">
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
          </div>
        </section>
      </main>
    </div>
  )
}
```

**Step 2: Verify everything works**

Run: `pnpm dev`
1. Go to http://localhost:3000
2. Search for a city
3. See new layout with run selector and image viewer

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: update compare page with run selector and image viewer"
```

---

### Task 9: Update Home Page

**Files:**
- Modify: `src/routes/index.tsx`

**Step 1: Simplify home page (header now has search)**

Update `src/routes/index.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8">
      <div className="text-center animate-fade-in">
        <span className="text-6xl mb-4 block">☁️</span>
        <h1
          className="text-5xl font-bold mb-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Nimbus
        </h1>
        <p className="text-white/50 text-lg mb-8 max-w-md">
          Compare weather models from GFS, ECMWF, GEM, and UKMO in one beautiful interface.
        </p>
        <p className="text-white/30 text-sm">
          Use the search bar above to find a location
        </p>
      </div>
    </div>
  )
}
```

**Step 2: Verify**

Run: `pnpm dev`
Check: Home page shows simplified content, search in header works

**Step 3: Commit**

```bash
git add -A
git commit -m "style: simplify home page, search now in header"
```

---

## Phase 5: Final Polish

### Task 10: Run Tests and Final Build

**Step 1: Run all tests**

Run: `pnpm test:run`
Expected: All tests pass (some may need updates)

**Step 2: Run type check**

Run: `pnpm tsc --noEmit`
Expected: No type errors

**Step 3: Production build**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final polish and fixes"
```

---

## Summary

After completing all tasks, Nimbus will have:

- **Header** with autocomplete search, logo, settings placeholder
- **Run Selector** to pick model and run time
- **Run Image Viewer** with Tropical Tidbits charts, tabs, and hour slider
- **Updated Compare Page** with new layout and components
- **Storm Observatory** dark aesthetic with refined typography
- **Removed** TanStack Start demo routes

Total: 10 tasks
