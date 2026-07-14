import { useState, type ReactNode } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { FeedbackSentiment } from '@/types'
import {
  AGE_BANDS,
  DEPARTMENT_OPTIONS,
  ISSUE_CATEGORIES,
  POSITIVE_DRIVERS,
  INTENT_STAGES,
  OUTCOMES,
} from '@/data/feedback'
import { PRODUCTS, PRODUCT_BY_SKU } from '@/data/products'
import { STORE_BY_ID, USER_BY_ID } from '@/data/stores'
import { feedbackForStore, sentimentScore, topIssues } from '@/engine/voiceOfCustomer'
import { SectionHeading } from '@/components/shared/Stat'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ExplainerBanner } from '@/components/help/ExplainerBanner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Frown, Meh, Smile, Send, ShieldCheck, X, MapPin } from 'lucide-react'

type Tone = 'danger' | 'warning' | 'success'
const SENTIMENTS: { value: FeedbackSentiment; label: string; icon: typeof Frown; tone: Tone }[] = [
  { value: 'negative', label: 'Negative', icon: Frown, tone: 'danger' },
  { value: 'neutral', label: 'Neutral', icon: Meh, tone: 'warning' },
  { value: 'positive', label: 'Positive', icon: Smile, tone: 'success' },
]
const SENT_ACTIVE: Record<Tone, string> = {
  danger: 'border-danger bg-danger/10 text-danger',
  warning: 'border-warning bg-warning/10 text-warning',
  success: 'border-success bg-success/10 text-success',
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      {hint && <p className="mb-1.5 -mt-1 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  )
}

export function Feedback() {
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const feedback = useAppStore((s) => s.feedback)
  const addFeedback = useAppStore((s) => s.addFeedback)
  const store = STORE_BY_ID[activeStoreId]
  const me = USER_BY_ID[currentUserId]

  const [sentiment, setSentiment] = useState<FeedbackSentiment | ''>('')
  const [department, setDepartment] = useState('')
  const [issues, setIssues] = useState<string[]>([])
  const [skus, setSkus] = useState<string[]>([])
  const [intent, setIntent] = useState('')
  const [outcome, setOutcome] = useState('')
  const [ageBand, setAgeBand] = useState('')
  const [notes, setNotes] = useState('')

  const issueOptions = sentiment === 'positive' ? POSITIVE_DRIVERS : ISSUE_CATEGORIES
  const canSubmit = sentiment !== '' && department !== '' && issues.length > 0
  const todays = feedbackForStore(feedback, activeStoreId)

  function pickSentiment(v: FeedbackSentiment) {
    setSentiment(v)
    setIssues([]) // the issue / positive vocabulary changes with sentiment
  }
  function toggleIssue(v: string) {
    setIssues((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))
  }
  function submit() {
    if (!canSubmit) return
    addFeedback({
      storeId: activeStoreId,
      sentiment: sentiment as FeedbackSentiment,
      department,
      skus,
      issues,
      intent: intent || undefined,
      outcome: outcome || undefined,
      ageBand: ageBand || undefined,
      notes: notes.trim() || undefined,
    })
    toast.success('Shared with your manager', {
      description: 'Captured anonymously — no personal details stored.',
    })
    setSentiment('')
    setDepartment('')
    setIssues([])
    setSkus([])
    setIntent('')
    setOutcome('')
    setAgeBand('')
    setNotes('')
  }

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Customer Feedback"
        description="Capture what a customer told you — takes about a minute."
      />
      <ExplainerBanner text="After you speak with a customer, log how it went. It rolls up to your manager, region and HQ so we can fix what's frustrating customers — no personal details are ever recorded." />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="size-3.5" /> {store.name} · #{store.code} · capturing as{' '}
        <span className="font-medium text-foreground">{me.name}</span>
      </div>

      <div className="space-y-5 rounded-lg border border-border bg-card p-4">
        {/* Sentiment */}
        <Field label="How did it go?">
          <div className="grid grid-cols-3 gap-2">
            {SENTIMENTS.map((s) => {
              const Icon = s.icon
              const active = sentiment === s.value
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => pickSentiment(s.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border p-3 text-sm font-medium transition-colors',
                    active ? SENT_ACTIVE[s.tone] : 'border-border hover:border-primary/40',
                  )}
                >
                  <Icon className="size-5" />
                  {s.label}
                </button>
              )
            })}
          </div>
        </Field>

        {/* Department */}
        <Field label="What were they looking at?">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENT_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Issues / positives */}
        <Field label={sentiment === 'positive' ? 'What went well?' : 'What was the issue?'}>
          {sentiment === '' ? (
            <p className="text-sm text-muted-foreground">Pick how it went first.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {issueOptions.map((o) => (
                <Chip key={o} selected={issues.includes(o)} onClick={() => toggleIssue(o)}>
                  {o}
                </Chip>
              ))}
            </div>
          )}
        </Field>

        {/* Products (optional) */}
        <Field label="Specific product(s)" hint="Optional — tag what they were interested in.">
          <Select value="" onValueChange={(v) => setSkus((cur) => (cur.includes(v) ? cur : [...cur, v]))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Add a product" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCTS.map((p) => (
                <SelectItem key={p.sku} value={p.sku}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {skus.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skus.map((sku) => (
                <span
                  key={sku}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs"
                >
                  {PRODUCT_BY_SKU[sku]?.name ?? sku}
                  <button type="button" onClick={() => setSkus((cur) => cur.filter((x) => x !== sku))}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        {/* Optional selects */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Where in the journey?">
            <Select value={intent} onValueChange={setIntent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                {INTENT_STAGES.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Outcome">
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                {OUTCOMES.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Age group">
            <Select value={ageBand} onValueChange={setAgeBand}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                {AGE_BANDS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Notes */}
        <Field label="Notes">
          <Textarea
            value={notes}
            maxLength={240}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did they say? Please don't record names or personal details."
          />
        </Field>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" /> No personally identifiable information is captured.
          </p>
          <Button onClick={submit} disabled={!canSubmit} className="gap-1.5">
            <Send className="size-4" /> Share feedback
          </Button>
        </div>
      </div>

      {/* Today at this store */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Today at {store.name}</h3>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl font-semibold tabular-nums">{todays.length}</div>
            <div className="text-xs text-muted-foreground">Captured</div>
          </div>
          <div>
            <div className="text-2xl font-semibold tabular-nums">{sentimentScore(todays)}</div>
            <div className="text-xs text-muted-foreground">Sentiment /100</div>
          </div>
          <div>
            <div className="truncate text-sm font-medium">{topIssues(todays)[0]?.label ?? '—'}</div>
            <div className="text-xs text-muted-foreground">Top issue</div>
          </div>
        </div>
      </div>
    </div>
  )
}
