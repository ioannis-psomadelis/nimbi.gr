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
            // Base styles matching language toggle
            'relative h-9 px-2.5 rounded-lg',
            'border border-border',
            'transition-all duration-200',
            'flex items-center gap-2',
            // Background based on state
            enabled
              ? 'bg-primary/15 border-primary/30 hover:bg-primary/20'
              : 'bg-muted hover:bg-secondary',
            // Disabled/loading state
            isLoading && 'opacity-70 cursor-wait',
            // Focus ring
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
          )}
          aria-label={t('proModeLabel')}
          aria-pressed={enabled}
        >
          {/* PRO text with two lines */}
          <div className="flex flex-col items-center leading-none">
            <span
              className={cn(
                'text-[11px] font-bold tracking-wider',
                enabled ? 'text-primary' : 'text-foreground'
              )}
            >
              PRO
            </span>
            <span className="text-[8px] text-muted-foreground font-medium -mt-0.5">
              mode
            </span>
          </div>

          {/* Switch indicator */}
          <div
            className={cn(
              'relative w-7 h-4 rounded-full transition-colors duration-200',
              'border',
              enabled
                ? 'bg-primary border-primary'
                : 'bg-muted-foreground/20 border-border'
            )}
          >
            {/* Thumb */}
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white',
                'transform transition-transform duration-200 shadow-sm',
                enabled ? 'translate-x-3' : 'translate-x-0',
                isLoading && 'animate-pulse'
              )}
            />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        <p className="font-medium">{enabled ? t('proModeEnabled') : t('proModeDisabled')}</p>
        <p className="text-[10px] opacity-80 mt-0.5">{t('proModeDescription')}</p>
      </TooltipContent>
    </Tooltip>
  )
}
