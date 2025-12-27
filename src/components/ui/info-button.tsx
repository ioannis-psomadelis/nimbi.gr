'use client'

import { useState, type ReactNode } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './tooltip'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from './dialog'

interface InfoButtonProps {
  title?: string
  children: ReactNode
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function InfoButton({ title, children, className, side = 'bottom' }: InfoButtonProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)

  const button = (
    <button
      className={`w-8 h-8 rounded-lg bg-muted/50 border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ${className ?? ''}`}
      aria-label={title ?? 'Info'}
      onClick={isMobile ? () => setIsOpen(true) : undefined}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  )

  // Mobile: Show modal on click
  if (isMobile) {
    return (
      <>
        {button}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-sm">
            {title && <DialogTitle>{title}</DialogTitle>}
            <div className="text-sm text-muted-foreground">
              {children}
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Desktop: Show tooltip on hover
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        {button}
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-64 p-3">
        {children}
      </TooltipContent>
    </Tooltip>
  )
}
