'use client'

import { useRouterState } from '@tanstack/react-router'

export function NavigationLoader() {
  const { isLoading, isTransitioning } = useRouterState({
    select: (state) => ({
      isLoading: state.isLoading,
      isTransitioning: state.isTransitioning,
    }),
  })

  const showLoader = isLoading || isTransitioning

  if (!showLoader) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1">
      {/* Background track */}
      <div className="absolute inset-0 bg-primary/20" />

      {/* Animated progress bar */}
      <div
        className="absolute inset-y-0 left-0 bg-primary animate-navigation-progress"
        style={{
          boxShadow: '0 0 10px var(--color-primary), 0 0 5px var(--color-primary)',
        }}
      />

      {/* Shimmer effect - theme aware */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-shimmer" />
    </div>
  )
}
