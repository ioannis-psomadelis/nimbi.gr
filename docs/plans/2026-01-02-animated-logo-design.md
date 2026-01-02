# Animated Logo Design

## Overview

Replace the static cloud logo with a dynamic, playful animated logo that cycles through weather states using the Meteocons icon library. Also generate GIF/favicon assets for SEO and branding.

## Requirements

- **Behavior**: Continuous loop cycling through weather conditions
- **Pacing**: ~2.5 seconds per state (moderate, not distracting)
- **States**: Full spectrum showcase (6 weather types)
- **Assets**: GIF exports for favicon and Open Graph images

## Weather Sequence

```
clear-day → partly-cloudy-day → cloudy → rain → thunderstorms → snow → (loop)
```

Total cycle duration: ~15 seconds

## Technical Design

### AnimatedLogo Component

**Location**: `src/components/ui/animated-logo.tsx`

**Props**:
```tsx
interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg'  // Maps to icon sizes
  className?: string
  paused?: boolean           // For reduced motion preference
}
```

**Animation Strategy**:
1. Two `WeatherIcon` components stacked with absolute positioning
2. Current icon at `opacity: 1`, next at `opacity: 0`
3. On interval tick:
   - Swap which icon is "current" vs "next"
   - Update the "next" icon's weather state
   - CSS transition handles the crossfade (`transition-opacity duration-500`)
4. Preload all 6 SVGs on mount to prevent flash

**Performance**:
- SVGs cached in existing `svgCache` Map
- Only 2 icons in DOM at any time
- Interval pauses when tab hidden (`visibilitychange` API)
- Respects `prefers-reduced-motion` (pauses animation)

### Favicon Generation Script

**Location**: `scripts/generate-favicons.mjs`

**Dependencies**:
- `puppeteer` - Headless browser for rendering
- `gif-encoder-2` - GIF creation
- `sharp` - Image processing (resize, convert)

**Process**:
1. Start dev server or use static HTML with inline component
2. Puppeteer captures frames at 30fps over one full cycle
3. Stitch frames into GIF using gif-encoder-2
4. Generate multiple sizes using sharp
5. Create WebP alternative for smaller file size

**Output Files**:
```
public/
├── favicon.ico              # 32x32 static (first frame, fallback)
├── favicon.svg              # Vector version (static)
├── favicon-animated.gif     # 32x32 animated
├── apple-touch-icon.png     # 180x180 static (iOS ignores animation)
├── og-logo.gif              # 512x512 for social sharing
└── og-logo.webp             # 512x512 smaller alternative
```

### HTML Integration

Update `index.html` or root layout:
```html
<link rel="icon" type="image/gif" href="/favicon-animated.gif">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:image" content="https://nimbi.gr/og-logo.gif">
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/animated-logo.tsx` | Create | Cycling logo component |
| `scripts/generate-favicons.mjs` | Create | Asset generation script |
| `src/components/layout/header.tsx` | Modify | Use AnimatedLogo |
| `index.html` | Modify | Update favicon links |
| `package.json` | Modify | Add script + dependencies |

## Accessibility

- Respects `prefers-reduced-motion`: shows static icon when enabled
- Maintains existing `aria-label` for screen readers
- No flashing content (smooth crossfades only)

## Testing

1. Visual: Verify smooth cycling in browser
2. Performance: Check no memory leaks over time
3. Assets: Validate GIF plays correctly, sizes are correct
4. Fallback: Test static favicon in older browsers
