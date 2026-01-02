#!/usr/bin/env node

/**
 * Generate animated favicon and OG images from weather icons
 *
 * Usage: node scripts/generate-favicons.mjs
 *
 * Outputs:
 * - public/favicon.ico (32x32 static)
 * - public/favicon-animated.gif (32x32 animated)
 * - public/favicon-16x16.png (16x16 static)
 * - public/favicon-32x32.png (32x32 static)
 * - public/apple-touch-icon.png (180x180 static)
 * - public/icon-192x192.png (192x192 PWA icon)
 * - public/icon-512x512.png (512x512 PWA icon)
 * - public/og-image.png (1200x630 branded)
 */

import puppeteer from 'puppeteer'
import GifEncoder from 'gif-encoder-2'
import sharp from 'sharp'
import { createWriteStream, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const PUBLIC_DIR = join(PROJECT_ROOT, 'public')
const ICONS_DIR = join(PUBLIC_DIR, 'weather-icons', 'fill')

// Weather sequence matching the AnimatedLogo component
const WEATHER_SEQUENCE = [
  'clear-day',
  'partly-cloudy-day',
  'cloudy',
  'rain',
  'thunderstorms',
  'snow',
]

// Animation settings
const FRAMES_PER_ICON = 15 // Frames to capture per icon (for internal animation)
const FRAME_DELAY = 100 // Delay between GIF frames in ms (100ms = 10fps)

// Output sizes
const SIZES = {
  favicon16: 16,
  favicon32: 32,
  appleTouchIcon: 180,
  pwa192: 192,
  pwa512: 512,
}

function loadSvgContent(iconName) {
  const svgPath = join(ICONS_DIR, `${iconName}.svg`)
  if (!existsSync(svgPath)) {
    throw new Error(`Icon not found: ${svgPath}`)
  }
  return readFileSync(svgPath, 'utf-8')
}

async function captureIconFrames(browser, iconName, size, numFrames) {
  const svgContent = loadSvgContent(iconName)
  const frames = []

  const page = await browser.newPage()
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 2 })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: ${size}px;
          height: ${size}px;
          background: transparent;
          overflow: hidden;
        }
        body {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        svg {
          width: ${size}px;
          height: ${size}px;
        }
      </style>
    </head>
    <body>${svgContent}</body>
    </html>
  `

  await page.setContent(html, { waitUntil: 'networkidle0' })

  // Wait for SVG animations to initialize
  await new Promise(r => setTimeout(r, 100))

  // Capture frames over time to get the animation
  for (let i = 0; i < numFrames; i++) {
    const buffer = await page.screenshot({
      type: 'png',
      omitBackground: true,
    })
    frames.push(buffer)
    // Wait between frames to capture animation progress
    await new Promise(r => setTimeout(r, 80))
  }

  await page.close()
  return frames
}

async function createAnimatedGif(frames, size, outputPath, frameDelay = FRAME_DELAY) {
  return new Promise(async (resolve, reject) => {
    const encoder = new GifEncoder(size, size, 'neuquant', true)
    const stream = createWriteStream(outputPath)

    stream.on('finish', resolve)
    stream.on('error', reject)

    encoder.createReadStream().pipe(stream)
    encoder.start()
    encoder.setDelay(frameDelay)
    encoder.setRepeat(0) // Loop forever
    encoder.setTransparent(0x00000000)
    encoder.setQuality(10) // Best quality

    for (const framePng of frames) {
      // Convert PNG to raw RGBA and resize
      const { data } = await sharp(framePng)
        .resize(size, size)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })

      encoder.addFrame(data)
    }

    encoder.finish()
  })
}

async function createStaticPng(frame, size, outputPath) {
  await sharp(frame).resize(size, size).png().toFile(outputPath)
}

async function createIco(pngBuffer, outputPath) {
  // Create 32x32 PNG
  const png32 = await sharp(pngBuffer).resize(32, 32).png().toBuffer()

  // Simple ICO format with PNG payload
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // Reserved
  header.writeUInt16LE(1, 2) // ICO type
  header.writeUInt16LE(1, 4) // Number of images

  const entry = Buffer.alloc(16)
  entry.writeUInt8(32, 0) // Width
  entry.writeUInt8(32, 1) // Height
  entry.writeUInt8(0, 2) // Color palette
  entry.writeUInt8(0, 3) // Reserved
  entry.writeUInt16LE(1, 4) // Color planes
  entry.writeUInt16LE(32, 6) // Bits per pixel
  entry.writeUInt32LE(png32.length, 8) // Size of image data
  entry.writeUInt32LE(22, 12) // Offset to image data (6 + 16 = 22)

  const ico = Buffer.concat([header, entry, png32])
  writeFileSync(outputPath, ico)
}

async function createBrandedOgImage(browser, outputPath) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })

  // Load weather icons for the collage
  const icons = ['clear-day', 'partly-cloudy-day', 'rain', 'thunderstorms', 'snow']
  const iconSvgs = icons.map(name => loadSvgContent(name))

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 1200px;
          height: 630px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        body {
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .bg-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.1;
          background-image: radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
                            radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
                            radial-gradient(circle at 40% 40%, white 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .icons-row {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .icon {
          width: 100px;
          height: 100px;
          opacity: 0.9;
        }
        .icon.main {
          width: 160px;
          height: 160px;
          opacity: 1;
        }
        .icon svg {
          width: 100%;
          height: 100%;
        }
        .brand {
          text-align: center;
        }
        .brand h1 {
          font-size: 72px;
          font-weight: 700;
          color: white;
          letter-spacing: -2px;
          text-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .brand p {
          font-size: 28px;
          color: rgba(255,255,255,0.9);
          font-weight: 400;
          margin-top: 8px;
        }
        .url {
          position: absolute;
          bottom: 40px;
          font-size: 22px;
          color: rgba(255,255,255,0.7);
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="bg-pattern"></div>
      <div class="content">
        <div class="icons-row">
          <div class="icon">${iconSvgs[0]}</div>
          <div class="icon">${iconSvgs[1]}</div>
          <div class="icon main">${iconSvgs[2]}</div>
          <div class="icon">${iconSvgs[3]}</div>
          <div class="icon">${iconSvgs[4]}</div>
        </div>
        <div class="brand">
          <h1>nimbi</h1>
          <p>Multi-Model Weather Observatory</p>
        </div>
      </div>
      <div class="url">nimbi.gr</div>
    </body>
    </html>
  `

  await page.setContent(html, { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 500)) // Wait for fonts and animations

  const buffer = await page.screenshot({ type: 'png' })
  await page.close()

  await sharp(buffer).resize(1200, 630).png({ quality: 90 }).toFile(outputPath)
}

