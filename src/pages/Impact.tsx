import { useAppStore } from '@/store/useAppStore'
import { impactSinceMorning } from '@/engine/analytics'
import { completedTasks } from '@/store/selectors'
import { STORE_BY_ID } from '@/data/stores'
import { SectionHeading, KpiStat, ProgressBar } from '@/components/shared/Stat'
import { CountUp } from '@/components/shared/CountUp'
import { DomainChip } from '@/components/shared/badges'
import { ExplainerBanner } from '@/components/help/ExplainerBanner'
import { LabelWithHelp } from '@/components/help/HelpTip'
import { gbp } from '@/lib/format'
import { CheckCircle2, PoundSterling, ShieldCheck, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'

export function Impact() {
  const tasks = useAppStore((s) => s.tasks)
  const impact = impactSinceMorning(tasks)
  const done = completedTasks(tasks)
  const complianceDelta = impact.complianceNow - impact.complianceMorning
  const exceptionDelta = impact.openExceptionsMorning - impact.openExceptionsNow

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Impact since this morning"
        description="Closing the loop — turning completed actions into measurable business outcomes."
      />

      <ExplainerBanner text="This is the pay-off: the actions completed today turned into real results — compliance up, money protected, fewer stores at risk. It shows the work is worth it." />

      {/* Headlines */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-tour="impact-headlines">
        <KpiStat label="Actions completed" value={<CountUp value={impact.actionsCompleted} />} tone="success" icon={<CheckCircle2 className="size-4" />} sub="across the estate" />
        <KpiStat label={<LabelWithHelp helpId="riskMitigated">Risk mitigated</LabelWithHelp>} value={<CountUp value={impact.riskMitigatedGBP} format={(n) => gbp(n, { compact: true })} />} tone="success" icon={<PoundSterling className="size-4" />} />
        <KpiStat label={<LabelWithHelp helpId="compliance">Compliance</LabelWithHelp>} value={<CountUp value={impact.complianceNow} format={(n) => `${Math.round(n)}%`} />} delta={complianceDelta} icon={<ShieldCheck className="size-4" />} sub="vs this morning" />
        <KpiStat label={<LabelWithHelp helpId="openExceptions">Open exceptions</LabelWithHelp>} value={<CountUp value={impact.openExceptionsNow} />} delta={exceptionDelta > 0 ? exceptionDelta : 0} tone={impact.openExceptionsNow ? 'warning' : 'success'} sub={`from ${impact.openExceptionsMorning}`} />
      </div>

      {/* Before / after */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Compliance — morning vs now</h3>
          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>This morning</span>
                <span className="tabular-nums">{impact.complianceMorning}%</span>
              </div>
              <ProgressBar value={impact.complianceMorning} tone="warning" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-success">Now</span>
                <span className="font-semibold tabular-nums text-success">{impact.complianceNow}%</span>
              </div>
              <ProgressBar value={impact.complianceNow} tone="success" />
            </div>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-sm text-success">
            <TrendingUp className="size-4" /> +{complianceDelta} points as actions were completed today.
          </p>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="size-4" /> Execution → outcomes
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 text-primary" />
              Promo end caps verified → console bundle & TV conversion recovering.
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 text-primary" />
              {impact.attachActions > 0 ? impact.attachActions : 'Attach'} prompts actioned → soundbar & care-plan attach rising.
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 text-primary" />
              Stock & equipment exceptions escalated within SLA → lost sales avoided.
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 text-primary" />
              {gbp(impact.riskMitigatedGBP, { compact: true })} of value at risk protected so far today.
            </li>
          </ul>
        </div>
      </div>

      {/* Completed list */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Completed today ({done.length})</h3>
        </div>
        {done.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            Nothing completed yet in this session. Complete a task from the store view and watch the numbers move.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {done.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {STORE_BY_ID[task.storeId]?.name} · #{STORE_BY_ID[task.storeId]?.code}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <DomainChip domainId={task.domainId} />
                  {task.estImpactGBP > 0 && (
                    <span className="text-sm font-semibold text-success">{gbp(task.estImpactGBP, { compact: true })}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
