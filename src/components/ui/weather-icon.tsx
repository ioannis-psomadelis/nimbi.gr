'use client'

import { memo, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

/**
 * Available Meteocons icon names
 */
export type MeteoconName =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'overcast'
  | 'overcast-day'
  | 'overcast-night'
  | 'fog'
  | 'fog-day'
  | 'fog-night'
  | 'mist'
  | 'haze'
  | 'haze-day'
  | 'haze-night'
  | 'drizzle'
  | 'rain'
  | 'partly-cloudy-day-rain'
  | 'partly-cloudy-night-rain'
  | 'partly-cloudy-day-drizzle'
  | 'partly-cloudy-night-drizzle'
  | 'thunderstorms'
  | 'thunderstorms-day'
  | 'thunderstorms-night'
  | 'thunderstorms-rain'
  | 'thunderstorms-day-rain'
  | 'thunderstorms-night-rain'
  | 'snow'
  | 'sleet'
  | 'hail'
  | 'partly-cloudy-day-snow'
  | 'partly-cloudy-night-snow'
  | 'partly-cloudy-day-sleet'
  | 'partly-cloudy-night-sleet'
  | 'partly-cloudy-day-hail'
  | 'partly-cloudy-night-hail'
  | 'wind'
  | 'tornado'
  | 'hurricane'
  | 'dust'
  | 'dust-day'
  | 'dust-night'
  | 'smoke'
  | 'not-available'

/**
 * Icon style variants
 */
export type IconStyle = 'fill' | 'line'

/**
 * Size presets for consistent sizing
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const SIZE_CLASSES: Record<IconSize, string> = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
  '2xl': 'w-12 h-12',
}

interface WeatherIconProps {
  /** The Meteocons icon name */
  name: MeteoconName
  /** Icon style: 'fill' (solid) or 'line' (outlined) */
  style?: IconStyle
  /** Predefined size or custom class */
  size?: IconSize
  /** Additional CSS classes */
  className?: string
  /** Alt text for accessibility */
  alt?: string
}

// SVG cache to avoid refetching (client-side only)
const svgCache = typeof window !== 'undefined' ? new Map<string, string>() : null

/**
 * Preload SVGs into cache for faster rendering
 * Used by AnimatedLogo to prevent flash
 */
export async function preloadWeatherIcons(
  icons: MeteoconName[],
  style: IconStyle = 'fill'
): Promise<void> {
  if (!svgCache) return

  await Promise.all(
    icons.map(async (name) => {
      const cacheKey = `${style}/${name}`
      if (svgCache.has(cacheKey)) return

      try {
        const res = await fetch(`/weather-icons/${style}/${name}.svg`)
        if (!res.ok) return
        const svg = await res.text()
        const cleanSvg = svg
          .replace(/<\?xml[^>]*\?>/g, '')
          .replace(/<!DOCTYPE[^>]*>/g, '')
          .trim()
        svgCache.set(cacheKey, cleanSvg)
      } catch {
        // Silently fail
      }
    })
  )
}

/**
 * WeatherIcon - Renders animated Meteocons weather icons
 * Uses inline SVG for reliable animation support
 *
 * @example
 * <WeatherIcon name="clear-day" size="lg" />
 * <WeatherIcon name="rain" style="line" size="xl" />
 */
export const WeatherIcon = memo(function WeatherIcon({
  name,
  style = 'fill',
  size = 'md',
  className,
  alt,
}: WeatherIconProps) {
  const [svgContent, setSvgContent] = useState<string | null>(() => {
    if (!svgCache) return null
    const cacheKey = `${style}/${name}`
    return svgCache.get(cacheKey) || null
  })

  useEffect(() => {
    const cacheKey = `${style}/${name}`

    // Already have it cached
    if (svgCache?.has(cacheKey)) {
      setSvgContent(svgCache.get(cacheKey)!)
      return
    }

    // Fetch the SVG
    const controller = new AbortController()
    fetch(`/weather-icons/${style}/${name}.svg`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load icon')
        return res.text()
      })
      .then(svg => {
        // Remove XML declaration and doctype if present
        const cleanSvg = svg
          .replace(/<\?xml[^>]*\?>/g, '')
          .replace(/<!DOCTYPE[^>]*>/g, '')
          .trim()
        svgCache?.set(cacheKey, cleanSvg)
        setSvgContent(cleanSvg)
      })
      .catch(() => {
        // Silently fail - will show nothing
      })

    return () => controller.abort()
  }, [name, style])

  if (!svgContent) {
    // Placeholder while loading
    return (
      <div
        className={cn(SIZE_CLASSES[size], 'bg-muted/30 rounded animate-pulse', className)}
        role="img"
        aria-label={alt || name.replace(/-/g, ' ')}
      />
    )
  }

  return (
    <div
      className={cn(SIZE_CLASSES[size], '[&>svg]:w-full [&>svg]:h-full', className)}
      role="img"
      aria-label={alt || name.replace(/-/g, ' ')}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
})

