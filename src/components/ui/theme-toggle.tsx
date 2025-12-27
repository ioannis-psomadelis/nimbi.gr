'use client'

import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative rounded-xl',
        'bg-muted hover:bg-secondary',
        'border border-border',
        'transition-all duration-200',
        'flex items-center justify-center',
        'group',
        'w-9 h-9'
      )}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon (shown in dark mode) */}
      <svg
        className={`
          w-4 h-4 transition-all duration-300
          ${resolvedTheme === 'dark'
            ? 'text-primary rotate-0 scale-100'
            : 'text-primary -rotate-90 scale-0 absolute'
          }
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon icon (shown in light mode) */}
      <svg
        className={`
          w-4 h-4 transition-all duration-300
          ${resolvedTheme === 'light'
            ? 'text-primary rotate-0 scale-100'
            : 'text-primary rotate-90 scale-0 absolute'
          }
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  )
}
