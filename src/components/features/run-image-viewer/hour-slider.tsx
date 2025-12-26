'use client'

import { memo, useState } from 'react'
import { type ForecastDateTime } from './types'
import { snapToValidHour, MODEL_HOUR_CONFIG } from './types'
import { type ModelId } from '../../../types/models'

interface HourSliderProps {
  forecastHour: number
  onChange: (hour: number) => void
  forecastDateTime: ForecastDateTime
  model: ModelId
}

export const HourSlider = memo(function HourSlider({
  forecastHour,
  onChange,
  forecastDateTime,
  model,
}: HourSliderProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const hourConfig = MODEL_HOUR_CONFIG[model]
  const minHour = hourConfig.min
  const maxHour = hourConfig.max
  const hourStep = hourConfig.step

  const goToPrevious = () => {
    onChange(Math.max(minHour, forecastHour - hourStep))
  }

  const goToNext = () => {
    onChange(Math.min(maxHour, forecastHour + hourStep))
  }

  const quickPickHours = [24, 48, 72, 120, 168]

  return (
    <div className="p-3 sm:p-4 border-t border-border bg-muted/30">
      {/* Prev/Next Buttons with Time */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button
          onClick={goToPrevious}
          disabled={forecastHour <= minHour}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs sm:text-sm text-muted-foreground font-mono">-{hourStep}h</span>
        </button>

        <div className="text-center">
          <div className="text-sm font-semibold text-foreground">{forecastDateTime.weekday}</div>
          <div className="text-xs text-muted-foreground font-mono">{forecastDateTime.time}</div>
        </div>

        <button
          onClick={goToNext}
          disabled={forecastHour >= maxHour}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-xs sm:text-sm text-muted-foreground font-mono">+{hourStep}h</span>
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Slider with tooltip that follows thumb */}
      <div
        className="relative py-3"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Tooltip - positioned above slider thumb, follows its position */}
        {showTooltip && (
          <div
            className="absolute bottom-full mb-2 -translate-x-1/2 z-10 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-100"
            style={{
              // Calculate position: percentage across track, adjusted for thumb width (12px on each side)
              left: `calc(${((forecastHour - minHour) / (maxHour - minHour)) * 100}% + ${12 - ((forecastHour - minHour) / (maxHour - minHour)) * 24}px)`,
            }}
          >
            <div className="px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-mono whitespace-nowrap shadow-lg">
              +{forecastHour}h ({Math.floor(forecastHour / 24)}d {forecastHour % 24}h)
            </div>
            {/* Arrow pointing down to thumb */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-foreground" />
          </div>
        )}
        <input
          type="range"
          min={minHour}
          max={maxHour}
          step={hourStep}
          value={forecastHour}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          aria-label="Forecast hour"
          aria-valuemin={minHour}
          aria-valuemax={maxHour}
          aria-valuenow={forecastHour}
          aria-valuetext={`+${forecastHour} hours (${Math.floor(forecastHour / 24)} days ${forecastHour % 24} hours)`}
          className="
            w-full h-2 sm:h-2.5 rounded-full appearance-none cursor-pointer
            bg-border
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:sm:w-6
            [&::-webkit-slider-thumb]:sm:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:shadow-primary/30
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-background
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-background
            [&::-moz-range-thumb]:cursor-grab
          "
        />
      </div>

      {/* Hour markers - model aware */}
      <div className="flex justify-between mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono">
        <span>+{minHour}h</span>
        <span>+3d</span>
        <span>+5d</span>
        <span>+7d</span>
        <span>+{Math.floor(maxHour / 24)}d</span>
      </div>

      {/* Quick select buttons - model aware */}
      <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {quickPickHours.map((h) => {
          // Snap to valid hour for this model
          const validHour = snapToValidHour(h, model)
          // Skip if beyond model's max
          if (validHour > maxHour) return null
          return (
            <button
              key={h}
              onClick={() => onChange(validHour)}
              className={`
                flex-1 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium font-mono transition-all
                ${forecastHour === validHour
                  ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
              `}
            >
              +{validHour / 24}d
            </button>
          )
        })}
      </div>
    </div>
  )
})
