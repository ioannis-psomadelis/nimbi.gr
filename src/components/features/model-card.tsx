'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { MODEL_CONFIG, type ModelId } from '../../types/models'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ModelCardProps {
  model: ModelId
  temperature?: number
  isLoading: boolean
  isError?: boolean
  isSelected?: boolean
  onClick?: () => void
  showInfo?: boolean
}

export const ModelCard = memo(function ModelCard({
  model,
  temperature,
  isLoading,
  isError,
  isSelected,
  onClick,
  showInfo = false,
}: ModelCardProps) {
  const { t } = useTranslation()
  const config = MODEL_CONFIG[model]

  return (
    <div className="flex items-stretch">
      {/* Main button */}
      <button
        onClick={onClick}
        className={`
          flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200
          ${showInfo ? 'rounded-l-lg' : 'rounded-lg'}
          ${isSelected
            ? 'bg-primary/10 border border-primary/40 ring-1 ring-primary/30'
            : 'bg-card border border-border hover:bg-muted'
          }
          ${showInfo ? 'border-r-0' : ''}
          ${!onClick ? 'opacity-60 cursor-default' : 'cursor-pointer'}
        `}
      >
        {/* Model indicator */}
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: config.color }}
        />

        {/* Model Name */}
        <span className={`font-medium shrink-0 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
          {config.name}
        </span>

        {/* Temperature */}
        {isLoading ? (
          <Skeleton className="w-8 h-5" data-testid="model-card-loading" />
        ) : isError ? (
          <span className="text-destructive">--</span>
        ) : (
          <span
            className="font-semibold tabular-nums"
            style={{ color: config.color }}
          >
            {temperature !== undefined ? `${Math.round(temperature)}°` : '--'}
          </span>
        )}
      </button>

      {/* Info button - connected to card */}
      {showInfo && (
        <Dialog>
          <DialogTrigger asChild>
            <button
              className={`
                px-2 py-2 rounded-r-lg text-xs transition-all duration-200 border
                ${isSelected
                  ? 'bg-primary/10 text-primary/70 hover:text-primary border-primary/40 border-l-primary/20'
                  : 'bg-card hover:bg-muted text-muted-foreground/60 hover:text-muted-foreground border-border border-l-border/50'
                }
              `}
              title={t('modelInfo', { model: config.name })}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border shadow-xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-foreground">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-lg">{config.name}</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t('modelDetails')}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">{t('resolution')}</span>
                  <p className="font-medium text-foreground">{config.resolution}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">{t('updateTimes')}</span>
                  <p className="font-medium text-foreground">{config.updateTimes}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">{t('forecastLength')}</span>
                  <p className="font-medium text-foreground">{config.forecastLength}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">{t('regional')}</span>
                  <p className="font-medium text-foreground">
                    {config.hasRegional ? t('yes') : t('no')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {config.description}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
})
