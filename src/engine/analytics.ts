import type { PillarId, Task } from '@/types'
import { PILLARS } from '@/data/domains'
import { STORE_KPIS, KPI_BY_STORE } from '@/data/kpis'
import { STORES } from '@/data/stores'

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n))
}

// Seeded baseline health per pillar — Trading & Stock intentionally dip so the
// control tower tells a story on the demo day.
const PILLAR_BASE: Record<PillarId, number> = {
  people: 88,
  trading: 79,
  stock: 77,
  risk: 90,
  enablement: 85,
}

function isOpenException(t: Task): boolean {
  return t.status === 'escalated' || t.status === 'blocked'
}

export function pillarHealth(pillarId: PillarId, tasks: Task[]): number {
  const inPillar = tasks.filter((t) => t.pillarId === pillarId)
  const exceptions = inPillar.filter(isOpenException).length
  const completed = inPillar.filter((t) => t.status === 'complete').length
  return Math.round(clamp(PILLAR_BASE[pillarId] - exceptions * 3 + completed * 2))
}

export interface PillarHealth {
  pillarId: PillarId
  name: string
  color: string
  pct: number
}

export function allPillarHealth(tasks: Task[]): PillarHealth[] {
  return PILLARS.map((p) => ({
    pillarId: p.id,
    name: p.name,
    color: p.color,
    pct: pillarHealth(p.id, tasks),
  }))
}

export function estateHealthScore(tasks: Task[]): number {
  return Math.round(avg(PILLARS.map((p) => pillarHealth(p.id, tasks))))
}

export interface StoreRisk {
  storeId: string
  reasons: string[]
}

export function storesAtRisk(tasks: Task[]): StoreRisk[] {
  const risks: StoreRisk[] = []
  for (const store of STORES) {
    const kpi = KPI_BY_STORE[store.id]
    const reasons: string[] = []
    if (kpi.compliancePct < 70) reasons.push(`Compliance ${kpi.compliancePct}%`)
    if (kpi.salesVsTargetPct < 85) reasons.push(`Sales ${kpi.salesVsTargetPct}% of target`)
    const openCrit = tasks.filter(
      (t) => t.storeId === store.id && isOpenException(t) && (t.priority === 'P1' || t.escalation),
    )
    if (openCrit.length > 0) reasons.push(`${openCrit.length} open exception${openCrit.length > 1 ? 's' : ''}`)
    if (kpi.oosRatePct >= 11) reasons.push(`Out-of-stock ${kpi.oosRatePct}%`)
    if (reasons.length > 0) risks.push({ storeId: store.id, reasons })
  }
  return risks
}

// ── Impact since morning ────────────────────────────────────────────────────
// Estate-wide actions already cleared earlier today (baseline), so the headline
// reads healthily and still moves as the user completes tasks live.
const BASELINE_ACTIONS = 11
const BASELINE_RISK = 4200
const COMPLIANCE_MORNING = 79

export interface ImpactSummary {
  actionsCompleted: number
  riskMitigatedGBP: number
  complianceMorning: number
  complianceNow: number
  openExceptionsMorning: number
  openExceptionsNow: number
  attachActions: number
}

export function impactSinceMorning(tasks: Task[]): ImpactSummary {
  const completed = tasks.filter((t) => t.status === 'complete')
  const complianceContribution = completed.filter(
    (t) => t.pillarId === 'trading' || t.pillarId === 'risk',
  ).length
  const openExceptionsNow = tasks.filter(isOpenException).length
  const attachActions = completed.filter((t) => t.domainId === 'task-execution').length

  return {
    actionsCompleted: BASELINE_ACTIONS + completed.length,
    riskMitigatedGBP: BASELINE_RISK + completed.reduce((sum, t) => sum + t.estImpactGBP, 0),
    complianceMorning: COMPLIANCE_MORNING,
    complianceNow: Math.round(clamp(COMPLIANCE_MORNING + 3 + complianceContribution * 1.2)),
    openExceptionsMorning: 9,
    openExceptionsNow,
    attachActions,
  }
}

// ── Trend series for analytics charts (synthetic but stable) ────────────────
export const COMPLETION_TREND = [
  { day: 'Sun', pct: 80 },
  { day: 'Mon', pct: 82 },
  { day: 'Tue', pct: 85 },
  { day: 'Wed', pct: 83 },
  { day: 'Thu', pct: 88 },
  { day: 'Fri', pct: 86 },
  { day: 'Today', pct: 91 },
]

export const COMPLIANCE_TREND = [
  { day: 'Sun', pct: 78 },
  { day: 'Mon', pct: 80 },
  { day: 'Tue', pct: 81 },
  { day: 'Wed', pct: 79 },
  { day: 'Thu', pct: 83 },
  { day: 'Fri', pct: 84 },
  { day: 'Today', pct: 86 },
]

export const STOCK_EXCEPTION_TREND = [
  { day: 'Mon', count: 18 },
  { day: 'Tue', count: 15 },
  { day: 'Wed', count: 21 },
  { day: 'Thu', count: 14 },
  { day: 'Fri', count: 17 },
  { day: 'Today', count: 12 },
]

export function avgCompliance(): number {
  return Math.round(avg(STORE_KPIS.map((k) => k.compliancePct)))
}
