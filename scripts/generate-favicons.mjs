import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// Orange color palette
const orange = '#f97316'
const darkBg = '#0a0a0a'

// Cloud SVG for favicons - with rounded rect background and orange border
const faviconSvg = (size) => {
  const padding = size * 0.03
  const rectSize = size - (padding * 2)
  const borderWidth = Math.max(1, size * 0.06)
  const radius = size * 0.19
  const cloudScale = size / 32

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect x="${padding}" y="${padding}" width="${rectSize}" height="${rectSize}" rx="${radius}" fill="${darkBg}" stroke="${orange}" stroke-width="${borderWidth}"/>
  <g transform="translate(${size * 0.125}, ${size * 0.19}) scale(${cloudScale * 0.75})">
    <path fill="${orange}" d="M20 11c0-.13-.01-.26-.02-.38A5.25 5.25 0 008.8 8 4.125 4.125 0 005 12.5 4.125 4.125 0 009.125 16.5h9a4.125 4.125 0 001.125-8.09V11z"/>
  </g>
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
  <!-- Cloud icon -->
  <g transform="translate(500, 180) scale(6)">
    <path fill="${orange}" d="M25 14.5c0-.17-.01-.34-.02-.5A7 7 0 0011.1 10.5 5.5 5.5 0 006 16a5.5 5.5 0 005.5 5.5h12a5.5 5.5 0 001.5-10.78V14.5z"/>
  </g>
  <!-- Text -->
  <text x="600" y="480" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700">nimbi.gr</text>
  <text x="600" y="540" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28">Weather Observatory</text>
</svg>`

async function generateFavicons() {
  console.log('Generating favicons with orange theme...')

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
