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
            'border border-border',
            'transition-all duration-200',
            'flex items-center',
            'h-9 px-2.5 gap-2',
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

          {/* Switch indicator */}
          <div
            className={cn(
              'relative rounded-full transition-colors duration-200',
              'border w-7 h-4',
              enabled
                ? 'bg-primary border-primary'
                : 'bg-muted-foreground/20 border-border'
            )}
          >
            {/* Thumb */}
            <span
              className={cn(
                'absolute rounded-full bg-white top-0.5 left-0.5 w-2.5 h-2.5',
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
