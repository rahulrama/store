import type { Priority, Severity } from '@/types'
import { DEMO_NOW } from '@/data/now'

const SEVERITY_WEIGHT: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

/** Hours until due, by severity — drives both the due time and the urgency. */
export const DUE_HOURS_BY_SEVERITY: Record<Severity, number> = {
  critical: 1,
  high: 2,
  medium: 4,
  low: 8,
}

function impactWeight(estImpactGBP: number): number {
  if (estImpactGBP >= 3000) return 3
  if (estImpactGBP >= 1500) return 2
  if (estImpactGBP >= 500) return 1
  return 0
}

function deadlineBonus(dueAt: string): number {
  const mins = (new Date(dueAt).getTime() - DEMO_NOW.getTime()) / 60_000
  if (mins <= 60) return 6
  if (mins <= 120) return 4
  if (mins <= 240) return 2
  return 0
}

export interface PriorityResult {
  score: number
  band: Priority
}

/**
 * Transparent priority score = severity × impact × deadline proximity.
 * Shown to users on the priority card so the ranking is explainable.
 */
export function computePriority(
  severity: Severity,
  estImpactGBP: number,
  dueAt: string,
): PriorityResult {
  const score =
    SEVERITY_WEIGHT[severity] * 10 + impactWeight(estImpactGBP) * 5 + deadlineBonus(dueAt)
  let band: Priority = 'P3'
  if (score >= 34) band = 'P1'
  else if (score >= 20) band = 'P2'
  return { score, band }
}

export function priorityLabel(band: Priority): string {
  switch (band) {
    case 'P1':
      return 'Critical'
    case 'P2':
      return 'High'
    case 'P3':
      return 'Routine'
  }
}
