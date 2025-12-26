'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type ChartRegion, REGION_CONFIG, REGIONAL_MODELS } from '../../../lib/utils/runs'
import { type ModelId } from '../../../types/models'

interface RegionSelectorProps {
  selectedRegion: ChartRegion
  onChange: (region: ChartRegion) => void
  availableRegions: ChartRegion[]
  model: ModelId
}

export const RegionSelector = memo(function RegionSelector({
  selectedRegion,
  onChange,
  availableRegions,
  model,
}: RegionSelectorProps) {
  const { t } = useTranslation()

  // Only show for models that support regional charts
  if (!REGIONAL_MODELS.includes(model)) {
    return null
  }

  return (
    <div className="px-3 sm:px-4 py-2.5 border-b border-border bg-muted/30">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">{t('region')}:</span>
        {availableRegions.map((region) => (
          <button
            key={region}
            onClick={() => onChange(region)}
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
      </div>
    </div>
  )
})
