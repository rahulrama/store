import { useNavigate } from 'react-router-dom'
import { PILLARS, DOMAINS } from '@/data/domains'
import { HELP } from '@/data/help'
import type { PillarId } from '@/types'
import { SectionHeading } from '@/components/shared/Stat'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useTourStore } from '@/store/useTourStore'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  PlayCircle,
  LayoutDashboard,
  Building2,
  Store as StoreIcon,
  Smartphone,
  Sparkles,
  ListChecks,
  Camera,
  TriangleAlert,
  TrendingUp,
  ShoppingBag,
  Truck,
  Boxes,
  MessageSquare,
  ClipboardList,
} from 'lucide-react'

const PILLAR_DOT: Record<PillarId, string> = {
  people: 'bg-pillar-people',
  trading: 'bg-pillar-trading',
  stock: 'bg-pillar-stock',
  risk: 'bg-pillar-risk',
  enablement: 'bg-pillar-enablement',
}

const PERSONAS = [
  {
    icon: LayoutDashboard,
    name: 'HQ / Central Ops',
    line: 'Sees the whole estate, sets direction and watches overall health.',
  },
  {
    icon: Building2,
    name: 'Regional Manager',
    line: 'Looks after a group of stores, clears blockers and coaches managers.',
  },
  {
    icon: StoreIcon,
    name: 'Store Manager',
    line: 'Runs a store — works the prioritised day and proves tasks are done.',
  },
  {
    icon: Smartphone,
    name: 'Store Colleague',
    line: 'On the shop floor on a phone — captures customer feedback and helps customers.',
  },
]

const CUSTOMER = [
  { icon: ShoppingBag, title: 'Recommend & attach', body: 'Turns “I need a laptop for uni” into the right in-stock match, plus accessories and a care plan.' },
  { icon: Truck, title: 'Save the sale', body: 'If it’s out of stock here, it sources it from the nearest store — reserve, same-day courier or ship-from-store — so the sale isn’t lost.' },
  { icon: Boxes, title: 'Stock at a glance', body: 'Weeks of supply and where every line stands, from a single store up to the whole estate.' },
  { icon: MessageSquare, title: 'Voice of Customer', body: 'Colleagues capture quick, anonymous feedback that rolls up so HQ can fix what frustrates customers.' },
  { icon: ClipboardList, title: 'Scorecards', body: 'A shareable, role-scoped snapshot of the numbers — print it or copy it in a click.' },
]

const FLOW = [
  { icon: Sparkles, title: 'Signals', body: 'Data from across the store becomes operational “alerts”.' },
  { icon: ListChecks, title: 'Prioritised actions', body: 'The Copilot ranks them into a clear daily to-do list.' },
  { icon: Camera, title: 'Proof', body: 'Colleagues complete tasks and capture evidence (a photo, a count).' },
  { icon: TriangleAlert, title: 'Escalation', body: 'Anything blocked is escalated to the right team on a clock (SLA).' },
  { icon: TrendingUp, title: 'Impact', body: 'Completed work rolls up into measurable results for the business.' },
]

const GLOSSARY_IDS = [
  'estateHealth',
  'priority',
  'valueAtRisk',
  'riskMitigated',
  'sla',
  'openExceptions',
  'compliance',
  'attachRate',
  'conversion',
  'oosRate',
  'weeksOfSupply',
  'csat',
  'evidence',
  'socialPulse',
  'vocSentiment',
  'recoveredSales',
  'scorecard',
  'pushToStore',
]

