// One-off icon generator for the PWA. Run: node scripts/gen-icons.mjs
// Generates every PWA / favicon asset from the authentic Currys roundel
// (public/currys-logo.svg.webp), so all icons stay in sync with one source.
// Uses the top-level `sharp` (the bundled one in the assets-generator is broken on Node 24).
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pub = resolve(root, 'public')
const src = readFileSync(resolve(pub, 'currys-logo.svg.webp'))

// Exact Currys roundel purple (sampled from the source). Fills the transparent
// corners of the maskable / apple-touch tiles seamlessly with the circle.
const ACCENT = '#4c12a1'

async function png(size, out, { flatten = false } = {}) {
  let img = sharp(src).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  if (flatten) img = img.flatten({ background: ACCENT })
  await img.png().toFile(resolve(pub, out))
  console.log('wrote', out)
}

// Manifest "any" icons — transparent corners, shown as the circular logo.
await png(64, 'pwa-64x64.png')
await png(192, 'pwa-192x192.png')
await png(512, 'pwa-512x512.png')
// Maskable + Apple touch — flattened onto the brand purple so the OS mask
// never reveals transparent corners.
await png(512, 'maskable-icon-512x512.png', { flatten: true })
await png(180, 'apple-touch-icon-180x180.png', { flatten: true })
// PNG favicon.
await png(32, 'favicon-32x32.png')

// SVG-typed favicons + the in-app brand mark: wrap the authentic logo so they
// all render the real Currys icon. Embed a PNG (PNG-in-SVG renders in every
// browser, including Safari, unlike WebP-in-SVG).
const embedPng = await sharp(src)
  .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()
const dataUri = `data:image/png;base64,${embedPng.toString('base64')}`
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
  `viewBox="0 0 256 256" width="256" height="256" role="img" aria-label="Currys">\n` +
  `  <image href="${dataUri}" xlink:href="${dataUri}" width="256" height="256"/>\n` +
  `</svg>\n`
for (const out of ['brand-icon.svg', 'favicon.svg', 'currys-logo.svg']) {
  writeFileSync(resolve(pub, out), svg)
  console.log('wrote', out)
}
console.log('done')
