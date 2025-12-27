'use client'

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Share2, Check, Copy } from 'lucide-react'
import { Button } from './button'

interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
  className?: string
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleShare = useCallback(async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
    const shareTitle = title || (typeof document !== 'undefined' ? document.title : '')
    const shareText = text || ''

    // Try native share API first (mobile-friendly)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        return
      } catch (err) {
        // User cancelled or error - fall back to clipboard
        if ((err as Error).name === 'AbortError') {
          return // User cancelled, do nothing
        }
      }
    }

    // Fall back to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setShowToast(true)

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false)
        setShowToast(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [url, title, text])

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className={className}
      >
        {copied ? (
          <Check className="w-4 h-4 mr-1.5 text-green-500" />
        ) : (
          <Share2 className="w-4 h-4 mr-1.5" />
        )}
        <span className="text-xs">{t('share', 'Share')}</span>
      </Button>

      {/* Toast notification */}
      {showToast && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="flex items-center gap-2 px-3 py-2 bg-foreground text-background rounded-lg shadow-lg whitespace-nowrap">
            <Copy className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{t('linkCopied', 'Link copied!')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
