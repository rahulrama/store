import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { STORE_BY_ID, REGION_BY_ID, managerOfStore } from '@/data/stores'
import { KPI_BY_STORE } from '@/data/kpis'
import { tasksForStore, rankedOpenTasks } from '@/store/selectors'
import { SectionHeading, KpiStat } from '@/components/shared/Stat'
import { ExceptionInbox } from '@/components/estate/ExceptionInbox'
import { PriorityBadge, PillarChip, StatusPill } from '@/components/shared/badges'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/Stat'
import { gbp } from '@/lib/format'
import { ArrowLeft, ExternalLink, FileQuestion } from 'lucide-react'

export function StoreDrilldown() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tasks = useAppStore((s) => s.tasks)
  const enterStore = useAppStore((s) => s.enterStore)

  const store = id ? STORE_BY_ID[id] : undefined
  if (!store) {
    return <EmptyState icon={<FileQuestion className="size-8" />} title="Store not found" />
  }

  const kpi = KPI_BY_STORE[store.id]
  const manager = managerOfStore(store.id)
  const storeTasks = tasksForStore(tasks, store.id)
  const open = rankedOpenTasks(storeTasks)

  return (
    <div className="space-y-6">
      <Link to="/region" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to cockpit
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading
          title={`${store.name} · #${store.code}`}
          description={`${REGION_BY_ID[store.regionId].name} · ${store.format} · Manager: ${manager?.name}`}
        />
        <Button
          className="gap-1.5"
          onClick={() => {
            enterStore(store.id)
            navigate('/store')
          }}
        >
          <ExternalLink className="size-4" /> Open store app
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiStat label="Compliance" value={`${kpi.compliancePct}%`} tone={kpi.compliancePct >= 80 ? 'success' : 'warning'} />
        <KpiStat label="Sales vs target" value={`${kpi.salesVsTargetPct}%`} tone={kpi.salesVsTargetPct >= 95 ? 'success' : 'warning'} />
        <KpiStat label="Attach rate" value={`${kpi.attachRatePct}%`} />
        <KpiStat label="Out-of-stock" value={`${kpi.oosRatePct}%`} tone={kpi.oosRatePct >= 10 ? 'danger' : 'default'} />
        <KpiStat label="CSAT" value={kpi.csat} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Open tasks */}
        <div>
          <SectionHeading title="Open tasks" description={`${open.length} open`} className="mb-3" />
          <div className="space-y-2">
            {open.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => {
                  useAppStore.getState().enterStore(store.id)
                  navigate(`/store/task/${task.id}`)
                }}
                className="block w-full rounded-lg border border-border bg-card p-3 text-left hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={task.priority} showLabel={false} />
                    <PillarChip pillarId={task.pillarId} />
                  </div>
                  <StatusPill status={task.status} />
                </div>
                <p className="mt-1.5 text-sm font-medium">{task.title}</p>
                {task.estImpactGBP > 0 && (
                  <p className="text-xs text-muted-foreground">{gbp(task.estImpactGBP)} at risk</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Exceptions */}
        <div>
          <SectionHeading title="Exceptions & SLAs" className="mb-3" />
          <ExceptionInbox tasks={storeTasks} showStore={false} />
        </div>
      </div>
    </div>
  )
}
