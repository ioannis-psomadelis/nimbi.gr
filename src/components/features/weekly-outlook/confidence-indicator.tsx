import * as Tooltip from '@radix-ui/react-tooltip'
import { useTranslation } from 'react-i18next'
import type { ConfidenceLevel } from '../../../lib/forecast/types'

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel
  description: string
}

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { dots: number; color: string; bgColor: string }> = {
  high: {
    dots: 5,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
  },
  medium: {
    dots: 3,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
  },
  low: {
    dots: 2,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
  },
}

export function ConfidenceIndicator({ level, description }: ConfidenceIndicatorProps) {
  const { t } = useTranslation()
  const config = CONFIDENCE_CONFIG[level]
  const totalDots = 5

  const labelMap: Record<ConfidenceLevel, string> = {
    high: t('highConfidence', 'High confidence'),
    medium: t('moderateConfidence', 'Moderate confidence'),
    low: t('lowerConfidence', 'Lower confidence'),
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-help">
            {/* Dots */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: totalDots }).map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-2 h-2 rounded-full transition-colors
                    ${i < config.dots ? config.bgColor : 'bg-muted-foreground/20'}
                  `}
                />
              ))}
            </div>
            {/* Label */}
            <span className={`text-xs font-medium ${config.color}`}>
              {labelMap[level]}
            </span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={8}
            className="z-50 max-w-xs rounded-lg bg-foreground text-background px-3 py-2 shadow-lg animate-in fade-in-0 zoom-in-95"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: totalDots }).map((_, i) => (
                    <div
                      key={i}
                      className={`
                        w-1.5 h-1.5 rounded-full
                        ${i < config.dots ? config.bgColor : 'bg-muted-foreground/20'}
                      `}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-background">
                  {labelMap[level]}
                </span>
              </div>
              <p className="text-xs text-background/80 leading-relaxed">
                {description}
              </p>
              <div className="pt-1 border-t border-background/20 mt-2">
                <p className="text-[10px] text-background/60">
                  {t('confidenceExplanation', 'Based on agreement between ECMWF HD, GFS, GEM, and UKMO weather models.')}
                </p>
              </div>
            </div>
            <Tooltip.Arrow className="fill-foreground" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
