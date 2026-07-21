import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { InventoryItem } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { INVENTORY, inventoryForStore } from '@/data/inventory'
import { PRODUCT_BY_SKU } from '@/data/products'
import { STORE_BY_ID, STORES, REGION_BY_ID, USER_BY_ID, storesInRegion } from '@/data/stores'
import {
  itemsForStores,
  stockSummary,
  weeksOfSupply,
  storesWithStock,
  rebalanceSuggestions,
  availabilityRisks,
  type StockSummary,
  type RebalanceSuggestion,
  type DemandDriver,
} from '@/engine/stock'
import { StockMatrix } from '@/components/estate/StockMatrix'
import { SectionHeading, KpiStat } from '@/components/shared/Stat'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExplainerBanner } from '@/components/help/ExplainerBanner'
import { LabelWithHelp } from '@/components/help/HelpTip'
import { cn } from '@/lib/utils'
import { gbp } from '@/lib/format'
import { toast } from 'sonner'
import { Boxes, TriangleAlert, PackageX, PackageCheck, ArrowLeftRight, MapPin, Zap, Radio } from 'lucide-react'

const STATUS_RANK: Record<InventoryItem['status'], number> = { out_of_stock: 0, low: 1, in_stock: 2 }

function byRisk(a: InventoryItem, b: InventoryItem): number {
  return STATUS_RANK[a.status] - STATUS_RANK[b.status] || weeksOfSupply(a) - weeksOfSupply(b)
}

function StockPill({ status }: { status: InventoryItem['status'] }) {
  const map = {
    out_of_stock: { label: 'Out of stock', cls: 'border-danger/30 bg-danger/10 text-danger' },
    low: { label: 'Low', cls: 'border-warning/30 bg-warning/10 text-warning' },
    in_stock: { label: 'In stock', cls: 'border-success/30 bg-success/10 text-success' },
  }[status]
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', map.cls)}>
      {map.label}
    </span>
  )
}

function SummaryTiles({ summary }: { summary: StockSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiStat label="In stock" value={summary.inStock} tone="success" icon={<PackageCheck className="size-4" />} />
      <KpiStat label="Low" value={summary.low} tone="warning" icon={<TriangleAlert className="size-4" />} />
      <KpiStat label="Out of stock" value={summary.outOfStock} tone={summary.outOfStock ? 'danger' : 'success'} icon={<PackageX className="size-4" />} />
      <KpiStat label={<LabelWithHelp helpId="soldOutNoneOnOrder">Sold out · none on order</LabelWithHelp>} value={summary.soldOutNoneOnOrder} tone={summary.soldOutNoneOnOrder ? 'danger' : 'success'} icon={<TriangleAlert className="size-4" />} />
    </div>
  )
}

