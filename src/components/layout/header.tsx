'use client'

import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { SearchResultSkeleton } from '@/components/skeletons/search-result-skeleton'
import { createLocationFromCoords } from '@/lib/server/locations'
import { useDebounce } from '@/lib/utils/debounce'

interface SearchResult {
  name: string
  lat: number
  lon: number
  country: string
  admin1?: string
}

export function Header() {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    const search = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(debouncedQuery)}&count=5&language=${i18n.language}`
        )
        const data = await res.json()
        const mapped = data.results?.map((r: any) => ({
          name: r.name,
          lat: r.latitude,
          lon: r.longitude,
          country: r.country,
          admin1: r.admin1,
        })) || []
        setResults(mapped)
        setIsOpen(mapped.length > 0)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    search()
  }, [debouncedQuery, i18n.language])

  const selectResult = async (result: SearchResult) => {
    setQuery('')
    setIsOpen(false)
    const { slug } = await createLocationFromCoords({ data: { lat: result.lat, lon: result.lon } })
    navigate({ to: '/observatory/$slug', params: { slug } })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      selectResult(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        bg-card border-b border-border
        transition-all duration-300 ease-out
        ${isScrolled ? 'md:mx-4 md:mt-3 md:rounded-xl md:bg-card/95 md:backdrop-blur-sm md:border' : ''}
      `}
    >
      <div
        className={`
          max-w-7xl mx-auto flex items-center gap-4
          h-14 px-4 sm:px-6
          transition-all duration-300
          ${isScrolled ? 'md:h-12 md:px-4' : ''}
        `}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className={`rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20 group-hover:from-primary/40 group-hover:to-primary/20 transition-all duration-300 w-8 h-8 ${isScrolled ? 'md:w-7 md:h-7' : ''}`}>
            <svg className={`text-primary transition-all duration-300 w-4.5 h-4.5 ${isScrolled ? 'md:w-4 md:h-4' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div className={`transition-all duration-300 ${isScrolled ? 'md:hidden lg:block' : ''}`}>
            <h1 className={`font-semibold text-foreground leading-tight transition-all duration-300 text-sm group-hover:text-primary ${isScrolled ? 'md:text-xs' : ''}`}>nimbi.gr</h1>
            <p className={`text-muted-foreground leading-tight transition-all duration-300 text-[10px] ${isScrolled ? 'md:text-[9px]' : ''}`}>{t('weatherObservatory')}</p>
          </div>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-md mx-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 150)}
              placeholder={t('searchPlaceholder')}
              className={`
                w-full pl-10 pr-4 rounded-lg text-sm
                bg-muted border-border
                text-foreground placeholder:text-muted-foreground
                focus:border-primary focus:ring-1 focus:ring-primary/50
                transition-all duration-300
                h-9 ${isScrolled ? 'md:h-8' : ''}
              `}
            />
            {isLoading ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
              </div>
            ) : !query && (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </div>

          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
              {results.map((result, index) => (
                <button
                  key={`${result.lat}-${result.lon}`}
                  onClick={() => selectResult(result)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                    index === selectedIndex ? 'bg-primary/20' : 'hover:bg-muted'
                  }`}
                >
                  <div>
                    <span className="font-medium text-foreground">{result.name}</span>
                    {result.admin1 && <span className="text-muted-foreground ml-1">{result.admin1},</span>}
                  </div>
                  <span className="text-muted-foreground text-sm">{result.country}</span>
                </button>
              ))}
            </div>
          )}

          {isLoading && query.trim() && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
              <SearchResultSkeleton />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
