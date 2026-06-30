import { useState } from 'react'
import type { Evidence, Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'
import { Camera, Hash, PoundSterling, StickyNote, Check } from 'lucide-react'
import { timeOf } from '@/lib/format'

const ICON: Record<Evidence['type'], typeof Camera> = {
  photo: Camera,
  count: Hash,
  price: PoundSterling,
  note: StickyNote,
}

export function EvidenceCapture({ task }: { task: Task }) {
  const addEvidence = useAppStore((s) => s.addEvidence)
  const [count, setCount] = useState('')
  const [note, setNote] = useState('')

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Proof of execution</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Capture evidence so the action is verifiable end-to-end.
      </p>

      {/* Captured evidence */}
      {task.evidence.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {task.evidence.map((ev) => {
            const Icon = ICON[ev.type]
            return (
              <div key={ev.id} className="rounded-md border border-border bg-muted/40 p-2">
                {ev.type === 'photo' ? (
                  <div className="flex h-16 items-center justify-center rounded bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                    <Camera className="size-6" />
                  </div>
                ) : (
                  <div className="flex h-16 flex-col items-center justify-center rounded bg-muted">
                    <Icon className="size-5 text-muted-foreground" />
                    <span className="mt-1 text-sm font-semibold">{ev.value}</span>
                  </div>
                )}
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  {ev.label} · {timeOf(ev.capturedAt)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Capture controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            addEvidence(task.id, { type: 'photo', label: 'Photo', value: 'capture.jpg' })
          }
        >
          <Camera className="size-4" />
          Take photo
        </Button>

        <div className="flex items-center gap-1">
          <Input
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="Count"
            className="h-9 w-24"
            inputMode="numeric"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!count}
            onClick={() => {
              addEvidence(task.id, { type: 'count', label: 'Stock count', value: count })
              setCount('')
            }}
          >
            <Check className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note"
            className="h-9 w-40"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!note}
            onClick={() => {
              addEvidence(task.id, { type: 'note', label: 'Note', value: note })
              setNote('')
            }}
          >
            <Check className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
