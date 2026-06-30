import { useState } from 'react'
import type { Task } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { slaStatus, TARGET_LABEL } from '@/engine/sla'
import { SlaChip } from '@/components/shared/badges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { USER_BY_ID } from '@/data/stores'
import { timeOf } from '@/lib/format'
import { TriangleAlert, CheckCircle2, Send } from 'lucide-react'

export function EscalationThread({ task }: { task: Task }) {
  const addEscalationUpdate = useAppStore((s) => s.addEscalationUpdate)
  const resolveEscalation = useAppStore((s) => s.resolveEscalation)
  const [note, setNote] = useState('')

  if (!task.escalation) return null
  const esc = task.escalation
  const sla = slaStatus(esc)
  const resolved = esc.status === 'resolved'

  return (
    <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-4 text-danger" />
          <h3 className="text-sm font-semibold">Escalated to {TARGET_LABEL[esc.target]}</h3>
        </div>
        {!resolved ? (
          <SlaChip state={sla.state} label={sla.label} />
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="size-4" /> Resolved
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{esc.reason}</p>

      {/* Thread */}
      <div className="mt-3 space-y-2 border-l-2 border-border pl-3">
        {esc.thread.map((u, i) => {
          const user = USER_BY_ID[u.byUserId]
          return (
            <div key={i} className="text-sm">
              <span className="font-medium">{user?.name ?? 'System'}</span>
              <span className="ml-2 text-xs text-muted-foreground">{timeOf(u.at)}</span>
              <p className="text-muted-foreground">{u.note}</p>
            </div>
          )
        })}
      </div>

      {!resolved && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-1.5">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an update…"
              className="h-9"
            />
            <Button
              size="icon"
              variant="outline"
              disabled={!note}
              onClick={() => {
                addEscalationUpdate(task.id, note)
                setNote('')
              }}
            >
              <Send className="size-4" />
            </Button>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => resolveEscalation(task.id)}>
            <CheckCircle2 className="size-4" />
            Mark resolved
          </Button>
        </div>
      )}
    </div>
  )
}
