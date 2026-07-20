import type { InventoryItem, Product } from '@/types'
import { INVENTORY, TRACKED_SKUS, velocityOf, nextDeliveryDays } from '@/data/inventory'
import { PRODUCT_BY_SKU } from '@/data/products'
import { STORE_BY_ID } from '@/data/stores'

/** Weeks of supply = on-hand ÷ weekly sales velocity (the industry "weeks of cover"). */
export function weeksOfSupply(item: InventoryItem): number {
  const v = velocityOf(item.storeId, item.sku)
  if (v <= 0) return item.onHand > 0 ? 99 : 0
  return Math.round((item.onHand / v) * 10) / 10
}

export type CoverBand = 'out' | 'low' | 'healthy' | 'overstock'

export function coverBand(item: InventoryItem): CoverBand {
  if (item.onHand <= 0) return 'out'
  const w = weeksOfSupply(item)
  if (w < 1) return 'low'
  if (w > 6) return 'overstock'
  return 'healthy'
}

export interface StockSummary {
  totalLines: number
  inStock: number
  low: number
  outOfStock: number
  soldOutNoneOnOrder: number
  oosRatePct: number
  unitsOnHand: number
  unitsOnOrder: number
}

export function stockSummary(items: InventoryItem[]): StockSummary {
  const total = items.length
  const outOfStock = items.filter((i) => i.status === 'out_of_stock').length
  return {
    totalLines: total,
    inStock: items.filter((i) => i.status === 'in_stock').length,
    low: items.filter((i) => i.status === 'low').length,
    outOfStock,
    soldOutNoneOnOrder: items.filter((i) => i.onHand <= 0 && i.onOrder <= 0).length,
    oosRatePct: total ? Math.round((outOfStock / total) * 100) : 0,
    unitsOnHand: items.reduce((s, i) => s + i.onHand, 0),
    unitsOnOrder: items.reduce((s, i) => s + i.onOrder, 0),
  }
}

export function itemsForStores(storeIds: string[]): InventoryItem[] {
  const set = new Set(storeIds)
  return INVENTORY.filter((i) => set.has(i.storeId))
}

export interface MatrixRow {
  sku: string
  product?: Product
  cells: (InventoryItem | undefined)[]
}

/** Rows = SKUs, columns = stores — the heatmap the Regional/HQ views render. */
export function stockMatrix(storeIds: string[], skus: string[] = TRACKED_SKUS): MatrixRow[] {
  return skus.map((sku) => ({
    sku,
    product: PRODUCT_BY_SKU[sku],
    cells: storeIds.map((storeId) => INVENTORY.find((i) => i.storeId === storeId && i.sku === sku)),
  }))
}

/** Other stores currently holding a SKU (not out of stock), richest first. Shared with fulfilment. */
export function storesWithStock(sku: string, excludeStoreId?: string): InventoryItem[] {
  return INVENTORY.filter(
    (i) => i.sku === sku && i.status !== 'out_of_stock' && i.storeId !== excludeStoreId,
  ).sort((a, b) => b.onHand - a.onHand)
}

export interface RebalanceSuggestion {
  sku: string
  fromStoreId: string
  toStoreId: string
  fromOnHand: number
}

/** One store OOS (none on order) while a sibling is overstocked → suggest a transfer. */
export function rebalanceSuggestions(regionId?: string): RebalanceSuggestion[] {
  const out: RebalanceSuggestion[] = []
  for (const sku of TRACKED_SKUS) {
    const rows = INVENTORY.filter(
      (i) => i.sku === sku && (!regionId || STORE_BY_ID[i.storeId]?.regionId === regionId),
    )
    const needy = rows.filter((i) => i.status === 'out_of_stock' && i.onOrder <= 0)
    const donors = rows
      .filter((i) => coverBand(i) === 'overstock')
      .sort((a, b) => b.onHand - a.onHand)
    for (const n of needy) {
      const donor =
        donors.find((d) => STORE_BY_ID[d.storeId]?.regionId === STORE_BY_ID[n.storeId]?.regionId) ??
        donors[0]
      if (donor && donor.storeId !== n.storeId) {
        out.push({ sku, fromStoreId: donor.storeId, toStoreId: n.storeId, fromOnHand: donor.onHand })
      }
    }
  }
  return out
}

// ── Signal-to-Shelf ───────────────────────────────────────────────────
// Connect a demand signal → cover → next delivery → the gap → the £ it costs.

