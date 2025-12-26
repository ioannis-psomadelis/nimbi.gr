import type { NarrativeDay } from '../../../lib/forecast/types'

interface DayCardProps {
  day: NarrativeDay
  isToday?: boolean
  compact?: boolean
}

export function DayCard({ day, isToday, compact }: DayCardProps) {
  // Compact variant for desktop grid
  if (compact) {
    return (
      <div
        className={`
          flex items-center gap-3 p-3 rounded-xl transition-colors
          ${isToday ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}
        `}
      >
        <span className="text-2xl flex-shrink-0">{day.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
              {day.dayOfWeek}
            </h3>
            <div className="text-sm">
              <span className="font-medium">{day.tempHigh}&deg;</span>
              <span className="text-muted-foreground">/{day.tempLow}&deg;</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {day.headline}
          </p>
          {day.modelNote && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 truncate flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
              {day.modelNote}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Full variant for mobile
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
        isToday ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 text-3xl">{day.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className={`font-semibold ${isToday ? 'text-primary' : ''}`}>
            {day.dayOfWeek}
          </h3>
          <div className="text-sm font-medium">
            <span className="text-foreground">{day.tempHigh}&deg;</span>
            <span className="text-muted-foreground"> / {day.tempLow}&deg;</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {day.headline}
        </p>

        {day.details && (
          <p className="text-xs text-muted-foreground/80 mt-1">
            {day.details}
          </p>
        )}

        {day.modelNote && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
            {day.modelNote}
          </p>
        )}
      </div>
    </div>
  )
}
