'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type RunInfo, getNextRunTime } from '../../lib/utils/runs'
import { InfoButton } from '../ui/info-button'

interface RunSelectorProps {
  currentRun: RunInfo
  previousRuns: RunInfo[]
  selectedRun: RunInfo
  onRunChange: (run: RunInfo) => void
}

export const RunSelector = memo(function RunSelector({
  currentRun,
  previousRuns,
  selectedRun,
  onRunChange,
}: RunSelectorProps) {
  const { t } = useTranslation()
  const allRuns = [currentRun, ...previousRuns]
  const nextRun = getNextRunTime()

  return (
    <div className="space-y-4">
      {/* Run Timeline with Info */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Info Button */}
          <InfoButton title={t('runTimingInfo')}>
            <p className="mb-2">{t('runInfoTooltip')}</p>
            <div className="flex items-center gap-2 text-primary">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                {t('nextRunAvailable')}: {nextRun.hours}h {nextRun.minutes}m
              </span>
            </div>
          </InfoButton>
          {allRuns.map((run, index) => {
            const isSelected = selectedRun.id === run.id
            const isLatest = index === 0

            return (
              <button
                key={run.id}
                onClick={() => onRunChange(run)}
                className={`
                  relative flex-shrink-0 px-4 py-2.5 rounded-xl
                  transition-all duration-200 group
                  ${isSelected
                    ? 'bg-primary/20 border-primary/40'
                    : 'bg-muted/50 border-border hover:bg-muted hover:border-border/80'
                  }
                  border
                `}
              >
                {/* Glow for selected */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-xl bg-primary/10 blur-lg -z-10" />
                )}

                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {run.label}
                  </span>

                  {isLatest && (
                    <span className={`
                      text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full
                      ${isSelected ? 'bg-primary/30 text-primary' : 'bg-emerald-500/20 text-emerald-400'}
                    `}>
                      {t('latest')}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Fade edge indicator */}
        <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  )
})
