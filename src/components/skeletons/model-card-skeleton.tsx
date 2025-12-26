import { cn } from '@/lib/utils'

export function ModelCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg border bg-card border-border',
        className
      )}
    >
      {/* Model indicator dot */}
      <div className="w-2 h-2 rounded-full bg-muted animate-pulse shrink-0" />

      {/* Model name */}
      <div className="w-12 h-4 rounded-md bg-muted animate-pulse shrink-0" />

      {/* Temperature */}
      <div className="w-8 h-5 rounded-md bg-muted animate-pulse" />
    </div>
  )
}
