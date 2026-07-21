import type { Colleague } from '@/types'
import { COLLEAGUE_BY_ID, shiftsInStore } from '@/data/colleagues'

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000
  return h
}

export interface ColleagueContribution {
  tasksDone: number
  attachPct: number
  vocCaptures: number
}

/** Deterministic per-colleague day stats for the team view (synthetic but stable per build). */
export function colleagueContribution(colleagueId: string): ColleagueContribution {
  const h = hash(colleagueId)
  return {
    tasksDone: 2 + (h % 5), // 2..6
    attachPct: 24 + (h % 16), // 24..39
    vocCaptures: h % 4, // 0..3
  }
}

export interface CoverSuggestion {
  colleague: Colleague
  department: string
  reason: string
}

/**
 * Suggest the best available colleague to cover today's absence at a store —
 * same department first, then any available colleague. One clear recommendation,
 * not a list, so the redeploy call stays unambiguous.
 */
export function suggestCover(storeId: string): CoverSuggestion | null {
  const shifts = shiftsInStore(storeId)
  const absent = shifts.find((s) => s.status === 'absent')
  if (!absent) return null
  const available = shifts.filter(
    (s) => s.colleagueId !== absent.colleagueId && (s.status === 'clocked_in' || s.status === 'scheduled'),
  )
  const pick = available.find((s) => s.department === absent.department) ?? available[0]
  if (!pick) return null
  const colleague = COLLEAGUE_BY_ID[pick.colleagueId]
  if (!colleague) return null
  const when = pick.status === 'clocked_in' ? 'on shift now' : `on at ${pick.start}`
  const reason =
    pick.department === absent.department
      ? `${pick.department}, ${when}`
      : `${pick.department} · redeployable, ${when}`
  return { colleague, department: absent.department, reason }
}
