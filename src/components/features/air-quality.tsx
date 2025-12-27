'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Wind, Info } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  airQualityQueryOptions,
  getEuropeanAQIInfo,
  type AirQualityCurrent,
  type AQILevel,
} from '@/lib/api/air-quality'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AirQualityCardProps {
  lat: number
  lon: number
  variant?: 'default' | 'compact' | 'sidebar' | 'inline'
  className?: string
}

// Pollutant display configuration
type PollutantConfig = {
  key: 'pm2_5' | 'pm10' | 'ozone' | 'nitrogen_dioxide'
  label: string
  labelKey?: string
}

const POLLUTANTS: PollutantConfig[] = [
  { key: 'pm2_5', label: 'PM2.5' },
  { key: 'pm10', label: 'PM10' },
  { key: 'ozone', label: 'O3', labelKey: 'aqiOzone' },
  { key: 'nitrogen_dioxide', label: 'NO2', labelKey: 'aqiNO2' },
]

function getAQILevelTranslationKey(level: AQILevel): string {
  const keys: Record<AQILevel, string> = {
    good: 'aqiGood',
    fair: 'aqiFair',
    moderate: 'aqiModerate',
    poor: 'aqiPoor',
    very_poor: 'aqiVeryPoor',
    extremely_poor: 'aqiExtremelyPoor',
  }
  return keys[level]
}

function AirQualityBadge({
  current,
  variant = 'default',
}: {
  current: AirQualityCurrent
  variant?: 'default' | 'compact' | 'sidebar' | 'inline'
}) {
  const { t } = useTranslation()
  const aqiInfo = getEuropeanAQIInfo(current.european_aqi)

  if (!aqiInfo || current.european_aqi === null) {
    return null
  }

  const levelLabel = t(getAQILevelTranslationKey(aqiInfo.level))

  // Inline variant - for embedding in other components (like modal header)
  if (variant === 'inline') {
    return (
      <div
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg"
        style={{ backgroundColor: aqiInfo.bgColor }}
      >
        <Wind className="w-3.5 h-3.5" style={{ color: aqiInfo.color }} />
        <span className="text-xs font-medium" style={{ color: aqiInfo.textColor }}>
          {t('airQuality')}
        </span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: aqiInfo.textColor }}
        >
          {current.european_aqi}
        </span>
        <span className="text-[10px]" style={{ color: aqiInfo.textColor }}>
          {levelLabel}
        </span>
      </div>
    )
  }

  // Compact variant - just icon and number
  if (variant === 'compact') {
    return (
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
        style={{ backgroundColor: aqiInfo.bgColor }}
      >
        <Wind className="w-3.5 h-3.5" style={{ color: aqiInfo.color }} />
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: aqiInfo.textColor }}
        >
          {current.european_aqi}
        </span>
      </div>
    )
  }

  // Sidebar variant - full card style
  if (variant === 'sidebar') {
    return (
      <div
        className="p-3 rounded-xl border"
        style={{
          backgroundColor: aqiInfo.bgColor,
          borderColor: `${aqiInfo.color}40`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: aqiInfo.textColor }}>
            {t('airQuality')}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{t('aqiExplanation')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${aqiInfo.color}30` }}
          >
            <Wind className="w-5 h-5" style={{ color: aqiInfo.color }} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: aqiInfo.textColor }}
              >
                {current.european_aqi}
              </span>
              <span className="text-xs text-muted-foreground">EAQI</span>
            </div>
            <p className="text-xs font-medium" style={{ color: aqiInfo.textColor }}>
              {levelLabel}
            </p>
          </div>
        </div>

        {/* Pollutants breakdown */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t" style={{ borderColor: `${aqiInfo.color}20` }}>
          {POLLUTANTS.map((pollutant) => {
            const value = current[pollutant.key as keyof AirQualityCurrent]
            if (value === null || typeof value !== 'number') return null
            return (
              <div key={pollutant.key} className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {pollutant.labelKey ? t(pollutant.labelKey) : pollutant.label}
                </span>
                <span className="text-xs font-medium tabular-nums">
                  {Math.round(value)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg border"
      style={{
        backgroundColor: aqiInfo.bgColor,
        borderColor: `${aqiInfo.color}40`,
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${aqiInfo.color}30` }}
      >
        <Wind className="w-4 h-4" style={{ color: aqiInfo.color }} />
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: aqiInfo.textColor }}
          >
            {current.european_aqi}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {t('airQuality')}
          </span>
        </div>
        <p className="text-xs" style={{ color: aqiInfo.textColor }}>
          {levelLabel}
        </p>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="space-y-2">
              <p className="text-xs">{t('aqiExplanation')}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {POLLUTANTS.map((pollutant) => {
                  const value = current[pollutant.key as keyof AirQualityCurrent]
                  if (value === null || typeof value !== 'number') return null
                  return (
                    <div key={pollutant.key} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {pollutant.labelKey ? t(pollutant.labelKey) : pollutant.label}
                      </span>
                      <span className="font-medium">{Math.round(value)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function AirQualitySkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'sidebar' | 'inline' }) {
  if (variant === 'compact' || variant === 'inline') {
    return <Skeleton className="w-32 h-7 rounded-lg" />
  }

  if (variant === 'sidebar') {
    return (
      <div className="p-3 rounded-xl border border-border bg-muted/30 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-3.5 h-3.5 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="w-12 h-7 mb-1" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="w-10 h-2.5" />
              <Skeleton className="w-6 h-3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-muted/30 animate-pulse">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="w-20 h-5 mb-1" />
        <Skeleton className="w-16 h-3" />
      </div>
      <Skeleton className="w-4 h-4 rounded-full" />
    </div>
  )
}

export const AirQualityCard = memo(function AirQualityCard({
  lat,
  lon,
  variant = 'default',
  className = '',
}: AirQualityCardProps) {
  const { data, isLoading, isError } = useQuery(airQualityQueryOptions(lat, lon))

  if (isLoading) {
    return (
      <div className={className}>
        <AirQualitySkeleton variant={variant} />
      </div>
    )
  }

  if (isError || !data?.current) {
    return null
  }

  return (
    <div className={className}>
      <AirQualityBadge current={data.current} variant={variant} />
    </div>
  )
})
