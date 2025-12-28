'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, MapPin } from 'lucide-react'
import { type ChartRegion, type MeteocielRegion, REGION_CONFIG, type ChartScope } from '../../../lib/utils/runs'
import { MODEL_CONFIG, type ModelId } from '../../../types/models'
import { WETTERZENTRALE_REGIONS, detectWetterzenRegion } from '../../../lib/utils/wetterzentrale'

interface RegionSelectorProps {
  scope: ChartScope
  onScopeChange: (scope: ChartScope) => void
  selectedRegion: ChartRegion
  onRegionChange: (region: MeteocielRegion) => void
  availableRegions: ChartRegion[]
  model: ModelId
  latitude?: number
  longitude?: number
}

export const RegionSelector = memo(function RegionSelector({
  scope,
  onScopeChange,
  selectedRegion,
  onRegionChange,
  availableRegions,
  model,
  latitude,
  longitude,
}: RegionSelectorProps) {
  const { t } = useTranslation()
  const config = MODEL_CONFIG[model]
  const hasRegional = config.hasRegional

  // Get the regional name based on chart provider
  const getRegionalName = () => {
    if (config.chartProvider === 'wetterzentrale' && latitude && longitude) {
      const regionCode = detectWetterzenRegion(latitude, longitude)
      const region = WETTERZENTRALE_REGIONS[regionCode]
      return t(region.nameKey)
    }
    // For Meteociel (ECMWF), use the detected meteociel region
    return t(REGION_CONFIG[selectedRegion].nameKey)
  }

  return (
    <div className="px-3 sm:px-4 py-2.5 border-b border-border bg-muted/30">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">{t('region')}:</span>

        {/* Europe button - always enabled */}
        <button
          onClick={() => onScopeChange('europe')}
          className={`
            flex items-center gap-1.5 min-w-[5.5rem] px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0
            ${scope === 'europe'
              ? 'bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-background'
              : 'bg-muted text-muted-foreground hover:bg-secondary'
            }
          `}
        >
          <Globe className="w-3 h-3" />
          <span>{t('europe')}</span>
        </button>

        {/* Regional button - disabled for models without regional */}
        <button
          onClick={() => hasRegional && onScopeChange('regional')}
          disabled={!hasRegional}
          className={`
            flex items-center gap-1.5 min-w-[5.5rem] px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0
            ${!hasRegional
              ? 'bg-muted/50 text-muted-foreground/40 cursor-not-allowed'
              : scope === 'regional'
                ? 'bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-background'
                : 'bg-muted text-muted-foreground hover:bg-secondary'
            }
          `}
          title={!hasRegional ? t('regionalNotAvailable') : undefined}
        >
          <MapPin className="w-3 h-3" />
          <span>{scope === 'regional' ? getRegionalName() : t('regional')}</span>
        </button>

        {/* Country-specific regions for ECMWF when in regional mode */}
        {model === 'ecmwf-hres' && scope === 'regional' && availableRegions.length > 1 && (
          <>
            <span className="text-muted-foreground/40">|</span>
            {availableRegions.filter(r => r !== 'europe').map((region) => (
              <button
                key={region}
                onClick={() => onRegionChange(region)}
                className={`
                  min-w-[5.5rem] px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0
                  ${selectedRegion === region
                    ? 'bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-background'
                    : 'bg-muted text-muted-foreground hover:bg-secondary'
                  }
                `}
              >
                {t(REGION_CONFIG[region].nameKey)}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
})
