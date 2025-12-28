'use client'

import { createFileRoute, redirect } from '@tanstack/react-router'
import { dehydrate } from '@tanstack/react-query'
import { allModelsQueryOptions } from '../../lib/api/weather'
import { getQueryClient } from '../../lib/query-client'
import { getLocationBySlug } from '../../lib/server/locations'
import { getServerSavedLocations, getServerSelectedModel } from '../../lib/server/storage'
import { ObservatoryPage } from '../../pages/observatory'
import { isWithinEUBounds, parseCoordinateSlug } from '../../lib/utils/geo-bounds'
import i18n from '../../lib/i18n'

export const Route = createFileRoute('/en/observatory/$slug')({
  beforeLoad: ({ params }) => {
    // Check coordinate-based slugs for EU bounds
    const coords = parseCoordinateSlug(params.slug)
    if (coords && !isWithinEUBounds(coords.lat, coords.lon)) {
      throw redirect({
        to: '/en',
        search: { error: 'eu_only' },
      })
    }
  },
  loader: async ({ params }) => {
    // Ensure i18n is set to English for SSR
    if (i18n.language !== 'en') {
      await i18n.changeLanguage('en')
    }

    // Non-pro route: proMode is always false (URL is source of truth)
    const [location, savedLocations, savedModel] = await Promise.all([
      getLocationBySlug({ data: params.slug }),
      getServerSavedLocations(),
      getServerSelectedModel(),
    ])

    // Check EU bounds for named slugs (coordinate slugs already checked in beforeLoad)
    if (!isWithinEUBounds(location.lat, location.lon)) {
      throw redirect({
        to: '/en',
        search: { error: 'eu_only' },
      })
    }

    const proMode = false

    const queryClient = getQueryClient()
    await queryClient.ensureQueryData(
      allModelsQueryOptions(location.lat, location.lon, proMode)
    )

    const dehydratedState = dehydrate(queryClient)

    return {
      location,
      savedLocations,
      savedModel,
      proMode,
      lang: 'en' as const,
      dehydratedState: JSON.parse(JSON.stringify(dehydratedState)),
    }
  },
  head: ({ loaderData }) => {
    const locationName = loaderData?.location?.name || 'Weather'
    const slug = loaderData?.location?.slug || ''
    const lat = loaderData?.location?.lat || 0
    const lon = loaderData?.location?.lon || 0
    const country = loaderData?.location?.country || ''
    const title = i18n.t('metaObservatoryTitle', { location: locationName })
    const description = i18n.t('metaObservatoryDescription', { location: locationName })
    const url = `https://nimbi.gr/en/observatory/${slug}`

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url: url,
      name: title,
      description: description,
      isPartOf: {
        '@id': 'https://nimbi.gr/#website',
      },
      about: {
        '@type': 'Place',
        name: locationName,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: lat,
          longitude: lon,
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: country,
        },
      },
      mainEntity: {
        '@type': 'WebApplication',
        name: 'nimbi.gr Weather Forecast',
        applicationCategory: 'WeatherApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
      },
      inLanguage: 'en',
      dateModified: new Date().toISOString(),
    }

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [
        { rel: 'canonical', href: url },
        { rel: 'alternate', hrefLang: 'el', href: `https://nimbi.gr/observatory/${slug}` },
        { rel: 'alternate', hrefLang: 'en', href: url },
        { rel: 'alternate', hrefLang: 'x-default', href: `https://nimbi.gr/observatory/${slug}` },
      ],
      scripts: [
        { type: 'application/ld+json', children: JSON.stringify(jsonLd) },
      ],
    }
  },
  component: EnglishObservatoryPageRoute,
})

function EnglishObservatoryPageRoute() {
  const { location, savedLocations, savedModel, proMode, dehydratedState, lang } = Route.useLoaderData()

  return (
    <ObservatoryPage
      location={location}
      savedLocations={savedLocations}
      savedModel={savedModel}
      proMode={proMode}
      dehydratedState={dehydratedState}
      lang={lang}
    />
  )
}
