import { useNavigate } from 'react-router-dom'
import type { Task } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PriorityBadge,
  PillarChip,
  StatusPill,
  TaskSourceChip,
} from '@/components/shared/badges'
import { gbp, relativeToNow } from '@/lib/format'
import { Clock, ArrowRight, Camera, AlertTriangle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PriorityCard({ task, rank }: { task: Task; rank?: number }) {
  const navigate = useNavigate()
  const overdue =
    task.status !== 'complete' && new Date(task.dueAt).getTime() < Date.now() // visual only

  return (
    <Card
      className={cn(
        'gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md',
        task.priority === 'P1' && task.status !== 'complete' && 'ring-1 ring-danger/20',
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {rank != null && (
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {rank}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <PillarChip pillarId={task.pillarId} />
            <TaskSourceChip source={task.source} />
            {task.status !== 'not_started' && <StatusPill status={task.status} />}
          </div>

          <h3 className="mt-2 text-base font-semibold leading-snug">{task.title}</h3>

          <div className="mt-2 rounded-md bg-muted/60 p-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Why this matters
            </p>
            <p className="mt-0.5 text-sm text-foreground/90">{task.rationale}</p>
          </div>

          <p className="mt-2 text-sm">
            <span className="font-medium text-primary">Suggested action: </span>
            {task.suggestedAction}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {task.estImpactGBP > 0 ? (
              <span className="font-semibold text-foreground">
                {gbp(task.estImpactGBP, { compact: true })} at risk
              </span>
            ) : task.domainId === 'safety-compliance' ? (
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <ShieldCheck className="size-3.5" /> Mandatory · legal/safety
              </span>
            ) : null}
            <span className={cn('inline-flex items-center gap-1', overdue && 'text-danger')}>
              <Clock className="size-3.5" />
              Due {relativeToNow(task.dueAt)}
            </span>
            {task.evidenceRequired && (
              <span className="inline-flex items-center gap-1">
                <Camera className="size-3.5" />
                Evidence required
              </span>
            )}
            {task.escalation && (
              <span className="inline-flex items-center gap-1 text-danger">
                <AlertTriangle className="size-3.5" />
                Escalated to {task.escalation.target}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {task.steps.filter((s) => s.done).length}/{task.steps.length} steps done
        </span>
        <Button size="sm" className="gap-1.5" onClick={() => navigate(`/store/task/${task.id}`)}>
          {task.status === 'complete' ? 'View' : 'Open & action'}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </Card>
  )
}
