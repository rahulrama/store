import type { CustomerFeedback, FeedbackSentiment } from '@/types'
import { STORE_BY_ID } from '@/data/stores'

const SENTIMENT_SCORE: Record<FeedbackSentiment, number> = { negative: 0, neutral: 50, positive: 100 }

/** Average sentiment as a 0–100 score, comparable to the external Social Pulse. */
export function sentimentScore(entries: CustomerFeedback[]): number {
  if (!entries.length) return 0
  return Math.round(entries.reduce((s, e) => s + SENTIMENT_SCORE[e.sentiment], 0) / entries.length)
}

export function feedbackForStore(entries: CustomerFeedback[], storeId: string): CustomerFeedback[] {
  return entries.filter((e) => e.storeId === storeId)
}

export function feedbackForRegion(entries: CustomerFeedback[], regionId: string): CustomerFeedback[] {
  return entries.filter((e) => STORE_BY_ID[e.storeId]?.regionId === regionId)
}

export interface LabelCount {
  label: string
  count: number
}

function tally(entries: CustomerFeedback[], pick: (e: CustomerFeedback) => string[]): LabelCount[] {
  const m = new Map<string, number>()
  for (const e of entries) for (const l of pick(e)) if (l) m.set(l, (m.get(l) ?? 0) + 1)
  return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
}

/** Complaint categories from non-positive feedback, most common first. */
export function topIssues(entries: CustomerFeedback[]): LabelCount[] {
  return tally(entries.filter((e) => e.sentiment !== 'positive'), (e) => e.issues)
}

/** What's going well, from positive feedback. */
export function topPraise(entries: CustomerFeedback[]): LabelCount[] {
  return tally(entries.filter((e) => e.sentiment === 'positive'), (e) => e.issues)
}

export function byDepartment(entries: CustomerFeedback[]): LabelCount[] {
  return tally(entries, (e) => [e.department])
}

export function byAgeBand(entries: CustomerFeedback[]): LabelCount[] {
  return tally(entries, (e) => (e.ageBand ? [e.ageBand] : []))
}

export interface FeedbackCluster {
  storeId: string
  issue: string
  count: number
}

/**
 * Non-positive feedback of the same issue clustering at one store — the trigger
 * for a service-recovery follow-up (the existing NegativeFeedback signal rule).
 */
export function feedbackClusters(entries: CustomerFeedback[], threshold = 3): FeedbackCluster[] {
  const m = new Map<string, number>()
  for (const e of entries) {
    if (e.sentiment === 'positive') continue
    for (const issue of e.issues) {
      const key = `${e.storeId}::${issue}`
      m.set(key, (m.get(key) ?? 0) + 1)
    }
  }
  return [...m.entries()]
    .filter(([, c]) => c >= threshold)
    .map(([k, count]) => {
      const [storeId, issue] = k.split('::')
      return { storeId, issue, count }
    })
    .sort((a, b) => b.count - a.count)
}
