import { QueryClient } from '@tanstack/react-query'

/**
 * Default query client options
 * - staleTime: How long data is considered fresh (no refetch)
 * - gcTime: How long inactive data stays in cache before garbage collection
 */
const QUERY_CLIENT_OPTIONS = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - keep data fresh during navigation
      gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache (consolidated)
    },
  },
}

/**
 * Creates a new QueryClient instance
 * Used for both server (per-request) and browser (singleton)
 */
function makeQueryClient() {
  return new QueryClient(QUERY_CLIENT_OPTIONS)
}

/**
 * Browser singleton - persists across navigations
 * Only created once on client side
 */
let browserQueryClient: QueryClient | undefined

/**
 * Get the appropriate QueryClient for the current environment
 *
 * Server: Creates a NEW client for each request to prevent:
 *   - Memory leaks (cache growing unbounded)
 *   - Data leaks between users
 *   - Stale data from long-running processes
 *
 * Browser: Returns singleton to maintain cache across navigations
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create new client per request
    return makeQueryClient()
  }
  // Browser: reuse singleton for cache persistence
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}
