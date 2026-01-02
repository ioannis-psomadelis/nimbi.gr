import { QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Scripts, createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { I18nextProvider, useTranslation } from 'react-i18next'

import { useLayoutEffect } from 'react'
import { useThemeEffect } from '../hooks/use-theme-effect'
import i18n from '../lib/i18n'
import { NavigationLoader } from '../components/layout/navigation-loader'
import { PostHogProvider } from '../components/providers/posthog-provider'
import { getQueryClient } from '../lib/query-client'

import appCss from '../styles.css?url'

// Script to prevent flash of wrong theme - reads from nimbi-store cookie
const themeScript = `
  (function() {
    var themeColors = { light: '#ffffff', dark: '#0a0a0a' };
    function applyTheme(theme) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
      // Update theme-color meta tag for status bar
      var metas = document.querySelectorAll('meta[name="theme-color"]');
      metas.forEach(function(meta) { meta.remove(); });
      var meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = themeColors[theme];
      document.head.appendChild(meta);
    }
    function getSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    try {
      var cookie = document.cookie.split('; ').find(function(row) { return row.startsWith('nimbi-store='); });
      if (cookie) {
        var data = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        var stored = data.preferences && data.preferences.state && data.preferences.state.theme;
        if (stored === 'light' || stored === 'dark') {
          applyTheme(stored);
          return;
        }
        if (stored === 'system') {
          applyTheme(getSystemTheme());
          return;
        }
      }
    } catch (e) {}
    // Fallback to system preference, not hardcoded dark
    applyTheme(getSystemTheme());
  })();
`

// Script to prevent flash of wrong language - reads cookie and sets data attribute
const languageScript = `
  (function() {
    var lang = document.cookie.split('; ').find(function(row) { return row.startsWith('nimbi-language='); });
    lang = lang ? lang.split('=')[1] : null;
    if (lang === 'el' || lang === 'en') {
      document.documentElement.lang = lang;
      document.documentElement.dataset.lang = lang;
    }
  })();
`

// 404 Not Found Component - exported for use in catch-all route
export function NotFoundComponent() {
  const { t } = useTranslation()

  // Generate weather particles
  const snowflakes = Array.from({ length: 40 }, (_, i) => (
    <div key={`snow-${i}`} className="snowflake" />
  ))

  const raindrops = Array.from({ length: 50 }, (_, i) => (
    <div key={`rain-${i}`} className="raindrop" />
  ))

  const clouds = (
    <div className="clouds-layer">
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />
      <div className="cloud cloud-5" />
    </div>
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Living Weather Background */}
      <div className="home-bg">
        {clouds}
        <div className="weather-particles">
          <div className="snow-layer">{snowflakes}</div>
          <div className="rain-layer">{raindrops}</div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8">
        <div className="w-full max-w-md text-center animate-fade-in">
          {/* 404 Icon */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/15">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl sm:text-7xl font-bold text-white dark:text-foreground tracking-tight mb-4 drop-shadow-lg">
            404
          </h1>
          <p className="text-xl text-white/90 dark:text-foreground/80 font-medium mb-2 drop-shadow-md">
            {t('pageNotFound')}
          </p>
          <p className="text-white/70 dark:text-foreground/50 text-sm mb-8 drop-shadow-md">
            {t('pageNotFoundDescription')}
          </p>

          {/* Back to Home Button */}
          <Link
            to="/"
            className="home-btn-primary inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-xl text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t('backToHome')}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center animate-fade-in">
        <p className="text-xs text-foreground/40">
          © {new Date().getFullYear()} nimbi.gr
        </p>
      </footer>
    </div>
  )
}

export const Route = createRootRoute({
  loader: async ({ location }) => {
    // Detect language from URL path (URL takes priority over cookie)
    const pathname = location.pathname
    const urlLang = pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'el'

    // Change i18n language on server before any component renders
    if (i18n.language !== urlLang) {
      await i18n.changeLanguage(urlLang)
    }
    return { language: urlLang }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      // Theme colors for light/dark mode (Android status bar)
      {
        name: 'theme-color',
        media: '(prefers-color-scheme: light)',
        content: '#ffffff',
      },
      {
        name: 'theme-color',
        media: '(prefers-color-scheme: dark)',
        content: '#0a0a0a',
      },
      // iOS status bar
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'nimbi',
      },
      // Mobile app behavior
      {
        name: 'mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'format-detection',
        content: 'telephone=no',
      },
      // SEO essentials
      {
        name: 'description',
        content: 'Compare weather forecasts from ECMWF, GFS, GEM & UKMO models. Multi-model weather observatory for Greece and Europe with hourly predictions and 7-day outlooks.',
      },
      {
        name: 'keywords',
        content: 'weather forecast, ECMWF, GFS, weather models, Greece weather, Europe weather, meteorology, forecast comparison',
      },
      {
        name: 'author',
        content: 'nimbi.gr',
      },
      {
        name: 'robots',
        content: 'index, follow',
      },
      // Base OG tags (can be overridden by child routes)
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'nimbi',
      },
      {
        property: 'og:title',
        content: 'nimbi - Multi-Model Weather Observatory',
      },
      {
        property: 'og:description',
        content: 'Compare weather forecasts from ECMWF, GFS, GEM & UKMO models for Greece and Europe.',
      },
      {
        property: 'og:url',
        content: 'https://nimbi.gr',
      },
      {
        property: 'og:locale',
        content: 'en_US',
      },
      {
        property: 'og:locale:alternate',
        content: 'el_GR',
      },
      {
        property: 'og:image',
        content: 'https://nimbi.gr/og-image.png',
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '630',
      },
      {
        property: 'og:image:alt',
        content: 'nimbi - Multi-Model Weather Observatory',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'nimbi - Multi-Model Weather Observatory',
      },
      {
        name: 'twitter:description',
        content: 'Compare weather forecasts from ECMWF, GFS, GEM & UKMO models.',
      },
      {
        name: 'twitter:image',
        content: 'https://nimbi.gr/og-image.png',
      },
      {
        name: 'twitter:image:alt',
        content: 'nimbi weather observatory',
      },
      {
        name: 'twitter:site',
        content: '@nimbi_gr',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      // Standard favicons first (for Google and browsers)
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      // Animated favicon for browsers that support it
      {
        rel: 'icon',
        type: 'image/gif',
        sizes: '32x32',
        href: '/favicon-animated.gif',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        href: '/icon-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        href: '/icon-512x512.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      // Hreflang for language variants
      {
        rel: 'alternate',
        hrefLang: 'en',
        href: 'https://nimbi.gr/',
      },
      {
        rel: 'alternate',
        hrefLang: 'el',
        href: 'https://nimbi.gr/',
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
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': 'https://nimbi.gr/#organization',
              name: 'nimbi.gr',
              url: 'https://nimbi.gr',
              logo: {
                '@type': 'ImageObject',
                url: 'https://nimbi.gr/icon-512x512.png',
                width: 512,
                height: 512,
              },
              sameAs: [],
            },
            {
              '@type': 'WebSite',
              '@id': 'https://nimbi.gr/#website',
              url: 'https://nimbi.gr',
              name: 'nimbi.gr - Weather Observatory',
              description: 'Multi-model weather forecasts comparing ECMWF, GFS, GEM & UKMO models for Greece and Europe',
              publisher: {
                '@id': 'https://nimbi.gr/#organization',
              },
              inLanguage: ['en', 'el'],
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://nimbi.gr/?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            },
          ],
        }),
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFoundComponent,
})

// Root component - sets language from URL
function RootComponent() {
  const { language } = Route.useLoaderData()

  // Set language from URL-based loader before first paint
  useLayoutEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language])

  return <Outlet />
}

// Component that applies theme effect and renders children
function ThemeApplier({ children }: { children: React.ReactNode }) {
  useThemeEffect()
  return <>{children}</>
}

function RootDocument({ children }: { children: React.ReactNode }) {
  // Get the appropriate QueryClient (new per-request on server, singleton on browser)
  const queryClient = getQueryClient()

  return (
    <html lang={i18n.language} suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: languageScript }} />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <I18nextProvider i18n={i18n}>
          <ThemeApplier>
            <NavigationLoader />
            <PostHogProvider>
              <QueryClientProvider client={queryClient}>
                {children}
                <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                ]}
                />
              </QueryClientProvider>
            </PostHogProvider>
          </ThemeApplier>
        </I18nextProvider>
        <Scripts />
      </body>
    </html>
  )
}
