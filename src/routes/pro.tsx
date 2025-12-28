'use client'

import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/pro')({
  component: ProLayout,
})

function ProLayout() {
  return <Outlet />
}
