'use client'

import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout route for /el/* - just renders children
// The /el/$.tsx splat route handles redirects for nested paths
// The /el/index.tsx handles redirect for /el and /el/
export const Route = createFileRoute('/el')({
  component: () => <Outlet />,
})
