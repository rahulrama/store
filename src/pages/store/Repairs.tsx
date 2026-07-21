import { useState, type ReactNode } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { SEED_REPAIRS } from '@/data/repairs'
import { assessRepair, DECISION_META, type RepairDecision } from '@/engine/repairs'
import { PRODUCT_BY_SKU } from '@/data/products'
import { SectionHeading } from '@/components/shared/Stat'
import { LabelWithHelp } from '@/components/help/HelpTip'
import { cn } from '@/lib/utils'
import { gbp, relativeToNow } from '@/lib/format'
import { toast } from 'sonner'
import {
  ClipboardList,
  Stethoscope,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  PoundSterling,
  type LucideIcon,
} from 'lucide-react'

function Panel({
  title,
  icon: Icon,
  helpId,
  children,
}: {
  title: string
  icon: LucideIcon
  helpId?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">
          {helpId ? <LabelWithHelp helpId={helpId}>{title}</LabelWithHelp> : title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Fig({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function ageLabel(months: number): string {
  const y = Math.floor(months / 12)
  const m = months % 12
  return `${y > 0 ? `${y}y ` : ''}${m}m old`
}

export function Repairs() {
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const cases = SEED_REPAIRS.filter((c) => c.storeId === activeStoreId)
  const [selectedId, setSelectedId] = useState(cases[0]?.id ?? '')
  const [resolved, setResolved] = useState<Record<string, RepairDecision>>({})

  const selected = cases.find((c) => c.id === selectedId) ?? cases[0]

  if (!selected) {
    return (
      <div className="space-y-6">
        <SectionHeading title="Repair Desk" description="Diagnose, check cover and resolve a repair — on one screen." />
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No open repair jobs for this store.
        </div>
      </div>
    )
  }

  const a = assessRepair(selected)
  const product = PRODUCT_BY_SKU[selected.sku]
  const meta = DECISION_META[a.decision]
  const done = resolved[selected.id]

  function resolve(decision: RepairDecision) {
    setResolved((r) => ({ ...r, [selected.id]: decision }))
    toast.success(DECISION_META[decision].done, {
      description: `${product?.name ?? selected.sku} · ${selected.ref}`,
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Repair Desk"
        description="Diagnose, check cover and resolve a repair — repair, replace or write-off — on one screen."
      />

      {/* Everything for a repair in one place */}
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wrench className="size-4" />
        </span>
        <div>
          <p className="flex items-center gap-1 text-sm font-semibold">
            <LabelWithHelp helpId="repairDesk">Everything for a repair in one place</LabelWithHelp>
          </p>
          <p className="text-xs text-muted-foreground">
            Screen the fault, get a repair / replace / write-off recommendation, check cover, and resolve — in a single flow.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Job list */}
        <div className="space-y-2">
          {cases.map((c) => {
            const ca = assessRepair(c)
            const cm = DECISION_META[ca.decision]
            const cp = PRODUCT_BY_SKU[c.sku]
            const cd = resolved[c.id]
            const active = c.id === selected.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  'block w-full rounded-lg border p-3 text-left transition-colors',
                  active ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{c.ref}</span>
                  <span className={cn('rounded-full border px-1.5 py-0.5 text-[10px] font-medium', cm.cls)}>
                    {cm.label}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-medium">{cp?.name ?? c.sku}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.fault} · {c.customer}
                </p>
                {cd && (
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-success">
                    <CheckCircle2 className="size-3" /> {DECISION_META[cd].done}
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* Detail — four consolidated panels */}
        <div className="space-y-4">
          {/* 1 — Intake & triage */}
          <Panel title="Intake & triage" icon={ClipboardList}>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{product?.name ?? selected.sku}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.category} · {selected.customer} · {selected.ref}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p>{ageLabel(selected.ageMonths)}</p>
                  <p>logged {relativeToNow(selected.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium">Reported fault</p>
                <p className="text-sm">{selected.fault}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium">Initial checks</p>
                <ul className="space-y-1">
                  {selected.symptoms.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="size-3.5 shrink-0 text-success" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          {/* 2 — Diagnosis & recommendation */}
          <Panel title="Diagnosis & recommendation" icon={Stethoscope} helpId="repairDecision">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full border px-2.5 py-1 text-sm font-semibold', meta.cls)}>{meta.label}</span>
                <span className="text-xs text-muted-foreground">recommended</span>
              </div>
              <p className="text-sm text-foreground/90">{a.rationale}</p>
              <div className="grid grid-cols-3 gap-3">
                <Fig label="Repair cost" value={gbp(a.repairCostGBP)} />
                <Fig label="Replacement" value={gbp(a.replacementValueGBP)} />
                <Fig label="Residual value" value={gbp(a.residualValueGBP)} />
              </div>
              {a.savingGBP > 0 && (
                <p className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">
                  <PoundSterling className="size-3" /> {gbp(a.savingGBP)} saved for the customer under cover
                </p>
              )}
            </div>
          </Panel>

          {/* 3 — Cover & entitlement */}
          <Panel title="Cover & entitlement" icon={ShieldCheck} helpId="repairCover">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className={cn('size-5 shrink-0', selected.cover.covered ? 'text-success' : 'text-muted-foreground')} />
                <div>
                  <p className="text-sm font-semibold">{selected.cover.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.cover.covered
                      ? selected.cover.excessGBP
                        ? `Covered · £${selected.cover.excessGBP} excess`
                        : 'Covered · no excess to the customer'
                      : 'Not covered for this fault'}
                  </p>
                </div>
              </div>
              {selected.cover.type === 'iD Mobile' && (
                <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  iD Mobile
                </span>
              )}
            </div>
          </Panel>

          {/* 4 — Resolve */}
          <Panel title="Resolve" icon={Wrench}>
            {done ? (
              <div className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-2 text-sm font-medium text-success">
                <CheckCircle2 className="size-4" /> {DECISION_META[done].done} · logged to job {selected.ref}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Recommended: <span className="font-medium text-foreground">{meta.action}</span>. Resolve in one tap — it’s captured straight to the job.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['repair', 'replace', 'write-off'] as RepairDecision[]).map((d) => {
                    const dm = DECISION_META[d]
                    const isRec = d === a.decision
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => resolve(d)}
                        className={cn(
                          'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                          isRec
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'border border-border bg-background hover:bg-muted',
                        )}
                      >
                        {dm.action}
                        {isRec ? ' · recommended' : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
