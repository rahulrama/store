import { useAppStore } from '@/store/useAppStore'
import { tasksForStore, rankedOpenTasks, completedTasks } from '@/store/selectors'
import { PriorityCard } from '@/components/task/PriorityCard'
import { KpiStat, SectionHeading } from '@/components/shared/Stat'
import { PROMOTIONS } from '@/data/promotions'
import { KPI_BY_STORE } from '@/data/kpis'
import { gbp } from '@/lib/format'
import { ListChecks, AlertTriangle, CheckCircle2, PoundSterling, Megaphone, Sun, TrendingUp } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { StatusPill } from '@/components/shared/badges'
import { ExplainerBanner } from '@/components/help/ExplainerBanner'
import { LabelWithHelp } from '@/components/help/HelpTip'

export function DailyBrief() {
  const tasks = useAppStore((s) => s.tasks)
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const fulfilments = useAppStore((s) => s.fulfilments)

  const storeTasks = tasksForStore(tasks, activeStoreId)
  const open = rankedOpenTasks(storeTasks)
  const done = completedTasks(storeTasks)
  const p1 = open.filter((t) => t.priority === 'P1').length
  const atRisk = open.reduce((sum, t) => sum + t.estImpactGBP, 0)
  const kpi = KPI_BY_STORE[activeStoreId]
  const recovered = fulfilments
    .filter((f) => f.fromStoreId === activeStoreId)
    .reduce((acc, f) => ({ count: acc.count + 1, sum: acc.sum + f.valueGBP }), { count: 0, sum: 0 })

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Good morning — here's your day</h2>
        <p className="text-sm text-muted-foreground">
          The Copilot has triaged today's signals into a prioritised plan. Work top-down.
        </p>
      </div>

      <ExplainerBanner text="Your prioritised plan for today. The most valuable, most urgent jobs are at the top — open each one, do the steps, capture any proof needed, and mark it complete." />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiStat label="Open priorities" value={open.length} icon={<ListChecks className="size-4" />} />
        <KpiStat label={<LabelWithHelp helpId="priority">Critical (P1)</LabelWithHelp>} value={p1} tone={p1 > 0 ? 'danger' : 'success'} icon={<AlertTriangle className="size-4" />} />
        <KpiStat label="Done today" value={done.length} tone="success" icon={<CheckCircle2 className="size-4" />} />
        <KpiStat label={<LabelWithHelp helpId="valueAtRisk">Value at risk</LabelWithHelp>} value={gbp(atRisk, { compact: true })} tone="warning" icon={<PoundSterling className="size-4" />} />
      </div>

      {recovered.count > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
          <TrendingUp className="size-5 text-success" />
          <div>
            <p className="text-sm font-semibold text-success">Recovered sales today: {gbp(recovered.sum)}</p>
            <p className="text-xs text-muted-foreground">
              {recovered.count} out-of-stock sale{recovered.count > 1 ? 's' : ''} saved by sourcing from another store.
            </p>
          </div>
        </div>
      )}

      {/* Live promotions */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Megaphone className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Live in store today</h3>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROMOTIONS.map((promo) => (
            <div key={promo.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5">
              {promo.id === 'promo-summer-cooling' ? (
                <Sun className="size-4 text-warning" />
              ) : (
                <Megaphone className="size-4 text-primary" />
              )}
              <span className="text-xs font-medium">{promo.name}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Store compliance {kpi.compliancePct}% · conversion {kpi.conversionPct}% · attach {kpi.attachRatePct}%
        </p>
      </div>

      {/* Priorities */}
      <div className="space-y-3">
        <SectionHeading title="Today's priorities" description={`${open.length} open · ranked by impact and urgency`} />
        {open.map((task, i) => (
          <div key={task.id} data-tour={i === 0 ? 'priority-1' : undefined}>
            <PriorityCard task={task} rank={i + 1} />
          </div>
        ))}
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="done" className="rounded-lg border border-border bg-card px-4">
            <AccordionTrigger className="text-sm font-semibold">
              Completed today ({done.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {done.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                    <span className="text-sm">{task.title}</span>
                    <StatusPill status={task.status} />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}
