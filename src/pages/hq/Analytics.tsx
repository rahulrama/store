import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import {
  COMPLETION_TREND,
  COMPLIANCE_TREND,
  STOCK_EXCEPTION_TREND,
} from '@/engine/analytics'
import { STORES } from '@/data/stores'
import { KPI_BY_STORE } from '@/data/kpis'
import { tasksForStore, openExceptions } from '@/store/selectors'
import { SectionHeading } from '@/components/shared/Stat'
import { Button } from '@/components/ui/button'
import { GraduationCap, ArrowRight } from 'lucide-react'

function ChartCard({
  title,
  children,
  hint,
}: {
  title: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const AXIS = { tick: { fontSize: 12 }, stroke: 'var(--muted-foreground)' }
const TOOLTIP = {
  contentStyle: { borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 },
}

export function Analytics() {
  const navigate = useNavigate()
  const tasks = useAppStore((s) => s.tasks)

  const coaching = STORES.map((store) => {
    const kpi = KPI_BY_STORE[store.id]
    const st = tasksForStore(tasks, store.id)
    return {
      store,
      compliance: kpi.compliancePct,
      attach: kpi.attachRatePct,
      exceptions: openExceptions(st).length,
    }
  })
    .filter((c) => c.compliance < 80 || c.exceptions > 0)
    .sort((a, b) => a.compliance - b.compliance)

  return (
    <div className="space-y-6">
      <SectionHeading title="Analytics" description="Execution trends and where to coach next." />

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Task completion rate" hint="Estate, last 6 days (%)">
          <LineChart data={COMPLETION_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" {...AXIS} />
            <YAxis domain={[70, 100]} {...AXIS} />
            <Tooltip {...TOOLTIP} />
            <Line type="monotone" dataKey="pct" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Compliance trend" hint="Estate, last 6 days (%)">
          <AreaChart data={COMPLIANCE_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="comp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--pillar-enablement)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--pillar-enablement)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" {...AXIS} />
            <YAxis domain={[70, 100]} {...AXIS} />
            <Tooltip {...TOOLTIP} />
            <Area type="monotone" dataKey="pct" stroke="var(--pillar-enablement)" strokeWidth={2.5} fill="url(#comp)" />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Stock exceptions" hint="Open stock exceptions, last 6 days">
          <BarChart data={STOCK_EXCEPTION_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" {...AXIS} />
            <YAxis {...AXIS} />
            <Tooltip {...TOOLTIP} />
            <Bar dataKey="count" fill="var(--pillar-stock)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      {/* Coaching */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <GraduationCap className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Stores needing coaching</h3>
        </div>
        <div className="divide-y divide-border">
          {coaching.map((c) => (
            <div key={c.store.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">
                  {c.store.name} · #{c.store.code}
                </p>
                <p className="text-xs text-muted-foreground">
                  Compliance {c.compliance}% · attach {c.attach}%
                  {c.exceptions > 0 && ` · ${c.exceptions} open exception${c.exceptions > 1 ? 's' : ''}`}
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/region/store/${c.store.id}`)}>
                Review <ArrowRight className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
