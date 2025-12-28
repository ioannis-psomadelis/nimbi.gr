# URL Structure Redesign: Language & Pro Mode in URLs

**Date:** 2025-12-28
**Status:** Approved for implementation

## Overview

Restructure URLs to include language and pro mode for improved SEO and SSR support.

## URL Structure

| URL | Language | Mode | Notes |
|-----|----------|------|-------|
| `/` | Greek | Normal | Default homepage |
| `/observatory/athens` | Greek | Normal | Location page |
| `/en/` | English | Normal | English homepage |
| `/en/observatory/athens` | English | Normal | English location |
| `/pro/` | Greek | Pro | Greek pro homepage |
| `/pro/observatory/athens` | Greek | Pro | Greek pro location |
| `/en/pro/` | English | Pro | English pro homepage |
| `/en/pro/observatory/athens` | English | Pro | English pro location |

### Redirects

- `/el/*` → 301 redirect to `/*` (Greek is default, no prefix needed)
- `/normal/*` → 301 redirect to `/*` (optional, if explicit non-pro needed)

### Canonicals

All pro pages point canonical to their non-pro equivalent:
- `/en/pro/observatory/athens` → canonical: `/en/observatory/athens`
- `/pro/observatory/athens` → canonical: `/observatory/athens`

### Hreflang Tags

```html
<!-- On /observatory/athens (Greek, non-pro) -->
<link rel="alternate" hreflang="el" href="https://nimbi.gr/observatory/athens" />
<link rel="alternate" hreflang="en" href="https://nimbi.gr/en/observatory/athens" />
<link rel="alternate" hreflang="x-default" href="https://nimbi.gr/observatory/athens" />
```

## File Structure

```
src/routes/
├── __root.tsx                    # Root layout (add pending loader)
├── _lang.tsx                     # Layout: extracts lang param, sets i18n
├── _lang/
│   ├── index.tsx                 # Home page (/, /en/)
│   ├── observatory.$slug.tsx     # Observatory (non-pro)
│   ├── _pro.tsx                  # Layout: sets proMode context
│   └── _pro/
│       ├── index.tsx             # Pro home (/pro/, /en/pro/)
│       └── observatory.$slug.tsx # Pro observatory
├── el.tsx                        # Redirect /el/* → /*
└── $.tsx                         # 404 catch-all
```

## Implementation Details

### 1. Language Layout (`_lang.tsx`)

```typescript
export const Route = createFileRoute('/_lang')({
  params: {
    parse: (params) => ({
      lang: params.lang as 'en' | undefined // undefined = Greek
    })
  },
  loader: async ({ params }) => {
    const lang = params.lang || 'el'
    await i18n.changeLanguage(lang)
    return { lang }
  },
  component: LangLayout
})
```

### 2. Pro Mode Layout (`_lang/_pro.tsx`)

```typescript
export const Route = createFileRoute('/_lang/_pro')({
  loader: async () => {
    return { proMode: true }
  },
  component: ProLayout
})
```

### 3. SSR Loading Indicator

Add top bar loader to `__root.tsx`:

```typescript
<RouterProvider
  router={router}
  defaultPendingComponent={() => <TopBarLoader />}
/>
```

### 4. Navigation Helper Hook

```typescript
// hooks/use-locale-path.ts
export function useLocalePath() {
  const { lang } = Route.useParams()
  const proMode = useProMode()

  return (path: string) => {
    const prefix = lang === 'en' ? '/en' : ''
    const proPrefix = proMode ? '/pro' : ''
    return `${prefix}${proPrefix}${path}`
  }
}
```

### 5. Toggle Behavior

**Language Toggle:**
| Current URL | Toggle | Result |
|-------------|--------|--------|
| `/observatory/athens` | → EN | `/en/observatory/athens` |
| `/en/pro/observatory/athens` | → EL | `/pro/observatory/athens` |

**Pro Toggle:**
| Current URL | Toggle | Result |
|-------------|--------|--------|
| `/en/observatory/athens` | → Pro | `/en/pro/observatory/athens` |
| `/pro/observatory/athens` | → Normal | `/observatory/athens` |

## SEO Strategy

### Pro Pages
- `<meta name="robots" content="noindex,follow" />`
- `<link rel="canonical" href="[non-pro-url]" />`
- Not indexed, but links are followed

### Non-Pro Pages
- Fully indexed
- Hreflang for language variants
- Greek (`/`) is `x-default`

## Files to Create/Modify

1. **Create** `src/routes/_lang.tsx` - language layout
2. **Create** `src/routes/_lang/_pro.tsx` - pro mode layout
3. **Move** `src/routes/index.tsx` → `src/routes/_lang/index.tsx`
4. **Move** `src/routes/observatory.$slug.tsx` → `src/routes/_lang/observatory.$slug.tsx`
5. **Create** `src/routes/_lang/_pro/index.tsx` - pro home
6. **Create** `src/routes/_lang/_pro/observatory.$slug.tsx` - pro observatory
7. **Create** `src/routes/el.tsx` - redirect handler
8. **Update** `src/routes/__root.tsx` - add pending loader
9. **Create** `src/components/ui/top-bar-loader.tsx`
10. **Create** `src/hooks/use-locale-path.ts`
11. **Update** all `<Link>` components to use locale-aware paths
12. **Update** language toggle to navigate instead of cookie
13. **Update** pro toggle to navigate instead of cookie
14. **Remove** cookie-based language/pro storage (keep for initial redirect only)

## Migration Strategy

1. Implement new route structure
2. Update all internal links
3. Set up 301 redirects for old cookie-based URLs
4. Test SSR loading indicator
5. Verify SEO tags with Google Search Console
6. Monitor for 404s and add redirects as needed

## Success Criteria

- [ ] All URLs resolve correctly
- [ ] Language/pro toggles navigate to correct URLs
- [ ] Top bar loader shows during navigation
- [ ] SEO tags correct (canonical, hreflang, robots)
- [ ] `/el/*` redirects to `/*`
- [ ] No hydration mismatches
- [ ] Google indexes non-pro pages only
