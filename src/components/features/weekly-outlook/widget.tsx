import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'
import type { WeeklyNarrative } from '../../../lib/forecast/types'
import { OutlookModal } from './modal'
import { useIsMobile } from '../../../hooks/use-mobile'
import { WeatherIcon } from '@/components/ui/weather-icon'

interface WeeklyOutlookWidgetProps {
  narrative: WeeklyNarrative | null
  isLoading?: boolean
}

export function WeeklyOutlookWidget({ narrative, isLoading }: WeeklyOutlookWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  // Animate in when narrative is ready
  useEffect(() => {
    if (narrative && !isLoading) {
      const showTimer = setTimeout(() => setIsVisible(true), 300)
      return () => clearTimeout(showTimer)
    }
  }, [narrative, isLoading])

  if (!narrative && !isLoading) return null

  // Get teaser info
  const today = narrative?.days[0]
  const nextChange = narrative?.days.find(
    (d, i) => i > 0 && d.icon !== today?.icon
  )

  // Mobile: Sticky bottom bar above footer
  if (isMobile) {
    const shouldShow = isVisible

    return (
      <>
        <div
          className={`
            fixed bottom-7 left-0 right-0 z-30
            bg-card/95 backdrop-blur-lg border-t border-border
            transition-all duration-300 ease-out
            ${shouldShow ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          `}
        >
          <button
            onClick={() => setIsOpen(true)}
            disabled={isLoading || !narrative}
            className="w-full flex items-center justify-between px-4 py-3 active:bg-muted/50 transition-colors disabled:opacity-50"
            aria-label={t('weeklyOutlook', 'Weekly Outlook')}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">{t('loading', 'Loading...')}</span>
              </div>
            ) : narrative && today ? (
              <>
                <div className="flex items-center gap-3">
                  <WeatherIcon name={today.icon} size="xl" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{today.tempHigh}&deg;</span>
                      {nextChange && (
                        <>
                          <span className="text-muted-foreground">&rarr;</span>
                          <WeatherIcon name={nextChange.icon} size="lg" />
                          <span className="text-sm text-muted-foreground">{nextChange.dayOfWeek}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {narrative.summary.slice(0, 50)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs font-medium">{t('weeklyOutlook', 'Weekly Outlook')}</span>
                </div>
              </>
            ) : null}
          </button>
        </div>

        {/* Spacer to prevent content from being hidden behind sticky bar + footer */}
        <div className={`h-24 ${shouldShow ? 'block' : 'hidden'}`} />

        {narrative && (
          <OutlookModal
            open={isOpen}
            onOpenChange={setIsOpen}
            narrative={narrative}
            fullScreen
          />
        )}
      </>
    )
  }

  // Desktop: Top-right widget below header, slides in from right
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isLoading || !narrative}
        className={`
          fixed top-[72px] right-6 z-40
          flex items-center gap-3 rounded-2xl
          bg-card/95 backdrop-blur-lg border border-border
          px-4 py-3 shadow-lg
          transition-all duration-500 ease-out
          hover:shadow-xl hover:scale-[1.02]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isVisible
            ? 'translate-x-0 opacity-100'
            : 'translate-x-[120%] opacity-0'
          }
        `}
        aria-label={t('weeklyOutlook', 'Weekly Outlook')}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">{t('loading', 'Loading...')}</span>
          </div>
        ) : narrative && today ? (
          <>
            <div className="flex items-center gap-2">
              <WeatherIcon name={today.icon} size="xl" />
              <span className="text-lg font-semibold">{today.tempHigh}&deg;C</span>
            </div>
            {nextChange && (
              <>
                <span className="text-muted-foreground">&rarr;</span>
                <div className="flex items-center gap-1">
                  <WeatherIcon name={nextChange.icon} size="lg" />
                  <span className="text-sm text-muted-foreground">{nextChange.dayOfWeek}</span>
                </div>
              </>
            )}
            <div className="ml-2 text-xs text-muted-foreground border-l border-border pl-3 flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {t('weeklyOutlook', 'Weekly Outlook')}
            </div>
          </>
        ) : null}
      </button>

      {narrative && (
        <OutlookModal
          open={isOpen}
          onOpenChange={setIsOpen}
          narrative={narrative}
        />
      )}
    </>
  )
}
