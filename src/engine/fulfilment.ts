import type { InventoryItem } from '@/types'
import { storesWithStock } from '@/engine/stock'
import { distanceMiles } from '@/data/stores'
import { PRODUCT_BY_SKU } from '@/data/products'

export type FulfilmentType = 'reserve-collect' | 'store-transfer' | 'same-day-courier' | 'ship-from-store'

export interface FulfilmentOption {
  type: FulfilmentType
  label: string
  sourceStoreId: string
  distanceMiles: number
  etaLabel: string
  priceGBP: number
  stockLeft: number
}

/** Stores holding the SKU, nearest to `fromStoreId` first. */
export function nearestWithStock(sku: string, fromStoreId: string): InventoryItem[] {
  return storesWithStock(sku, fromStoreId).sort(
    (a, b) => distanceMiles(fromStoreId, a.storeId) - distanceMiles(fromStoreId, b.storeId),
  )
}

const SAME_DAY_RADIUS_MILES = 45

function shipEta(miles: number): string {
  if (miles <= 60) return 'Next day'
  if (miles <= 150) return '2 days'
  return '2–3 days'
}

function courierPrice(miles: number): number {
  return Math.min(19.99, Math.round((4.99 + miles * 0.12) * 100) / 100)
}

/** Ranked ways to get an out-of-stock line to the customer, sourced from other stores. */
export function fulfilmentOptions(sku: string, fromStoreId: string): FulfilmentOption[] {
  const sources = nearestWithStock(sku, fromStoreId)
  if (sources.length === 0) return []
  const nearest = sources[0]
  const miles = distanceMiles(fromStoreId, nearest.storeId)
  const options: FulfilmentOption[] = []

  // Reserve & collect at the nearest store holding stock
  options.push({
    type: 'reserve-collect',
    label: 'Reserve & collect nearby',
    sourceStoreId: nearest.storeId,
    distanceMiles: miles,
    etaLabel: 'Ready in 1 hour',
    priceGBP: 0,
    stockLeft: nearest.onHand,
  })

  // Same-day courier from the nearest store (only within radius)
  if (miles <= SAME_DAY_RADIUS_MILES) {
    options.push({
      type: 'same-day-courier',
      label: 'Same-day courier to home',
      sourceStoreId: nearest.storeId,
      distanceMiles: miles,
      etaLabel: 'By 8pm today',
      priceGBP: courierPrice(miles),
      stockLeft: nearest.onHand,
    })
  }

  // Ship from store direct to the customer's home
  options.push({
    type: 'ship-from-store',
    label: 'Ship from store to home',
    sourceStoreId: nearest.storeId,
    distanceMiles: miles,
    etaLabel: shipEta(miles),
    priceGBP: miles <= 60 ? 0 : 3.99,
    stockLeft: nearest.onHand,
  })

  // Store-to-store transfer so the customer collects here
  options.push({
    type: 'store-transfer',
    label: 'Transfer to this store',
    sourceStoreId: nearest.storeId,
    distanceMiles: miles,
    etaLabel: 'Here tomorrow',
    priceGBP: 0,
    stockLeft: nearest.onHand,
  })

  return options
}

/** £ value recovered by fulfilling an out-of-stock line from another store. */
export function savedSaleValue(sku: string): number {
  return PRODUCT_BY_SKU[sku]?.price ?? 0
}
