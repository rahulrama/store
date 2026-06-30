import type { Escalation, EscalationTarget } from '@/types'
import { DEMO_NOW } from '@/data/now'

export type SlaState = 'on_track' | 'at_risk' | 'breached'

export interface SlaStatus {
  state: SlaState
  /** Minutes remaining (negative if breached). */
  minutesRemaining: number
  dueAt: string
  label: string
}

/** Default SLA windows per escalation target, in hours. */
export const SLA_HOURS_BY_TARGET: Record<EscalationTarget, number> = {
  IT: 4,
  Facilities: 24,
  Stock: 8,
  Regional: 12,
  LossPrevention: 2,
  HR: 24,
}

export const TARGET_LABEL: Record<EscalationTarget, string> = {
  IT: 'IT Service Desk',
  Facilities: 'Facilities',
  Stock: 'Stock / Supply',
  Regional: 'Regional Manager',
  LossPrevention: 'Loss Prevention',
  HR: 'People / HR',
}

export function slaStatus(escalation: Escalation): SlaStatus {
  const started = new Date(escalation.startedAt).getTime()
  const dueMs = started + escalation.slaHours * 3_600_000
  const minutesRemaining = Math.round((dueMs - DEMO_NOW.getTime()) / 60_000)
  let state: SlaState = 'on_track'
  if (minutesRemaining < 0) state = 'breached'
  else if (minutesRemaining <= escalation.slaHours * 60 * 0.25) state = 'at_risk'

  const abs = Math.abs(minutesRemaining)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const span = h > 0 ? `${h}h ${m}m` : `${m}m`
  const label =
    state === 'breached' ? `Breached by ${span}` : state === 'at_risk' ? `${span} left` : `${span} left`

  return { state, minutesRemaining, dueAt: new Date(dueMs).toISOString(), label }
}
