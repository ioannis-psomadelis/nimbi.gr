import type { NarrativeDay } from '../../../lib/forecast/types'
import { Droplets, Wind, Sun } from 'lucide-react'
import { WeatherIcon } from '@/components/ui/weather-icon'

interface DayCardProps {
  day: NarrativeDay
  isToday?: boolean
  compact?: boolean
}

// Temperature color based on value
function getTempColor(temp: number): string {
  if (temp >= 35) return 'text-red-500'
  if (temp >= 30) return 'text-orange-500'
  if (temp >= 25) return 'text-amber-500'
  if (temp >= 15) return 'text-foreground'
  if (temp >= 5) return 'text-cyan-500'
  return 'text-blue-500'
}

// UV index severity
function getUVInfo(uv: number): { color: string; label: string } {
  if (uv >= 11) return { color: 'text-purple-500', label: 'Extreme' }
  if (uv >= 8) return { color: 'text-red-500', label: 'Very High' }
  if (uv >= 6) return { color: 'text-orange-500', label: 'High' }
  if (uv >= 3) return { color: 'text-yellow-500', label: 'Moderate' }
  return { color: 'text-green-500', label: 'Low' }
}

// Agreement level info - extracted to avoid duplication
function getAgreementInfo(agreement: number) {
  if (agreement >= 80) return { dots: 3, bg: 'bg-green-500', text: 'text-green-500', label: 'High' }
  if (agreement >= 60) return { dots: 2, bg: 'bg-yellow-500', text: 'text-yellow-500', label: 'Medium' }
  return { dots: 1, bg: 'bg-orange-500', text: 'text-orange-500', label: 'Low' }
}

// Visual agreement indicator with dots
function AgreementIndicator({ agreement }: { agreement: number }) {
  const { dots, bg, text, label } = getAgreementInfo(agreement)

  return (
    <div className="flex items-center gap-1" title={`${agreement}% model agreement`}>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= dots ? bg : 'bg-muted-foreground/20'}`}
          />
        ))}
      </div>
      <span className={`text-[10px] ${text}`}>{label}</span>
    </div>
  )
}

export function DayCard({ day, isToday, compact }: DayCardProps) {
  const showFeelsLike = Math.abs(day.feelsLikeHigh - day.tempHigh) >= 2
  const uvInfo = getUVInfo(day.uvMax)

  // Compact variant for desktop grid
  if (compact) {
    return (
      <div
        className={`
          px-2.5 py-2 rounded-lg
          ${isToday ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}
        `}
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5">
            <WeatherIcon name={day.icon} size="lg" />
            <h3 className={`text-xs font-medium ${isToday ? 'text-primary' : ''}`}>
              {day.dayOfWeek}
            </h3>
          </div>
          <AgreementIndicator agreement={day.agreement} />
        </div>

        {/* Temperature display */}
        <div className="flex items-baseline gap-0.5">
          <span className={`text-sm font-semibold ${getTempColor(day.tempHigh)}`}>
            {day.tempHigh}&deg;
          </span>
          <span className="text-muted-foreground text-xs">/</span>
          <span className={`text-xs ${getTempColor(day.tempLow)}`}>
            {day.tempLow}&deg;
          </span>
          {showFeelsLike && (
            <span className="text-[9px] text-muted-foreground ml-1">
              ({day.feelsLikeHigh}&deg;)
            </span>
          )}
        </div>

        {/* Weather metrics - single line */}
        <div className="flex items-center gap-1.5 mt-1 text-[10px]">
          {day.precipTotal > 0 && (
            <span className="flex items-center gap-0.5 text-cyan-500">
              <Droplets className="w-2.5 h-2.5" />
              {day.precipTotal.toFixed(1)}
            </span>
          )}
          {day.windMax > 10 && (
            <span className="flex items-center gap-0.5 text-purple-500">
              <Wind className="w-2.5 h-2.5" />
              {day.windMax}
            </span>
          )}
          {day.uvMax >= 3 && (
            <span className={`flex items-center gap-0.5 ${uvInfo.color}`}>
              <Sun className="w-2.5 h-2.5" />
              {day.uvMax}
            </span>
          )}
        </div>
      </div>
    )
  }

  // Full variant for mobile
  return (
    <div
      className={`rounded-lg ${
        isToday ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
      }`}
    >
      {/* Main content */}
      <div className="flex items-start gap-3 p-3">
        {/* Icon */}
        <WeatherIcon name={day.icon} size="2xl" className="flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
              {day.dayOfWeek}
            </h3>
            <AgreementIndicator agreement={day.agreement} />
          </div>

          {/* Temperature display with colors */}
          <div className="flex items-baseline gap-1 mb-1">
            <span className={`text-lg font-semibold ${getTempColor(day.tempHigh)}`}>
              {day.tempHigh}&deg;
            </span>
            <span className="text-muted-foreground text-sm">/</span>
            <span className={`text-sm ${getTempColor(day.tempLow)}`}>
              {day.tempLow}&deg;
            </span>
            {showFeelsLike && (
              <span className="text-[10px] text-muted-foreground ml-1">
                (feels {day.feelsLikeHigh}&deg;)
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {day.headline}
          </p>
        </div>
      </div>

      {/* Weather metrics bar */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-t border-border/30 text-[10px]">
        {day.precipTotal > 0 && (
          <span className="flex items-center gap-0.5 text-cyan-500">
            <Droplets className="w-3 h-3" />
            {day.precipTotal.toFixed(1)}mm
          </span>
        )}
        {day.windMax > 0 && (
          <span className="flex items-center gap-0.5 text-purple-500">
            <Wind className="w-3 h-3" />
            {day.windMax}
          </span>
        )}
        {day.uvMax >= 3 && (
          <span className={`flex items-center gap-0.5 ${uvInfo.color}`}>
            <Sun className="w-3 h-3" />
            {day.uvMax}
          </span>
        )}
      </div>

      {day.modelNote && (
        <div className="px-3 py-1.5 border-t border-amber-200/20 bg-amber-500/5">
          <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-amber-500" />
            {day.modelNote}
          </p>
        </div>
      )}
    </div>
  )
}
