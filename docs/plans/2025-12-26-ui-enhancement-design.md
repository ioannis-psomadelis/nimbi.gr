# Nimbus UI Enhancement Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Nimbus into a distinctive, atmospheric weather observatory interface with header redesign, autocomplete search, run image viewer, and refined aesthetics.

**Aesthetic Direction:** "Storm Observatory" - Cinematic dark UI resembling a professional meteorologist's command center. Deep atmospheric blacks, electric accents, layered glass panels, sharp technical typography.

---

## Design System

### Typography

**Display Font:** `"JetBrains Mono"` - Technical, sharp, monospace for data
**Heading Font:** `"Space Grotesk"` → Replace with `"Outfit"` - Modern geometric sans
**Body Font:** `"Inter"` → Replace with `"Plus Jakarta Sans"` - Refined, readable

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
```

### Color Palette

```css
:root {
  /* Atmospheric Darks */
  --void: #05080d;
  --abyss: #0a0f18;
  --deep: #0f1419;
  --surface: #151c25;
  --elevated: #1c2530;

  /* Glass Effects */
  --glass-bg: rgba(15, 20, 26, 0.7);
  --glass-border: rgba(255, 255, 255, 0.06);
  --glass-highlight: rgba(255, 255, 255, 0.03);

  /* Model Colors (Electric) */
  --gfs: #3b9eff;      /* Electric Blue */
  --ecmwf: #ff5757;    /* Coral Red */
  --gem: #4ade80;      /* Neon Green */
  --ukmo: #fbbf24;     /* Amber */

  /* Accent */
  --accent: #3b9eff;
  --accent-glow: rgba(59, 158, 255, 0.15);

  /* Text */
  --text-primary: #f0f4f8;
  --text-secondary: rgba(240, 244, 248, 0.6);
  --text-muted: rgba(240, 244, 248, 0.35);
}
```

### Effects

**Glass Panels:**
```css
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 0 0 1px var(--glass-highlight) inset,
    0 20px 40px rgba(0, 0, 0, 0.4);
}
```

**Glow Effects:**
```css
.glow-accent {
  box-shadow:
    0 0 20px var(--accent-glow),
    0 0 40px var(--accent-glow);
}
```

**Atmospheric Background:**
```css
.atmosphere {
  background:
    radial-gradient(ellipse at 20% 0%, rgba(59, 158, 255, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(251, 191, 36, 0.05) 0%, transparent 50%),
    var(--void);
}
```

---

## Component Designs

### 1. Header Component

**File:** `src/components/layout/header.tsx`

```
┌─────────────────────────────────────────────────────────────────────┐
│ ░░                                                              ░░░ │
│   ☁ NIMBUS          [🔍 Search location...]              [⚙]       │
│ ░░                                                              ░░░ │
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Height: 64px
- Position: Fixed top, z-index 50
- Background: Glass panel with subtle top glow
- Logo: Custom wordmark with subtle gradient

**Search Bar:**
- Width: 400px centered
- Rounded-full (pill shape)
- Glass background darker than header
- Placeholder: "Search location..." with search icon
- Focus: Accent glow ring

**Autocomplete Dropdown:**
- Appears below search on typing (debounced 300ms)
- Glass panel with results
- Each result: City name + Country (muted)
- Hover: Subtle highlight
- Max 5 results

### 2. Run Selector Component

**File:** `src/components/features/run-selector.tsx`

```
┌────────────────────────────────────────────────────────────────┐
│  Model                    Current Run                          │
│  ┌─────────────┐         ┌──────────────────────┐              │
│  │ ● GFS    ▾ │         │ 00z · Dec 26, 2025 ▾│              │
│  └─────────────┘         └──────────────────────┘              │
│                                                                 │
│  Previous Runs                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          │
│  │ 18z  │ │ 12z  │ │ 06z  │ │ 00z  │  ← Dec 25               │
│  └──────┘ └──────┘ └──────┘ └──────┘                          │
└────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Glass panel container
- Model selector: Dropdown with colored dot indicator
- Run selector: Shows date + time, dropdown for history
- Previous runs: Pill buttons, horizontal scroll if needed
- Active run: Accent border glow

### 3. Run Images Viewer

**File:** `src/components/features/run-image-viewer.tsx`

```
┌────────────────────────────────────────────────────────────────┐
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Pressure │ │ Temp 850 │ │  Precip  │ │   Wind   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │                                                          │  │
│  │              Weather Chart Image                         │  │
│  │              (Tropical Tidbits)                          │  │
│  │                                                          │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Forecast Hour                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ +0h ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ +384h │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Currently showing: +24h (Valid: Dec 27, 00z)                  │
│                                                                 │
│  📊 Charts by Tropical Tidbits                                 │
└────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Tabs: Pill-style, active has accent background + glow
- Image container: 16:9 aspect ratio, rounded-xl, subtle border
- Loading: Skeleton pulse animation
- Error: Fallback message with retry button
- Slider: Custom styled, accent color thumb with glow
- Hour display: Monospace font (JetBrains Mono)
- Attribution: Muted link at bottom

**Image Parameters:**

| Tab | Tropical Tidbits Param |
|-----|----------------------|
| Pressure | `mslp_pcpn_frzn` |
| Temp 850 | `T850` |
| Precip | `apcpn` |
| Wind | `10mwind` |

**Regions (auto-detect from coordinates):**
- Europe: `europe` (lat 35-70, lon -10-40)
- US: `us` (lat 25-50, lon -125 to -65)
- Default: `namer`

### 4. Updated Compare Page Layout

**File:** `src/routes/compare.$lat.$lon.tsx`

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│   SIDEBAR    │   Location: Athens, Greece                       │
│              │   37.98°N, 23.73°E                               │
│   ┌────────┐ │                                                  │
│   │ Saved  │ │   MODEL CARDS                                    │
│   │Locs    │ │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│   └────────┘ │   │ GFS │ │ECMWF│ │ GEM │ │UKMO │               │
│              │   └─────┘ └─────┘ └─────┘ └─────┘               │
│              │                                                  │
│              │   RUN SELECTOR                                   │
│              │   ┌──────────────────────────────┐               │
│              │   │ Model | Run | Previous Runs  │               │
│              │   └──────────────────────────────┘               │
│              │                                                  │
│              │   RUN IMAGES VIEWER                              │
│              │   ┌──────────────────────────────┐               │
│              │   │ Tabs + Image + Slider        │               │
│              │   └──────────────────────────────┘               │
│              │                                                  │
│              │   COMPARISON CHARTS                              │
│              │   ┌──────────────────────────────┐               │
│              │   │ Temperature | Precip | Wind  │               │
│              │   └──────────────────────────────┘               │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

---

## Animations

### Page Transitions
```css
.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Staggered Reveals
```css
.stagger > * {
  animation: fadeIn 0.4s ease-out backwards;
}
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 50ms; }
.stagger > *:nth-child(3) { animation-delay: 100ms; }
.stagger > *:nth-child(4) { animation-delay: 150ms; }
```

### Glow Pulse (for loading states)
```css
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px var(--accent-glow); }
  50% { box-shadow: 0 0 30px var(--accent-glow), 0 0 50px var(--accent-glow); }
}
```

### Slider Thumb
```css
input[type="range"]::-webkit-slider-thumb {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px var(--accent);
}
```

---

## Cleanup Tasks

### Remove TanStack Start Defaults
- Delete `src/routes/demo/` folder entirely
- Update `src/routes/__root.tsx` if needed
- Clean up any demo-related imports

---

## Implementation Tasks

1. Update global styles with new design system
2. Add Google Fonts imports
3. Create Header component with autocomplete search
4. Remove demo routes
5. Create RunSelector component
6. Create RunImageViewer component
7. Update compare page layout
8. Add animations and polish
9. Test and fix any issues

---

## Technical Notes

### Tropical Tidbits URL Builder

```typescript
function buildChartUrl(
  model: 'gfs' | 'ecmwf' | 'gem' | 'ukmo',
  run: string, // YYYYMMDDHH
  param: string,
  region: string,
  hour: number
): string {
  return `https://www.tropicaltidbits.com/analysis/models/${model}/${run}/${model}_${param}_${region}_${hour}.png`
}
```

### Run Time Detection

```typescript
function getLatestRun(): { run: string; time: string } {
  const now = new Date()
  const utcHour = now.getUTCHours()

  // Runs available ~4-5 hours after initialization
  // 00z available ~05z, 06z available ~11z, etc.
  let runHour: number
  if (utcHour >= 17) runHour = 12
  else if (utcHour >= 11) runHour = 6
  else if (utcHour >= 5) runHour = 0
  else runHour = 18 // previous day

  // Format: YYYYMMDDHH
  const runDate = new Date(now)
  if (runHour === 18 && utcHour < 5) {
    runDate.setUTCDate(runDate.getUTCDate() - 1)
  }

  const year = runDate.getUTCFullYear()
  const month = String(runDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(runDate.getUTCDate()).padStart(2, '0')
  const hour = String(runHour).padStart(2, '0')

  return {
    run: `${year}${month}${day}${hour}`,
    time: `${hour}z`
  }
}
```

### Region Detection

```typescript
function detectRegion(lat: number, lon: number): string {
  if (lat >= 35 && lat <= 72 && lon >= -12 && lon <= 45) {
    return 'europe'
  }
  if (lat >= 24 && lat <= 50 && lon >= -130 && lon <= -60) {
    return 'us'
  }
  return 'namer' // North America default
}
```
