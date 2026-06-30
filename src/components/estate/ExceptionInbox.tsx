import { useNavigate } from 'react-router-dom'
import type { Task } from '@/types'
import { openExceptions } from '@/store/selectors'
import { slaStatus, TARGET_LABEL } from '@/engine/sla'
import { SlaChip, DomainChip } from '@/components/shared/badges'
import { STORE_BY_ID } from '@/data/stores'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/Stat'
import { CheckCircle2, Bell, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export function ExceptionInbox({ tasks, showStore = true }: { tasks: Task[]; showStore?: boolean }) {
  const navigate = useNavigate()
  const exceptions = openExceptions(tasks).sort((a, b) => {
    const sa = a.escalation ? slaStatus(a.escalation).minutesRemaining : 9999
    const sb = b.escalation ? slaStatus(b.escalation).minutesRemaining : 9999
    return sa - sb
  })

  if (exceptions.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="size-8 text-success" />}
        title="No open exceptions"
        description="Everything is within SLA. Nice and calm."
      />
    )
  }

  return (
    <div className="space-y-2">
      {exceptions.map((task) => {
        const store = STORE_BY_ID[task.storeId]
        const sla = task.escalation ? slaStatus(task.escalation) : undefined
        return (
          <div key={task.id} className="rounded-lg border border-border bg-card p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {sla && <SlaChip state={sla.state} label={sla.label} />}
                {task.escalation && (
                  <span className="text-xs font-medium text-muted-foreground">
                    → {TARGET_LABEL[task.escalation.target]}
                  </span>
                )}
              </div>
              {showStore && (
                <span className="text-xs font-medium text-muted-foreground">
                  {store.name} · #{store.code}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm font-medium">{task.title}</p>
            <p className="text-xs text-muted-foreground">{task.rationale}</p>
            <div className="mt-2 flex items-center justify-between">
              <DomainChip domainId={task.domainId} />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    toast.success('Store nudged', {
                      description: `${store.name} notified about “${task.title}”.`,
                    })
                  }
                >
                  <Bell className="size-4" /> Nudge
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/region/store/${store.id}`)}>
                  View <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
