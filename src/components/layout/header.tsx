'use client'

import { useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ProToggle } from '@/components/ui/pro-toggle'
import { CLOUD_PATH } from '@/components/ui/logo'
import { SearchModal } from '@/components/features/search-modal'
import { useLocalePath } from '@/lib/route-context'

interface HeaderProps {
  proMode?: boolean
  leftSlot?: React.ReactNode
}

export function Header({ proMode = false, leftSlot }: HeaderProps) {
  const { t } = useTranslation()
  const { getPath, navigateToPro } = useLocalePath()

  const handleProToggle = useCallback((enabled: boolean) => {
    navigateToPro(enabled)
  }, [navigateToPro])

  const homePath = getPath('/')

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50
        bg-card/95 backdrop-blur-md border-b border-border/50
      "
    >
      <div className="w-full flex items-center h-14 px-3 sm:px-4 lg:px-6">
        {/* Left: Optional slot + Logo */}
        <div className="flex items-center gap-2 shrink-0">
          {leftSlot}
          <Link to={homePath} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white/90 dark:bg-primary/15 flex items-center justify-center border border-white/50 dark:border-primary/20 group-hover:bg-white dark:group-hover:bg-primary/25 transition-colors shadow-md dark:shadow-none">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={CLOUD_PATH} />
            </svg>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">nimbi</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">{t('weatherObservatory')}</p>
          </div>
          </Link>
        </div>

        {/* Center: Search (flex-1 to take remaining space, centered content) */}
        <div className="flex-1 min-w-0 flex justify-center px-2 sm:px-6 lg:px-12">
          <SearchModal variant="header" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <ProToggle enabled={proMode} onToggle={handleProToggle} />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
