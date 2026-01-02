'use client'

import { memo, useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { WeatherIcon, preloadWeatherIcons, type MeteoconName } from './weather-icon'

const WEATHER_SEQUENCE: MeteoconName[] = [
  'clear-day',
  'partly-cloudy-day',
  'cloudy',
  'rain',
  'thunderstorms',
  'snow',
]

const ICON_COUNT = WEATHER_SEQUENCE.length
const DURATION_PER_ICON = 2.5 // seconds
const TOTAL_DURATION = ICON_COUNT * DURATION_PER_ICON // 15 seconds total
const STYLE_ID = 'animated-logo-keyframes'

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_MAP = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-9 h-9',
  xl: 'w-12 h-12',
} as const

/**
 * Generate CSS keyframes for scale animation
 * Each icon scales up, holds, then scales back down
 */
function generateKeyframes(): string {
  const transitionTime = 2 // % of total time for scale transition

  return WEATHER_SEQUENCE.map((_, index) => {
    const startPercent = (index / ICON_COUNT) * 100
    const endPercent = ((index + 1) / ICON_COUNT) * 100
    const scaleInEnd = startPercent + transitionTime
    const scaleOutStart = endPercent - transitionTime

    // First icon needs special handling for loop continuity
    if (index === 0) {
      return `
        @keyframes weatherReveal${index} {
          0% { transform: scale(1); }
          ${scaleOutStart}% { transform: scale(1); }
          ${endPercent}% { transform: scale(0); }
          ${100 - transitionTime}% { transform: scale(0); }
          100% { transform: scale(1); }
        }
      `
    }

    return `
      @keyframes weatherReveal${index} {
        0%, ${startPercent}% { transform: scale(0); }
        ${scaleInEnd}% { transform: scale(1); }
        ${scaleOutStart}% { transform: scale(1); }
        ${endPercent}%, 100% { transform: scale(0); }
      }
    `
  }).join('\n')
}

const keyframesCSS = generateKeyframes()

// Track if keyframes have been injected (singleton)
let keyframesInjected = false

/**
 * Inject keyframes CSS only once into the document
 */
function injectKeyframes(): void {
  if (typeof document === 'undefined') return
  if (keyframesInjected) return
  if (document.getElementById(STYLE_ID)) {
    keyframesInjected = true
    return
  }

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = keyframesCSS
  document.head.appendChild(style)
  keyframesInjected = true
}

/**
 * AnimatedLogo - Cycles through weather icons with scale reveal animation
 * Each new icon scales up over the previous, creating a layered reveal effect
 */
export const AnimatedLogo = memo(function AnimatedLogo({
  size = 'md',
  className,
}: AnimatedLogoProps) {
  const [isReady, setIsReady] = useState(false)
  // Default to true for SSR safety - prevents hydration mismatch
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true)
  const hasInjectedRef = useRef(false)

  // Check for reduced motion preference on client
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Inject keyframes once and preload icons
  useEffect(() => {
    if (!hasInjectedRef.current) {
      injectKeyframes()
      hasInjectedRef.current = true
    }

    // Preload all icons into cache
    preloadWeatherIcons(WEATHER_SEQUENCE, 'fill').then(() => {
      setIsReady(true)
    })
  }, [])

  const sizeClass = SIZE_MAP[size]

  // Show static icon for reduced motion or while loading
  if (prefersReducedMotion || !isReady) {
    return (
      <div className={cn('relative', sizeClass, className)}>
        <WeatherIcon name="clear-day" size="xl" className="w-full h-full" />
      </div>
    )
  }

  return (
    <div
      className={cn('relative', sizeClass, className)}
      role="img"
      aria-label="nimbi weather logo"
    >
      {WEATHER_SEQUENCE.map((icon, index) => (
        <div
          key={icon}
          className="absolute inset-0 origin-center"
          style={{
            animation: `weatherReveal${index} ${TOTAL_DURATION}s cubic-bezier(0.34, 1.56, 0.64, 1) infinite`,
            zIndex: index,
            transform: index === 0 ? 'scale(1)' : 'scale(0)',
          }}
        >
          <WeatherIcon name={icon} size="xl" className="w-full h-full" />
        </div>
      ))}
    </div>
  )
})
