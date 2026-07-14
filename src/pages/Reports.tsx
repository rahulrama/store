import { useState, type ReactNode } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { STORE_BY_ID, STORES, REGIONS, REGION_BY_ID, USER_BY_ID, storesInRegion } from '@/data/stores'
import {
  kpiRollup,
  recoveredForStores,
  trendTo,
  scorecardNarrative,
  type TrendPoint,
} from '@/engine/reporting'
import { stockSummary, itemsForStores } from '@/engine/stock'
import { sentimentScore, topIssues } from '@/engine/voiceOfCustomer'
import { completionRate, openExceptions, overdueTasks } from '@/store/selectors'
import { DEMO_NOW } from '@/data/now'
import { SectionHeading, KpiStat, ScoreRing } from '@/components/shared/Stat'
import { StoreLeagueTable } from '@/components/estate/StoreLeagueTable'
import { ExplainerBanner } from '@/components/help/ExplainerBanner'
import { Button } from '@/components/ui/button'
import { gbp } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Sparkles,
  Printer,
  Copy,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  PackageX,
  MessageSquare,
  PoundSterling,
} from 'lucide-react'

function Cell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function TrendBars({ data, tone = 'primary' }: { data: TrendPoint[]; tone?: 'primary' | 'success' | 'danger' }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const bar = { primary: 'bg-primary/70', success: 'bg-success/70', danger: 'bg-danger/70' }[tone]
  return (
    <div className="flex h-20 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={cn('w-full rounded-t', bar)}
            style={{ height: `${(d.value / max) * 100}%` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function MetricTrend({
  title,
  unit = '',
  data,
  lowerBetter = false,
  period,
  tone,
}: {
  title: string
  unit?: string
  data: TrendPoint[]
  lowerBetter?: boolean
  period: 'today' | '7d'
  tone: 'primary' | 'success' | 'danger'
}) {
  const last = data[data.length - 1].value
  const prev = data[data.length - 2].value
  const delta = last - prev
  const good = lowerBetter ? delta <= 0 : delta >= 0
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      {period === 'today' ? (
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums">
            {last}
            {unit}
          </span>
          <span
            className={cn('inline-flex items-center gap-0.5 text-xs font-medium', good ? 'text-success' : 'text-danger')}
          >
            {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {delta >= 0 ? '+' : ''}
            {delta}
            {unit} vs yesterday
          </span>
        </div>
      ) : (
        <div className="mt-3">
          <TrendBars data={data} tone={tone} />
        </div>
      )}
    </div>
  )
}

export function Reports() {
  const role = useAppStore((s) => s.role)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const tasks = useAppStore((s) => s.tasks)
  const fulfilments = useAppStore((s) => s.fulfilments)
  const feedback = useAppStore((s) => s.feedback)
  const [period, setPeriod] = useState<'today' | '7d'>('today')

  // Scope: a single store, a region, or the estate.
  let storeIds: string[]
  let scopeLabel: string
  let seed: string
  if (role === 'Regional') {
    const regionId = USER_BY_ID[currentUserId]?.regionId ?? 'r-north'
    storeIds = storesInRegion(regionId).map((s) => s.id)
    scopeLabel = `${REGION_BY_ID[regionId].name} region`
    seed = regionId
  } else if (role === 'HQ') {
    storeIds = STORES.map((s) => s.id)
    scopeLabel = 'Estate'
    seed = 'estate'
  } else {
    storeIds = [activeStoreId]
    scopeLabel = STORE_BY_ID[activeStoreId].name
    seed = activeStoreId
  }

  const idSet = new Set(storeIds)
  const scopedTasks = tasks.filter((t) => idSet.has(t.storeId))
  const kpi = kpiRollup(storeIds)
  const complianceDelta = kpi.compliancePct - kpi.morning.compliancePct
  const conversionDelta = kpi.conversionPct - kpi.morning.conversionPct
  const attachDelta = kpi.attachRatePct - kpi.morning.attachRatePct
  const recovered = recoveredForStores(fulfilments, storeIds)
  const scopedFeedback = feedback.filter((f) => idSet.has(f.storeId))
  const voc = sentimentScore(scopedFeedback)
  const issues = topIssues(scopedFeedback)
  const stock = stockSummary(itemsForStores(storeIds))
  const completion = completionRate(scopedTasks)
  const exceptions = openExceptions(scopedTasks).length
  const overdue = overdueTasks(scopedTasks, DEMO_NOW).length
  const done = scopedTasks.filter((t) => t.status === 'complete').length
  const open = scopedTasks.filter((t) => t.status !== 'complete').length
  const protectedGBP = scopedTasks
    .filter((t) => t.status === 'complete')
    .reduce((s, t) => s + t.estImpactGBP, 0)

  const narrative = scorecardNarrative({
    scopeLabel,
    kpi,
    complianceDelta,
    voc,
    topIssue: issues[0]?.label,
    recovered,
    completion,
  })

  function copySummary() {
    navigator.clipboard?.writeText(narrative)
    toast.success('Summary copied', { description: 'Paste it into Teams or an email.' })
  }

  const complianceTrend = trendTo(kpi.compliancePct, seed + 'comp')
  const completionTrend = trendTo(completion, seed + 'compl')
  const oosTrend = trendTo(stock.oosRatePct, seed + 'oos')

  return (
    <div className="space-y-6">
      <SectionHeading
        title={`${scopeLabel} scorecard`}
        description="A shareable snapshot — trading, execution, stock, service and recovered sales in one view."
        action={
          <div className="flex items-center gap-2 print:hidden">
            <div className="flex items-center rounded-lg border border-border bg-muted p-0.5 text-xs">
              {(['today', '7d'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'rounded-md px-2.5 py-1 font-medium transition-colors',
                    period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {p === 'today' ? 'Today' : '7 days'}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="size-4" /> Print
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={copySummary}>
              <Copy className="size-4" /> Copy
            </Button>
          </div>
        }
      />

      <ExplainerBanner text="The role-scoped scorecard: everything here is for your scope only — this store, your region, or the whole estate — so the numbers always add up to what you own." />

      {/* Narrative */}
      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-sm">{narrative}</p>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiStat label="Sales vs target" value={`${kpi.salesVsTargetPct}%`} tone={kpi.salesVsTargetPct >= 95 ? 'success' : kpi.salesVsTargetPct >= 85 ? 'warning' : 'danger'} icon={<TrendingUp className="size-4" />} />
        <KpiStat label="Conversion" value={`${kpi.conversionPct}%`} delta={conversionDelta} />
        <KpiStat label="Attach rate" value={`${kpi.attachRatePct}%`} delta={attachDelta} />
        <KpiStat label="Compliance" value={`${kpi.compliancePct}%`} delta={complianceDelta} tone={kpi.compliancePct >= 85 ? 'success' : kpi.compliancePct >= 75 ? 'warning' : 'danger'} icon={<ShieldCheck className="size-4" />} />
        <KpiStat label="CSAT" value={kpi.csat} />
        <KpiStat label="Out-of-stock rate" value={`${stock.oosRatePct}%`} tone={stock.oosRatePct >= 8 ? 'danger' : 'warning'} icon={<PackageX className="size-4" />} />
        <KpiStat label="VoC sentiment" value={`${voc}/100`} tone={voc >= 67 ? 'success' : voc >= 45 ? 'warning' : 'danger'} icon={<MessageSquare className="size-4" />} />
        <KpiStat label="Recovered sales" value={gbp(recovered.sum, { compact: true })} tone="success" sub={`${recovered.count} rescue${recovered.count === 1 ? '' : 's'}`} icon={<PoundSterling className="size-4" />} />
      </div>

      {/* Execution + Voice of Customer */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Execution</h3>
          <div className="grid grid-cols-3 gap-3">
            <Cell label="Completion" value={`${completion}%`} />
            <Cell label="Done today" value={done} />
            <Cell label="Open actions" value={open} />
            <Cell label="Overdue" value={overdue} />
            <Cell label="Exceptions" value={exceptions} />
            <Cell label="£ protected" value={gbp(protectedGBP, { compact: true })} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Voice of customer</h3>
          <div className="flex items-center gap-4">
            <ScoreRing value={voc} label="Sentiment" size={84} />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top issues</p>
              {issues.length === 0 ? (
                <p className="text-sm text-muted-foreground">No issues logged.</p>
              ) : (
                <div className="space-y-1">
                  {issues.slice(0, 3).map((i) => (
                    <div key={i.label} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate">{i.label}</span>
                      <span className="text-xs text-muted-foreground">{i.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance trend (period-aware) */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Performance {period === '7d' ? '· last 7 days' : '· today vs yesterday'}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTrend title="Compliance" unit="%" data={complianceTrend} period={period} tone="success" />
          <MetricTrend title="Task completion" unit="%" data={completionTrend} period={period} tone="primary" />
          <MetricTrend title="Out-of-stock rate" unit="%" data={oosTrend} period={period} lowerBetter tone="danger" />
        </div>
      </div>

      {/* League table (region / estate) */}
      {role !== 'Store' && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Store league table</h3>
          <StoreLeagueTable tasks={tasks} storeIds={role === 'Regional' ? storeIds : undefined} />
        </div>
      )}

      {/* Region comparison (HQ) */}
      {role === 'HQ' && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Region comparison</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {REGIONS.map((r) => {
              const ids = storesInRegion(r.id).map((s) => s.id)
              const rk = kpiRollup(ids)
              const rSet = new Set(ids)
              const rvoc = sentimentScore(feedback.filter((f) => rSet.has(f.storeId)))
              return (
                <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Sales vs target</span>
                      <span className="tabular-nums text-foreground">{rk.salesVsTargetPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compliance</span>
                      <span className="tabular-nums text-foreground">{rk.compliancePct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VoC sentiment</span>
                      <span className="tabular-nums text-foreground">{rvoc}/100</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