export function Guide() {
  const navigate = useNavigate()
  const startTour = useTourStore((s) => s.start)

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <SectionHeading
        title="Onboarding guide"
        description="New to the Store Operations Copilot? This is your plain-English guide to what everything means and how to use it."
        action={
          <Button className="gap-1.5" onClick={() => startTour('coached')}>
            <PlayCircle className="size-4" /> Take the guided tour
          </Button>
        }
      />

      {/* What it is */}
      <section className="rounded-lg border border-primary/15 bg-primary/5 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <BookOpen className="size-4" /> What is this tool?
        </div>
        <p className="mt-2 text-sm leading-relaxed">
          It’s a single place that turns everything happening across the stores into a short,
          prioritised list of <strong>what to do today</strong>. Instead of staff wading through
          reports and emails, the Copilot reads the operational data, works out what matters most,
          and hands each person a ranked plan — then tracks that the work actually gets done, with
          proof, and escalates anything that’s blocked.
        </p>
      </section>

      {/* The loop */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">How it works — the loop</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {FLOW.map((f, i) => (
            <div key={f.title} className="relative rounded-lg border border-border bg-card p-4">
              <span className="absolute right-3 top-3 text-xs font-bold text-muted-foreground/40">
                {i + 1}
              </span>
              <f.icon className="size-5 text-primary" />
              <p className="mt-2 text-sm font-semibold">{f.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Personas */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">The four views</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((p) => (
            <div key={p.name} className="rounded-lg border border-border bg-card p-4">
              <p.icon className="size-5 text-primary" />
              <p className="mt-2 text-sm font-semibold">{p.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{p.line}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Switch between them with the HQ / Region / Store / Colleague buttons at the top-left. It’s
          the same platform, just the right view for each role.
        </p>
      </section>

      {/* Customer-facing skills */}
      <section>
        <h3 className="mb-1 text-sm font-semibold">What the Copilot does for customers</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Beyond running the day, the same Copilot helps win and keep the sale: a customer need
          becomes a recommendation, an out-of-stock line is sourced from another store, and how
          customers feel feeds back in.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CUSTOMER.map((c) => (
            <div key={c.title} className="rounded-lg border border-border bg-card p-4">
              <c.icon className="size-5 text-primary" />
              <p className="mt-2 text-sm font-semibold">{c.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars & domains */}
      <section>
        <h3 className="mb-1 text-sm font-semibold">The operating model — 5 themes, 14 job areas</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Every job a store does belongs to one of 14 areas, grouped into five themes. This is how
          the tool organises work and measures health.
        </p>
        <div className="space-y-3">
          {PILLARS.map((pillar) => {
            const domains = DOMAINS.filter((d) => d.pillarId === pillar.id)
            return (
              <div key={pillar.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <span className={cn('size-3 rounded-full', PILLAR_DOT[pillar.id])} />
                  <span className="text-sm font-semibold">{pillar.name}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{pillar.blurb}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {domains.map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      <span className="font-semibold text-foreground/70">{d.index}</span>
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => navigate('/domains')}>
          See the full domain catalogue
        </Button>
      </section>

      {/* Glossary */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Glossary — what the numbers mean</h3>
        <Accordion type="single" collapsible className="rounded-lg border border-border bg-card">
          {GLOSSARY_IDS.map((id) => {
            const entry = HELP[id]
            if (!entry) return null
            return (
              <AccordionItem key={id} value={id} className="border-b border-border px-4 last:border-b-0">
                <AccordionTrigger className="text-sm font-medium">{entry.term}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">{entry.body}</p>
                  {entry.whatToDo && (
                    <p className="mt-2 rounded-md bg-primary/5 p-2 text-xs">
                      <span className="font-medium text-primary">What to do: </span>
                      {entry.whatToDo}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </section>

      {/* Footer CTA */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <div>
          <p className="text-sm font-semibold">Ready to try it?</p>
          <p className="text-xs text-muted-foreground">
            Take the guided tour, or jump straight into a store’s daily brief.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => startTour('coached')}>
            <PlayCircle className="size-4" /> Guided tour
          </Button>
          <Button className="gap-1.5" onClick={() => navigate('/store')}>
            <StoreIcon className="size-4" /> Open a store
          </Button>
        </div>
      </section>
    </div>
  )
}
