import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { recommendProducts } from '@/copilot/recommend'
import { STORE_BY_ID } from '@/data/stores'
import { SectionHeading } from '@/components/shared/Stat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { gbp } from '@/lib/format'
import { Send, Package, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react'

const EXAMPLES = [
  'Laptop for a student doing video editing, around £700',
  'A big TV for watching the football',
  'First gaming setup as a birthday gift',
  'Something to keep cool in the heatwave',
  'A phone with a great camera, trade-in my old one',
]

export function Assist() {
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const store = STORE_BY_ID[activeStoreId]
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const result = useMemo(
    () => (submitted ? recommendProducts(submitted, activeStoreId) : undefined),
    [submitted, activeStoreId],
  )

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Customer Assist — Copilot clienteling"
        description="Turn what a customer asks into in-stock matches, with attach and care-plan prompts."
      />

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" /> The same Copilot that runs your day also helps you sell.
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(query)
          }}
          className="mt-3 flex gap-2"
        >
          <Input
            placeholder="Describe what the customer is looking for…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-card"
          />
          <Button type="submit" className="gap-1.5">
            <Send className="size-4" /> Find
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuery(ex)
                setSubmitted(ex)
              }}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {!result && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
          <ShoppingBag className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Ask in plain English</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            The Copilot matches against {store.name}'s live stock and suggests the right add-ons.
          </p>
        </div>
      )}

      {result && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Matches */}
          <div className="space-y-3 lg:col-span-2">
            <h3 className="text-sm font-semibold">
              Recommended for “{result.query}”
              {result.budget && <span className="text-muted-foreground"> · ~{gbp(result.budget)} budget</span>}
            </h3>
            {result.matches.length === 0 && (
              <p className="text-sm text-muted-foreground">No close matches — try rephrasing the need.</p>
            )}
            {result.matches.map((m, i) => (
              <div key={m.product.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {i === 0 && <Badge className="bg-primary text-primary-foreground">Best match</Badge>}
                      <h4 className="text-base font-semibold">{m.product.name}</h4>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{m.product.blurb}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(m.inStock ? 'border-success/30 text-success' : 'border-danger/30 text-danger')}
                      >
                        <Package className="mr-1 size-3" />
                        {m.inStock ? 'In stock here' : 'Out of stock'}
                      </Badge>
                      {m.reasons.map((r) => (
                        <span key={r} className="text-xs text-muted-foreground">· {r}</span>
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 text-lg font-semibold">{gbp(m.product.price)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Attach */}
          <div className="space-y-3">
            {result.attach.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Complete the basket
                </p>
                <div className="mt-2 space-y-2">
                  {result.attach.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span>{a.name}</span>
                      <span className="font-medium">{gbp(a.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.carePlanFor && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <ShieldCheck className="size-4" /> Offer a care &amp; protection plan
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Peace of mind on the {result.carePlanFor.name} — accidental damage & breakdown cover.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
