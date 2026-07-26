import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { recommendProducts } from '@/copilot/recommend'
import { FulfilmentOptions } from '@/components/task/FulfilmentOptions'
import type { FulfilmentType } from '@/engine/fulfilment'
import { STORE_BY_ID, USER_BY_ID } from '@/data/stores'
import { stockOf, ONLINE_DEAL_BY_SKU, CLICK_COLLECT_ORDERS } from '@/data/inventory'
import { PRODUCT_BY_SKU } from '@/data/products'
import type { Product, AssistedChannel } from '@/types'
import { SectionHeading } from '@/components/shared/Stat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { gbp, relativeToNow } from '@/lib/format'
import { Send, Package, ShieldCheck, Sparkles, ShoppingBag, Plus, Trash2, X, TrendingUp, Tag, Globe, PackageCheck, Handshake, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

const EXAMPLES = [
  'Laptop for a student doing video editing, around £700',
  'A big TV for the new football season',
  'First gaming setup as a birthday gift',
  'Something to keep cool in the heatwave',
  'A phone with a great camera, trade-in my old one',
]

interface BasketLine {
  key: string
  name: string
  price: number
  fulfil?: { sku: string; sourceStoreId: string; type: FulfilmentType; valueGBP: number }
  assist?: { sku: string; channel: AssistedChannel; valueGBP: number }
}

/** Map a store-to-store fulfilment to the omnichannel channel it credits the colleague for. */
const FULFIL_CHANNEL: Record<FulfilmentType, AssistedChannel> = {
  'reserve-collect': 'reserved-nearby',
  'store-transfer': 'in-store',
  'same-day-courier': 'ordered-online',
  'ship-from-store': 'ordered-online',
}

export function Assist() {
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const fulfilments = useAppStore((s) => s.fulfilments)
  const addFulfilment = useAppStore((s) => s.addFulfilment)
  const assistedSales = useAppStore((s) => s.assistedSales)
  const logAssistedSale = useAppStore((s) => s.logAssistedSale)
  const store = STORE_BY_ID[activeStoreId]
  const me = USER_BY_ID[currentUserId]?.name ?? 'You'
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [basket, setBasket] = useState<BasketLine[]>([])

  // Allow the tour / deep links to drive a query via ?q=
  useEffect(() => {
    const q = params.get('q')
    if (q && q !== submitted) {
      setQuery(q)
      setSubmitted(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const result = useMemo(
    () => (submitted ? recommendProducts(submitted, activeStoreId) : undefined),
    [submitted, activeStoreId],
  )

  function runSearch(q: string) {
    setSubmitted(q)
    setParams(q ? { q } : {}, { replace: true })
  }

  function addToBasket(line: BasketLine) {
    setBasket((b) => (b.some((x) => x.key === line.key) ? b : [...b, line]))
    toast.success('Added to basket', { description: line.name })
  }

  function addProduct(p: Product) {
    addToBasket({ key: p.id, name: p.name, price: p.price })
  }

  const total = basket.reduce((sum, l) => sum + l.price, 0)
  const recovered = fulfilments
    .filter((f) => f.fromStoreId === activeStoreId)
    .reduce((acc, f) => ({ count: acc.count + 1, sum: acc.sum + f.valueGBP }), { count: 0, sum: 0 })
  const assisted = assistedSales
    .filter((a) => a.storeId === activeStoreId)
    .reduce((acc, a) => ({ count: acc.count + 1, sum: acc.sum + a.valueGBP }), { count: 0, sum: 0 })

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Customer Assist — Copilot clienteling"
        description="Turn what a customer asks into in-stock matches, with attach and care-plan prompts."
      />

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" /> The same Copilot that runs your day also helps you sell.
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            runSearch(query)
          }}
          className="mt-3 flex gap-2"
        >
          <Input
            placeholder="Describe what the customer is looking for…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-card"
          />
          <Button type="submit" className="gap-1.5">
            <Send className="size-4" /> Find
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuery(ex)
                runSearch(ex)
              }}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {recovered.count > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm">
          <TrendingUp className="size-4 text-success" />
          <span className="font-medium text-success">
            Recovered sales today: {recovered.count} · {gbp(recovered.sum)}
          </span>
          <span className="text-xs text-muted-foreground">from out-of-stock rescues sourced from other stores</span>
        </div>
      )}

      {assisted.count > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <Handshake className="size-4 text-primary" />
          <span className="font-medium text-primary">
            Assisted sales today: {assisted.count} · {gbp(assisted.sum)}
          </span>
          <span className="text-xs text-muted-foreground">omnichannel sales credited to the team — counted all the way to region &amp; HQ</span>
        </div>
      )}

      {!result && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
          <ShoppingBag className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Ask in plain English</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            The Copilot matches against {store.name}'s live stock and suggests the right add-ons.
          </p>
        </div>
      )}

      {result && (
        <div className="grid gap-4 lg:grid-cols-3" data-tour="assist-results">
          {/* Matches */}
          <div className="space-y-3 lg:col-span-2">
            <h3 className="text-sm font-semibold">
              Recommended for “{result.query}”
              {result.budget && <span className="text-muted-foreground"> · ~{gbp(result.budget)} budget</span>}
            </h3>
            {result.matches.length === 0 && (
              <p className="text-sm text-muted-foreground">No close matches — try rephrasing the need.</p>
            )}
            {result.matches.map((m, i) => (
              <div key={m.product.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {i === 0 && <Badge className="bg-primary text-primary-foreground">Best match</Badge>}
                      <h4 className="text-base font-semibold">{m.product.name}</h4>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{m.product.blurb}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(m.inStock ? 'border-success/30 text-success' : 'border-danger/30 text-danger')}
                      >
                        <Package className="mr-1 size-3" />
                        {m.inStock ? 'In stock here' : 'Out of stock'}
                      </Badge>
                      {m.reasons.map((r) => (
                        <span key={r} className="text-xs text-muted-foreground">· {r}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-lg font-semibold">{gbp(m.product.price)}</span>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => addProduct(m.product)}>
                      <Plus className="size-4" /> Add
                    </Button>
                  </div>
                </div>
                {(() => {
                  const inv = stockOf(activeStoreId, m.product.sku)
                  const low = inv?.status === 'low'
                  if (m.inStock && !low) return null
                  const prefix = `fulfil:${m.product.sku}:`
                  const chosenLine = basket.find((l) => l.key.startsWith(prefix))
                  const chosenType = chosenLine ? (chosenLine.key.slice(prefix.length) as FulfilmentType) : undefined
                  return (
                    <FulfilmentOptions
                      sku={m.product.sku}
                      productName={m.product.name}
                      productPrice={m.product.price}
                      fromStoreId={activeStoreId}
                      lowHere={m.inStock && low}
                      chosenType={chosenType}
                      onAddToBasket={addToBasket}
                    />
                  )
                })()}
                {(() => {
                  const deal = ONLINE_DEAL_BY_SKU[m.product.sku]
                  if (!deal) return null
                  const inBasket = basket.some((l) => l.key === `assist:${m.product.sku}`)
                  const isMatch = deal.onlinePriceGBP != null
                  return (
                    <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        {isMatch ? <Tag className="size-4" /> : <Globe className="size-4" />}
                        {isMatch ? 'Found it cheaper online?' : 'Online-only deal'}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {isMatch ? (
                          <>
                            Online <span className="font-medium text-danger">{gbp(deal.onlinePriceGBP!)}</span> — Price Promise: match it and keep the sale here.
                          </>
                        ) : (
                          deal.onlineOnlyDeal
                        )}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 gap-1.5"
                        disabled={inBasket}
                        onClick={() =>
                          addToBasket({
                            key: `assist:${m.product.sku}`,
                            name: isMatch ? `${m.product.name} — Price Promise match` : `${m.product.name} — ordered online`,
                            price: isMatch ? deal.onlinePriceGBP! : m.product.price,
                            assist: {
                              sku: m.product.sku,
                              channel: isMatch ? 'price-match' : 'ordered-online',
                              valueGBP: isMatch ? deal.onlinePriceGBP! : m.product.price,
                            },
                          })
                        }
                      >
                        {isMatch ? (
                          <>
                            <Tag className="size-3.5" /> Match &amp; sell here
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="size-3.5" /> Order online for them
                          </>
                        )}
                      </Button>
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>

          {/* Attach + basket */}
          <div className="space-y-3">
            {result.attach.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Attach to grow the basket
                </p>
                <div className="mt-2 space-y-1.5">
                  {result.attach.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate">{a.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{gbp(a.price)}</span>
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => addProduct(a)}>
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.carePlanFor && (
              <button
                type="button"
                onClick={() =>
                  addToBasket({
                    key: `care-${result.carePlanFor!.id}`,
                    name: `Care plan — ${result.carePlanFor!.name}`,
                    price: Math.max(39, Math.round((result.carePlanFor!.price * 0.12) / 5) * 5),
                  })
                }
                className="block w-full rounded-lg border border-primary/20 bg-primary/5 p-4 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <ShieldCheck className="size-4" /> Add a care &amp; protection plan
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Peace of mind on the {result.carePlanFor.name} — accidental damage &amp; breakdown cover.
                </p>
              </button>
            )}

            {/* Basket */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Basket</p>
                <ShoppingBag className="size-4 text-muted-foreground" />
              </div>
              {basket.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Add the recommendation and attach items to build the sale.</p>
              ) : (
                <>
                  <div className="mt-2 space-y-1.5">
                    {basket.map((l) => (
                      <div key={l.key} className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate">{l.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{gbp(l.price)}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-6 text-muted-foreground"
                            onClick={() => setBasket((b) => b.filter((x) => x.key !== l.key))}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-lg font-bold">{gbp(total)}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        const ref = 'S' + Math.floor(100000 + Math.random() * 900000)
                        const deliveries = basket.filter((l) => l.fulfil)
                        deliveries.forEach(
                          (l) => l.fulfil && addFulfilment({ ...l.fulfil, fromStoreId: activeStoreId }),
                        )
                        // Credit the colleague for every omnichannel assist (price match / order online / reserved nearby / transfer).
                        deliveries.forEach(
                          (l) =>
                            l.fulfil &&
                            logAssistedSale({ storeId: activeStoreId, colleagueName: me, sku: l.fulfil.sku, channel: FULFIL_CHANNEL[l.fulfil.type], valueGBP: l.fulfil.valueGBP }),
                        )
                        basket
                          .filter((l) => l.assist)
                          .forEach(
                            (l) =>
                              l.assist &&
                              logAssistedSale({ storeId: activeStoreId, colleagueName: me, sku: l.assist.sku, channel: l.assist.channel, valueGBP: l.assist.valueGBP }),
                          )
                        const assists = deliveries.length + basket.filter((l) => l.assist).length
                        toast.success('Sale completed', {
                          description: `${basket.length} items · ${gbp(total)} · ref ${ref}${assists ? ` · ${assists} assist${assists === 1 ? '' : 's'} credited to ${me.split(' ')[0]}` : ''}`,
                        })
                        setBasket([])
                      }}
                    >
                      Complete sale
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setBasket([])} title="Clear basket">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click & Collect — online orders coming in for pickup */}
      <ClickCollectBoard storeId={activeStoreId} />
    </div>
  )
}

/** Online Click & Collect orders routed to this store for pickup today. */
function ClickCollectBoard({ storeId }: { storeId: string }) {
  const [collected, setCollected] = useState<Record<string, boolean>>({})
  const orders = CLICK_COLLECT_ORDERS.filter((o) => o.storeId === storeId)
  if (orders.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <PackageCheck className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Click &amp; Collect — today&rsquo;s pickups</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Online orders routed here for collection, each on the Fast Track promise clock.</p>
      <div className="mt-3 space-y-2">
        {orders.map((o) => {
          const p = PRODUCT_BY_SKU[o.sku]
          const isCollected = collected[o.id] || o.status === 'collected'
          const overdue = !isCollected && new Date(o.dueAt).getTime() < Date.now()
          const label = isCollected ? 'Collected' : o.status === 'preparing' ? 'Preparing' : 'Ready to collect'
          const cls = isCollected
            ? 'border-border bg-muted text-muted-foreground'
            : o.status === 'preparing'
              ? 'border-warning/30 bg-warning/10 text-warning'
              : 'border-success/30 bg-success/10 text-success'
          return (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/40 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {p?.name ?? o.sku} <span className="text-muted-foreground">· {o.ref}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {o.customer} · {gbp(o.valueGBP)} ·{' '}
                  <span className={cn(overdue && 'font-medium text-danger')}>{overdue ? 'past Fast Track' : `collect ${relativeToNow(o.dueAt)}`}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium', cls)}>{label}</span>
                {!isCollected && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      setCollected((m) => ({ ...m, [o.id]: true }))
                      toast.success('Marked collected', { description: `${o.ref} handed to ${o.customer}` })
                    }}
                  >
                    <PackageCheck className="size-3.5" /> Collected
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
