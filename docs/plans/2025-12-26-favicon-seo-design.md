# Favicon & Dynamic SEO Design

## Overview

Add a branded favicon and dynamic SEO meta tags to nimbi.gr with i18n support.

## Favicon & PWA Assets

### Files to Create

| File | Size | Purpose |
|------|------|---------|
| `public/favicon.svg` | scalable | Modern cloud icon, primary color |
| `public/favicon-32x32.png` | 32x32 | Standard favicon |
| `public/favicon-16x16.png` | 16x16 | Small favicon |
| `public/apple-touch-icon.png` | 180x180 | iOS home screen |
| `public/og-image.png` | 1200x630 | Social sharing image |

### Design

- Simple filled cloud silhouette with rounded rect background
- Orange color: `#f97316` with dark background `#0a0a0a`
- Orange border around the rounded rectangle
- Clean, modern, recognizable at small sizes

### manifest.json Updates

```json
{
  "short_name": "nimbi",
  "name": "nimbi.gr - Weather Observatory",
  "icons": [...],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#f97316",
  "background_color": "#0a0a0a"
}
```

## Dynamic SEO

### Title Format

Location-first for SEO: `{{Location}} Weather Forecast | nimbi.gr`

### Route Meta Tags

#### Home (`/`)
- **Title (EN):** nimbi.gr - Weather Observatory
- **Title (EL):** nimbi.gr - Μετεωρολογικό Παρατηρητήριο
- **Description (EN):** Multi-model weather forecasts comparing ECMWF, GFS, GEM & UKMO models
- **Description (EL):** Προγνώσεις καιρού πολλαπλών μοντέλων συγκρίνοντας ECMWF, GFS, GEM & UKMO

#### Observatory (`/observatory/$slug`)
- **Title (EN):** {{Location}} Weather Forecast | nimbi.gr
- **Title (EL):** Πρόγνωση Καιρού {{Location}} | nimbi.gr
- **Description (EN):** 7-day weather forecast for {{Location}} comparing ECMWF, GFS, GEM & UKMO models
- **Description (EL):** 7ήμερη πρόγνωση καιρού για {{Location}} συγκρίνοντας μοντέλα ECMWF, GFS, GEM & UKMO

#### 404 Page
- **Title:** Page Not Found | nimbi.gr

### Open Graph Tags

Static OG image for all pages with dynamic title/description:

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="nimbi.gr">
<meta property="og:image" content="https://nimbi.gr/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta property="og:title" content="[dynamic]">
<meta property="og:description" content="[dynamic]">
```

## Implementation

### Files to Modify

1. `src/routes/__root.tsx` - Add favicon links, base OG tags
2. `src/routes/index.tsx` - Add `head()` with home page meta
3. `src/routes/observatory.$slug.tsx` - Add `head()` with dynamic location meta
4. `src/routes/$.tsx` - Add `head()` for 404 page
5. `src/lib/i18n/translations.ts` - Add meta translation keys
6. `public/manifest.json` - Update with nimbi.gr branding

### Translation Keys to Add

```ts
// English
metaHomeTitle: "nimbi.gr - Weather Observatory",
metaHomeDescription: "Multi-model weather forecasts comparing ECMWF, GFS, GEM & UKMO models",
metaObservatoryTitle: "{{location}} Weather Forecast | nimbi.gr",
metaObservatoryDescription: "7-day weather forecast for {{location}} comparing ECMWF, GFS, GEM & UKMO models",

// Greek
metaHomeTitle: "nimbi.gr - Μετεωρολογικό Παρατηρητήριο",
metaHomeDescription: "Προγνώσεις καιρού πολλαπλών μοντέλων συγκρίνοντας ECMWF, GFS, GEM & UKMO",
metaObservatoryTitle: "Πρόγνωση Καιρού {{location}} | nimbi.gr",
metaObservatoryDescription: "7ήμερη πρόγνωση καιρού για {{location}} συγκρίνοντας μοντέλα ECMWF, GFS, GEM & UKMO",
```