function RebalanceList({ suggestions }: { suggestions: RebalanceSuggestion[] }) {
  if (!suggestions.length) return null
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <ArrowLeftRight className="size-4 text-primary" />
        <h3 className="text-sm font-semibold"><LabelWithHelp helpId="stockRebalance">Suggested stock rebalances</LabelWithHelp></h3>
        <span className="ml-auto text-xs text-muted-foreground">{suggestions.length}</span>
      </div>
      <div className="divide-y divide-border">
        {suggestions.map((s, i) => {
          const p = PRODUCT_BY_SKU[s.sku]
          const from = STORE_BY_ID[s.fromStoreId]
          const to = STORE_BY_ID[s.toStoreId]
          return (
            <div key={`${s.sku}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p?.name ?? s.sku}</p>
                <p className="text-xs text-muted-foreground">
                  {from.name} (surplus {s.fromOnHand}) → {to.name} (out of stock)
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  toast.success('Transfer requested', {
                    description: `${p?.name ?? s.sku}: ${from.name} → ${to.name}`,
                  })
                }
                className="shrink-0 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted"
              >
                Raise transfer
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const DRIVER_META: Record<DemandDriver, { label: string; cls: string }> = {
  social: { label: 'Social', cls: 'border-primary/30 bg-primary/10 text-primary' },
  promo: { label: 'Promo', cls: 'border-primary/30 bg-primary/10 text-primary' },
  heatwave: { label: 'Heatwave', cls: 'border-warning/30 bg-warning/10 text-warning' },
  competitor: { label: 'Competitor', cls: 'border-danger/30 bg-danger/10 text-danger' },
  local: { label: 'Local', cls: 'border-border bg-muted text-muted-foreground' },
}

/** Signal-to-Shelf: demand signal → cover → next delivery → the gap → £ at risk → action. */
function SignalToShelf({ storeIds, showStore = false }: { storeIds: string[]; showStore?: boolean }) {
  const risks = availabilityRisks(storeIds)
  const [actioned, setActioned] = useState<Record<string, boolean>>({})
  const [chosen, setChosen] = useState<Record<string, string>>({})
  if (risks.length === 0) return null
  const total = risks.reduce((s, r) => s + r.valueAtRiskGBP, 0)
  return (
    <div className="rounded-lg border border-border bg-card" data-tour="signal-to-shelf">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <Zap className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">
          <LabelWithHelp helpId="signalToShelf">Signal-to-Shelf</LabelWithHelp>
        </h3>
        <span className="ml-auto rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
          {gbp(total, { compact: true })} sales at risk
        </span>
      </div>
      <div className="divide-y divide-border">
        {risks.map((r) => {
          const key = `${r.storeId}:${r.sku}`
          const raised = actioned[key]
          const meta = DRIVER_META[r.signal.driver]
          // A transfer needs a donor store that already holds the line; otherwise it's a PO.
          // The user picks which store to pull from — defaulting to the one best placed to spare it.
          const donors = r.coming ? storesWithStock(r.sku, r.storeId).slice(0, 5) : []
          const donorId = chosen[key] ?? donors[0]?.storeId
          const donor = donorId ? STORE_BY_ID[donorId] : undefined
          return (
            <div key={key} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium">{r.product?.name ?? r.sku}</span>
                    <span className={cn('shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium', meta.cls)}>{meta.label}</span>
                    {showStore && <span className="shrink-0 text-xs text-muted-foreground">{STORE_BY_ID[r.storeId]?.name}</span>}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Radio className="size-3 shrink-0" /> {r.signal.label}
                  </p>
                  <p className="mt-1 text-xs text-foreground/80">
                    {r.onHand <= 0 ? 'Out now' : `${r.daysToStockout}d cover`} · next delivery in {r.nextDeliveryDays}d ·{' '}
                    <span className="font-medium text-danger">{r.gapDays}-day gap</span>
                    {!r.coming && <span className="text-danger"> · nothing on order</span>}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold tabular-nums text-danger">{gbp(r.valueAtRiskGBP, { compact: true })}</div>
                  <div className="text-[10px] text-muted-foreground">at risk</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {raised ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">
                    <PackageCheck className="size-3" />
                    {donor
                      ? `Transfer raised · from ${donor.name} · ETA ${r.nextDeliveryDays}d`
                      : `PO raised · ETA ${r.nextDeliveryDays}d`}
                  </span>
                ) : donor ? (
                  <>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      from
                      <select
                        value={donorId}
                        onChange={(e) => setChosen((c) => ({ ...c, [key]: e.target.value }))}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground"
                      >
                        {donors.map((d) => (
                          <option key={d.storeId} value={d.storeId}>
                            {STORE_BY_ID[d.storeId]?.name} · {d.onHand} in stock
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActioned((a) => ({ ...a, [key]: true }))
                        toast.success('Transfer raised', {
                          description: `${r.product?.name ?? r.sku} · from ${donor.name} → ${STORE_BY_ID[r.storeId]?.name}`,
                        })
                      }}
                      className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Raise transfer
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActioned((a) => ({ ...a, [key]: true }))
                      toast.success('PO raised', {
                        description: `${r.product?.name ?? r.sku} · ${STORE_BY_ID[r.storeId]?.name}`,
                      })
                    }}
                    className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Raise PO
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StoreStock({ storeId }: { storeId: string }) {
  const navigate = useNavigate()
  const store = STORE_BY_ID[storeId]
  const items = inventoryForStore(storeId).slice().sort(byRisk)
  const summary = stockSummary(items)
  return (
    <div className="space-y-5">
      <SectionHeading title="Stock" description={`${store.name} · ${items.length} tracked lines`} />
      <ExplainerBanner text="Your live shop-floor stock for the hero and promo lines. Out-of-stock and low lines come first, with weeks of supply and whether the line is held at other stores." />
      <SummaryTiles summary={summary} />
      <SignalToShelf storeIds={[storeId]} />
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">On hand</TableHead>
              <TableHead className="text-right">On order</TableHead>
              <TableHead className="text-right"><LabelWithHelp helpId="weeksOfSupply">Weeks of supply</LabelWithHelp></TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Elsewhere</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const p = PRODUCT_BY_SKU[item.sku]
              const elsewhere = item.status === 'in_stock' ? [] : storesWithStock(item.sku, storeId)
              return (
                <TableRow key={item.sku}>
                  <TableCell>
                    <div className="text-sm font-medium">{p?.name ?? item.sku}</div>
                    <div className="text-xs text-muted-foreground">{p?.category}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{item.onHand}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{item.onOrder || '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.onHand > 0 ? weeksOfSupply(item) : '0'}</TableCell>
                  <TableCell>
                    <StockPill status={item.status} />
                  </TableCell>
                  <TableCell>
                    {elsewhere.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/store/assist?q=${encodeURIComponent(p?.name ?? '')}`)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <MapPin className="size-3" /> Find at {elsewhere.length} store{elsewhere.length > 1 ? 's' : ''}
                      </button>
                    ) : item.status === 'in_stock' ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <span className="text-xs text-danger">None nearby</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function RegionStock({ regionId }: { regionId: string }) {
  const region = REGION_BY_ID[regionId]
  const stores = storesInRegion(regionId)
  const ids = stores.map((s) => s.id)
  const items = itemsForStores(ids)
  const summary = stockSummary(items)
  const rebalances = rebalanceSuggestions(regionId)
  return (
    <div className="space-y-5">
      <SectionHeading title="Stock" description={`${region.name} region · ${stores.length} stores`} />
      <ExplainerBanner text="Stock across your region at a glance. Each cell is a store's on-hand for that line — red is out of stock, amber is low. Rebalance suggestions move surplus to stores that have sold out." />
      <SummaryTiles summary={summary} />
      <SignalToShelf storeIds={ids} showStore />
      <div>
        <h3 className="mb-2 text-sm font-semibold">Stock by store</h3>
        <StockMatrix storeIds={ids} />
      </div>
      <RebalanceList suggestions={rebalances} />
    </div>
  )
}

function EstateStock() {
  const summary = stockSummary(INVENTORY)
  const ids = STORES.map((s) => s.id)
  const rebalances = rebalanceSuggestions()
  return (
    <div className="space-y-5">
      <SectionHeading title="Estate stock" description={`${STORES.length} stores · ${summary.totalLines} tracked lines`} />
      <ExplainerBanner text="Estate-wide stock health across every store. Watch the 'sold out — none on order' count: these are live sales at risk until a replenishment or transfer is raised." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiStat label="Out-of-stock rate" value={`${summary.oosRatePct}%`} tone={summary.oosRatePct >= 8 ? 'danger' : 'warning'} icon={<PackageX className="size-4" />} />
        <KpiStat label={<LabelWithHelp helpId="soldOutNoneOnOrder">Sold out · none on order</LabelWithHelp>} value={summary.soldOutNoneOnOrder} tone={summary.soldOutNoneOnOrder ? 'danger' : 'success'} icon={<TriangleAlert className="size-4" />} />
        <KpiStat label="Low lines" value={summary.low} tone="warning" icon={<TriangleAlert className="size-4" />} />
        <KpiStat label="Units on hand" value={summary.unitsOnHand} icon={<Boxes className="size-4" />} />
      </div>
      <SignalToShelf storeIds={ids} showStore />
      <div>
        <h3 className="mb-2 text-sm font-semibold">Stock by store</h3>
        <StockMatrix storeIds={ids} />
      </div>
      <RebalanceList suggestions={rebalances} />
    </div>
  )
}

export function StockView() {
  const role = useAppStore((s) => s.role)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const activeStoreId = useAppStore((s) => s.activeStoreId)

  if (role === 'Store') return <StoreStock storeId={activeStoreId} />
  if (role === 'Regional') {
    const regionId = USER_BY_ID[currentUserId]?.regionId ?? 'r-north'
    return <RegionStock regionId={regionId} />
  }
  return <EstateStock />
}
