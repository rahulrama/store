import type { Product } from '@/types'
import { PRODUCTS, PRODUCT_BY_SKU } from '@/data/products'
import { stockOf } from '@/data/inventory'

export interface ProductMatch {
  product: Product
  score: number
  reasons: string[]
  inStock: boolean
}

export interface RecommendResult {
  query: string
  budget?: number
  matches: ProductMatch[]
  attach: Product[]
  carePlanFor?: Product
}

const CATEGORY_HINTS: { kw: RegExp; tags: string[] }[] = [
  { kw: /laptop|notebook|macbook/, tags: ['laptop'] },
  { kw: /\btv\b|television|oled|telly/, tags: ['tv'] },
  { kw: /phone|smartphone|handset|mobile/, tags: ['phone'] },
  { kw: /console|gaming|playstation|xbox|game/, tags: ['gaming', 'console'] },
  { kw: /headphone|earphone|headset/, tags: ['headphones', 'headset'] },
  { kw: /watch|wearable|fitness/, tags: ['watch', 'wearable'] },
  { kw: /doorbell|camera|security/, tags: ['security', 'camera'] },
  { kw: /speaker|alexa|voice/, tags: ['speaker', 'voice'] },
  { kw: /fan|air con|aircon|air-con|cooling|hot|heatwave/, tags: ['cooling'] },
  { kw: /fridge|freezer/, tags: ['fridge'] },
  { kw: /wash|laundry/, tags: ['laundry'] },
  { kw: /router|wifi|wi-fi|broadband/, tags: ['wifi', 'router'] },
  { kw: /editing|creator|creative|design|photo|video/, tags: ['video editing', 'creative'] },
  { kw: /student|study|school|uni|college/, tags: ['student'] },
  { kw: /gift|present/, tags: ['gift'] },
  { kw: /office|work from home|home office/, tags: ['home office', 'office'] },
]

function parseBudget(query: string): number | undefined {
  const around = query.match(/(?:£|gbp|around|about|under|up to|max|budget)\s*£?\s*(\d{2,4})/i)
  if (around) return Number(around[1])
  const bare = query.match(/£\s*(\d{2,4})/)
  if (bare) return Number(bare[1])
  const plain = query.match(/\b(\d{3,4})\b/)
  if (plain) return Number(plain[1])
  return undefined
}

function isInStock(storeId: string, sku: string): boolean {
  const inv = stockOf(storeId, sku)
  // Untracked SKUs are assumed available on the shop floor.
  if (!inv) return true
  return inv.status !== 'out_of_stock'
}

export function recommendProducts(query: string, storeId: string): RecommendResult {
  const q = query.toLowerCase()
  const budget = parseBudget(query)

  const wantedTags = new Set<string>()
  for (const hint of CATEGORY_HINTS) {
    if (hint.kw.test(q)) hint.tags.forEach((t) => wantedTags.add(t))
  }
  const tokens = q.split(/\s+/).filter((t) => t.length > 2)

  const matches: ProductMatch[] = PRODUCTS.map((product) => {
    const reasons: string[] = []
    let score = 0

    for (const tag of product.tags) {
      if (wantedTags.has(tag)) {
        score += 3
        reasons.push(`matches “${tag}”`)
      }
    }
    for (const token of tokens) {
      if (product.tags.some((t) => t.includes(token)) || product.name.toLowerCase().includes(token)) {
        score += 1
      }
    }
    if (budget) {
      if (product.price <= budget * 1.08) {
        score += 2
        reasons.push(`within ~£${budget} budget`)
      } else if (product.price > budget * 1.3) {
        score -= 3
      }
    }
    // Demote pure accessories from the headline matches.
    if (product.tags.includes('attach') && !wantedTags.has('attach')) score -= 2

    const inStock = isInStock(storeId, product.sku)
    if (!inStock) {
      score -= 1
      reasons.push('not in stock here')
    }
    return { product, score, reasons: [...new Set(reasons)], inStock }
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  // Attach suggestions from the top in-stock match.
  const top = matches.find((m) => m.inStock) ?? matches[0]
  const attach: Product[] = []
  if (top?.product.attachSkus) {
    for (const sku of top.product.attachSkus) {
      const p = PRODUCT_BY_SKU[sku]
      if (p && isInStock(storeId, sku)) attach.push(p)
    }
  }
  const carePlanFor = top?.product.carePlan ? top.product : undefined

  return { query, budget, matches, attach: attach.slice(0, 3), carePlanFor }
}
