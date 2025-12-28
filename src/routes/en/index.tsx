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

export const Route = createFileRoute('/en/')({
  validateSearch: searchSchema,
  loader: async () => {
    // Ensure i18n is set to English for SSR
    if (i18n.language !== 'en') {
      await i18n.changeLanguage('en')
    }
    const locations = await getAllLocations()
    return { locations, lang: 'en' as const, proMode: false }
  },
  head: () => {
    const title = i18n.t('metaHomeTitle')
    const description = i18n.t('metaHomeDescription')

    // JSON-LD for home page
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://nimbi.gr/en/#homepage',
      url: 'https://nimbi.gr/en/',
      name: title,
      description: description,
      isPartOf: {
        '@id': 'https://nimbi.gr/#website',
      },
      about: {
        '@type': 'WebApplication',
        name: 'nimbi.gr',
        applicationCategory: 'WeatherApplication',
        operatingSystem: 'Web',
        description: 'Multi-model weather forecasts comparing ECMWF, GFS, GEM & UKMO models',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
        featureList: [
          'ECMWF weather forecasts',
          'GFS weather forecasts',
          'GEM weather forecasts',
          'UKMO weather forecasts',
          'Multi-model comparison',
          '7-day weather forecast',
          'Hourly weather data',
        ],
      },
      inLanguage: 'en',
    }

    return {
      meta: [
        {
          title,
        },
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
        {
          property: 'og:url',
          content: 'https://nimbi.gr/en/',
        },
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:description',
          content: description,
        },
      ],
      links: [
        {
          rel: 'canonical',
          href: 'https://nimbi.gr/en/',
        },
        // Hreflang for language variants
        {
          rel: 'alternate',
          hrefLang: 'el',
          href: 'https://nimbi.gr/',
        },
        {
          rel: 'alternate',
          hrefLang: 'en',
          href: 'https://nimbi.gr/en/',
        },
        {
          rel: 'alternate',
          hrefLang: 'x-default',
          href: 'https://nimbi.gr/',
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(jsonLd),
        },
      ],
    }
  },
  component: EnglishHomePageRoute,
})

function EnglishHomePageRoute() {
  const { locations, lang, proMode } = Route.useLoaderData()

  return (
    <RouteContextProvider lang={lang} proMode={proMode}>
      <HomePage locations={locations} />
    </RouteContextProvider>
  )
}