/**
 * WMO Weather Code to Meteocons mapping
 * Based on Open-Meteo WMO Weather interpretation codes
 * https://open-meteo.com/en/docs
 */
export function getMeteoconFromWMO(
  code: number,
  isNight: boolean = false
): MeteoconName {
  // WMO Weather interpretation codes (WW)
  // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM

  switch (code) {
    // Clear sky
    case 0:
      return isNight ? 'clear-night' : 'clear-day'

    // Mainly clear
    case 1:
      return isNight ? 'clear-night' : 'clear-day'

    // Partly cloudy
    case 2:
      return isNight ? 'partly-cloudy-night' : 'partly-cloudy-day'

    // Overcast
    case 3:
      return 'cloudy'

    // Fog and depositing rime fog
    case 45:
    case 48:
      return isNight ? 'fog-night' : 'fog-day'

    // Drizzle: Light, moderate, and dense intensity
    case 51:
    case 53:
    case 55:
      return isNight ? 'partly-cloudy-night-drizzle' : 'partly-cloudy-day-drizzle'

    // Freezing Drizzle: Light and dense intensity
    case 56:
    case 57:
      return 'sleet'

    // Rain: Slight, moderate and heavy intensity
    case 61:
    case 63:
    case 65:
      return 'rain'

    // Freezing Rain: Light and heavy intensity
    case 66:
    case 67:
      return 'sleet'

    // Snow fall: Slight, moderate, and heavy intensity
    case 71:
    case 73:
    case 75:
      return 'snow'

    // Snow grains
    case 77:
      return 'snow'

    // Rain showers: Slight, moderate, and violent
    case 80:
    case 81:
    case 82:
      return isNight ? 'partly-cloudy-night-rain' : 'partly-cloudy-day-rain'

    // Snow showers slight and heavy
    case 85:
    case 86:
      return isNight ? 'partly-cloudy-night-snow' : 'partly-cloudy-day-snow'

    // Thunderstorm: Slight or moderate
    case 95:
      return isNight ? 'thunderstorms-night' : 'thunderstorms-day'

    // Thunderstorm with slight and heavy hail
    case 96:
    case 99:
      return isNight ? 'thunderstorms-night-rain' : 'thunderstorms-day-rain'

    default:
      return 'not-available'
  }
}

/**
 * Legacy condition type mapping (for backward compatibility)
 */
export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'windy'

/**
 * Map legacy weather conditions to Meteocons
 */
export function getMeteoconFromCondition(
  condition: WeatherCondition,
  isNight: boolean = false
): MeteoconName {
  switch (condition) {
    case 'sunny':
      return isNight ? 'clear-night' : 'clear-day'
    case 'partly_cloudy':
      return isNight ? 'partly-cloudy-night' : 'partly-cloudy-day'
    case 'cloudy':
      return 'cloudy'
    case 'rainy':
      return isNight ? 'partly-cloudy-night-rain' : 'partly-cloudy-day-rain'
    case 'stormy':
      return isNight ? 'thunderstorms-night-rain' : 'thunderstorms-day-rain'
    case 'snowy':
      return 'snow'
    case 'foggy':
      return isNight ? 'fog-night' : 'fog-day'
    case 'windy':
      return 'wind'
    default:
      return 'not-available'
  }
}

/**
 * Helper to determine if an hour is night time
 */
export function isNightHour(hour: number): boolean {
  return hour >= 20 || hour < 6
}

/**
 * Get icon URL for direct use (e.g., in img src or background-image)
 */
export function getWeatherIconUrl(
  name: MeteoconName,
  style: IconStyle = 'fill'
): string {
  return `/weather-icons/${style}/${name}.svg`
}
