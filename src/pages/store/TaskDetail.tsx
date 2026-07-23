import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { EvidenceCapture } from '@/components/task/EvidenceCapture'
import { EscalateDialog } from '@/components/task/EscalateDialog'
import { EscalationThread } from '@/components/task/EscalationThread'
import {
  PriorityBadge,
  PillarChip,
  DomainChip,
  StatusPill,
} from '@/components/shared/badges'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { EmptyState } from '@/components/shared/Stat'
import { gbp, relativeToNow } from '@/lib/format'
import { USER_BY_ID } from '@/data/stores'
import { suggestCover } from '@/engine/workforce'
import { ArrowLeft, Clock, CheckCircle2, Camera, PoundSterling, FileQuestion, Users, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const task = useAppStore((s) => s.tasks.find((t) => t.id === id))
  const toggleStep = useAppStore((s) => s.toggleStep)
  const completeTask = useAppStore((s) => s.completeTask)

  if (!task) {
    return (
      <EmptyState
        icon={<FileQuestion className="size-8" />}
        title="Task not found"
        description="It may have been reset. Head back to today."
      />
    )
  }

  const owner = USER_BY_ID[task.ownerUserId]
  const cover = task.title.toLowerCase().includes('redeploy') ? suggestCover(task.storeId) : null
  const allStepsDone = task.steps.every((s) => s.done)
  const evidenceOk = !task.evidenceRequired || task.evidence.length > 0
  const canComplete = task.status !== 'complete' && allStepsDone && evidenceOk

  return (
    <div className="space-y-4">
      <Link to="/store" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to today
      </Link>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <PillarChip pillarId={task.pillarId} />
          <DomainChip domainId={task.domainId} />
          <StatusPill status={task.status} />
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight">{task.title}</h1>

        <div className="mt-3 rounded-md bg-muted/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why this matters</p>
          <p className="mt-0.5 text-sm">{task.rationale}</p>
        </div>
        <p className="mt-2 text-sm">
          <span className="font-medium text-primary">Suggested action: </span>
          {task.suggestedAction}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {task.estImpactGBP > 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <PoundSterling className="size-3.5" />
              {gbp(task.estImpactGBP)} at risk
            </span>
          ) : task.domainId === 'safety-compliance' ? (
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <ShieldCheck className="size-3.5" /> Mandatory · legal/safety
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> Due {relativeToNow(task.dueAt)}
          </span>
          <span>Owner: {owner?.name}</span>
          {task.evidenceRequired && (
            <span className="inline-flex items-center gap-1">
              <Camera className="size-3.5" /> Evidence required
            </span>
          )}
        </div>
      </div>

      {cover && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <Users className="size-4 shrink-0 text-primary" />
          <p>
            <span className="font-medium">Suggested cover: {cover.colleague.name}</span>
            <span className="text-muted-foreground"> — {cover.reason}</span>
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="rounded-lg border border-border bg-card p-4" data-tour="task-steps">
        <h3 className="text-sm font-semibold">Steps</h3>
        <div className="mt-2 space-y-1">
          {task.steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3 rounded-md px-1 py-2 hover:bg-muted/40">
              <Checkbox
                checked={step.done}
                onCheckedChange={() => toggleStep(task.id, step.id)}
                disabled={task.status === 'complete'}
              />
              <span className={step.done ? 'text-sm text-muted-foreground line-through' : 'text-sm'}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence */}
      {(task.evidenceRequired || task.evidence.length > 0) && <EvidenceCapture task={task} />}

      {/* Escalation */}
      {task.escalation ? (
        <EscalationThread task={task} />
      ) : (
        task.status !== 'complete' && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <h3 className="text-sm font-semibold">Blocked or need help?</h3>
              <p className="text-xs text-muted-foreground">Escalate to IT, Facilities, Stock, LP, HR or your Regional Manager.</p>
            </div>
            <EscalateDialog task={task} />
          </div>
        )
      )}

      {/* Complete bar */}
      {task.status !== 'complete' ? (
        <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-lg">
          <span className="text-xs text-muted-foreground">
            {task.evidenceRequired && task.evidence.length === 0
              ? 'Capture evidence to complete'
              : allStepsDone
                ? 'All steps done — ready to complete'
                : `${task.steps.filter((s) => s.done).length}/${task.steps.length} steps done`}
          </span>
          <Button
            className="gap-1.5"
            disabled={!canComplete}
            onClick={() => {
              completeTask(task.id)
              toast.success('Task completed', {
                description:
                  task.estImpactGBP > 0
                    ? `${gbp(task.estImpactGBP)} protected · KPIs updated.`
                    : 'KPIs updated.',
              })
              navigate('/store')
            }}
          >
            <CheckCircle2 className="size-4" />
            Mark complete
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
          <CheckCircle2 className="size-5" />
          Completed — nice work. This is now visible to your Regional Manager and HQ.
        </div>
      )}
    </div>
  )
}
