import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { USER_BY_ID } from '@/data/stores'
import { feedbackForRegion, sentimentScore, topIssues } from '@/engine/voiceOfCustomer'
import { DemoBadge } from '@/components/shared/DemoBadge'
import { MessageSquare, ChevronRight, TrendingUp } from 'lucide-react'

/** First-party in-store sentiment — the internal complement to the Social Pulse card. */
export function VoiceOfCustomerCard() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const feedback = useAppStore((s) => s.feedback)

  const isRegional = role === 'Regional'
  const scoped = isRegional
    ? feedbackForRegion(feedback, USER_BY_ID[currentUserId]?.regionId ?? 'r-north')
    : feedback
  const score = sentimentScore(scoped)
  const issues = topIssues(scoped)
  const target = isRegional ? '/region/voice' : '/hq/voice'
  const recentNote = scoped.find((e) => e.notes)
  const positives = scoped.filter((e) => e.sentiment === 'positive').length
  const positivePct = scoped.length ? Math.round((positives / scoped.length) * 100) : 0

  return (
    <div className="rounded-lg border border-border bg-card">
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(target)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(target)
          }
        }}
        className="flex w-full cursor-pointer items-center gap-2 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MessageSquare className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Voice of customer</h3>
        <DemoBadge className="ml-auto" />
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <Metric label="VoC sentiment" value={`${score}`} suffix="/100" />
        <Metric label="Captured" value={`${scoped.length}`} />
        <Metric label="Positive" value={`${positivePct}%`} />
      </div>

      <div className="px-4 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Top issues</p>
        <div className="space-y-1.5">
          {issues.slice(0, 3).map((i) => (
            <div key={i.label} className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate">{i.label}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <TrendingUp className="size-3" /> {i.count}
              </span>
            </div>
          ))}
          {issues.length === 0 && <p className="text-sm text-muted-foreground">No issues logged.</p>}
        </div>
      </div>

      {recentNote && (
        <div className="border-t border-border px-4 py-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Latest note</p>
          <p className="text-sm text-foreground/90">“{recentNote.notes}”</p>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-lg font-semibold tabular-nums">{value}</span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  )
}
