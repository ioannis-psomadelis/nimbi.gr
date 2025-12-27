# PostHog Integration Design

## Overview

Add PostHog analytics to nimbi.gr for page view tracking, custom event tracking, and session recordings.

## Goals

1. **Page views**: Automatic tracking on route changes
2. **Custom events**: Track key user interactions
3. **Session recordings**: Understand user behavior with replay

## Architecture

### File Structure

```
src/
├── lib/
│   └── posthog.ts              # PostHog init + typed event helpers
├── components/
│   └── providers/
│       └── posthog-provider.tsx # React provider with route tracking
```

### Provider Integration

`PostHogProvider` wraps the app in `__root.tsx`:

```
I18nextProvider
  └── ThemeApplier
        └── PostHogProvider        <-- NEW
              └── QueryClientProvider
                    └── children
```

### Environment Variables

```env
VITE_POSTHOG_KEY=phc_xxx        # PostHog project API key
VITE_POSTHOG_HOST=https://us.i.posthog.com  # Optional, defaults to US cloud
```

## Events to Track

| Event | Location | Properties |
|-------|----------|------------|
| `location_search` | `search-modal.tsx` | `{ query: string }` |
| `location_selected` | `search-modal.tsx` | `{ slug: string, source: 'search' \| 'recent' \| 'saved' }` |
| `model_changed` | `weather-store.ts` | `{ model: string, previousModel: string }` |
| `run_changed` | `weather-store.ts` | `{ run: string }` |
| `pro_mode_toggled` | `preferences-store.ts` | `{ enabled: boolean }` |
| `weekly_outlook_opened` | `ui-store.ts` | `{ slug: string }` |
| `geolocation_used` | `index.tsx` | `{ success: boolean }` |

## Session Recordings

- Enabled by default
- Automatic input masking (PostHog default)
- 100% sample rate initially

## Implementation Steps

1. Install `posthog-js` package
2. Create `src/lib/posthog.ts` with init and event helpers
3. Create `src/components/providers/posthog-provider.tsx`
4. Add provider to `__root.tsx`
5. Add `.env` with PostHog key
6. Add event tracking calls to stores and components
7. Test in development

## Privacy Notes

- No user accounts = no PII collection
- Cookie consent banner deferred to future iteration
- Location coordinates are functional, not personal identifiers

## Future Considerations

- Cookie consent banner for GDPR compliance
- Feature flags for A/B testing pro mode
- Adjust session recording sample rate based on volume
