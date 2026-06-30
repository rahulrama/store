// One-off icon generator for the PWA. Run: node scripts/gen-icons.mjs
// Uses the top-level `sharp` (the bundled one in the assets-generator is broken on Node 24).
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pub = resolve(root, 'public')
const src = readFileSync(resolve(pub, 'brand-icon.svg'))

const ACCENT = '#464feb'

async function png(size, out, { flatten = false } = {}) {
  let img = sharp(src, { density: 384 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  if (flatten) img = img.flatten({ background: ACCENT })
  await img.png().toFile(resolve(pub, out))
  console.log('wrote', out)
}

await png(64, 'pwa-64x64.png')
await png(192, 'pwa-192x192.png')
await png(512, 'pwa-512x512.png')
await png(512, 'maskable-icon-512x512.png', { flatten: true })
await png(180, 'apple-touch-icon-180x180.png', { flatten: true })
await png(32, 'favicon-32x32.png')
console.log('done')
