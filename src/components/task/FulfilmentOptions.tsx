import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { STORE_BY_ID } from '@/data/stores'
import { fulfilmentOptions, type FulfilmentType, type FulfilmentOption } from '@/engine/fulfilment'
import { gbp } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Truck, PackageCheck, ArrowLeftRight, MapPin, CheckCircle2 } from 'lucide-react'

const ICON: Record<FulfilmentType, typeof Truck> = {
  'reserve-collect': PackageCheck,
  'same-day-courier': Truck,
  'ship-from-store': MapPin,
  'store-transfer': ArrowLeftRight,
}

/**
 * "Get it to the customer" panel — shown on the Assist page when a matched
 * product is out of stock (or running low) at the current store. Choosing an
 * option adds it to the SAME clienteling basket as a delivery/collect line and
 * logs a recovered sale, so the whole order completes in one place.
 */
export function FulfilmentOptions({
  sku,
  productName,
  productPrice,
  fromStoreId,
  lowHere,
  onAddToBasket,
}: {
  sku: string
  productName: string
  productPrice: number
  fromStoreId: string
  lowHere?: boolean
  onAddToBasket: (line: { key: string; name: string; price: number }) => void
}) {
  const addFulfilment = useAppStore((s) => s.addFulfilment)
  const [chosen, setChosen] = useState<FulfilmentOption | null>(null)
  const options = fulfilmentOptions(sku, fromStoreId)

  if (options.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-muted-foreground">
        No stock at other stores right now — offer a home-delivery order or a suitable alternative.
      </div>
    )
  }

  const nearest = STORE_BY_ID[options[0].sourceStoreId]

  function choose(o: FulfilmentOption) {
    addFulfilment({ sku, fromStoreId, sourceStoreId: o.sourceStoreId, type: o.type, valueGBP: productPrice })
    onAddToBasket({
      key: `fulfil-${sku}-${o.type}`,
      name: `${productName} — ${o.label} (from ${STORE_BY_ID[o.sourceStoreId].name})`,
      price: productPrice + o.priceGBP,
    })
    setChosen(o)
  }

  return (
    <div
      className={cn(
        'mt-3 rounded-lg border p-3',
        lowHere ? 'border-warning/30 bg-warning/5' : 'border-primary/20 bg-primary/5',
      )}
    >
      <div
        className={cn('flex items-center gap-2 text-sm font-medium', lowHere ? 'text-warning' : 'text-primary')}
      >
        <Truck className="size-4" />{' '}
        {lowHere ? 'Running low here — fulfil from another store' : 'Not here — get it to the customer'}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        In stock at {nearest.name} ({options[0].distanceMiles} mi). Add the customer's preferred option to the sale.
      </p>
      <div className="mt-2 space-y-1.5">
        {options.map((o) => {
          const Icon = ICON[o.type]
          const src = STORE_BY_ID[o.sourceStoreId]
          const isChosen = chosen?.type === o.type
          return (
            <div
              key={o.type}
              className={cn(
                'flex items-center justify-between gap-2 rounded-md border px-2.5 py-2',
                isChosen ? 'border-success/40 bg-success/5' : 'border-border bg-card',
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.etaLabel} · {src.name} · {o.stockLeft} left
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-semibold">{o.priceGBP > 0 ? gbp(o.priceGBP) : 'Free'}</span>
                <button
                  type="button"
                  disabled={!!chosen}
                  onClick={() => choose(o)}
                  className={cn(
                    'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                    chosen
                      ? 'border-border text-muted-foreground'
                      : 'border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                >
                  {isChosen ? 'Added' : 'Add to sale'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {chosen && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-success">
          <CheckCircle2 className="size-3.5" /> Added to the sale — {gbp(productPrice + chosen.priceGBP)} incl.{' '}
          {chosen.priceGBP > 0 ? `${gbp(chosen.priceGBP)} delivery` : 'free delivery'}. Complete it in the basket.
        </div>
      )}
    </div>
  )
}
