import { useNavigate } from 'react-router-dom'
import type { Task } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { colleaguesInStore, shiftsInStore, COLLEAGUE_BY_ID, colleagueIdForUser } from '@/data/colleagues'
import { suggestAssignee } from '@/engine/workforce'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  PriorityBadge,
  PillarChip,
  StatusPill,
  TaskSourceChip,
} from '@/components/shared/badges'
import { gbp, relativeToNow } from '@/lib/format'
import { Clock, ArrowRight, Camera, AlertTriangle, ShieldCheck, UserPlus, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

      <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 text-xs text-muted-foreground">
            {task.steps.filter((s) => s.done).length}/{task.steps.length} steps done
          </span>
          <AssignControl task={task} />
        </div>
        <Button size="sm" className="shrink-0 gap-1.5" onClick={() => navigate(`/store/task/${task.id}`)}>
          {task.status === 'complete' ? 'View' : 'Open & action'}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </Card>
  )
}

const SHIFT_ORDER: Record<string, number> = { clocked_in: 0, scheduled: 1, absent: 2 }

/** Assign a task to an on-shift colleague, with a skills/shift-matched suggestion. */
export function AssignControl({ task }: { task: Task }) {
  const role = useAppStore((s) => s.role)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const assignTask = useAppStore((s) => s.assignTask)
  const roster = colleaguesInStore(task.storeId)
  const shifts = shiftsInStore(task.storeId)
  const shiftOf = (cid: string) => shifts.find((sh) => sh.colleagueId === cid)
  const assigned = task.assignedColleagueId ? COLLEAGUE_BY_ID[task.assignedColleagueId] : undefined
  const suggestion = assigned ? null : suggestAssignee(task.storeId, task.department)

  // A shop-floor colleague can't reassign others — only take an unassigned task.
  if (role === 'Colleague') {
    const myColleagueId = colleagueIdForUser(currentUserId)
    if (task.assignedColleagueId || !myColleagueId) return null
    return (
      <button
        type="button"
        onClick={() => {
          assignTask(task.id, myColleagueId)
          toast.success('You took this task', { description: task.title })
        }}
        className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/5 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
      >
        <UserPlus className="size-3.5" /> Take it
      </button>
    )
  }

  const ordered = [...roster].sort(
    (a, b) =>
      (SHIFT_ORDER[shiftOf(a.id)?.status ?? 'scheduled'] ?? 1) -
      (SHIFT_ORDER[shiftOf(b.id)?.status ?? 'scheduled'] ?? 1),
  )

  function assign(id: string | undefined, name?: string) {
    assignTask(task.id, id)
    toast.success(id ? `Assigned to ${name}` : 'Unassigned', { description: id ? task.title : undefined })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {assigned ? (
          <button className="flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-card py-0.5 pl-0.5 pr-2 hover:border-primary/40">
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{assigned.initials}</AvatarFallback>
            </Avatar>
            <span className="truncate text-xs font-medium">{assigned.name.split(' ')[0]}</span>
          </button>
        ) : (
          <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">
            <UserPlus className="size-3.5" />
            {suggestion ? `Assign · ${suggestion.colleague.name.split(' ')[0]}?` : 'Assign'}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Assign to a colleague</DropdownMenuLabel>
        {suggestion && (
          <>
            <DropdownMenuItem onClick={() => assign(suggestion.colleague.id, suggestion.colleague.name)}>
              <Sparkles className="mr-2 size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="truncate text-sm">
                  {suggestion.colleague.name} <span className="text-xs text-primary">· suggested</span>
                </div>
                <div className="truncate text-xs text-muted-foreground">{suggestion.reason}</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {ordered.map((c) => {
          const st = shiftOf(c.id)?.status
          const meta = st === 'absent' ? 'off today' : st === 'scheduled' ? `on at ${shiftOf(c.id)?.start}` : c.department
          return (
            <DropdownMenuItem key={c.id} disabled={st === 'absent'} onClick={() => assign(c.id, c.name)}>
              <Avatar size="sm" className="mr-2">
                <AvatarFallback className="text-[10px]">{c.initials}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
              <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{meta}</span>
            </DropdownMenuItem>
          )
        })}
        {assigned && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => assign(undefined)}>
              <X className="mr-2 size-4" /> Unassign
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
