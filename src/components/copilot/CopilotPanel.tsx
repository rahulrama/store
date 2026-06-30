import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Search, ShoppingBag, ListChecks, Lightbulb, Send, Package, ShieldCheck } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { rankedOpenTasks, tasksForStore } from '@/store/selectors'
import { searchSops } from '@/data/sops'
import { recommendProducts } from '@/copilot/recommend'
import { RULE_BY_SIGNAL_TYPE } from '@/engine/signalsEngine'
import { STORE_BY_ID } from '@/data/stores'
import { PriorityBadge } from '@/components/shared/badges'
import { gbp } from '@/lib/format'
import { cn } from '@/lib/utils'

const ASK_EXAMPLES = [
  'How do I build a promo end-cap?',
  'What’s the age-restricted refusal process?',
  'How do I process a trade-in?',
  'Who do I contact for a broken fridge?',
]

const RECOMMEND_EXAMPLES = [
  'Laptop for a student doing video editing, around £700',
  'A TV for watching the football',
  'First gaming setup as a gift',
  'Something to keep cool in the heatwave',
]

export function CopilotPanel() {
  const open = useAppStore((s) => s.copilotOpen)
  const setOpen = useAppStore((s) => s.setCopilotOpen)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            wattsRus Copilot
          </SheetTitle>
          <SheetDescription>
            One assistant, five skills — runs entirely on this device over synthetic data.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="prioritise" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-4 mt-3 grid grid-cols-4">
            <TabsTrigger value="prioritise" className="gap-1 text-xs">
              <ListChecks className="size-3.5" /> Prioritise
            </TabsTrigger>
            <TabsTrigger value="ask" className="gap-1 text-xs">
              <Search className="size-3.5" /> Ask
            </TabsTrigger>
            <TabsTrigger value="recommend" className="gap-1 text-xs">
              <ShoppingBag className="size-3.5" /> Recommend
            </TabsTrigger>
            <TabsTrigger value="explain" className="gap-1 text-xs">
              <Lightbulb className="size-3.5" /> Explain
            </TabsTrigger>
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
            <TabsContent value="prioritise" className="mt-0">
              <PrioritiseTab />
            </TabsContent>
            <TabsContent value="ask" className="mt-0">
              <AskTab />
            </TabsContent>
            <TabsContent value="recommend" className="mt-0">
              <RecommendTab />
            </TabsContent>
            <TabsContent value="explain" className="mt-0">
              <ExplainTab />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function PrioritiseTab() {
  const navigate = useNavigate()
  const tasks = useAppStore((s) => s.tasks)
  const role = useAppStore((s) => s.role)
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const setOpen = useAppStore((s) => s.setCopilotOpen)

  const scoped = role === 'Store' ? tasksForStore(tasks, activeStoreId) : tasks
  const top = rankedOpenTasks(scoped).slice(0, 6)

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Today's highest-value actions, ranked by{' '}
        <span className="font-medium text-foreground">severity × £impact × deadline</span>.
      </p>
      {top.map((task) => (
        <button
          key={task.id}
          type="button"
          onClick={() => {
            setOpen(false)
            if (role === 'Store') navigate(`/store/task/${task.id}`)
            else navigate(`/region/store/${task.storeId}`)
          }}
          className="block w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
        >
          <div className="flex items-center justify-between gap-2">
            <PriorityBadge priority={task.priority} showLabel={false} />
            <span className="text-xs font-medium text-muted-foreground">
              {gbp(task.estImpactGBP, { compact: true })} at risk
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium">{task.title}</p>
          {role !== 'Store' && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {STORE_BY_ID[task.storeId]?.name} · #{STORE_BY_ID[task.storeId]?.code}
            </p>
          )}
        </button>
      ))}
    </div>
  )
}

function AskTab() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const results = useMemo(() => (submitted ? searchSops(submitted) : []), [submitted])
  const top = results[0]

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(query)
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Ask a how-to or policy question…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" size="icon">
          <Send className="size-4" />
        </Button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {ASK_EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setQuery(ex)
              setSubmitted(ex)
            }}
            className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
          >
            {ex}
          </button>
        ))}
      </div>

      {top && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">{top.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{top.summary}</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {top.steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
      {submitted && !top && (
        <p className="text-sm text-muted-foreground">No SOP found — try one of the examples above.</p>
      )}
    </div>
  )
}

function RecommendTab() {
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const result = useMemo(
    () => (submitted ? recommendProducts(submitted, activeStoreId) : undefined),
    [submitted, activeStoreId],
  )

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Clienteling — turn a customer need into in-stock matches and attach suggestions.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(query)
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="What is the customer looking for?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" size="icon">
          <Send className="size-4" />
        </Button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {RECOMMEND_EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setQuery(ex)
              setSubmitted(ex)
            }}
            className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
          >
            {ex}
          </button>
        ))}
      </div>

      {result && (
        <div className="space-y-3">
          {result.matches.length === 0 && (
            <p className="text-sm text-muted-foreground">No close matches — try rephrasing the need.</p>
          )}
          {result.matches.map((m, i) => (
            <div key={m.product.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {i === 0 && <Badge className="bg-primary text-primary-foreground">Best match</Badge>}
                    <span className="text-sm font-semibold">{m.product.name}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.product.blurb}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold">{gbp(m.product.price)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    m.inStock ? 'border-success/30 text-success' : 'border-danger/30 text-danger',
                  )}
                >
                  <Package className="mr-1 size-3" />
                  {m.inStock ? 'In stock here' : 'Out of stock'}
                </Badge>
                {m.reasons.slice(0, 2).map((r) => (
                  <span key={r} className="text-xs text-muted-foreground">
                    · {r}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {result.attach.length > 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Attach to grow the basket
              </p>
              <div className="mt-2 space-y-1.5">
                {result.attach.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span>{a.name}</span>
                    <span className="font-medium">{gbp(a.price)}</span>
                  </div>
                ))}
                {result.carePlanFor && (
                  <div className="flex items-center gap-1.5 pt-1 text-sm text-primary">
                    <ShieldCheck className="size-4" />
                    Offer a care &amp; protection plan on the {result.carePlanFor.name}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ExplainTab() {
  const ruleEntries = Object.entries(RULE_BY_SIGNAL_TYPE)
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <p className="text-sm">
          <strong>How prioritisation works.</strong> The Copilot reads operational signals from all 14
          task domains, then scores each with{' '}
          <span className="font-medium">severity × £ impact × deadline proximity</span> to produce the
          ranked daily actions. Every rule is transparent — no black box.
        </p>
      </div>
      {ruleEntries.map(([type, rule]) => (
        <div key={type} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-sm font-semibold">{type}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{rule}</p>
        </div>
      ))}
    </div>
  )
}
