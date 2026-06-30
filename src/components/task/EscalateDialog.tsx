import { useState } from 'react'
import type { EscalationTarget, Task } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/useAppStore'
import { TARGET_LABEL, SLA_HOURS_BY_TARGET } from '@/engine/sla'
import { TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

const TARGETS: EscalationTarget[] = ['IT', 'Facilities', 'Stock', 'Regional', 'LossPrevention', 'HR']

export function EscalateDialog({ task, children }: { task: Task; children?: React.ReactNode }) {
  const escalateTask = useAppStore((s) => s.escalateTask)
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<EscalationTarget>('Facilities')
  const [reason, setReason] = useState('')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" className="gap-1.5">
            <TriangleAlert className="size-4" />
            Escalate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escalate this task</DialogTitle>
          <DialogDescription>
            Route the blocker to the right team. An SLA clock starts immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Escalate to</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as EscalationTarget)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGETS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TARGET_LABEL[t]} · {SLA_HOURS_BY_TARGET[t]}h SLA
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea
              placeholder="What's blocking this and what's needed?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              escalateTask(task.id, target, reason || 'Escalated from the store.')
              setOpen(false)
              toast.success(`Escalated to ${TARGET_LABEL[target]}`, {
                description: `${SLA_HOURS_BY_TARGET[target]}h SLA clock started.`,
              })
            }}
          >
            Escalate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
