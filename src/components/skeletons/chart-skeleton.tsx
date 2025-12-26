import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ChartSkeleton() {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        {/* Title placeholder */}
        <div className={cn('h-5 w-40 bg-muted animate-pulse rounded-md')} />
      </CardHeader>
      <CardContent>
        <div className="flex h-[300px]">
          {/* Y-axis placeholder */}
          <div className={cn('h-[250px] w-6 bg-muted animate-pulse rounded-md mr-2 self-center')} />

          {/* Main chart area */}
          <div className="flex-1 flex flex-col justify-between relative">
            {/* Horizontal grid lines */}
            <div className={cn('h-[1px] w-full bg-muted animate-pulse rounded-md')} />
            <div className={cn('h-[1px] w-full bg-muted animate-pulse rounded-md')} />
            <div className={cn('h-[1px] w-full bg-muted animate-pulse rounded-md')} />
            <div className={cn('h-[1px] w-full bg-muted animate-pulse rounded-md')} />

            {/* Wavy chart area simulation - overlapping bars at different heights */}
            <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
              <div className={cn('h-[40%] w-[8%] bg-muted/60 animate-pulse rounded-md')} />
              <div className={cn('h-[55%] w-[8%] bg-muted/60 animate-pulse rounded-md')} />
              <div className={cn('h-[45%] w-[8%] bg-muted/60 animate-pulse rounded-md')} />
              <div className={cn('h-[70%] w-[8%] bg-muted/60 animate-pulse rounded-md')} />
              <div className={cn('h-[60%] w-[8%] bg-muted/60 animate-pulse rounded-md')} />
              <div className={cn('h-[50%] w-[8%] bg-muted/60 animate-pulse rounded-md')} />
              <div className={cn('h-[65%] w-[8%] bg-muted/60 animate-pulse rounded-md')} />
              <div className={cn('h-[55%] w-[8%] bg-muted/60 animate-pulse rounded-md')} />
            </div>

            {/* X-axis placeholder */}
            <div className={cn('h-4 w-full bg-muted animate-pulse rounded-md mt-2')} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
