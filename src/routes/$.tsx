import { createFileRoute } from '@tanstack/react-router'
import { NotFoundComponent } from './__root'
import i18n from '../lib/i18n'

// Catch-all route for 404 pages
// This matches any path that doesn't match other routes
export const Route = createFileRoute('/$')({
  head: () => ({
    meta: [
      {
        title: i18n.t('meta404Title'),
      },
      {
        name: 'robots',
        content: 'noindex',
      },
    ],
  }),
  component: NotFoundComponent,
})
