'use client'

import { createFileRoute, redirect } from '@tanstack/react-router'

// Redirect /el/* to /* (Greek is the default, no prefix needed)
// Catches paths like /el/observatory/athens -> /observatory/athens
export const Route = createFileRoute('/el/$')({
  beforeLoad: ({ location }) => {
    // Get path after /el/ and redirect to root equivalent
    const pathAfterEl = location.pathname.replace(/^\/el\/?/, '/') || '/'

    throw redirect({
      to: pathAfterEl as '/',
      statusCode: 301,
    })
  },
  component: () => null,
})
