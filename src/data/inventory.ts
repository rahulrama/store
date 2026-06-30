import type { InventoryItem, StockStatus } from '@/types'
import { STORES } from '@/data/stores'

// SKUs we actively track on the shop floor for the demo (promo + hero lines).
const TRACKED_SKUS = [
  'GM-CONSOLE-BUNDLE',
  'GM-CONSOLE-X',
  'GM-GAME-HERO',
  'GM-CONTROLLER',
  'GM-HEADSET',
  'TV-OLED-65',
  'TV-LED-50',
  'TV-SOUNDBAR',
  'CM-LAPTOP-CREATOR',
  'CM-LAPTOP-STUDENT',
  'MB-PHONE-PRO',
  'LA-FAN-TOWER',
  'LA-AIRCON',
]

// Deterministic pseudo-random so the estate looks varied but is stable per build.
function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000
  return h
}

function baseOnHand(storeId: string, sku: string): number {
  return 4 + (hash(storeId + sku) % 18)
}

function statusFor(onHand: number, onOrder: number): StockStatus {
  if (onHand <= 0) return 'out_of_stock'
  if (onHand <= 3) return 'low'
  void onOrder
  return 'in_stock'
}

// Scenario overrides drive the signals/exceptions in the talk track.
type Override = { onHand: number; onOrder: number }
const OVERRIDES: Record<string, Override> = {
  // Store 301 London Leyton Mills: console bundle SOLD OUT with NONE on order →
  // replenishment task auto-escalates to the Stock team.
  's-301:GM-CONSOLE-BUNDLE': { onHand: 0, onOrder: 0 },
  // Store 214 Manchester: heatwave cooling lines running low.
  's-214:LA-FAN-TOWER': { onHand: 2, onOrder: 20 },
  's-214:LA-AIRCON': { onHand: 1, onOrder: 6 },
  // Store 214: plenty of console bundles to sell (display is the issue, not stock).
  's-214:GM-CONSOLE-BUNDLE': { onHand: 14, onOrder: 0 },
  // Store 126 Liverpool: 65" OLED out of stock but replenishment inbound.
  's-126:TV-OLED-65': { onHand: 0, onOrder: 4 },
  // Store 309 Reading: portable AC sold out, none on order.
  's-309:LA-AIRCON': { onHand: 0, onOrder: 0 },
}

function buildInventory(): InventoryItem[] {
  const items: InventoryItem[] = []
  for (const store of STORES) {
    for (const sku of TRACKED_SKUS) {
      const key = `${store.id}:${sku}`
      const override = OVERRIDES[key]
      const onHand = override ? override.onHand : baseOnHand(store.id, sku)
      const onOrder = override ? override.onOrder : hash(key) % 3 === 0 ? 8 : 0
      items.push({ storeId: store.id, sku, onHand, onOrder, status: statusFor(onHand, onOrder) })
    }
  }
  return items
}

export const INVENTORY: InventoryItem[] = buildInventory()

export function inventoryForStore(storeId: string): InventoryItem[] {
  return INVENTORY.filter((i) => i.storeId === storeId)
}

export function stockOf(storeId: string, sku: string): InventoryItem | undefined {
  return INVENTORY.find((i) => i.storeId === storeId && i.sku === sku)
}
