import type { StoreKpi, FulfilmentLog } from '@/types'
import { KPI_BY_STORE } from '@/data/kpis'
import { STORES, REGIONS, storesInRegion } from '@/data/stores'
import { DEMO_NOW } from '@/data/now'

// Rollups + helpers for the role-scoped Scorecard. Everything is derived from
// data already in the app and always scoped to a set of store ids, so a store,
// region or estate scorecard only ever shows numbers for that scope.

export interface KpiRollup {
  salesVsTargetPct: number
  conversionPct: number
  attachRatePct: number
  carePlanAttachPct: number
  oosRatePct: number
  compliancePct: number
  csat: number
  salesTodayGBP: number
  onlineSharePct: number
  grossMarginPct: number
  morning: { compliancePct: number; attachRatePct: number; conversionPct: number }
}

/** Average the per-store KPIs across a scope (a single store, a region, or the estate). */
export function kpiRollup(storeIds: string[]): KpiRollup {
  const ks = storeIds.map((id) => KPI_BY_STORE[id]).filter(Boolean) as StoreKpi[]
  const avg = (f: (k: StoreKpi) => number) =>
    ks.length ? Math.round(ks.reduce((s, k) => s + f(k), 0) / ks.length) : 0
  return {
    salesVsTargetPct: avg((k) => k.salesVsTargetPct),
    conversionPct: avg((k) => k.conversionPct),
    attachRatePct: avg((k) => k.attachRatePct),
    carePlanAttachPct: avg((k) => k.carePlanAttachPct),
    oosRatePct: avg((k) => k.oosRatePct),
    compliancePct: avg((k) => k.compliancePct),
    csat: avg((k) => k.csat),
    salesTodayGBP: ks.reduce((s, k) => s + k.salesTodayGBP, 0),
    onlineSharePct: avg((k) => k.onlineSharePct),
    grossMarginPct: avg((k) => k.grossMarginPct),
    morning: {
      compliancePct: avg((k) => k.morning.compliancePct),
      attachRatePct: avg((k) => k.morning.attachRatePct),
      conversionPct: avg((k) => k.morning.conversionPct),
    },
  }
}

export interface RecoveredSummary {
  count: number
  sum: number
}

/** Out-of-stock rescues attributed to the stores in scope (where the sale started). */
export function recoveredForStores(fulfilments: FulfilmentLog[], storeIds: string[]): RecoveredSummary {
  const set = new Set(storeIds)
  const rel = fulfilments.filter((f) => set.has(f.fromStoreId))
  return { count: rel.length, sum: rel.reduce((s, f) => s + f.valueGBP, 0) }
}

export interface TrendPoint {
  label: string
  value: number
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TREND_LEN = 7

/** Weekday labels for the rolling 7-day window ending on the demo clock (the last point is "Today"). */
const TREND_DAYS = Array.from({ length: TREND_LEN }, (_, i) => {
  const daysAgo = TREND_LEN - 1 - i
  if (daysAgo === 0) return 'Today'
  const d = new Date(DEMO_NOW)
  d.setDate(d.getDate() - daysAgo)
  return WEEKDAY[d.getDay()]
})

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000
  return h
}

/**
 * A deterministic 7-point trend that ends exactly at `endValue` — the current,
 * real scoped number. The earlier points are illustrative (stable per build) so
 * the "7 days" view is credible without claiming precision the demo doesn't have.
 */
export function trendTo(endValue: number, seed: string, jitter = 4): TrendPoint[] {
  return TREND_DAYS.map((label, i) => {
    if (i === TREND_DAYS.length - 1) return { label, value: Math.round(endValue) }
    const drift = (TREND_DAYS.length - 1 - i) * 0.8
    const wobble = (hash(seed + i) % (jitter * 2 + 1)) - jitter
    return { label, value: Math.max(0, Math.round(endValue - drift + wobble)) }
  })
}

/** One-line, plain-English summary in the Copilot "Explain" voice. */
export function scorecardNarrative(o: {
  scopeLabel: string
  kpi: KpiRollup
  complianceDelta: number
  voc: number
  topIssue?: string
  recovered: RecoveredSummary
  completion: number
}): string {
  const dir = o.complianceDelta >= 0 ? '+' : ''
  const rescue =
    o.recovered.sum > 0
      ? `£${o.recovered.sum.toLocaleString('en-GB', { maximumFractionDigits: 0 })} recovered from out-of-stock rescues`
      : 'no out-of-stock rescues logged yet'
  const issue = o.topIssue ? ` The top customer issue is ${o.topIssue.toLowerCase()}.` : ''
  return `${o.scopeLabel}: sales ${o.kpi.salesVsTargetPct}% of target, conversion ${o.kpi.conversionPct}%, attach ${o.kpi.attachRatePct}%, compliance ${o.kpi.compliancePct}% (${dir}${o.complianceDelta} vs this morning). Customer sentiment ${o.voc}/100.${issue} ${o.completion}% of today's actions complete, with ${rescue}.`
}

export interface PeerBenchmark {
  rankLabel: string
  sub: string
}

/** Where a single store ranks among all stores on sales vs target. */
export function storePeerRank(storeId: string): PeerBenchmark {
  const ranked = [...STORES].sort(
    (a, b) => (KPI_BY_STORE[b.id]?.salesVsTargetPct ?? 0) - (KPI_BY_STORE[a.id]?.salesVsTargetPct ?? 0),
  )
  const rank = ranked.findIndex((s) => s.id === storeId) + 1
  return { rankLabel: rank ? `#${rank} of ${ranked.length}` : '—', sub: 'stores · sales vs target' }
}

/** Where a region ranks among all regions on average sales vs target. */
export function regionPeerRank(regionId: string): PeerBenchmark {
  const avgFor = (id: string) => kpiRollup(storesInRegion(id).map((s) => s.id)).salesVsTargetPct
  const ranked = [...REGIONS].sort((a, b) => avgFor(b.id) - avgFor(a.id))
  const rank = ranked.findIndex((r) => r.id === regionId) + 1
  return { rankLabel: rank ? `#${rank} of ${ranked.length}` : '—', sub: 'regions · sales vs target' }
}

/** The leading region by average sales vs target — the estate-level benchmark. */
export function topRegion(): PeerBenchmark {
  const avgFor = (id: string) => kpiRollup(storesInRegion(id).map((s) => s.id)).salesVsTargetPct
  const top = [...REGIONS].sort((a, b) => avgFor(b.id) - avgFor(a.id))[0]
  return { rankLabel: top?.name ?? '—', sub: 'leading region · sales vs target' }
}
