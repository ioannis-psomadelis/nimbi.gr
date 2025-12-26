import * as Dialog from '@radix-ui/react-dialog'
import { X, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { WeeklyNarrative } from '../../../lib/forecast/types'
import { DayCard } from './day-card'
import { WeekChart } from './week-chart'
import { ConfidenceIndicator } from './confidence-indicator'

interface OutlookModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  narrative: WeeklyNarrative
  fullScreen?: boolean
}

export function OutlookModal({ open, onOpenChange, narrative, fullScreen }: OutlookModalProps) {
  const { t } = useTranslation()

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`
            fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          `}
        />
        <Dialog.Content
          className={`
            fixed z-50 bg-card shadow-2xl
            data-[state=open]:animate-in data-[state=closed]:animate-out
            ${fullScreen
              ? `
                inset-0
                data-[state=closed]:slide-out-to-bottom
                data-[state=open]:slide-in-from-bottom
                data-[state=closed]:duration-300
                data-[state=open]:duration-500
              `
              : `
                left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                w-full max-w-2xl rounded-2xl border border-border
                max-h-[85vh]
                data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
              `
            }
            flex flex-col
          `}
        >
          {/* Header */}
          <div className={`
            flex items-center justify-between p-4 border-b border-border
            ${fullScreen ? 'pt-safe' : ''}
          `}>
            <div>
              <Dialog.Title className="text-lg font-semibold">
                {t('weeklyOutlook', 'Weekly Outlook')}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground flex items-center gap-1">
                <span>{narrative.location}</span>
              </Dialog.Description>
            </div>
            <Dialog.Close className={`
              rounded-lg p-2 hover:bg-muted transition-colors
              ${fullScreen ? 'bg-muted' : ''}
            `}>
              {fullScreen ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          {/* Summary + Chart (Desktop only) */}
          <div className={`p-4 border-b border-border bg-muted/20 ${fullScreen ? '' : 'pb-2'}`}>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{narrative.days[0]?.icon}</span>
              <div className="flex-1">
                <p className="text-sm leading-relaxed font-medium">{narrative.summary}</p>
                <div className="mt-3">
                  <ConfidenceIndicator
                    level={narrative.confidence}
                    description={narrative.confidenceText.split(' - ')[1] || narrative.confidenceText}
                  />
                </div>
              </div>
            </div>

            {/* Temperature Chart - Desktop only */}
            {!fullScreen && (
              <div className="mt-4 -mx-2">
                <WeekChart days={narrative.days} />
              </div>
            )}
          </div>

          {/* Days */}
          <div className={`
            flex-1 overflow-y-auto p-4
            ${fullScreen ? 'pb-safe space-y-3' : 'grid grid-cols-2 gap-3'}
          `}>
            {narrative.days.map((day, index) => (
              <DayCard key={day.date.toISOString()} day={day} isToday={index === 0} compact={!fullScreen} />
            ))}
          </div>

          {/* Footer */}
          <div className={`
            p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground
            ${fullScreen ? 'pb-safe' : ''}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{t('basedOn', 'Based on')} {narrative.primaryModelName}</span>
                <span>&bull;</span>
                <span>{t('updated', 'Updated')} {formatTime(narrative.lastUpdated)}</span>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
