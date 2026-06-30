import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { shiftsInStore, COLLEAGUE_BY_ID, colleaguesInStore } from '@/data/colleagues'
import { tasksForStore } from '@/store/selectors'
import { SectionHeading } from '@/components/shared/Stat'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { UserX, GraduationCap, ArrowRight, ClipboardList } from 'lucide-react'

const SHIFT_STATUS: Record<string, { label: string; className: string }> = {
  clocked_in: { label: 'Clocked in', className: 'bg-success/10 text-success border-success/30' },
  scheduled: { label: 'Scheduled', className: 'bg-muted text-muted-foreground border-border' },
  absent: { label: 'Absent', className: 'bg-danger/10 text-danger border-danger/30' },
  on_break: { label: 'On break', className: 'bg-warning/10 text-warning border-warning/30' },
}

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

  return (
    <div className="space-y-5">
      <SectionHeading title="Workforce & shifts" description="Today's rota, cover and redeployment for a busy Saturday." />

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
            {shifts.map((shift) => {
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
            <h3 className="text-sm font-semibold">Training renewals due</h3>
          </div>
          <div className="mt-3 space-y-2">
            {expiring.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                <span className="text-sm">{c.name}</span>
                <span className={cn('text-xs font-medium', (c.trainingExpiringDays ?? 0) <= 5 ? 'text-danger' : 'text-warning')}>
                  Age-restricted · {c.trainingExpiringDays}d left
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
