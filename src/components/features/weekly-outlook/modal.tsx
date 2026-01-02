import * as Dialog from '@radix-ui/react-dialog'
import { X, ChevronDown, Download, Sunrise, Sunset } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRef, useCallback, useState } from 'react'
import type { WeeklyNarrative } from '../../../lib/forecast/types'
import { DayCard } from './day-card'
import { WeekChart } from './week-chart'
import { ConfidenceIndicator } from './confidence-indicator'
import { AirQualityCard } from '../air-quality'
import { WeatherIcon } from '@/components/ui/weather-icon'

interface OutlookModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  narrative: WeeklyNarrative
  fullScreen?: boolean
}

export function OutlookModal({ open, onOpenChange, narrative, fullScreen }: OutlookModalProps) {
  const { t } = useTranslation()
  const contentRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!contentRef.current) return

    setIsDownloading(true)
    try {
      const { toPng } = await import('html-to-image')

      // Get computed styles to inline them for the capture
      const computedStyle = getComputedStyle(document.documentElement)
      const bgColor = computedStyle.getPropertyValue('--card').trim() || '0 0% 11%'

      // Convert HSL to actual color for background
      const hslToRgb = (hsl: string) => {
        const parts = hsl.split(' ').map(p => parseFloat(p))
        if (parts.length < 3) return '#1c1c1c'
        const [h, s, l] = [parts[0], parts[1] / 100, parts[2] / 100]
        const a = s * Math.min(l, 1 - l)
        const f = (n: number) => {
          const k = (n + h / 30) % 12
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
          return Math.round(255 * color).toString(16).padStart(2, '0')
        }
        return `#${f(0)}${f(8)}${f(4)}`
      }

      // Use PNG for lossless quality, higher pixel ratio for sharper images
      const dataUrl = await toPng(contentRef.current, {
        backgroundColor: hslToRgb(bgColor),
        pixelRatio: 3, // Higher for better quality on retina displays
        style: {
          transform: 'none',
        },
        filter: (node) => {
          if (node instanceof Element && node.hasAttribute('data-exclude-capture')) {
            return false
          }
          return true
        },
      })

      const link = document.createElement('a')
      link.download = `nimbi-forecast-${narrative.location.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to download forecast:', error)
    } finally {
      setIsDownloading(false)
    }
  }, [narrative.location])

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
            flex flex-col overflow-hidden
          `}
        >
          {/* Close button - outside capture area */}
          <Dialog.Close
            data-exclude-capture
            className={`
              absolute z-10 rounded-lg p-2 hover:bg-muted/80 transition-colors
              ${fullScreen ? 'top-4 right-4 bg-muted' : 'top-3 right-3'}
            `}
          >
            {fullScreen ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
            <span className="sr-only">Close</span>
          </Dialog.Close>

          {/* Capture wrapper - contains only the content to be captured */}
          <div ref={contentRef} className="flex flex-col flex-1 overflow-hidden bg-card">
            {/* Header */}
            <div className={`
              p-4 border-b border-border
              ${fullScreen ? 'pt-safe' : ''}
            `}>
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {t('weeklyOutlook', 'Weekly Outlook')}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {narrative.location}
              </Dialog.Description>
            </div>

            {/* Summary + Chart */}
            <div className={`p-4 border-b border-border bg-muted/20 ${fullScreen ? '' : 'pb-2'}`}>
              <div className="flex items-start gap-3 mb-4">
                {narrative.days[0] && (
                  <WeatherIcon name={narrative.days[0].icon} size="2xl" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed font-medium text-foreground">{narrative.summary}</p>
                  <div className="mt-3">
                    <ConfidenceIndicator
                      level={narrative.confidence}
                      description={narrative.confidenceText.split(' - ')[1] || narrative.confidenceText}
                    />
                  </div>
                </div>
              </div>

              {/* Sunrise/Sunset + Air Quality Row */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
                {/* Sunrise */}
                {narrative.sunrise && (
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-foreground">{narrative.sunrise}</span>
                  </div>
                )}
                {/* Sunset */}
                {narrative.sunset && (
                  <div className="flex items-center gap-2">
                    <Sunset className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-foreground">{narrative.sunset}</span>
                  </div>
                )}
                {/* Spacer */}
                <div className="flex-1" />
                {/* Air Quality inline */}
                {narrative.lat && narrative.lon && (
                  <AirQualityCard lat={narrative.lat} lon={narrative.lon} variant="inline" />
                )}
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

            {/* Footer info - included in capture */}
            <div className={`
              px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground
              ${fullScreen ? 'pb-safe' : ''}
            `}>
              <div className="flex items-center gap-2">
                <span>{t('basedOn', 'Based on')} {narrative.primaryModelName}</span>
                <span>•</span>
                <span>{t('updated', 'Updated')} {formatTime(narrative.lastUpdated)}</span>
              </div>
            </div>
          </div>

          {/* Download button - outside capture area, fixed at bottom */}
          <div
            data-exclude-capture
            className={`
              px-4 py-3 border-t border-border bg-card
              ${fullScreen ? 'pb-safe' : ''}
            `}
          >
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors disabled:opacity-50"
              title={t('downloadForecast', 'Download forecast')}
            >
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>{t('downloading', 'Downloading...')}</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>{t('downloadForecast', 'Download forecast')}</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
