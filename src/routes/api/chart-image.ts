import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/chart-image')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const imageUrl = url.searchParams.get('url')

        if (!imageUrl) {
          return new Response('Missing url parameter', { status: 400 })
        }

        // Only allow Tropical Tidbits URLs
        if (!imageUrl.startsWith('https://www.tropicaltidbits.com/')) {
          return new Response('Invalid URL: only Tropical Tidbits URLs allowed', { status: 403 })
        }

        try {
          const response = await fetch(imageUrl, {
            headers: {
              'Referer': 'https://www.tropicaltidbits.com/analysis/models/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          })

          if (!response.ok) {
            return new Response(`Upstream error: ${response.status}`, { status: response.status })
          }

          const imageBuffer = await response.arrayBuffer()
          const contentType = response.headers.get('content-type') || 'image/png'

          return new Response(imageBuffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
              'Access-Control-Allow-Origin': '*',
            },
          })
        } catch (error) {
          console.error('Image proxy error:', error)
          return new Response('Failed to fetch image', { status: 500 })
        }
      },
    },
  },
})
