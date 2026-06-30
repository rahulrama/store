import { useAppStore } from '@/store/useAppStore'
import { tasksForStore } from '@/store/selectors'
import { STORE_BY_ID } from '@/data/stores'
import { SectionHeading, ProgressBar } from '@/components/shared/Stat'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusPill } from '@/components/shared/badges'
import { Sun, Moon, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

// Synthetic per-department readiness checks for the demo store.
const READINESS: Record<string, { label: string; done: boolean }[]> = {
  'TV & Audio': [
    { label: 'Demo wall powered & football loop running', done: false },
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
}: {
  icon: React.ReactNode
  title: string
  steps: { id: string; label: string; done: boolean }[]
  status: string
}) {
  const done = steps.filter((s) => s.done).length
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {done}/{steps.length} · {status}
        </span>
      </div>
      <div className="mt-3 space-y-1">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center gap-3 py-1">
            <Checkbox checked={s.done} disabled />
            <span className={cn('text-sm', s.done && 'text-muted-foreground line-through')}>{s.label}</span>
          </div>
        ))}
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

  return (
    <div className="space-y-5">
      <SectionHeading title="Checklists & department readiness" description="Daily trading routines and shop-floor standards." />

      <div className="grid gap-3 md:grid-cols-2">
        {opening && (
          <ChecklistCard
            icon={<Sun className="size-4 text-warning" />}
            title="Opening checklist"
            status={opening.status === 'complete' ? 'Complete' : 'Due'}
            steps={opening.steps}
          />
        )}
        {closing && (
          <ChecklistCard
            icon={<Moon className="size-4 text-primary" />}
            title="Closing checklist"
            status={closing.status === 'complete' ? 'Complete' : 'Due at close'}
            steps={closing.steps}
          />
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Store className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Department readiness</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {store.departments.map((dept) => {
            const checks = READINESS[dept] ?? []
            const done = checks.filter((c) => c.done).length
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
                <ul className="mt-3 space-y-1.5">
                  {checks.map((c) => (
                    <li key={c.label} className="flex items-center gap-2 text-xs">
                      <span className={cn('size-1.5 rounded-full', c.done ? 'bg-success' : 'bg-muted-foreground/40')} />
                      <span className={c.done ? 'text-muted-foreground' : ''}>{c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
