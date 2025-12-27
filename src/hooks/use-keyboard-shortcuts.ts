'use client'

import { useEffect, useCallback } from 'react'
import { type ModelId } from '../types/models'

interface UseKeyboardShortcutsOptions {
  enabled?: boolean
  onPreviousHour?: () => void
  onNextHour?: () => void
  onModelChange?: (model: ModelId) => void
  currentModel?: ModelId
}

const MODEL_KEYS: Record<string, ModelId> = {
  '1': 'ecmwf-hres',
  '2': 'gfs',
  '3': 'gem',
  '4': 'ukmo',
}

export function useKeyboardShortcuts({
  enabled = true,
  onPreviousHour,
  onNextHour,
  onModelChange,
  currentModel,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Don't trigger if any modifier key is pressed (except for Cmd+K which is handled elsewhere)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          onPreviousHour?.()
          break
        case 'ArrowRight':
          e.preventDefault()
          onNextHour?.()
          break
        case '1':
        case '2':
        case '3':
        case '4':
          const model = MODEL_KEYS[e.key]
          if (model && model !== currentModel) {
            e.preventDefault()
            onModelChange?.(model)
          }
          break
      }
    },
    [onPreviousHour, onNextHour, onModelChange, currentModel]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}
