'use client'

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Wind,
  Snowflake,
  CloudLightning,
  CloudFog,
  Thermometer,
  Waves,
  Flame,
  Mountain,
  CloudRain,
  Droplets,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react'
import {
  weatherAlertsQueryOptions,
  getSeverityColor,
  type WeatherAlert,
  type AlertType,
  type AlertSeverity,
} from '@/lib/api/alerts'
import { Skeleton } from '@/components/ui/skeleton'

interface WeatherAlertsProps {
  countryCode: string
  lat?: number
  lon?: number
  locationName?: string
  compact?: boolean
}

/**
 * Get the icon component for an alert type
 */
function AlertIcon({ type, className }: { type: AlertType; className?: string }) {
  const iconProps = { className: className || 'h-5 w-5' }

  switch (type) {
    case 'wind':
      return <Wind {...iconProps} />
    case 'snow-ice':
      return <Snowflake {...iconProps} />
    case 'thunderstorm':
      return <CloudLightning {...iconProps} />
    case 'fog':
      return <CloudFog {...iconProps} />
    case 'high-temperature':
      return <Thermometer {...iconProps} />
    case 'low-temperature':
      return <Thermometer {...iconProps} />
    case 'coastal-event':
      return <Waves {...iconProps} />
    case 'forest-fire':
      return <Flame {...iconProps} />
    case 'avalanche':
      return <Mountain {...iconProps} />
    case 'rain':
      return <CloudRain {...iconProps} />
    case 'flood':
    case 'rain-flood':
      return <Droplets {...iconProps} />
    default:
      return <AlertTriangle {...iconProps} />
  }
}

/**
 * Severity badge component
 */
function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const { t } = useTranslation()
  const colors = getSeverityColor(severity)

  const label = t(`alertSeverity.${severity}`)

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {label}
    </span>
  )
}

/**
 * Format date for display
 */
function formatAlertTime(dateString: string, locale: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString(locale === 'el' ? 'el-GR' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

/**
 * Single alert card component
 */
const AlertCard = memo(function AlertCard({
  alert,
  compact,
}: {
  alert: WeatherAlert
  compact?: boolean
}) {
  const { t, i18n } = useTranslation()
  const colors = getSeverityColor(alert.severity)

  // Get translated alert type
  const alertTypeLabel = t(`alertType.${alert.type}`)

  if (compact) {
    return (
      <a
        href="https://www.meteoalarm.org"
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-3 p-3 rounded-lg border ${colors.bg} ${colors.border} hover:opacity-80 transition-opacity cursor-pointer`}
      >
        <div className={`shrink-0 ${colors.icon}`}>
          <AlertIcon type={alert.type} className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${colors.text}`}>
              {alertTypeLabel}
            </span>
            <SeverityBadge severity={alert.severity} />
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {alert.areaDesc}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </a>
    )
  }

  return (
    <div
      className={`p-4 rounded-xl border ${colors.bg} ${colors.border} space-y-3`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`shrink-0 p-2 rounded-lg ${colors.bg} ${colors.icon}`}>
          <AlertIcon type={alert.type} className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${colors.text}`}>
              {alertTypeLabel}
            </span>
            <SeverityBadge severity={alert.severity} />
          </div>
          <p className={`text-xs mt-1 ${colors.text} opacity-80`}>
            {alert.headline}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs text-muted-foreground">
        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{alert.areaDesc}</span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            {t('alertValidUntil')} {formatAlertTime(alert.expires, i18n.language)}
          </span>
        </div>
      </div>
    </div>
  )
})

/**
 * Loading skeleton for alerts
 */
function AlertsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border bg-muted/30 space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Empty state when no alerts
 */
function NoAlerts() {
  const { t } = useTranslation()

  return (
    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
      <div className="inline-flex items-center justify-center p-2 rounded-full bg-emerald-500/10 mb-2">
        <AlertTriangle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
        {t('noActiveAlerts')}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {t('noActiveAlertsDesc')}
      </p>
    </div>
  )
}

/**
 * Weather Alerts component
 * Displays active weather warnings from MeteoAlarm for European countries
 */
export const WeatherAlerts = memo(function WeatherAlerts({
  countryCode,
  lat: _lat, // Reserved for future location-based filtering
  lon: _lon, // Reserved for future location-based filtering
  locationName,
  compact = false,
}: WeatherAlertsProps) {
  const { t } = useTranslation()

  const { data: alerts, isLoading, isError } = useQuery(
    weatherAlertsQueryOptions(countryCode)
  )

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    if (!alerts) return []

    const severityOrder: Record<AlertSeverity, number> = {
      extreme: 0,
      severe: 1,
      moderate: 2,
      minor: 3,
    }

    // Sort by severity first
    const sorted = [...alerts].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    )

    // If locationName provided, filter alerts that mention the location
    if (locationName) {
      const locationLower = locationName.toLowerCase()
      const locationMatches = sorted.filter(alert =>
        alert.areaDesc.toLowerCase().includes(locationLower)
      )

      // If we have location matches, show those
      if (locationMatches.length > 0) {
        return locationMatches
      }

      // Fallback: show only severe/extreme alerts for the country
      // (they might affect the location even if not specifically named)
      return sorted.filter(
        alert => alert.severity === 'extreme' || alert.severity === 'severe'
      )
    }

    return sorted
  }, [alerts, locationName])

  // Filter to show only top 3 in compact mode
  const displayAlerts = compact ? filteredAlerts.slice(0, 3) : filteredAlerts

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">
            {t('weatherAlerts')}
          </h3>
        </div>
        <AlertsSkeleton count={compact ? 2 : 3} />
      </div>
    )
  }

  if (isError) {
    return null // Silently fail - alerts are supplementary
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">
            {t('weatherAlerts')}
          </h3>
          {filteredAlerts.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
              {filteredAlerts.length}
            </span>
          )}
        </div>
        {compact && filteredAlerts.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{filteredAlerts.length - 3} {t('more')}
          </span>
        )}
      </div>

      {/* Alerts list or empty state */}
      {displayAlerts.length > 0 ? (
        <div className="space-y-2">
          {displayAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} compact={compact} />
          ))}
        </div>
      ) : (
        <NoAlerts />
      )}

      {/* Attribution */}
      <p className="text-[10px] text-muted-foreground text-center">
        {t('alertsSource')}:{' '}
        <a
          href="https://www.meteoalarm.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          MeteoAlarm
        </a>
      </p>
    </div>
  )
})
