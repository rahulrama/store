import type { Task, CustomerFeedback, FulfilmentLog } from '@/types'
import { kpiRollup, recoveredForStores } from '@/engine/reporting'
import { itemsForStores, stockSummary, availabilityAtRiskGBP, availabilityRisks } from '@/engine/stock'
import { sentimentScore, topIssues } from '@/engine/voiceOfCustomer'
import { completionRate, openExceptions, overdueTasks } from '@/store/selectors'
import { STORE_BY_ID } from '@/data/stores'
import { DEMO_NOW } from '@/data/now'
import { gbp } from '@/lib/format'

export interface AskContext {
  tasks: Task[]
  feedback: CustomerFeedback[]
  fulfilments: FulfilmentLog[]
}

export interface AskAnswer {
  /** True when the question matched a known metric; false returns the capability list. */
  matched: boolean
  metricLabel: string
  headline: string
  detail?: string
}

export const ASK_STORE_EXAMPLES = [
  'What’s at risk on stock right now?',
  'How are we tracking against sales target?',
  'What’s our compliance today?',
  'What’s the top customer complaint?',
  'How much have we recovered from out-of-stocks?',
  'What’s our attach rate?',
]

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w))

/**
 * A deterministic natural-language answer about a scope's live numbers. Nothing
 * leaves the device: every answer is computed from the same engines the pages use,
 * so "Ask your store" always agrees with the Scorecard and Stock views.
 */
export function askStore(query: string, storeIds: string[], ctx: AskContext): AskAnswer {
  const q = query.toLowerCase().trim()
  const idSet = new Set(storeIds)
  const kpi = kpiRollup(storeIds)
  const scopedTasks = ctx.tasks.filter((t) => idSet.has(t.storeId))
  const scopedFeedback = ctx.feedback.filter((f) => idSet.has(f.storeId))

  // Stock availability / at-risk
  if (has(q, 'stock', 'availab', 'risk', 'sold out', 'oos', 'shelf', 'replenish')) {
    const atRisk = availabilityAtRiskGBP(storeIds)
    const stock = stockSummary(itemsForStores(storeIds))
    const top = availabilityRisks(storeIds, 1)[0]
    const topStr = top
      ? ` Biggest gap: ${top.product?.name ?? top.sku} at ${STORE_BY_ID[top.storeId]?.name} (${gbp(top.valueAtRiskGBP, { compact: true })}).`
      : ''
    return {
      matched: true,
      metricLabel: 'Availability at risk',
      headline: `${gbp(atRisk, { compact: true })} of sales at risk from availability gaps.`,
      detail: `${stock.soldOutNoneOnOrder} line${stock.soldOutNoneOnOrder === 1 ? '' : 's'} sold out with nothing on order · ${stock.oosRatePct}% out-of-stock rate.${topStr}`,
    }
  }

  // Sales vs target / trading
  if (has(q, 'sales', 'target', 'trading', 'takings', 'revenue', 'turnover')) {
    return {
      matched: true,
      metricLabel: 'Sales vs target',
      headline: `${kpi.salesVsTargetPct}% of sales target.`,
      detail: `${gbp(kpi.salesTodayGBP, { compact: true })} taken so far today (inc VAT) · ${kpi.onlineSharePct}% online mix.`,
    }
  }

  // Gross margin / profit
  if (has(q, 'margin', 'profit')) {
    const marginGBP = Math.round((kpi.salesTodayGBP / 1.2) * (kpi.grossMarginPct / 100))
    return {
      matched: true,
      metricLabel: 'Gross margin',
      headline: `${kpi.grossMarginPct}% gross margin.`,
      detail: `About ${gbp(marginGBP, { compact: true })} gross profit on today’s sales (ex VAT).`,
    }
  }

  // Online / omnichannel
  if (has(q, 'online', 'omnichannel', 'click', 'collect', 'web')) {
    return {
      matched: true,
      metricLabel: 'Online mix',
      headline: `${kpi.onlineSharePct}% of sales are online or click & collect.`,
    }
  }

  // Compliance
  if (has(q, 'compliance', 'standards', 'audit')) {
    const delta = kpi.compliancePct - kpi.morning.compliancePct
    return {
      matched: true,
      metricLabel: 'Compliance',
      headline: `${kpi.compliancePct}% compliance.`,
      detail: `${delta >= 0 ? '+' : ''}${delta} point${Math.abs(delta) === 1 ? '' : 's'} vs this morning.`,
    }
  }

  // Conversion
  if (has(q, 'conversion', 'convert')) {
    return { matched: true, metricLabel: 'Conversion', headline: `${kpi.conversionPct}% conversion.` }
  }

  // Attach / accessories / care plan
  if (has(q, 'attach', 'accessor', 'care plan', 'careplan', 'protection')) {
    return {
      matched: true,
      metricLabel: 'Attach rate',
      headline: `${kpi.attachRatePct}% attach rate.`,
      detail: `${kpi.carePlanAttachPct}% care-plan attach.`,
    }
  }

  // Recovered sales / rescues
  if (has(q, 'recover', 'rescue', 'saved', 'save the sale', 'fulfil')) {
    const rec = recoveredForStores(ctx.fulfilments, storeIds)
    return {
      matched: true,
      metricLabel: 'Recovered sales',
      headline: `${gbp(rec.sum, { compact: true })} recovered from out-of-stock rescues.`,
      detail: `${rec.count} sale${rec.count === 1 ? '' : 's'} saved by sourcing from another store.`,
    }
  }

  // Customer sentiment / complaints / VoC
  if (has(q, 'customer', 'sentiment', 'voc', 'complaint', 'feedback', 'issue', 'happy', 'unhappy', 'review')) {
    const voc = sentimentScore(scopedFeedback)
    const issue = topIssues(scopedFeedback)[0]
    return {
      matched: true,
      metricLabel: 'Voice of customer',
      headline: `Customer sentiment ${voc}/100.`,
      detail: issue
        ? `Top issue: ${issue.label.toLowerCase()} (${issue.count} mention${issue.count === 1 ? '' : 's'}).`
        : 'No issues logged.',
    }
  }

  // Actions / tasks / workload
  if (has(q, 'task', 'action', 'to do', 'todo', 'workload', 'overdue', 'exception', 'priorit', 'busy')) {
    const completion = completionRate(scopedTasks)
    const open = scopedTasks.filter((t) => t.status !== 'complete').length
    const overdue = overdueTasks(scopedTasks, DEMO_NOW).length
    const exceptions = openExceptions(scopedTasks).length
    return {
      matched: true,
      metricLabel: 'Actions today',
      headline: `${open} open action${open === 1 ? '' : 's'} · ${completion}% complete.`,
      detail: `${overdue} overdue · ${exceptions} exception${exceptions === 1 ? '' : 's'} on SLA.`,
    }
  }

  // Fallback — list what it can answer.
  return {
    matched: false,
    metricLabel: 'Ask your store',
    headline:
      'I can answer on stock risk, sales vs target, margin, online mix, compliance, conversion, attach rate, recovered sales, customer sentiment and today’s actions.',
    detail: 'Try one of the suggestions below.',
  }
}
