import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import type { DomainId, Priority } from '@/types'
import { DOMAINS } from '@/data/domains'
import { STORES } from '@/data/stores'
import { SectionHeading } from '@/components/shared/Stat'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export function CreateTask() {
  const navigate = useNavigate()
  const createTask = useAppStore((s) => s.createTask)
  const enterStore = useAppStore((s) => s.enterStore)

  const [title, setTitle] = useState('')
  const [rationale, setRationale] = useState('')
  const [domainId, setDomainId] = useState<DomainId>('task-execution')
  const [storeId, setStoreId] = useState('s-214')
  const [priority, setPriority] = useState<Priority>('P2')
  const [evidenceRequired, setEvidenceRequired] = useState(false)
  const [impact, setImpact] = useState('')

  const canSubmit = title.trim().length > 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SectionHeading title="Create & assign task" description="Push a one-off or standing task to a store, region or role." />

      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Task title</Label>
          <Input id="title" placeholder="e.g. Re-merchandise the soundbar bay" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="why">Why this matters</Label>
          <Textarea id="why" placeholder="Context the colleague will see on the priority card." value={rationale} onChange={(e) => setRationale(e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Domain</Label>
            <Select value={domainId} onValueChange={(v) => setDomainId(v as DomainId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOMAINS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.index}. {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Assign to store</Label>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STORES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · #{s.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P1">P1 · Critical</SelectItem>
                <SelectItem value="P2">P2 · High</SelectItem>
                <SelectItem value="P3">P3 · Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="impact">Estimated £ impact (optional)</Label>
            <Input id="impact" inputMode="numeric" placeholder="e.g. 800" value={impact} onChange={(e) => setImpact(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2.5">
          <div>
            <Label htmlFor="evidence" className="text-sm">Evidence required</Label>
            <p className="text-xs text-muted-foreground">Require a photo/note/count to complete.</p>
          </div>
          <Switch id="evidence" checked={evidenceRequired} onCheckedChange={setEvidenceRequired} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            className="gap-1.5"
            disabled={!canSubmit}
            onClick={() => {
              const id = createTask({
                title: title.trim(),
                rationale: rationale.trim() || 'Manually created task.',
                domainId,
                storeId,
                priority,
                evidenceRequired,
                estImpactGBP: Number(impact) || 0,
              })
              const store = STORES.find((s) => s.id === storeId)
              enterStore(storeId)
              navigate(`/store/task/${id}`)
              toast.success('Task created & assigned', {
                description: `Now on ${store?.name ?? 'the store'}'s list.`,
              })
            }}
          >
            <Plus className="size-4" /> Create task
          </Button>
        </div>
      </div>
    </div>
  )
}
