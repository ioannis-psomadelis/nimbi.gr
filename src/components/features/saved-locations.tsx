'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { getSavedLocations, saveLocation, removeLocation } from '../../lib/storage'
import { type SavedLocation } from '../../lib/server/storage'
import { createLocationFromCoords } from '@/lib/server/locations'

interface SavedLocationsProps {
  currentLat?: number
  currentLon?: number
  currentName?: string
  initialLocations?: SavedLocation[]
}

export function SavedLocations({ currentLat, currentLon, currentName, initialLocations = [] }: SavedLocationsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [locations, setLocations] = useState<SavedLocation[]>(initialLocations)

  const handleSaveCurrent = () => {
    if (currentLat === undefined || currentLon === undefined) return

    const newLocation: SavedLocation = {
      id: `${currentLat}-${currentLon}`,
      name: currentName || `Location`,
      lat: currentLat,
      lon: currentLon,
      isDefault: locations.length === 0,
    }

    saveLocation(newLocation)
    setLocations(getSavedLocations())
  }

  const handleRemove = (id: string) => {
    removeLocation(id)
    setLocations(getSavedLocations())
  }

  const handleNavigateToLocation = async (location: SavedLocation) => {
    const { slug } = await createLocationFromCoords({ data: { lat: location.lat, lon: location.lon } })
    navigate({ to: '/observatory/$slug', params: { slug } })
  }

  const isCurrentSaved = locations.some(
    (l) => l.lat === currentLat && l.lon === currentLon
  )

  return (
    <div className="space-y-2">
      {/* Save current location button */}
      {!isCurrentSaved && currentLat !== undefined && (
        <button
          onClick={handleSaveCurrent}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          {t('saveLocation')}
        </button>
      )}

      {/* Saved locations list */}
      {locations.length === 0 ? (
        <p className="text-muted-foreground text-xs px-1">{t('noSavedLocations')}</p>
      ) : (
        <div className="space-y-1">
          {locations.map((location) => (
            <div
              key={location.id}
              className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Bookmark icon */}
              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>

              {/* Location info */}
              <button
                onClick={() => handleNavigateToLocation(location)}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {location.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
                </p>
              </button>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(location.id)}
                className="w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                aria-label={t('removeLocation')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
