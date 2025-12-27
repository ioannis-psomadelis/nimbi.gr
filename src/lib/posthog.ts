import posthog from 'posthog-js'

// Event names for type safety
export type PostHogEvent =
  | 'location_search'
  | 'location_selected'
  | 'model_changed'
  | 'run_changed'
  | 'pro_mode_toggled'
  | 'weekly_outlook_opened'
  | 'geolocation_used'

// Event property types
export interface EventProperties {
  location_search: { query: string }
  location_selected: { slug: string; source: 'search' | 'recent' | 'saved' }
  model_changed: { model: string; previousModel: string }
  run_changed: { run: string }
  pro_mode_toggled: { enabled: boolean }
  weekly_outlook_opened: { slug?: string }
  geolocation_used: { success: boolean }
}

/**
 * Track a PostHog event with type-safe properties
 */
export function trackEvent<T extends PostHogEvent>(
  event: T,
  properties: EventProperties[T]
): void {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties)
  }
}

export { posthog }
