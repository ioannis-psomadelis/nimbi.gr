'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type ForecastDateTime } from './types'

interface ForecastTimeBarProps {
  forecastDateTime: ForecastDateTime
  forecastHour: number
  formatHourLabel: (hour: number) => string
}

export const ForecastTimeBar = memo(function ForecastTimeBar({
  forecastDateTime,
  forecastHour,
  formatHourLabel,
}: ForecastTimeBarProps) {
  const { t } = useTranslation()

  return (
    <div className="px-3 sm:px-4 py-2.5 bg-muted/50 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {t('forecastFor')}{' '}
            <span className="font-medium text-foreground">{forecastDateTime.short}</span>
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
          <span className="text-primary font-medium text-xs font-mono">{formatHourLabel(forecastHour)}</span>
        </div>
      </div>
    </div>
  )
})
