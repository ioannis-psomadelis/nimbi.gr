import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

// Cloud path used consistently across the app
export const CLOUD_PATH = 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z'

interface LogoProps {
  showText?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    container: 'w-8 h-8 rounded-lg',
    icon: 'w-4 h-4',
    text: 'text-xs',
  },
  md: {
    container: 'w-9 h-9 rounded-xl',
    icon: 'w-5 h-5',
    text: 'text-sm',
  },
  lg: {
    container: 'w-14 h-14 rounded-2xl',
    icon: 'w-7 h-7',
    text: 'text-base',
  },
}

export function Logo({ showText = true, className, size = 'md' }: LogoProps) {
  const sizes = sizeClasses[size]

  return (
    <Link to="/" className={cn('flex items-center gap-2.5 group', className)}>
      <div
        className={cn(
          sizes.container,
          'bg-white/90 dark:bg-primary/15 flex items-center justify-center',
          'border border-white/50 dark:border-primary/20',
          'group-hover:bg-white dark:group-hover:bg-primary/25 transition-colors',
          'shadow-md dark:shadow-none'
        )}
      >
        <svg
          className={cn(sizes.icon, 'text-primary')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d={CLOUD_PATH}
          />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            sizes.text,
            'font-semibold text-white dark:text-foreground/90 tracking-wide',
            'drop-shadow-md dark:drop-shadow-none'
          )}
        >
          nimbi
        </span>
      )}
    </Link>
  )
}

// Standalone cloud icon for use outside of Link
export function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5 text-primary', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d={CLOUD_PATH}
      />
    </svg>
  )
}
