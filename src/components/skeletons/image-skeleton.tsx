import { cn } from '@/lib/utils'

interface ImageSkeletonProps {
  className?: string
}

export function ImageSkeleton({ className }: ImageSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-muted/30 overflow-hidden',
        className?.includes('absolute') ? 'w-full h-full' : 'min-h-[400px]',
        className
      )}
    >
      {/* Weather map skeleton - mimics Meteociel chart layout */}
      <div className="w-full h-full min-h-[400px] relative animate-pulse">
        {/* Map background with grid pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-muted/40" />

        {/* Simulated grid lines */}
        <div className="absolute inset-0">
          {/* Horizontal lines */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 h-[1px] bg-muted-foreground/10"
              style={{ top: `${(i + 1) * 11}%` }}
            />
          ))}
          {/* Vertical lines */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 w-[1px] bg-muted-foreground/10"
              style={{ left: `${(i + 1) * 9}%` }}
            />
          ))}
        </div>

        {/* Simulated continent/land mass shapes */}
        <div className="absolute top-[15%] left-[20%] w-[35%] h-[40%] bg-muted-foreground/8 rounded-[40%_60%_50%_70%]" />
        <div className="absolute top-[25%] right-[15%] w-[25%] h-[30%] bg-muted-foreground/8 rounded-[60%_40%_45%_55%]" />
        <div className="absolute bottom-[20%] left-[40%] w-[20%] h-[25%] bg-muted-foreground/8 rounded-[50%_50%_40%_60%]" />

        {/* Simulated pressure systems / weather patterns */}
        <div className="absolute top-[30%] left-[30%] w-16 h-16 rounded-full border-2 border-muted-foreground/15 border-dashed" />
        <div className="absolute top-[45%] right-[25%] w-12 h-12 rounded-full border-2 border-muted-foreground/15 border-dashed" />

        {/* Simulated isobars (curved lines) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M0,40 Q25,35 50,42 T100,38"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted-foreground/15"
          />
          <path
            d="M0,55 Q30,50 55,58 T100,52"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted-foreground/15"
          />
          <path
            d="M0,70 Q20,65 45,72 T100,68"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted-foreground/15"
          />
        </svg>

        {/* Title bar placeholder at top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="h-4 w-32 bg-muted-foreground/15 rounded" />
          <div className="h-4 w-20 bg-muted-foreground/15 rounded" />
        </div>

        {/* Legend placeholder at bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <div className="h-3 w-full bg-gradient-to-r from-blue-500/20 via-green-500/20 via-yellow-500/20 to-red-500/20 rounded" />
        </div>

        {/* Loading indicator in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 bg-background/80 px-4 py-3 rounded-lg border border-border/50">
            <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">Loading map...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
