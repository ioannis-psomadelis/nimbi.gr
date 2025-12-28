'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useLocalePath, type Language } from '@/lib/route-context'

const languages = [
  { code: 'en' as const, name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'el' as const, name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
]

export function LanguageToggle() {
  const { lang, navigateToLang } = useLocalePath()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLangObj = languages.find(l => l.code === lang) || languages[1]

  const handleSelect = (code: Language) => {
    setIsOpen(false)
    navigateToLang(code)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative rounded-xl',
          'bg-muted hover:bg-secondary',
          'border border-border',
          'transition-all duration-200',
          'flex items-center',
          'text-sm font-medium text-foreground',
          'h-9 px-3 gap-2',
          isOpen && 'ring-2 ring-primary/30'
        )}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        {/* Flag only on mobile, text on desktop */}
        <span className="text-base md:hidden">{currentLangObj.flag}</span>
        <span className="hidden md:inline text-sm">{currentLangObj.nativeName}</span>
        <svg
          className={cn('text-muted-foreground transition-transform duration-200 w-3 h-3', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
          absolute right-0 mt-2 w-44
          bg-card border border-border rounded-xl shadow-lg
          overflow-hidden
          transform origin-top-right
          transition-all duration-200 ease-out
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }
          z-50
        `}
      >
        {languages.map((langItem, index) => {
          const isActive = langItem.code === lang
          const isFirst = index === 0
          const isLast = index === languages.length - 1
          return (
            <button
              key={langItem.code}
              onClick={() => handleSelect(langItem.code)}
              className={`
                w-full px-3 py-2.5 flex items-center gap-3
                transition-colors duration-150
                ${isFirst ? 'rounded-t-xl' : ''}
                ${isLast ? 'rounded-b-xl' : ''}
                ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
                }
              `}
            >
              <span className="text-xl">{langItem.flag}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{langItem.nativeName}</span>
                <span className="text-[10px] text-muted-foreground">{langItem.name}</span>
              </div>
              {isActive && (
                <svg className="w-4 h-4 ml-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
