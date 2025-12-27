import { useEffect, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import posthog from 'posthog-js'

// Track page views on route changes
function PostHogPageView() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  useEffect(() => {
    if (pathname && posthog.__loaded) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
      })
    }
  }, [pathname])

  return null
}

interface Props {
  children: React.ReactNode
}

export function PostHogProvider({ children }: Props) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
    const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

    if (!key) {
      console.warn('PostHog key not found, analytics disabled')
      setIsReady(true)
      return
    }

    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: host || 'https://eu.i.posthog.com',
        capture_pageview: false, // We handle this manually with router
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
      })
    }
    setIsReady(true)
  }, [])

  // During SSR or before init, just render children without provider
  if (typeof window === 'undefined' || !isReady) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  )
}
