import type { InventoryItem, Product } from '@/types'
import { INVENTORY, TRACKED_SKUS, velocityOf } from '@/data/inventory'
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
