'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Search, MapPin, Loader2, X, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { createLocationFromCoords } from '@/lib/server/locations'
import { searchLocationsWithLang, type GeocodeResult } from '@/lib/server/geocode'
import { useDebounce } from '@/lib/utils/debounce'
import { useLocationsStore, type RecentSearch } from '@/stores'
import { useIsMobile } from '@/hooks/use-mobile'

interface SearchModalProps {
  /** Trigger style variant */
  variant?: 'header' | 'home'
}

const MIN_SEARCH_CHARS = 3

export function SearchModal({ variant = 'header' }: SearchModalProps) {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const navigate = useNavigate()

  // Zustand stores
  const recentSearches = useLocationsStore((s) => s.recentSearches)
  const addRecentSearch = useLocationsStore((s) => s.addRecentSearch)
  const modalInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const debouncedQuery = useDebounce(query, 350)

  // Close search when viewport size changes to prevent React hydration issues
  useEffect(() => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  // Keyboard shortcut: Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => modalInputRef.current?.focus(), 50)
    } else {
      // Clear search when closing
      setQuery('')
      setResults([])
      setIsNavigating(false)
    }
  }, [isSearchOpen])

  // Search with min chars check
  useEffect(() => {
    const trimmed = debouncedQuery.trim()

    if (trimmed.length < MIN_SEARCH_CHARS) {
      setResults([])
      return
    }

    const search = async () => {
      setIsLoading(true)
      try {
        const searchResults = await searchLocationsWithLang({
          data: { query: trimmed, language: i18n.language }
        })
        setResults(searchResults)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    search()
  }, [debouncedQuery, i18n.language])

  const selectResult = useCallback(async (result: GeocodeResult) => {
    setIsNavigating(true)
    try {
      // Save to recent searches
      addRecentSearch({
        name: result.name,
        lat: result.lat,
        lon: result.lon,
        country: result.country,
        admin1: result.admin1,
      })
      const { slug } = await createLocationFromCoords({ data: { lat: result.lat, lon: result.lon } })
      await navigate({ to: '/observatory/$slug', params: { slug } })
      // Close modal after successful navigation
      setIsSearchOpen(false)
    } catch (error) {
      console.error('Navigation failed:', error)
      setIsNavigating(false)
    }
  }, [navigate, addRecentSearch])

  const selectRecentSearch = useCallback(async (search: RecentSearch) => {
    setIsNavigating(true)
    try {
      // Update timestamp for this search
      addRecentSearch({
        name: search.name,
        lat: search.lat,
        lon: search.lon,
        country: search.country,
        admin1: search.admin1,
      })
      const { slug } = await createLocationFromCoords({ data: { lat: search.lat, lon: search.lon } })
      await navigate({ to: '/observatory/$slug', params: { slug } })
      setIsSearchOpen(false)
    } catch (error) {
      console.error('Navigation failed:', error)
      setIsNavigating(false)
    }
  }, [navigate, addRecentSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault()
      selectResult(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false)
    }
  }

  const showMinCharsHint = query.trim().length > 0 && query.trim().length < MIN_SEARCH_CHARS

  // Trigger button based on variant
  const TriggerButton = variant === 'home' ? (
    <button
      onClick={() => setIsSearchOpen(true)}
      className="
        w-full h-12 px-4 pl-10
        rounded-xl
        bg-background/50 hover:bg-background/70
        border border-border/50 hover:border-border/70
        text-left text-sm text-muted-foreground
        transition-all duration-200
        relative
      "
    >
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
      <span>{t('searchForACity')}</span>
    </button>
  ) : (
    <button
      onClick={() => setIsSearchOpen(true)}
      className="
        flex items-center gap-2 h-9 px-3 sm:px-4
        w-full max-w-xl
        rounded-xl
        bg-muted/50 hover:bg-muted/80
        border border-border/40 hover:border-border/70
        text-muted-foreground
        transition-all duration-200
        group
      "
    >
      <Search className="w-4 h-4 shrink-0 group-hover:text-foreground/70 transition-colors" />
      <span className="text-sm truncate flex-1 text-left">{t('searchPlaceholder')}</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 bg-background/60 border border-border/40 rounded shrink-0">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )

  return (
    <>
      {TriggerButton}

      {/* Search - Modal on desktop, Bottom Sheet on mobile */}
      {isMobile ? (
        // Mobile: Bottom Sheet
        <Sheet key="search-sheet" open={isSearchOpen} onOpenChange={(open) => !isNavigating && setIsSearchOpen(open)}>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="h-[85vh] rounded-t-2xl p-0 gap-0 flex flex-col bg-card/98 backdrop-blur-xl border-border/40"
          >

            {/* Header with drag handle */}
            <div className="shrink-0 border-b border-border/40 pt-2">
              {/* Drag handle */}
              <div className="flex justify-center py-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Title bar */}
              <div className="flex items-center justify-between px-4 pb-3">
                <SheetTitle className="text-base font-semibold text-foreground">
                  {t('searchLocation', 'Search Location')}
                </SheetTitle>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search input */}
              <div className="relative px-4 pb-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={modalInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('searchPlaceholder')}
                    disabled={isNavigating}
                    className="
                      w-full h-11 pl-10 pr-10
                      bg-muted/40 border-border/50
                      rounded-xl text-sm
                      placeholder:text-muted-foreground/50
                      focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50
                      disabled:opacity-50
                    "
                    autoFocus
                  />
                  {(isLoading || isNavigating) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Area - scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Min chars hint */}
              {showMinCharsHint && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground/70">
                    {t('minSearchChars', `Type at least ${MIN_SEARCH_CHARS} characters`)}
                  </p>
                </div>
              )}

              {/* Loading skeleton */}
              {isLoading && query.trim().length >= MIN_SEARCH_CHARS && results.length === 0 && (
                <div className="p-3 space-y-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-muted/40" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-28 bg-muted/40 rounded-lg" />
                        <div className="h-3 w-20 bg-muted/25 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="p-3 space-y-1">
                  <p className="px-3 py-1.5 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                    {t('searchResults', 'Results')}
                  </p>
                  {results.map((result, index) => (
                    <button
                      key={`${result.lat}-${result.lon}`}
                      onClick={() => selectResult(result)}
                      disabled={isNavigating}
                      className={`
                        w-full flex items-center gap-3 px-3 py-3 rounded-xl
                        text-left transition-all duration-150
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${index === selectedIndex
                          ? 'bg-primary/10 ring-1 ring-primary/20'
                          : 'hover:bg-muted/40 active:bg-muted/60'
                        }
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                        transition-colors
                        ${index === selectedIndex
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted/40 text-muted-foreground'
                        }
                      `}>
                        <MapPin className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{result.name}</p>
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {result.admin1 && `${result.admin1}, `}{result.country}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {!isLoading && query.trim().length >= MIN_SEARCH_CHARS && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground/70 mb-1">{t('noResults')}</p>
                  <p className="text-xs text-muted-foreground/60">{t('tryDifferentSearch', 'Try a different search term')}</p>
                </div>
              )}

              {/* Empty state with recent searches */}
              {!query.trim() && (
                <div className="p-3">
                  {recentSearches.length > 0 ? (
                    <>
                      <p className="px-3 py-1.5 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                        {t('recentSearches', 'Recent')}
                      </p>
                      <div className="space-y-1">
                        {recentSearches.map((search) => (
                          <button
                            key={`${search.lat}-${search.lon}`}
                            onClick={() => selectRecentSearch(search)}
                            disabled={isNavigating}
                            className="
                              w-full flex items-center gap-3 px-3 py-3 rounded-xl
                              text-left transition-all duration-150
                              disabled:opacity-50 disabled:cursor-not-allowed
                              hover:bg-muted/40 active:bg-muted/60
                            "
                          >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-muted/40 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{search.name}</p>
                              <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                                {search.admin1 && `${search.admin1}, `}{search.country}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <MapPin className="w-6 h-6 text-primary/50" />
                      </div>
                      <p className="text-sm font-medium text-foreground/70 mb-1">
                        {t('findYourLocation', 'Find your location')}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {t('searchCitiesHint', 'Search for cities, towns, or places')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        // Desktop: Centered Modal
        <Dialog key="search-dialog" open={isSearchOpen} onOpenChange={(open) => !isNavigating && setIsSearchOpen(open)}>
          <DialogContent
            className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-card/98 backdrop-blur-xl border-border/40 shadow-2xl"
            showCloseButton={false}
          >
            {/* Hidden title and description for accessibility */}
            <DialogTitle className="sr-only">{t('searchPlaceholder')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('searchCitiesHint', 'Search for cities, towns, or places')}
            </DialogDescription>

            {/* Search Input */}
            <div className="relative border-b border-border/40">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                ref={modalInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('searchPlaceholder')}
                disabled={isNavigating}
                className="
                  w-full h-14 pl-12 pr-4
                  bg-transparent border-0 rounded-none
                  text-base text-foreground placeholder:text-muted-foreground/60
                  focus-visible:ring-0 focus-visible:ring-offset-0
                  disabled:opacity-50
                "
                autoFocus
              />
              {(isLoading || isNavigating) && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              )}
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Min chars hint */}
              {showMinCharsHint && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Search className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('minSearchChars', `Type at least ${MIN_SEARCH_CHARS} characters`)}
                  </p>
                </div>
              )}

              {/* Loading skeleton */}
              {isLoading && query.trim().length >= MIN_SEARCH_CHARS && results.length === 0 && (
                <div className="p-2 space-y-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-muted/50" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted/50 rounded" />
                        <div className="h-3 w-24 bg-muted/30 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="p-2">
                  {results.map((result, index) => (
                    <button
                      key={`${result.lat}-${result.lon}`}
                      onClick={() => selectResult(result)}
                      disabled={isNavigating}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg
                        text-left transition-all duration-150
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${index === selectedIndex
                          ? 'bg-primary/10 text-foreground'
                          : 'hover:bg-muted/50 text-foreground/90'
                        }
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${index === selectedIndex
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted/50 text-muted-foreground'
                        }
                      `}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{result.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.admin1 && `${result.admin1}, `}{result.country}
                        </p>
                      </div>
                      {index === selectedIndex && (
                        <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded shrink-0">
                          Enter
                        </kbd>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {!isLoading && query.trim().length >= MIN_SEARCH_CHARS && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground/80 mb-1">{t('noResults')}</p>
                  <p className="text-xs text-muted-foreground">{t('tryDifferentSearch', 'Try a different search term')}</p>
                </div>
              )}

              {/* Empty state with recent searches */}
              {!query.trim() && (
                <div className="p-2">
                  {recentSearches.length > 0 ? (
                    <>
                      <p className="px-4 py-2 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                        {t('recentSearches', 'Recent')}
                      </p>
                      {recentSearches.map((search) => (
                        <button
                          key={`${search.lat}-${search.lon}`}
                          onClick={() => selectRecentSearch(search)}
                          disabled={isNavigating}
                          className="
                            w-full flex items-center gap-3 px-4 py-3 rounded-lg
                            text-left transition-all duration-150
                            disabled:opacity-50 disabled:cursor-not-allowed
                            hover:bg-muted/50 text-foreground/90
                          "
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/50 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{search.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {search.admin1 && `${search.admin1}, `}{search.country}
                            </p>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Search className="w-5 h-5 text-primary/60" />
                      </div>
                      <p className="text-sm text-muted-foreground">{t('searchPlaceholder')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50 bg-muted/20 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑</kbd>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↓</kbd>
                  <span className="ml-1">{t('toNavigate', 'navigate')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd>
                  <span className="ml-1">{t('toSelect', 'select')}</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
                <span className="ml-1">{t('toClose', 'close')}</span>
              </span>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
