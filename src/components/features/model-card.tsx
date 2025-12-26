'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { MODEL_CONFIG, type ModelId } from '../../types/models'
import { Skeleton } from '@/components/ui/skeleton'

interface ModelCardProps {
  model: ModelId
  temperature?: number
  isLoading: boolean
  isError?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export const ModelCard = memo(function ModelCard({
  model,
  temperature,
  isLoading,
  isError,
  isSelected,
  onClick,
}: ModelCardProps) {
  const { t } = useTranslation()
  const config = MODEL_CONFIG[model]

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200
        ${isSelected
          ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/30'
          : 'bg-card border-border hover:bg-muted'
        }
        ${!onClick ? 'opacity-60 cursor-default' : 'cursor-pointer'}
      `}
    >
      {/* Model indicator */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: config.color }}
      />

      {/* Model Name */}
      <span className={`text-xs font-medium shrink-0 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
        {config.name}
      </span>

      {/* Temperature */}
      {isLoading ? (
        <Skeleton className="w-8 h-5" data-testid="model-card-loading" />
      ) : isError ? (
        <span className="text-xs text-destructive">{t('error')}</span>
      ) : (
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: config.color }}
        >
          {temperature !== undefined ? `${Math.round(temperature)}°` : '--'}
        </span>
      )}
    </button>
  )
})
