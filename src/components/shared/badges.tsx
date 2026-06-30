import type { DomainId, PillarId, Priority, TaskSource, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'
import { DOMAIN_BY_ID, PILLAR_BY_ID } from '@/data/domains'
import { SOURCE_BY_ID } from '@/data/sources'
import { useAppStore } from '@/store/useAppStore'
import type { SlaState } from '@/engine/sla'
import { priorityLabel } from '@/engine/priority'
import { Sparkles, FileText, Hand } from 'lucide-react'

const PILLAR_CLASSES: Record<PillarId, string> = {
  people: 'bg-pillar-people/10 text-pillar-people border-pillar-people/30',
  trading: 'bg-pillar-trading/10 text-pillar-trading border-pillar-trading/30',
  stock: 'bg-pillar-stock/10 text-pillar-stock border-pillar-stock/30',
  risk: 'bg-pillar-risk/10 text-pillar-risk border-pillar-risk/30',
  enablement: 'bg-pillar-enablement/10 text-pillar-enablement border-pillar-enablement/30',
}

export function PillarChip({ pillarId, className }: { pillarId: PillarId; className?: string }) {
  const pillar = PILLAR_BY_ID[pillarId]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        PILLAR_CLASSES[pillarId],
        className,
      )}
    >
      {pillar.name}
    </span>
  )
}

export function DomainChip({ domainId, className }: { domainId: DomainId; className?: string }) {
  const domain = DOMAIN_BY_ID[domainId]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground',
        className,
      )}
    >
      <span className="font-semibold text-foreground/70">{domain.index}</span>
      {domain.name}
    </span>
  )
}

const PRIORITY_CLASSES: Record<Priority, string> = {
  P1: 'bg-danger/10 text-danger border-danger/30',
  P2: 'bg-warning/10 text-warning border-warning/30',
  P3: 'bg-muted text-muted-foreground border-border',
}

export function PriorityBadge({ priority, showLabel = true }: { priority: Priority; showLabel?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold',
        PRIORITY_CLASSES[priority],
      )}
    >
      {priority}
      {showLabel && <span className="font-normal opacity-80">· {priorityLabel(priority)}</span>}
    </span>
  )
}

const STATUS_META: Record<TaskStatus, { label: string; className: string }> = {
  not_started: { label: 'Not started', className: 'bg-muted text-muted-foreground border-border' },
  in_progress: { label: 'In progress', className: 'bg-info/10 text-info border-info/30' },
  blocked: { label: 'Blocked', className: 'bg-warning/10 text-warning border-warning/30' },
  escalated: { label: 'Escalated', className: 'bg-danger/10 text-danger border-danger/30' },
  complete: { label: 'Complete', className: 'bg-success/10 text-success border-success/30' },
}

export function StatusPill({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', meta.className)}>
      {meta.label}
    </span>
  )
}

const SLA_CLASSES: Record<SlaState, string> = {
  on_track: 'bg-success/10 text-success border-success/30',
  at_risk: 'bg-warning/10 text-warning border-warning/30',
  breached: 'bg-danger/10 text-danger border-danger/30',
}

export function SlaChip({ state, label }: { state: SlaState; label: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium', SLA_CLASSES[state])}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

const SOURCE_ICON: Record<TaskSource, typeof Sparkles> = {
  ai: Sparkles,
  manual: Hand,
  template: FileText,
}

export function TaskSourceChip({ source }: { source: TaskSource }) {
  const Icon = SOURCE_ICON[source]
  const label = source === 'ai' ? 'Copilot' : source === 'manual' ? 'Manual' : 'Routine'
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
      <Icon className="size-3" />
      {label}
    </span>
  )
}

/** A clickable provenance tag that opens the Sources panel. */
export function SourceTag({ sourceId, className }: { sourceId?: string; className?: string }) {
  const setSourcesOpen = useAppStore((s) => s.setSourcesOpen)
  if (!sourceId) return null
  const source = SOURCE_BY_ID[sourceId]
  if (!source) return null
  return (
    <button
      type="button"
      onClick={() => setSourcesOpen(true)}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-dashed border-border px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary',
        className,
      )}
      title="Based on public category research — open Sources"
    >
      <FileText className="size-3" />
      Source: {source.name.split('—')[0].trim()}
    </button>
  )
}
