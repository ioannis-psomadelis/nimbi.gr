import { QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Scripts, createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { I18nextProvider, useTranslation } from 'react-i18next'

import { useEffect, useLayoutEffect } from 'react'
import { ThemeProvider } from '../hooks/use-theme'
import i18n, { syncLanguageFromStorage } from '../lib/i18n'
import { getServerLanguage } from '../lib/server/language'
import { NavigationLoader } from '../components/layout/navigation-loader'
import { getQueryClient } from '../lib/query-client'

import appCss from '../styles.css?url'

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    const stored = localStorage.getItem('nimbi-theme');
    const theme = stored === 'light' || stored === 'dark' ? stored :
                  stored === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') :
                  'dark';
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
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
  loader: async () => {
    // Get language from cookie on server and apply it BEFORE rendering
    const language = await getServerLanguage()
    // Change i18n language on server before any component renders
    if (i18n.language !== language) {
      await i18n.changeLanguage(language)
    }
    return { language }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'theme-color',
        content: '#3b82f6',
      },
      // Base OG tags (can be overridden by child routes)
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'nimbi.gr',
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
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFoundComponent,
})

// Root component - sets language from server and syncs on client
function RootComponent() {
  const { language } = Route.useLoaderData()

  // Set language from server loader before first paint
  useLayoutEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language])

  // Also sync from cookies on client (for changes after initial load)
  useEffect(() => {
    syncLanguageFromStorage()
  }, [])

  return <Outlet />
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
          <ThemeProvider>
            <NavigationLoader />
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
          </ThemeProvider>
        </I18nextProvider>
        <Scripts />
      </body>
    </html>
  )
}
