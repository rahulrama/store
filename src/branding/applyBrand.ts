import type { Brand } from '@/data/brands'

// ── Colour helpers ───────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** Mix `hex` towards `target` by `ratio` (0..1 weight of target). */
function mix(hex: string, target: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(hex)
  const [r2, g2, b2] = hexToRgb(target)
  return rgbToHex(r1 + (r2 - r1) * ratio, g1 + (g2 - g1) * ratio, b1 + (b2 - b1) * ratio)
}

export const darken = (hex: string, amt = 0.18) => mix(hex, '#000000', amt)
export const tint = (hex: string, amt = 0.92) => mix(hex, '#ffffff', amt)

/**
 * Apply a brand at runtime by rewriting the design-token CSS variables, the
 * theme-color meta, the document title and the in-tab favicon. Note: an already
 * installed PWA's home-screen icon/name come from the static manifest and are
 * not affected — this changes the in-app identity only.
 */
export function applyBrand(brand: Brand) {
  const root = document.documentElement
  const accent = brand.accent
  const dark = darken(accent, 0.2)
  const surface = tint(accent, 0.92)

  const vars: Record<string, string> = {
    '--primary': accent,
    '--ring': accent,
    '--info': accent,
    '--sidebar-primary': accent,
    '--sidebar-ring': accent,
    '--chart-1': accent,
    '--pillar-trading': accent,
    '--accent': surface,
    '--accent-foreground': dark,
    '--sidebar-accent': surface,
    '--sidebar-accent-foreground': dark,
  }
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', accent)
  document.title = `${brand.name} · ${brand.tagline}`

  // Update the in-tab favicon to the uploaded logo when present.
  if (brand.logoDataUrl) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-brand]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      link.setAttribute('data-brand', 'true')
      document.head.appendChild(link)
    }
    link.href = brand.logoDataUrl
  }
}

export function applyDark(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}
