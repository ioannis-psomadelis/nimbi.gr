'use client'

import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAllLocations } from '../../lib/server/locations'
import { RouteContextProvider } from '../../lib/route-context'
import { HomePage } from '../../pages/home'
import i18n from '../../lib/i18n'

const searchSchema = z.object({
  error: z.enum(['eu_only']).optional(),
})

export const Route = createFileRoute('/pro/')({
  validateSearch: searchSchema,
  loader: async () => {
    const locations = await getAllLocations()
    return { locations, lang: 'el' as const, proMode: true }
  },
  head: () => {
    const title = i18n.t('metaHomeTitle')
    const description = i18n.t('metaHomeDescription')

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        // Pro pages are noindex
        { name: 'robots', content: 'noindex,follow' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: 'https://nimbi.gr/pro/' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [
        // Canonical points to non-pro version
        { rel: 'canonical', href: 'https://nimbi.gr/' },
        // Hreflang for language variants (non-pro)
        { rel: 'alternate', hrefLang: 'el', href: 'https://nimbi.gr/' },
        { rel: 'alternate', hrefLang: 'en', href: 'https://nimbi.gr/en/' },
        { rel: 'alternate', hrefLang: 'x-default', href: 'https://nimbi.gr/' },
      ],
    }
  },
  component: ProHomePageRoute,
})

function ProHomePageRoute() {
  const { locations, lang, proMode } = Route.useLoaderData()

  return (
    <RouteContextProvider lang={lang} proMode={proMode}>
      <HomePage locations={locations} />
    </RouteContextProvider>
  )
}
