import { PILLARS, DOMAINS } from '@/data/domains'
import { TASK_TEMPLATES } from '@/data/taskTemplates'
import type { DemoDepth, PillarId } from '@/types'
import { SectionHeading } from '@/components/shared/Stat'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { Layers } from 'lucide-react'

const DEPTH_META: Record<DemoDepth, { label: string; className: string }> = {
  deep: { label: 'Deep in demo', className: 'border-success/40 text-success' },
  represented: { label: 'Represented', className: 'border-warning/40 text-warning' },
  catalogued: { label: 'Catalogued', className: 'border-muted-foreground/30 text-muted-foreground' },
}

const PILLAR_DOT: Record<PillarId, string> = {
  people: 'bg-pillar-people',
  trading: 'bg-pillar-trading',
  stock: 'bg-pillar-stock',
  risk: 'bg-pillar-risk',
  enablement: 'bg-pillar-enablement',
}

export function DomainCatalogue() {
  const setSourcesOpen = useAppStore((s) => s.setSourcesOpen)

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Operating model — 14 task domains"
        description="The canonical store operations taxonomy, grouped into 5 pillars. Every signal, task and KPI hangs off a domain."
        action={
          <button onClick={() => setSourcesOpen(true)} className="text-sm text-primary hover:underline">
            View sources
          </button>
        }
      />

      {PILLARS.map((pillar) => {
        const domains = DOMAINS.filter((d) => d.pillarId === pillar.id)
        return (
          <div key={pillar.id}>
            <div className="mb-3 flex items-center gap-2">
              <span className={cn('size-3 rounded-full', PILLAR_DOT[pillar.id])} />
              <h3 className="text-base font-semibold">{pillar.name}</h3>
              <span className="text-sm text-muted-foreground">— {pillar.blurb}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain) => {
                const templateCount = TASK_TEMPLATES.filter((t) => t.domainId === domain.id).length
                const depth = DEPTH_META[domain.depth]
                return (
                  <div key={domain.id} className="flex flex-col rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                          {domain.index}
                        </span>
                        <h4 className="text-sm font-semibold leading-tight">{domain.name}</h4>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('mt-2 w-fit', depth.className)}>
                      {depth.label}
                    </Badge>
                    <p className="mt-2 text-xs text-muted-foreground">{domain.blurb}</p>
                    <ul className="mt-3 space-y-1">
                      {domain.examples.slice(0, 4).map((ex) => (
                        <li key={ex} className="flex gap-1.5 text-xs text-foreground/80">
                          <span className="text-muted-foreground">•</span>
                          {ex}
                        </li>
                      ))}
                    </ul>
                    {templateCount > 0 && (
                      <div className="mt-auto flex items-center gap-1 pt-3 text-[11px] text-muted-foreground">
                        <Layers className="size-3" />
                        {templateCount} task template{templateCount > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
