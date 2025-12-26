import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function SearchResultSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex flex-col gap-1">
            <Skeleton className={cn('w-32 h-4 bg-muted animate-pulse rounded-md')} />
            <Skeleton className={cn('w-20 h-3 bg-muted animate-pulse rounded-md')} />
          </div>
          <Skeleton className={cn('w-16 h-4 bg-muted animate-pulse rounded-md')} />
        </div>
      ))}
    </div>
  )
}
