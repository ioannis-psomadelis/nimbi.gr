# Skeleton Loaders Design

**Date:** 2025-12-26
**Status:** Approved

## Overview

Add comprehensive skeleton loading states across all Nimbus components for a polished loading experience that works seamlessly with light/dark themes.

## Design Decisions

- **Animation:** Pulse (`animate-pulse`) - subtle and professional
- **Shapes:** Realistic - match exact content layout
- **Theme:** Use existing tokens (`bg-muted`) - automatic light/dark support

## Components

### New Skeleton Components

Located in `src/components/skeletons/`:

| Component | Purpose | Key Elements |
|-----------|---------|--------------|
| `ChartSkeleton` | ComparisonChart loading | Card header, axis lines, data area placeholder |
| `ModelCardSkeleton` | ModelCard loading | Circle icon, temperature bar, name text |
| `ImageSkeleton` | RunImageViewer loading | Full container, center icon placeholder |
| `SearchResultSkeleton` | Header search dropdown | 3-4 stacked result items with icon + text |
| `LocationInfoSkeleton` | Sidebar location header | Location name bar, coordinates bar |

### Integration Points

| Component | File | Trigger |
|-----------|------|---------|
| ComparisonChart | `src/components/features/comparison-chart.tsx` | When `data` array empty during load |
| ModelCard | `src/components/features/model-card.tsx` | When `isLoading={true}` |
| RunImageViewer | `src/components/features/run-image-viewer.tsx` | During `isLoading` state |
| Header Search | `src/components/layout/header.tsx` | When `isSearching && results.length === 0` |
| Compare Page | `src/routes/compare.$lat.$lon.tsx` | During `useModelData` loading |

## Technical Details

### Base Skeleton (existing)

```tsx
// src/components/ui/skeleton.tsx
export function Skeleton({ className, ...props }) {
  return (
    <div className={cn("bg-accent animate-pulse rounded-md", className)} {...props} />
  )
}
```

### Theme Tokens

- `bg-muted` - Primary skeleton background (adapts to theme)
- `bg-accent` - Alternative for contrast areas
- `animate-pulse` - Consistent animation across all skeletons

## Implementation Plan

1. Create `src/components/skeletons/` directory with all skeleton components
2. Integrate `ChartSkeleton` into `comparison-chart.tsx`
3. Integrate `ModelCardSkeleton` into `model-card.tsx`
4. Integrate `ImageSkeleton` into `run-image-viewer.tsx`
5. Integrate `SearchResultSkeleton` into `header.tsx`
6. Update `compare.$lat.$lon.tsx` with loading states
