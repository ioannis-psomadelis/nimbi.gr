'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageSkeleton } from '@/components/skeletons/image-skeleton'

interface ImageDisplayProps {
  targetUrl: string
  altText: string
}

export const ImageDisplay = memo(function ImageDisplay({
  targetUrl,
  altText,
}: ImageDisplayProps) {
  const { t } = useTranslation()

  // Image state
  const [displayedUrl, setDisplayedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  // Preload ref
  const preloadRef = useRef<HTMLImageElement | null>(null)

  // Preload images
  const preloadImage = useCallback((url: string) => {
    if (preloadRef.current) {
      preloadRef.current.onload = null
      preloadRef.current.onerror = null
    }

    setIsLoading(true)
    setHasError(false)
    setFailedUrl(null)

    const img = new Image()
    preloadRef.current = img

    img.onload = () => {
      if (img === preloadRef.current) {
        setDisplayedUrl(url)
        setIsLoading(false)
        setHasError(false)
        setFailedUrl(null)
      }
    }

    img.onerror = () => {
      if (img === preloadRef.current) {
        setIsLoading(false)
        setHasError(true)
        setFailedUrl(url)
        // Keep displayedUrl unchanged - show previous valid image
      }
    }

    img.src = url
  }, [])

  // Load new image when URL changes
  useEffect(() => {
    if (targetUrl !== displayedUrl) {
      preloadImage(targetUrl)
    }
  }, [targetUrl, displayedUrl, preloadImage])

  // Initial load
  useEffect(() => {
    preloadImage(targetUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preloadRef.current) {
        preloadRef.current.onload = null
        preloadRef.current.onerror = null
        preloadRef.current.src = ''
        preloadRef.current = null
      }
    }
  }, [])

  const handleRetry = () => {
    preloadImage(targetUrl)
  }

  return (
    <div className="relative bg-muted/30 min-h-[300px] max-h-[70vh] overflow-auto">
      {/* Currently displayed image */}
      {displayedUrl && (
        <img
          src={displayedUrl}
          alt={altText}
          className={`
            w-full h-auto transition-all duration-300
            ${isLoading ? 'opacity-50 blur-sm scale-[0.995]' : 'opacity-100 blur-0 scale-100'}
          `}
        />
      )}

      {/* First load skeleton - show when no image loaded yet */}
      {!displayedUrl && isLoading && (
        <ImageSkeleton className="absolute inset-0" />
      )}

      {/* Loading Overlay - only show spinner when updating an existing image */}
      {displayedUrl && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-xl bg-card border border-border shadow-lg">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-primary/20 rounded-full" />
              <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-primary rounded-full animate-spin" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {t('updating')}
            </span>
          </div>
        </div>
      )}

      {/* Error State - Full overlay only when no previous image */}
      {hasError && !isLoading && !displayedUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95">
          <div className="flex flex-col items-center gap-4 text-center p-6 sm:p-8">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-foreground font-medium mb-1 text-sm sm:text-base">{t('chartNotAvailable')}</p>
              <p className="text-muted-foreground text-xs sm:text-sm">{t('chartNotReady')}</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
            >
              {t('tryAgain')}
            </button>
          </div>
        </div>
      )}

      {/* Error Toast - Subtle notification when previous image is showing */}
      {hasError && !isLoading && displayedUrl && failedUrl && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border shadow-lg">
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm text-foreground">{t('chartNotReady')}</span>
            <button
              onClick={handleRetry}
              className="ml-2 px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-xs font-medium transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      )}

      {/* First load placeholder */}
      {!displayedUrl && !isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground text-sm">{t('noChartLoaded')}</p>
        </div>
      )}
    </div>
  )
})
