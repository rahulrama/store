import { useAppStore } from '@/store/useAppStore'
import { SIGNALS } from '@/data/signals'
import { RULE_BY_SIGNAL_TYPE } from '@/engine/signalsEngine'
import { STORE_BY_ID } from '@/data/stores'
import { SectionHeading } from '@/components/shared/Stat'
import { PriorityBadge, DomainChip } from '@/components/shared/badges'
import { gbp, relativeToNow } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'

const SEVERITY_CLASS: Record<string, string> = {
  low: 'border-muted-foreground/30 text-muted-foreground',
  medium: 'border-warning/40 text-warning',
  high: 'border-danger/40 text-danger',
  critical: 'border-danger/60 text-danger',
}

export function SignalsExplorer() {
  const tasks = useAppStore((s) => s.tasks)
  const taskBySignal = new Map(tasks.filter((t) => t.sourceSignalId).map((t) => [t.sourceSignalId!, t]))

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Signals Explorer"
        description="How the Copilot turns raw operational signals into prioritised actions — every rule is transparent."
      />

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="size-4" /> Signal → Rule → Prioritised task
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          The engine reads signals across all 14 domains and scores each with{' '}
          <span className="font-medium text-foreground">severity × £ impact × deadline proximity</span>. No black box —
          here is exactly what fired and what it produced.
        </p>
      </div>

      <div className="space-y-3">
        {SIGNALS.map((sig, i) => {
          const store = STORE_BY_ID[sig.storeId]
          const task = taskBySignal.get(sig.id)
          return (
            <div key={sig.id} data-tour={i === 0 ? 'signals-first' : undefined} className="grid gap-3 rounded-lg border border-border bg-card p-4 lg:grid-cols-[1fr_auto_1fr]">
              {/* Signal */}
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn('rounded-md border px-2 py-0.5 text-xs font-semibold uppercase', SEVERITY_CLASS[sig.severity])}>
                    {sig.severity}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {store.name} · #{store.code} · {relativeToNow(sig.detectedAt)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm">{sig.message}</p>
                {sig.metric && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sig.metric.label}:{' '}
                    <span className="font-medium text-danger">
                      {sig.metric.value}
                      {sig.metric.unit}
                    </span>{' '}
                    vs threshold {sig.metric.threshold}
                    {sig.metric.unit}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <DomainChip domainId={sig.domainId} />
                  {sig.estImpactGBP > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">{gbp(sig.estImpactGBP)} at risk</span>
                  )}
                </div>
              </div>

              {/* Rule arrow */}
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-1 text-primary">
                  <Zap className="size-4" />
                  <ArrowRight className="hidden size-5 lg:block" />
                </div>
              </div>

              {/* Generated task */}
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Rule</p>
                <p className="text-xs text-foreground/80">{RULE_BY_SIGNAL_TYPE[sig.type]}</p>
                {task && (
                  <div className="mt-2 border-t border-border pt-2">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} showLabel={false} />
                      <span className="text-xs text-muted-foreground">score {task.priorityScore}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{task.title}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
