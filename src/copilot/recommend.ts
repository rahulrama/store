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
  { kw: /laptop|notebook|macbook|chromebook/, tags: ['laptop'] },
  { kw: /\btv\b|television|telly/, tags: ['tv'] },
  { kw: /\bphone\b|smartphone|handset|\bmobile\b/, tags: ['phone'] },
  { kw: /console|gaming|playstation|\bps5\b|xbox|nintendo|\bgames?\b/, tags: ['gaming', 'console'] },
  { kw: /headphone|earphone|earbud|headset/, tags: ['headphones', 'headset'] },
  { kw: /\bwatch\b|smartwatch|wearable/, tags: ['watch', 'wearable'] },
  { kw: /doorbell|cctv|\bsecurity\b|surveillance/, tags: ['security', 'camera'] },
  { kw: /speaker|alexa|\becho\b|\bvoice\b/, tags: ['speaker', 'voice'] },
  { kw: /\bfan\b|air ?-?con|aircon|conditioner|cooling|\bcool\b|heatwave|\bhot\b/, tags: ['cooling'] },
  { kw: /fridge|freezer/, tags: ['fridge'] },
  { kw: /washing|washer|laundry|tumble dryer/, tags: ['laundry'] },
  { kw: /router|wi-?fi|broadband|\bmesh\b/, tags: ['wifi', 'router'] },
  { kw: /editing|creator|creative|photo|graphic design|photography/, tags: ['video editing', 'creative'] },
  { kw: /student|study|school|\buni\b|college|university/, tags: ['student'] },
  { kw: /\bgift\b|present|birthday/, tags: ['gift'] },
  { kw: /office|work from home|home office|\bwfh\b/, tags: ['home office', 'office'] },
]

function parseBudget(query: string): number | undefined {
  // A number is only a budget when it follows a money cue and is NOT a spec
  // figure (e.g. "9000 BTU", "RTX 4060", "65 inch", "1080p").
  const cue = query.match(
    /(?:£|gbp|~|around|about|under|up to|upto|max|budget|spend(?:ing)?|for|roughly|approx\.?)\s*£?\s*(\d{2,4})(?!\s*(?:k|w|kw|btu|gb|tb|mah|hz|mm|cm|ml|p|fps|"|inch|in|°)\b)/i,
  )
  if (cue) return Number(cue[1])
  const pound = query.match(/£\s*(\d{2,4})/)
  if (pound) return Number(pound[1])
  return undefined
}

function isInStock(storeId: string, sku: string): boolean {
  const inv = stockOf(storeId, sku)
  // Untracked SKUs are assumed available on the shop floor.
  if (!inv) return true
  return inv.status !== 'out_of_stock'
}

// Generic descriptors that must never drive a match on their own.
const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'something', 'anything', 'some', 'any', 'one',
  'ones', 'need', 'needs', 'want', 'wants', 'looking', 'look', 'like', 'get', 'buy', 'buying',
  'please', 'good', 'great', 'best', 'nice', 'cheap', 'decent', 'new', 'latest', 'big', 'small',
  'little', 'old', 'keep', 'cool', 'warm', 'make', 'made', 'has', 'have', 'had', 'customer',
  'present', 'portable', 'lightweight', 'around', 'about', 'under', 'their', 'your', 'our',
])

function tokenize(text: string): string[] {
  return text
    .split(/[^a-z0-9]+/i)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

function nameWordsOf(name: string): Set<string> {
  return new Set(name.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean))
}

export function recommendProducts(query: string, storeId: string): RecommendResult {
  const q = query.toLowerCase()
  const budget = parseBudget(query)

  const wantedTags = new Set<string>()
  for (const hint of CATEGORY_HINTS) {
    if (hint.kw.test(q)) hint.tags.forEach((t) => wantedTags.add(t))
  }
  const hasCategory = wantedTags.size > 0
  const tokens = tokenize(q)

  const scored = PRODUCTS.map((product) => {
    const reasons: string[] = []
    let tagScore = 0
    for (const tag of product.tags) {
      if (wantedTags.has(tag)) {
        tagScore += 3
        reasons.push(`matches “${tag}”`)
      }
    }
    let score = tagScore
    const nameWords = nameWordsOf(product.name)
    for (const token of tokens) {
      if (product.tags.includes(token) || nameWords.has(token)) score += 1
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
    return { product, score, tagScore, reasons: [...new Set(reasons)], inStock }
  })

  // When the query names a category, only surface products in that category — a
  // stray descriptor token must never pull an unrelated product in.
  const matches: ProductMatch[] = scored
    .filter((m) => (hasCategory ? m.tagScore > 0 && m.score > 0 : m.score > 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ product, score, reasons, inStock }) => ({ product, score, reasons, inStock }))

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
