import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  estateHealthScore,
  allPillarHealth,
  storesAtRisk,
} from '@/engine/analytics'
import { openExceptions, completionRate, overdueTasks } from '@/store/selectors'
import { SIGNALS } from '@/data/signals'
import { STORE_BY_ID } from '@/data/stores'
import { DOMAIN_BY_ID } from '@/data/domains'
import type { PillarId } from '@/types'
import { SectionHeading, ScoreRing, KpiStat, ProgressBar } from '@/components/shared/Stat'
import { StoreLeagueTable } from '@/components/estate/StoreLeagueTable'
import { SocialPulseCard } from '@/components/estate/SocialPulseCard'
import { DomainChip } from '@/components/shared/badges'
import { ExplainerBanner } from '@/components/help/ExplainerBanner'
import { HelpTip, LabelWithHelp } from '@/components/help/HelpTip'
import { DEMO_NOW } from '@/data/now'
import { relativeToNow, gbp } from '@/lib/format'
import { cn } from '@/lib/utils'
import { TriangleAlert, Clock, CheckCircle2, Activity, ChevronRight, Radio } from 'lucide-react'

const PILLAR_DOT: Record<string, string> = {
  'pillar-people': 'bg-pillar-people',
  'pillar-trading': 'bg-pillar-trading',
  'pillar-stock': 'bg-pillar-stock',
  'pillar-risk': 'bg-pillar-risk',
  'pillar-enablement': 'bg-pillar-enablement',
}

const PILLAR_HELP: Record<string, string> = {
  people: 'pillarPeople',
  trading: 'pillarTrading',
  stock: 'pillarStock',
  risk: 'pillarRisk',
  enablement: 'pillarEnablement',
}

const PILLARS_BY_ID: Record<string, string> = {
  people: 'People & Workforce',
  trading: 'Trading & Execution',
  stock: 'Stock & Fulfilment',
  risk: 'Risk, Safety & Compliance',
  enablement: 'Enablement & Support',
}

const SEVERITY_DOT: Record<string, string> = {
  low: 'bg-muted-foreground/40',
  medium: 'bg-warning',
  high: 'bg-danger',
  critical: 'bg-danger',
}

export function ControlTower() {
  const navigate = useNavigate()
  const tasks = useAppStore((s) => s.tasks)
  const [pillarFilter, setPillarFilter] = useState<PillarId | null>(null)

  const health = estateHealthScore(tasks)
  const pillars = allPillarHealth(tasks)
  const atRisk = storesAtRisk(tasks)
  const exceptions = openExceptions(tasks)
  const overdue = overdueTasks(tasks, DEMO_NOW)
  const completion = completionRate(tasks)
  const recentSignals = [...SIGNALS]
    .filter((sig) => !pillarFilter || DOMAIN_BY_ID[sig.domainId].pillarId === pillarFilter)
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Estate Control Tower"
        description="Saturday 13 June · live operational health across 12 stores and 3 regions."
      />

      <ExplainerBanner text="Your estate-wide command centre — a single health score, the five operational themes, and the stores and signals that need attention across the whole chain today." />

      {/* Top row */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5" data-tour="estate-health">
          <ScoreRing value={health} label="Health" size={104} />
          <div>
            <p className="flex items-center gap-1 text-sm font-semibold">
              Estate health <HelpTip id="estateHealth" />
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Composite of compliance, execution, stock & service across the estate.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiStat label={<LabelWithHelp helpId="openExceptions">Open exceptions</LabelWithHelp>} value={exceptions.length} tone={exceptions.length ? 'danger' : 'success'} icon={<TriangleAlert className="size-4" />} />
          <KpiStat label={<LabelWithHelp helpId="overdueActions">Overdue actions</LabelWithHelp>} value={overdue.length} tone={overdue.length ? 'warning' : 'success'} icon={<Clock className="size-4" />} />
          <KpiStat label={<LabelWithHelp helpId="completionRate">Completion rate</LabelWithHelp>} value={`${completion}%`} tone="success" icon={<CheckCircle2 className="size-4" />} />
          <KpiStat label={<LabelWithHelp helpId="storesAtRisk">Stores at risk</LabelWithHelp>} value={atRisk.length} tone={atRisk.length ? 'warning' : 'success'} icon={<Activity className="size-4" />} />
        </div>
      </div>

      {/* Pillar health tiles */}
      <div>
        <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold">
          Operational themes <HelpTip id="operationalThemes" />
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" data-tour="pillar-tiles">
          {pillars.map((p) => {
            const active = pillarFilter === p.pillarId
            return (
              <button
                key={p.pillarId}
                type="button"
                onClick={() => setPillarFilter(active ? null : p.pillarId)}
                className={cn(
                  'rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40',
                  active ? 'border-primary ring-1 ring-primary/30' : 'border-border',
                )}
                title={`Filter the signals feed by ${p.name}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={cn('size-2.5 rounded-full', PILLAR_DOT[p.color])} />
                  <span className="text-xs font-semibold">{p.name}</span>
                  <HelpTip id={PILLAR_HELP[p.pillarId]} className="ml-auto" />
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums">{p.pct}</div>
                <div className="mt-2">
                  <ProgressBar value={p.pct} tone={p.pct >= 85 ? 'success' : p.pct >= 75 ? 'warning' : 'danger'} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stores at risk + Signals feed */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <TriangleAlert className="size-4 text-warning" />
            <h3 className="text-sm font-semibold">Stores needing attention</h3>
          </div>
          <div className="divide-y divide-border">
            {atRisk.map((r) => {
              const store = STORE_BY_ID[r.storeId]
              return (
                <button
                  key={r.storeId}
                  type="button"
                  onClick={() => navigate(`/region/store/${r.storeId}`)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-medium">{store.name} · #{store.code}</p>
                    <p className="text-xs text-muted-foreground">{r.reasons.join(' · ')}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Radio className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Live signals feed</h3>
            <HelpTip id="signals" />
            {pillarFilter && (
              <button
                type="button"
                onClick={() => setPillarFilter(null)}
                className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
              >
                {PILLARS_BY_ID[pillarFilter]} ×
              </button>
            )}
          </div>
          <div className="max-h-[320px] divide-y divide-border overflow-y-auto scrollbar-thin">
            {recentSignals.map((sig) => {
              const store = STORE_BY_ID[sig.storeId]
              return (
                <div key={sig.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('size-2 rounded-full', SEVERITY_DOT[sig.severity])} />
                      <span className="text-xs font-medium">{store.name} · #{store.code}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{relativeToNow(sig.detectedAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/90">{sig.message}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <DomainChip domainId={sig.domainId} />
                    {sig.estImpactGBP > 0 && (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {gbp(sig.estImpactGBP, { compact: true })} at risk
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Social pulse */}
      <SocialPulseCard />

      {/* League table */}
      <div>
        <SectionHeading title="Store league table" description="Ranked by compliance, sales and stock health. Click a store to drill in." className="mb-3" />
        <StoreLeagueTable tasks={tasks} />
      </div>
    </div>
  )
}
