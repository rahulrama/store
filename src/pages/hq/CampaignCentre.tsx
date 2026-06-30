import { useParams } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { PROMO_BY_ID } from '@/data/promotions'
import { STORES, REGIONS } from '@/data/stores'
import { stockOf } from '@/data/inventory'
import { SIGNALS } from '@/data/signals'
import { SectionHeading, KpiStat } from '@/components/shared/Stat'
import { ExplainerBanner } from '@/components/help/ExplainerBanner'
import { LabelWithHelp, HelpTip } from '@/components/help/HelpTip'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { pct } from '@/lib/format'
import { Megaphone, CheckCircle2, Store as StoreIcon, TrendingUp, Percent } from 'lucide-react'

const CHECKS = ['Display built', 'Ticketed', 'Demo running', 'Stock available'] as const
type Check = (typeof CHECKS)[number]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000
  return h
}

function checkState(storeId: string, promoId: string, check: Check): boolean {
  // Display/demo fail where there is an underperforming/unverified promo signal.
  const hasPromoIssue = SIGNALS.some(
    (s) =>
      s.storeId === storeId &&
      s.promotionId === promoId &&
      (s.type === 'PromoUnderperforming' || s.type === 'DisplayUnverified'),
  )
  if ((check === 'Display built' || check === 'Demo running') && hasPromoIssue) return false
  if (check === 'Stock available') {
    const promo = PROMO_BY_ID[promoId]
    const sku = promo.productSkus[0]
    const inv = stockOf(storeId, sku)
    if (inv) return inv.status !== 'out_of_stock'
    return true
  }
  // Otherwise deterministic, mostly compliant.
  return hash(storeId + promoId + check) % 5 !== 0
}

function storeCompliance(storeId: string, promoId: string): number {
  const passed = CHECKS.filter((c) => checkState(storeId, promoId, c)).length
  return Math.round((passed / CHECKS.length) * 100)
}

export function CampaignCentre() {
  const { id } = useParams()
  const promo = PROMO_BY_ID[id ?? 'promo-console-bundle'] ?? PROMO_BY_ID['promo-console-bundle']

  const compliances = STORES.map((s) => storeCompliance(s.id, promo.id))
  const avgCompliance = Math.round(compliances.reduce((a, b) => a + b, 0) / compliances.length)
  const adoption = Math.round(
    (STORES.filter((s) => checkState(s.id, promo.id, 'Display built')).length / STORES.length) * 100,
  )
  const fullyCompliant = compliances.filter((c) => c === 100).length

  // Per-region target vs actual uplift (synthetic, deterministic).
  const liftData = REGIONS.map((r) => {
    const regionStores = STORES.filter((s) => s.regionId === r.id)
    const avg = Math.round(
      regionStores.reduce((sum, s) => sum + storeCompliance(s.id, promo.id), 0) / regionStores.length,
    )
    const target = Math.round(promo.targetUplift * 100)
    const actual = Math.round(target * (avg / 100))
    return { region: r.name, target, actual }
  })

  return (
    <div className="space-y-6">
      <SectionHeading title="Campaign Command Centre" description="Track promotional execution across the estate in real time." />

      <ExplainerBanner text="Track one promotion across every store: how many have built the display, how compliant the set-up is, and whether the sales uplift is hitting target — so you can fix underperformers fast." />

      {/* Campaign header */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="size-5 text-primary" />
              <h3 className="text-lg font-semibold">{promo.name}</h3>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{promo.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary">{promo.mechanic}</Badge>
            <span className="text-xs text-muted-foreground">
              {promo.startDate} → {promo.endDate}
            </span>
          </div>
        </div>
        <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
          <span className="font-medium text-primary">Execution standard: </span>
          {promo.executionNote}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiStat label="Stores live" value={STORES.length} icon={<StoreIcon className="size-4" />} />
        <KpiStat label={<LabelWithHelp helpId="compliance">Avg compliance</LabelWithHelp>} value={pct(avgCompliance)} tone={avgCompliance >= 80 ? 'success' : 'warning'} icon={<CheckCircle2 className="size-4" />} />
        <KpiStat label={<LabelWithHelp helpId="campaignAdoption">Display adoption</LabelWithHelp>} value={pct(adoption)} tone={adoption >= 80 ? 'success' : 'warning'} icon={<Percent className="size-4" />} />
        <KpiStat label="Fully compliant" value={`${fullyCompliant}/${STORES.length}`} icon={<TrendingUp className="size-4" />} />
      </div>

      {/* Heatmap */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Execution compliance heatmap</h3>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-border bg-muted px-3 py-2 text-left font-medium">Store</th>
                {CHECKS.map((c) => (
                  <th key={c} className="border border-border bg-muted px-3 py-2 text-center font-medium">
                    {c}
                  </th>
                ))}
                <th className="border border-border bg-muted px-3 py-2 text-center font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {STORES.map((store) => {
                const score = storeCompliance(store.id, promo.id)
                return (
                  <tr key={store.id}>
                    <td className="border border-border px-3 py-2">
                      <span className="font-medium">{store.name}</span>
                      <span className="ml-1 text-xs text-muted-foreground">#{store.code}</span>
                    </td>
                    {CHECKS.map((c) => {
                      const ok = checkState(store.id, promo.id, c)
                      return (
                        <td key={c} className="border border-border px-3 py-2 text-center">
                          <span
                            className={cn(
                              'inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold',
                              ok ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger',
                            )}
                          >
                            {ok ? '✓' : '✕'}
                          </span>
                        </td>
                      )
                    })}
                    <td
                      className={cn(
                        'border border-border px-3 py-2 text-center font-semibold tabular-nums',
                        score === 100 ? 'text-success' : score >= 75 ? 'text-warning' : 'text-danger',
                      )}
                    >
                      {score}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales lift */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-1 text-sm font-semibold">
          Sales uplift vs target by region (%) <HelpTip id="salesLift" />
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={liftData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="region" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="target" name="Target uplift" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual uplift" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
