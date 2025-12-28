'use client'

import { createFileRoute, redirect } from '@tanstack/react-router'

// Redirect /el and /el/ to / (Greek is the default, no prefix needed)
export const Route = createFileRoute('/el/')({
  beforeLoad: () => {
    throw redirect({
      to: '/',
      statusCode: 301,
    })
  },
  component: () => null,
})
