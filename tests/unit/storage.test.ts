import { describe, it, expect, vi } from 'vitest'

// Mock js-cookie
vi.mock('js-cookie', () => {
  const store: Record<string, string> = {}
  return {
    default: {
      get: (key: string) => store[key],
      set: (key: string, value: string) => {
        store[key] = value
      },
      remove: (key: string) => {
        delete store[key]
      },
    },
  }
})

import { saveLocation, getSavedLocations } from '../../src/lib/storage'

describe('storage', () => {
  it('saves and retrieves locations', () => {
    saveLocation({
      id: '1',
      name: 'Athens',
      lat: 37.98,
      lon: 23.73,
      isDefault: true,
    })
    const locations = getSavedLocations()
    expect(locations).toHaveLength(1)
    expect(locations[0].name).toBe('Athens')
  })
})
