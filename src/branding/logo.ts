// Logo processing for the brand admin. Raster images are downscaled to a small
// square via canvas before being stored, so the base64 data URL stays tiny and
// never overflows localStorage — which is what caused upload failures with large
// PNG/JPEG files. Small SVGs are kept as-is so they stay crisp and scalable.

const MAX_DIMENSION = 256
const MAX_INPUT_BYTES = 12_000_000 // reject absurdly large files before decoding
const SVG_INLINE_LIMIT = 120_000 // keep small SVGs as vector

const SUPPORTED = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read that file'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not decode that image'))
    img.src = src
  })
}

/**
 * Validate, decode and downscale a logo file to a compact PNG data URL.
 * Accepts PNG, JPG, WebP, GIF and SVG. Throws a friendly Error on failure.
 */
export async function processLogoFile(file: File): Promise<string> {
  if (!SUPPORTED.test(file.type)) {
    throw new Error('Use a PNG, JPG, WebP, GIF or SVG image')
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('That image is very large — try one under ~12 MB')
  }

  // Small SVGs: keep the original (vector, crisp at any size).
  if (file.type === 'image/svg+xml' && file.size <= SVG_INLINE_LIMIT) {
    return readAsDataUrl(file)
  }

  const sourceUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(sourceUrl)
    const naturalW = img.naturalWidth || img.width || MAX_DIMENSION
    const naturalH = img.naturalHeight || img.height || MAX_DIMENSION
    const scale = Math.min(1, MAX_DIMENSION / Math.max(naturalW, naturalH))
    const w = Math.max(1, Math.round(naturalW * scale))
    const h = Math.max(1, Math.round(naturalH * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Image processing is not supported in this browser')
    ctx.drawImage(img, 0, 0, w, h)
    // PNG preserves transparency; the downscaled result is only a few KB.
    return canvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}
