import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { I18nextProvider } from 'react-i18next'

import { useEffect, useLayoutEffect } from 'react'
import { ThemeProvider } from '../hooks/use-theme'
import i18n, { syncLanguageFromStorage } from '../lib/i18n'
import { getServerLanguage } from '../lib/server/language'
import { NavigationLoader } from '../components/layout/navigation-loader'

import appCss from '../styles.css?url'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes
      gcTime: 1000 * 60 * 60 * 2, // 2 hours
    },
  },
})

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
        title: 'nimbi.gr - Weather Observatory',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
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
