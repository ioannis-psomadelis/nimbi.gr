import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { WeeklyNarrative } from '../../../lib/forecast/types'
import { OutlookModal } from './modal'
import { useIsMobile } from '../../../hooks/use-mobile'
import { WeatherIcon } from '@/components/ui/weather-icon'

interface OutlookTriggerProps {
  narrative: WeeklyNarrative | null
  variant?: 'default' | 'compact' | 'icon' | 'sidebar'
  className?: string
}

/**
 * Reusable trigger button that can be placed anywhere to open the outlook modal
 */
export function OutlookTrigger({ narrative, variant = 'default', className = '' }: OutlookTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  if (!narrative) return null

  const today = narrative.days[0]
  if (!today) return null

  // Icon only variant
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`
            p-2 rounded-lg hover:bg-muted transition-colors
            text-muted-foreground hover:text-foreground
            ${className}
          `}
          aria-label={t('weeklyOutlook', 'Weekly Outlook')}
        >
          <CalendarDays className="h-5 w-5" />
        </button>
        <OutlookModal
          open={isOpen}
          onOpenChange={setIsOpen}
          narrative={narrative}
          fullScreen={isMobile}
        />
      </>
    )
  }

  // Compact variant - just icon + temp
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg
            bg-muted/50 hover:bg-muted transition-colors
            text-sm
            ${className}
          `}
        >
          <WeatherIcon name={today.icon} size="lg" />
          <span className="font-medium">{today.tempHigh}&deg;</span>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </button>
        <OutlookModal
          open={isOpen}
          onOpenChange={setIsOpen}
          narrative={narrative}
          fullScreen={isMobile}
        />
      </>
    )
  }

  // Sidebar variant - fits in sidebar style
  if (variant === 'sidebar') {
    const nextChange = narrative.days.find((d, i) => i > 0 && d.icon !== today.icon)

    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`
            w-full p-3 rounded-xl
            bg-gradient-to-br from-primary/10 to-primary/5
            border border-primary/20
            hover:border-primary/40 transition-all
            text-left group
            ${className}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-primary font-medium">
              {t('weeklyOutlook', 'Weekly Outlook')}
            </span>
            <CalendarDays className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-center gap-3">
            <WeatherIcon name={today.icon} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{today.tempHigh}&deg;</span>
                {nextChange && (
                  <>
                    <span className="text-muted-foreground text-sm">&rarr;</span>
                    <WeatherIcon name={nextChange.icon} size="lg" />
                    <span className="text-xs text-muted-foreground">{nextChange.dayOfWeek}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {narrative.summary.slice(0, 40)}...
              </p>
            </div>
          </div>
        </button>
        <OutlookModal
          open={isOpen}
          onOpenChange={setIsOpen}
          narrative={narrative}
          fullScreen={isMobile}
        />
      </>
    )
  }

  // Default variant - full button
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-xl
          bg-card border border-border
          hover:bg-muted/50 transition-colors
          ${className}
        `}
      >
        <WeatherIcon name={today.icon} size="xl" />
        <div className="text-left">
          <div className="text-sm font-medium">{today.tempHigh}&deg;C</div>
          <div className="text-xs text-muted-foreground">{t('weeklyOutlook', 'Weekly Outlook')}</div>
        </div>
        <CalendarDays className="h-4 w-4 text-muted-foreground ml-auto" />
      </button>
      <OutlookModal
        open={isOpen}
        onOpenChange={setIsOpen}
        narrative={narrative}
        fullScreen={isMobile}
      />
    </>
  )
}