export type DemandDriver = 'social' | 'promo' | 'heatwave' | 'competitor' | 'local'

export interface DemandSignal {
  driver: DemandDriver
  label: string
}

const DEMAND_BY_SKU: Record<string, DemandSignal> = {
  'GM-CONSOLE-BUNDLE': { driver: 'social', label: 'Viral on TikTok — PS5 × GTA VI unboxing at 2.1M views' },
  'GM-CONSOLE-X': { driver: 'social', label: 'Console demand riding the bundle buzz' },
  'GM-GAME-HERO': { driver: 'social', label: 'Attach demand from the console bundle' },
  'LA-AIRCON': { driver: 'heatwave', label: 'Heatwave — cooling searches up 41%' },
  'LA-FAN-TOWER': { driver: 'heatwave', label: 'Heatwave — fans selling through fast' },
  'TV-OLED-65': { driver: 'promo', label: 'New Season 4K TV event live' },
  'TV-LED-50': { driver: 'promo', label: 'New Season 4K TV event live' },
  'TV-SOUNDBAR': { driver: 'promo', label: 'Soundbar attach on the TV event' },
  'CM-LAPTOP-STUDENT': { driver: 'promo', label: 'Back to School bundle live' },
  'MB-PHONE-PRO': { driver: 'competitor', label: 'Competitor sold out nearby — demand shifting to us' },
}

/** Why demand is rising for a line — the "signal" half of Signal-to-Shelf. */
export function demandSignalFor(sku: string): DemandSignal {
  return DEMAND_BY_SKU[sku] ?? { driver: 'local', label: 'Local top-seller for this store' }
}

export interface StockoutForecast {
  item: InventoryItem
  product?: Product
  storeId: string
  sku: string
  onHand: number
  onOrder: number
  dailyVelocity: number
  daysToStockout: number
  nextDeliveryDays: number
  coming: boolean
  gapDays: number
  lostUnits: number
  valueAtRiskGBP: number
  signal: DemandSignal
}

// When nothing is on order, quantify a week of exposure rather than an open-ended gap.
const RISK_HORIZON_DAYS = 7

/** Predict when a line runs dry vs the next delivery, and price the gap. */
export function stockoutForecast(item: InventoryItem): StockoutForecast {
  const product = PRODUCT_BY_SKU[item.sku]
  const weekly = velocityOf(item.storeId, item.sku)
  const dailyVelocity = Math.max(0.1, Math.round((weekly / 7) * 10) / 10)
  const daysToStockout = item.onHand <= 0 ? 0 : Math.max(0, Math.round(item.onHand / dailyVelocity))
  const delivery = nextDeliveryDays(item.storeId)
  const coming = item.onOrder > 0
  const gapDays = coming
    ? Math.max(0, delivery - daysToStockout)
    : Math.max(0, Math.max(delivery, RISK_HORIZON_DAYS) - daysToStockout)
  const lostUnits = Math.max(0, Math.round(gapDays * dailyVelocity))
  const valueAtRiskGBP = Math.round(lostUnits * (product?.price ?? 0))
  return {
    item,
    product,
    storeId: item.storeId,
    sku: item.sku,
    onHand: item.onHand,
    onOrder: item.onOrder,
    dailyVelocity,
    daysToStockout,
    nextDeliveryDays: delivery,
    coming,
    gapDays,
    lostUnits,
    valueAtRiskGBP,
    signal: demandSignalFor(item.sku),
  }
}

/** Lines that will (or already) run dry before the next delivery — richest £-at-risk first. */
export function availabilityRisks(storeIds: string[], limit = 6): StockoutForecast[] {
  const set = new Set(storeIds)
  return INVENTORY.filter((i) => set.has(i.storeId))
    .map(stockoutForecast)
    .filter((f) => f.gapDays > 0 && f.valueAtRiskGBP > 0)
    .sort((a, b) => b.valueAtRiskGBP - a.valueAtRiskGBP)
    .slice(0, limit)
}

/** Total £ of sales at risk from availability gaps across the given stores. */
export function availabilityAtRiskGBP(storeIds: string[]): number {
  const set = new Set(storeIds)
  return INVENTORY.filter((i) => set.has(i.storeId))
    .map(stockoutForecast)
    .filter((f) => f.gapDays > 0)
    .reduce((sum, f) => sum + f.valueAtRiskGBP, 0)
}