async function main() {
  console.log('🎨 Generating favicon and OG images...\n')

  // Ensure output directory exists
  if (!existsSync(PUBLIC_DIR)) {
    mkdirSync(PUBLIC_DIR, { recursive: true })
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    // Collect all frames for the complete animation cycle
    console.log('📸 Capturing frames for each weather state...')
    const allFrames = {
      [SIZES.favicon16]: [],
      [SIZES.favicon32]: [],
      [SIZES.appleTouchIcon]: [],
      [SIZES.pwa192]: [],
      [SIZES.pwa512]: [],
    }

    for (const iconName of WEATHER_SEQUENCE) {
      console.log(`  - ${iconName}`)

      for (const size of Object.values(SIZES)) {
        const frames = await captureIconFrames(browser, iconName, size, FRAMES_PER_ICON)
        allFrames[size].push(...frames)
      }
    }

    // Generate outputs
    console.log('\n✨ Generating output files...')

    // Favicon (static .ico)
    console.log('  - favicon.ico (32x32 static)')
    await createIco(allFrames[SIZES.favicon32][0], join(PUBLIC_DIR, 'favicon.ico'))

    // Animated favicon GIF
    console.log('  - favicon-animated.gif (32x32 animated)')
    await createAnimatedGif(
      allFrames[SIZES.favicon32],
      SIZES.favicon32,
      join(PUBLIC_DIR, 'favicon-animated.gif'),
      FRAME_DELAY
    )

    // Favicon PNGs
    console.log('  - favicon-16x16.png (16x16 static)')
    await createStaticPng(
      allFrames[SIZES.favicon16][0],
      SIZES.favicon16,
      join(PUBLIC_DIR, 'favicon-16x16.png')
    )

    console.log('  - favicon-32x32.png (32x32 static)')
    await createStaticPng(
      allFrames[SIZES.favicon32][0],
      SIZES.favicon32,
      join(PUBLIC_DIR, 'favicon-32x32.png')
    )

    // Apple touch icon (static)
    console.log('  - apple-touch-icon.png (180x180 static)')
    await createStaticPng(
      allFrames[SIZES.appleTouchIcon][0],
      SIZES.appleTouchIcon,
      join(PUBLIC_DIR, 'apple-touch-icon.png')
    )

    // PWA icons
    console.log('  - icon-192x192.png (192x192 PWA icon)')
    await createStaticPng(
      allFrames[SIZES.pwa192][0],
      SIZES.pwa192,
      join(PUBLIC_DIR, 'icon-192x192.png')
    )

    console.log('  - icon-512x512.png (512x512 PWA icon)')
    await createStaticPng(
      allFrames[SIZES.pwa512][0],
      SIZES.pwa512,
      join(PUBLIC_DIR, 'icon-512x512.png')
    )

    // Branded OG image
    console.log('  - og-image.png (1200x630 branded)')
    await createBrandedOgImage(browser, join(PUBLIC_DIR, 'og-image.png'))

    console.log('\n✅ Done! Generated files in public/')
    console.log('\nGenerated:')
    console.log('  • favicon.ico - Static fallback')
    console.log('  • favicon-animated.gif - Animated for modern browsers')
    console.log('  • favicon-16x16.png - Small favicon')
    console.log('  • favicon-32x32.png - Standard favicon')
    console.log('  • apple-touch-icon.png - iOS home screen icon')
    console.log('  • icon-192x192.png - PWA icon (192x192)')
    console.log('  • icon-512x512.png - PWA icon (512x512)')
    console.log('  • og-image.png - Social media sharing (branded)')
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
