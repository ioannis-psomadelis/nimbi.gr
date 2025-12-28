'use client'

import { createFileRoute, Outlet } from '@tanstack/react-router'
import i18n from '../../lib/i18n'

export const Route = createFileRoute('/en/pro')({
  beforeLoad: async () => {
    // Set language to English for all routes under /en/pro/
    if (i18n.language !== 'en') {
      await i18n.changeLanguage('en')
    }
  },
  component: EnglishProLayout,
})

function EnglishProLayout() {
  return <Outlet />
}
