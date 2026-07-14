import { useAppStore } from '@/store/useAppStore'
import type { CustomerFeedback } from '@/types'
import { STORE_BY_ID, USER_BY_ID, REGION_BY_ID } from '@/data/stores'
import {
  sentimentScore,
  topIssues,
  topPraise,
  byDepartment,
  byAgeBand,
  feedbackForRegion,
  feedbackClusters,
  type LabelCount,
  type FeedbackCluster,
} from '@/engine/voiceOfCustomer'
import { SectionHeading, KpiStat, ScoreRing } from '@/components/shared/Stat'
import { ExplainerBanner } from '@/components/help/ExplainerBanner'
import { LabelWithHelp } from '@/components/help/HelpTip'
import { relativeToNow } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { MessageSquare, Frown, TriangleAlert, ThumbsUp, ArrowRight } from 'lucide-react'

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-44 shrink-0 truncate text-sm">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${max ? (count / max) * 100 : 0}%` }} />
      </div>
      <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">{count}</span>
    </div>
  )
}

function BarList({ title, rows }: { title: string; rows: LabelCount[] }) {
  const max = rows[0]?.count ?? 0
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.slice(0, 6).map((r) => (
            <BarRow key={r.label} label={r.label} count={r.count} max={max} />
          ))}
        </div>
      )}
    </div>
  )
}

const SENT_DOT: Record<CustomerFeedback['sentiment'], string> = {
  negative: 'bg-danger',
  neutral: 'bg-warning',
  positive: 'bg-success',
}

export function VoiceOfCustomer() {
  const role = useAppStore((s) => s.role)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const feedback = useAppStore((s) => s.feedback)
  const createTask = useAppStore((s) => s.createTask)

  const isRegional = role === 'Regional'
  const regionId = USER_BY_ID[currentUserId]?.regionId ?? 'r-north'
  const scoped = isRegional ? feedbackForRegion(feedback, regionId) : feedback

  const score = sentimentScore(scoped)
  const issues = topIssues(scoped)
  const praise = topPraise(scoped)
  const depts = byDepartment(scoped)
  const ages = byAgeBand(scoped)
  const clusters = feedbackClusters(scoped)
  const negatives = scoped.filter((e) => e.sentiment === 'negative').length
  const recent = [...scoped].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt)).slice(0, 8)

  function raise(c: FeedbackCluster) {
    createTask({
      title: `Service recovery — ${c.issue}`,
      rationale: `${c.count} customers at ${STORE_BY_ID[c.storeId].name} flagged "${c.issue}". Investigate and close the loop.`,
      domainId: 'returns-service',
      storeId: c.storeId,
      priority: 'P2',
      evidenceRequired: false,
      estImpactGBP: c.count * 300,
    })
    toast.success('Service-recovery task raised', {
      description: `${STORE_BY_ID[c.storeId].name} · ${c.issue}`,
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Voice of Customer"
        description={
          isRegional
            ? `${REGION_BY_ID[regionId].name} region · in-store customer sentiment`
            : 'Estate-wide · first-party customer sentiment captured in store'
        }
      />
      <ExplainerBanner text="Structured, PII-free feedback captured by colleagues after they speak with customers. This is your first-party sentiment — the internal complement to the external Social Pulse." />

      {/* Headline */}
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
          <ScoreRing value={score} label="Sentiment" size={104} />
          <div>
            <p className="text-sm font-semibold"><LabelWithHelp helpId="vocSentiment">VoC sentiment</LabelWithHelp></p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Average across {scoped.length} captured conversations.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiStat label="Captured" value={scoped.length} icon={<MessageSquare className="size-4" />} />
          <KpiStat label="Negative" value={negatives} tone={negatives ? 'danger' : 'success'} icon={<Frown className="size-4" />} />
          <KpiStat label="Positive" value={scoped.filter((e) => e.sentiment === 'positive').length} tone="success" icon={<ThumbsUp className="size-4" />} />
          <KpiStat label={<LabelWithHelp helpId="issueClusters">Issue clusters</LabelWithHelp>} value={clusters.length} tone={clusters.length ? 'warning' : 'success'} icon={<TriangleAlert className="size-4" />} />
        </div>
      </div>

      {/* Clusters → service recovery */}
      {clusters.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2 border-b border-warning/20 px-4 py-3">
            <TriangleAlert className="size-4 text-warning" />
            <h3 className="text-sm font-semibold">Recommended service-recovery actions</h3>
          </div>
          <div className="divide-y divide-border">
            {clusters.map((c) => (
              <div key={`${c.storeId}-${c.issue}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {c.count}× “{c.issue}” at {STORE_BY_ID[c.storeId].name}
                  </p>
                  <p className="text-xs text-muted-foreground">Clustering feedback — raise a follow-up to close the loop.</p>
                </div>
                <button
                  type="button"
                  onClick={() => raise(c)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/30 bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Raise task <ArrowRight className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdowns */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BarList title="Top issues" rows={issues} />
        <BarList title="What's going well" rows={praise} />
        <BarList title="By department" rows={depts} />
        <BarList title="By age group" rows={ages} />
      </div>

      {/* Recent feedback */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <MessageSquare className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Recent feedback</h3>
        </div>
        <div className="divide-y divide-border">
          {recent.map((e) => (
            <div key={e.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn('size-2 rounded-full', SENT_DOT[e.sentiment])} />
                  <span className="text-xs font-medium">
                    {STORE_BY_ID[e.storeId].name} · {e.department}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">{relativeToNow(e.capturedAt)}</span>
              </div>
              {e.notes && <p className="mt-1 text-sm text-foreground/90">{e.notes}</p>}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {e.issues.map((i) => (
                  <span key={i} className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
