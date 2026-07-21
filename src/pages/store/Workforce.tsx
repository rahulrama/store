import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { shiftsInStore, COLLEAGUE_BY_ID, colleaguesInStore } from '@/data/colleagues'
import { tasksForStore } from '@/store/selectors'
import { suggestCover, colleagueContribution } from '@/engine/workforce'
import { SectionHeading } from '@/components/shared/Stat'
import { LabelWithHelp } from '@/components/help/HelpTip'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { UserX, GraduationCap, ArrowRight, ClipboardList, Sparkles, CheckCircle2 } from 'lucide-react'

const SHIFT_STATUS: Record<string, { label: string; className: string }> = {
  clocked_in: { label: 'Clocked in', className: 'bg-success/10 text-success border-success/30' },
  scheduled: { label: 'Scheduled', className: 'bg-muted text-muted-foreground border-border' },
  absent: { label: 'Absent', className: 'bg-danger/10 text-danger border-danger/30' },
  on_break: { label: 'On break', className: 'bg-warning/10 text-warning border-warning/30' },
}

// Rota order: exceptions first (absent), then who's on now, then upcoming — each by start time.
const STATUS_ORDER: Record<string, number> = { absent: 0, clocked_in: 1, on_break: 2, scheduled: 3 }

export function Workforce() {
  const navigate = useNavigate()
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const tasks = useAppStore((s) => s.tasks)

  const shifts = shiftsInStore(activeStoreId)
  const colleagues = colleaguesInStore(activeStoreId)
  const absent = shifts.filter((s) => s.status === 'absent')
  const expiring = colleagues.filter((c) => c.trainingExpiringDays != null)
  const redeployTask = tasksForStore(tasks, activeStoreId).find(
    (t) => t.domainId === 'scheduling' && t.status !== 'complete',
  )
  const cover = suggestCover(activeStoreId)
  const shiftByColleague = new Map(shifts.map((s) => [s.colleagueId, s]))
  const rotaShifts = [...shifts].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.start.localeCompare(b.start),
  )
  const [recognised, setRecognised] = useState<Record<string, boolean>>({})

  function recognise(id: string, name: string) {
    setRecognised((r) => ({ ...r, [id]: true }))
    toast.success(`Recognised ${name}`, { description: 'A thank-you has been shared with the team.' })
  }

  return (
    <div className="space-y-5">
      <SectionHeading title="My Team" description="Your colleagues, today's cover and skills at a glance." />

      {/* Absence callout */}
      {absent.map((shift) => {
        const c = COLLEAGUE_BY_ID[shift.colleagueId]
        return (
          <div key={shift.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger/5 p-4">
            <div className="flex items-center gap-3">
              <UserX className="size-5 text-danger" />
              <div>
                <p className="text-sm font-semibold">{c?.name} is absent — {shift.department}</p>
                <p className="text-xs text-muted-foreground">
                  Peak Saturday with the TV event live. Cover is below target in {shift.department}.
                </p>
                {cover && (
                  <p className="mt-1 text-xs">
                    <span className="text-muted-foreground">Suggested cover: </span>
                    <span className="font-medium">{cover.colleague.name}</span>
                    <span className="text-muted-foreground"> — {cover.reason}</span>
                  </p>
                )}
              </div>
            </div>
            {redeployTask && (
              <Button className="gap-1.5" onClick={() => navigate(`/store/task/${redeployTask.id}`)}>
                Redeploy cover <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        )
      })}

      {/* Colleague 360 */}
      <div data-tour="my-team">
        <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold">
          <LabelWithHelp helpId="colleague360">Your team today</LabelWithHelp>
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {colleagues.map((c) => {
            const shift = shiftByColleague.get(c.id)
            const st = shift ? SHIFT_STATUS[shift.status] : undefined
            const contrib = colleagueContribution(c.id)
            const isRec = recognised[c.id]
            return (
              <div key={c.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{c.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.department}{shift ? ` · ${shift.start}–${shift.end}` : ''}
                      </p>
                    </div>
                  </div>
                  {st && (
                    <span className={cn('inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', st.className)}>
                      {st.label}
                    </span>
                  )}
                </div>

                {c.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.skills.map((s) => (
                      <span key={s} className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{s}</span>
                    ))}
                  </div>
                )}

                {c.trainingExpiringDays != null && (
                  <p className={cn('mt-2 text-[11px] font-medium', c.trainingExpiringDays <= 5 ? 'text-danger' : 'text-warning')}>
                    {c.trainingRenewal ?? 'Training'} renewal · {c.trainingExpiringDays}d left
                  </p>
                )}

                <div className="mt-2 flex items-center gap-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
                  <span><span className="font-semibold tabular-nums text-foreground">{contrib.tasksDone}</span> tasks today</span>
                  <span><span className="font-semibold tabular-nums text-foreground">{contrib.attachPct}%</span> attach</span>
                  <span><span className="font-semibold tabular-nums text-foreground">{contrib.vocCaptures}</span> feedback</span>
                </div>

                <div className="mt-2">
                  {isRec ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                      <CheckCircle2 className="size-3" /> Recognised
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => recognise(c.id, c.name)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium hover:bg-muted"
                    >
                      <Sparkles className="size-3 text-primary" /> Recognise
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rota */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Today's rota</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colleague</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rotaShifts.map((shift) => {
              const c = COLLEAGUE_BY_ID[shift.colleagueId]
              const st = SHIFT_STATUS[shift.status]
              return (
                <TableRow key={shift.id} className={cn(shift.status === 'absent' && 'bg-danger/5')}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                          {c?.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{c?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{shift.department}</TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {shift.start}–{shift.end}
                  </TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', st.className)}>
                      {st.label}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Training */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" />
            <h3 className="text-sm font-semibold"><LabelWithHelp helpId="trainingRenewal">Training renewals due</LabelWithHelp></h3>
          </div>
          <div className="mt-3 space-y-2">
            {expiring.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                <span className="text-sm">{c.name}</span>
                <span className={cn('text-xs font-medium', (c.trainingExpiringDays ?? 0) <= 5 ? 'text-danger' : 'text-warning')}>
                  {c.trainingRenewal ?? 'Training'} · {c.trainingExpiringDays}d left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Handover */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Shift handover</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• TV event is the focus — keep the demo wall running and prompt soundbar attach.</li>
            <li>• Cooling stock is low; replenishment task in progress on the floor.</li>
            <li>• Stockroom chiller fault logged with Facilities — keep the area cordoned.</li>
            <li>• Late team to complete the closing checklist and cash up.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
