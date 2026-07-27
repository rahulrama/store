import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { tasksForStore } from '@/store/selectors'
import { STORE_BY_ID } from '@/data/stores'
import { SectionHeading, ProgressBar } from '@/components/shared/Stat'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusPill } from '@/components/shared/badges'
import { Sun, Moon, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Synthetic per-department readiness checks for the demo store.
const READINESS: Record<string, { label: string; done: boolean }[]> = {
  'TV & Audio': [
    { label: 'Demo wall powered & new-season sport loop running', done: false },
    { label: 'Soundbar attach prompt in place', done: false },
    { label: 'Shelf prices match promo', done: true },
  ],
  Gaming: [
    { label: 'Console bundle end cap built', done: false },
    { label: 'Demo console on & game loaded', done: false },
    { label: 'Age-restricted titles secured', done: true },
  ],
  Computing: [
    { label: 'Back-to-school bundle pinboard up', done: true },
    { label: 'Laptop tickets reprinted to promo price', done: false },
  ],
  'Mobile & Wearables': [
    { label: 'Trade-in kiosk online', done: true },
    { label: 'Cashback QR cards stocked', done: true },
  ],
  'Smart Home': [{ label: 'Display devices paired & demoing', done: true }],
  'Large Appliances': [
    { label: 'Cooling stack near entrance topped up', done: false },
    { label: 'Energy labels displayed', done: true },
  ],
  'Customer Service': [
    { label: 'Click & Collect staging tidy', done: true },
    { label: 'Returns desk manned', done: true },
  ],
}

function ChecklistCard({
  icon,
  title,
  steps,
  status,
  isDone,
  onToggle,
}: {
  icon: React.ReactNode
  title: string
  steps: { id: string; label: string; done: boolean }[]
  status: string
  isDone: (id: string, fallback: boolean) => boolean
  onToggle: (id: string, fallback: boolean) => void
}) {
  const done = steps.filter((s) => isDone(s.id, s.done)).length
  const allDone = done === steps.length
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {done}/{steps.length} · {allDone ? 'Complete' : status}
        </span>
      </div>
      <div className="mt-3 space-y-1">
        {steps.map((s) => {
          const d = isDone(s.id, s.done)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onToggle(s.id, s.done)}
              className="flex w-full items-center gap-3 py-1 text-left"
            >
              <Checkbox checked={d} className="pointer-events-none" />
              <span className={cn('text-sm', d && 'text-muted-foreground line-through')}>{s.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Checklists() {
  const tasks = useAppStore((s) => s.tasks)
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const store = STORE_BY_ID[activeStoreId]
  const storeTasks = tasksForStore(tasks, activeStoreId)
  const opening = storeTasks.find((t) => t.id === 'task-214-opening')
  const closing = storeTasks.find((t) => t.id === 'task-214-closing')

  // Ticked state lives locally — a colleague checks these off as they ready the
  // floor for trade. Each item falls back to its seeded value until toggled.
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const isDone = (id: string, fallback: boolean) => checked[id] ?? fallback
  const readinessKey = (dept: string, label: string) => `rd:${dept}:${label}`
  const deptDone = (dept: string) =>
    (READINESS[dept] ?? []).filter((c) => isDone(readinessKey(dept, c.label), c.done)).length

  function toggleStep(id: string, fallback: boolean) {
    setChecked((c) => ({ ...c, [id]: !(c[id] ?? fallback) }))
  }

  function toggleReadiness(dept: string, label: string) {
    const key = readinessKey(dept, label)
    const items = READINESS[dept] ?? []
    const wasAll = items.every((c) => isDone(readinessKey(dept, c.label), c.done))
    setChecked((c) => ({ ...c, [key]: !(c[key] ?? (items.find((i) => i.label === label)?.done ?? false)) }))
    const nowAll = items.every((c) =>
      c.label === label ? !isDone(key, c.done) : isDone(readinessKey(dept, c.label), c.done),
    )
    if (nowAll && !wasAll) toast.success(`${dept} ready for trade`, { description: 'All readiness checks complete.' })
  }

  // Overall shop-floor readiness — the headline that climbs as you tick.
  const allChecks = store.departments.flatMap((dept) => READINESS[dept] ?? [])
  const readyDone = store.departments.reduce((n, dept) => n + deptDone(dept), 0)
  const readyPct = allChecks.length ? Math.round((readyDone / allChecks.length) * 100) : 100

  return (
    <div className="space-y-5">
      <SectionHeading title="Checklists & department readiness" description="Tick off the daily routines and department standards as the floor gets ready for trade." />

      <div className="grid gap-3 md:grid-cols-2">
        {opening && (
          <ChecklistCard
            icon={<Sun className="size-4 text-warning" />}
            title="Opening checklist"
            status="Due"
            steps={opening.steps}
            isDone={isDone}
            onToggle={toggleStep}
          />
        )}
        {closing && (
          <ChecklistCard
            icon={<Moon className="size-4 text-primary" />}
            title="Closing checklist"
            status="Due at close"
            steps={closing.steps}
            isDone={isDone}
            onToggle={toggleStep}
          />
        )}
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Store className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Department readiness</h3>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            <span className={cn('tabular-nums', readyPct === 100 ? 'text-success' : 'text-foreground')}>{readyPct}%</span> ready for trade
          </span>
        </div>
        <div className="mb-3">
          <ProgressBar value={readyPct} tone={readyPct === 100 ? 'success' : readyPct >= 50 ? 'warning' : 'danger'} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {store.departments.map((dept) => {
            const checks = READINESS[dept] ?? []
            const done = deptDone(dept)
            const pct = checks.length ? Math.round((done / checks.length) * 100) : 100
            return (
              <div key={dept} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{dept}</span>
                  <StatusPill status={pct === 100 ? 'complete' : pct >= 50 ? 'in_progress' : 'not_started'} />
                </div>
                <div className="mt-2">
                  <ProgressBar value={pct} tone={pct === 100 ? 'success' : pct >= 50 ? 'warning' : 'danger'} />
                </div>
                <ul className="mt-3 space-y-1">
                  {checks.map((c) => {
                    const d = isDone(readinessKey(dept, c.label), c.done)
                    return (
                      <li key={c.label}>
                        <button
                          type="button"
                          onClick={() => toggleReadiness(dept, c.label)}
                          className="flex w-full items-center gap-2 py-0.5 text-left text-xs"
                        >
                          <Checkbox checked={d} className="pointer-events-none size-4" />
                          <span className={cn(d && 'text-muted-foreground line-through')}>{c.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
