'use client'

import { useTranslation } from 'react-i18next'
import {
  MODEL_GROUPS,
  MODEL_CONFIG,
  type ModelId,
  type ModelGroupId,
} from '../../types/models'
import { useWeatherStore, useAvailableModels } from '../../stores/weather-store'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export function ModelSelector() {
  const { t } = useTranslation()
  const selectedModel = useWeatherStore((s) => s.selectedModel)
  const setSelectedModel = useWeatherStore((s) => s.setSelectedModel)
  const availableModels = useAvailableModels()

  return (
    <div className="space-y-3">
      {(
        Object.entries(MODEL_GROUPS) as [ModelGroupId, readonly ModelId[]][]
      ).map(([groupId, models]) => (
        <div key={groupId}>
          <span className="text-xs text-muted-foreground mb-1.5 block">
            {t(`modelGroup.${groupId}`)}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {models.map((modelId) => {
              const config = MODEL_CONFIG[modelId]
              const isAvailable = availableModels.includes(modelId)
              const isSelected = selectedModel === modelId

              return (
                <Button
                  key={modelId}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => setSelectedModel(modelId)}
                  className={cn(
                    'h-7 px-2 text-xs',
                    isSelected && 'ring-2 ring-offset-1'
                  )}
                  style={{
                    ...(isSelected && {
                      backgroundColor: config.color,
                      borderColor: config.color,
                    }),
                  }}
                >
                  {config.name}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
