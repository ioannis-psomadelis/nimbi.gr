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
    // Don't navigate if already at this location
    if (location.lat === currentLat && location.lon === currentLon) {
      return
    }
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
          {locations.map((location) => {
            const isActive = location.lat === currentLat && location.lon === currentLon

            return (
              <div
                key={location.id}
                className={`
                  group/item relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl
                  transition-all duration-200 cursor-pointer
                  ${isActive
                    ? 'bg-primary/10 ring-1 ring-primary/20'
                    : 'hover:bg-muted/70'
                  }
                `}
                onClick={() => handleNavigateToLocation(location)}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}

                {/* Bookmark icon */}
                <div className={`
                  w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                  ${isActive
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground group-hover/item:bg-muted-foreground/20 group-hover/item:text-foreground'
                  }
                `}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>

                {/* Location info */}
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm font-medium truncate transition-colors
                    ${isActive ? 'text-primary' : 'text-foreground'}
                  `}>
                    {location.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
                  </p>
                </div>

                {/* Remove button - only visible on item hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(location.id)
                  }}
                  className={`
                    w-6 h-6 rounded-md flex items-center justify-center shrink-0
                    opacity-0 group-hover/item:opacity-100
                    text-muted-foreground hover:text-destructive hover:bg-destructive/10
                    transition-all duration-150
                  `}
                  aria-label={t('removeLocation')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
