'use client'

import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ProToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  isLoading?: boolean
}

export function ProToggle({ enabled, onToggle, isLoading }: ProToggleProps) {
  const { t } = useTranslation()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => !isLoading && onToggle(!enabled)}
          disabled={isLoading}
          className={cn(
            // Base styles
            'relative rounded-xl',
            'border',
            'transition-all duration-200',
            'flex items-center',
            'h-9 px-2.5 gap-2',
            // Background based on state
            enabled
              ? 'bg-primary/15 border-primary/40 hover:bg-primary/25'
              : 'bg-secondary/80 border-border/50 hover:bg-secondary',
            // Disabled/loading state
            isLoading && 'opacity-70 cursor-wait',
            // Focus ring
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
          )}
          aria-label={t('proModeLabel')}
          aria-pressed={enabled}
        >
          {/* PRO mode text */}
          <div className="flex flex-col items-start leading-none">
            <span
              className={cn(
                'font-bold tracking-wider text-[11px]',
                enabled ? 'text-primary' : 'text-foreground'
              )}
            >
              PRO
            </span>
            <span className="font-medium tracking-wide text-muted-foreground text-[9px]">
              mode
            </span>
          </div>

          {/* Switch */}
          <span
            style={{ height: '20px', width: '36px' }}
            className={cn(
              'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200',
              enabled
                ? 'bg-primary'
                : 'bg-input dark:bg-input/80'
            )}
          >
            <span
              style={{
                height: '16px',
                width: '16px',
                transform: enabled ? 'translateX(18px)' : 'translateX(2px)',
                transition: 'transform 200ms ease-in-out',
              }}
              className={cn(
                'pointer-events-none absolute rounded-full',
                'bg-background dark:bg-foreground',
                enabled && 'dark:bg-primary-foreground',
                isLoading && 'animate-pulse'
              )}
            />
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        <p className="font-medium">{enabled ? t('proModeEnabled') : t('proModeDisabled')}</p>
        <p className="text-[10px] opacity-80 mt-0.5">{t('proModeDescription')}</p>
      </TooltipContent>
    </Tooltip>
  )
}
