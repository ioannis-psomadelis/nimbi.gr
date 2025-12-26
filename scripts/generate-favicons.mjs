import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// Primary blue color (matches app's primary color)
const primary = '#3b82f6'
const whiteBg = '#ffffff'
const darkBg = '#0f172a'

// Cloud path - same as used in the app (CLOUD_PATH from logo.tsx)
const CLOUD_PATH = 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z'

// Favicon SVG with stroke-based cloud (matches app logo)
const faviconSvg = (size) => {
  const padding = size * 0.03
  const rectSize = size - (padding * 2)
  const borderWidth = Math.max(1, size * 0.06)
  const radius = size * 0.19
  const iconPadding = size * 0.125
  const iconSize = size - (iconPadding * 2)
  // Scale stroke width based on size for visibility
  const strokeWidth = size <= 32 ? 2 : 1.5

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect x="${padding}" y="${padding}" width="${rectSize}" height="${rectSize}" rx="${radius}" fill="${whiteBg}" stroke="${primary}" stroke-width="${borderWidth}"/>
  <svg x="${iconPadding}" y="${iconPadding}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
    <path d="${CLOUD_PATH}"/>
  </svg>
</svg>`
}

// OG Image SVG (1200x630) with gradient background
const ogImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Cloud icon (stroke-based, matching app) -->
  <g transform="translate(456, 140)">
    <svg width="288" height="288" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
      <path d="${CLOUD_PATH}"/>
    </svg>
  </g>
  <!-- Text -->
  <text x="600" y="500" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700">nimbi.gr</text>
  <text x="600" y="560" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28">Weather Observatory</text>
</svg>`

async function generateFavicons() {
  console.log('Generating favicons with primary blue color...')

  // Generate favicon-16x16.png
  await sharp(Buffer.from(faviconSvg(16)))
    .png()
    .toFile(join(publicDir, 'favicon-16x16.png'))
  console.log('Created favicon-16x16.png')

  // Generate favicon-32x32.png
  await sharp(Buffer.from(faviconSvg(32)))
    .png()
    .toFile(join(publicDir, 'favicon-32x32.png'))
  console.log('Created favicon-32x32.png')

  // Generate apple-touch-icon.png (180x180)
  await sharp(Buffer.from(faviconSvg(180)))
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'))
  console.log('Created apple-touch-icon.png')

  // Generate OG image (1200x630)
  await sharp(Buffer.from(ogImageSvg))
    .png()
    .toFile(join(publicDir, 'og-image.png'))
  console.log('Created og-image.png')

  // Generate favicon.ico from 32x32
  await sharp(Buffer.from(faviconSvg(32)))
    .png()
    .toFile(join(publicDir, 'favicon.ico'))
  console.log('Created favicon.ico')

  console.log('Done!')
}

generateFavicons().catch(console.error)
