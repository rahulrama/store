import type { RepairCase } from '@/types'
import { PRODUCT_BY_SKU } from '@/data/products'

export type RepairDecision = 'repair' | 'replace' | 'write-off'

export interface RepairAssessment {
  decision: RepairDecision
  covered: boolean
  replacementValueGBP: number
  residualValueGBP: number
  repairCostGBP: number
  /** Value protected for the customer by their cover (0 when uncovered). */
  savingGBP: number
  rationale: string
}

// Straight-line depreciation horizon for a consumer-electronics residual value.
const DEPRECIATION_MONTHS = 60

/** What the unit is worth today given its age (floored at 10% of replacement). */
export function residualValue(replacementGBP: number, ageMonths: number): number {
  return Math.round(replacementGBP * Math.max(0.1, 1 - ageMonths / DEPRECIATION_MONTHS))
}

/**
 * Repair / replace / write-off recommendation from repair cost, replacement
 * value, age (residual) and cover. Deterministic so the desk always agrees with
 * itself — the whole diagnosis in one call.
 */
export function assessRepair(c: RepairCase): RepairAssessment {
  const replacement = Math.round(PRODUCT_BY_SKU[c.sku]?.price ?? 0)
  const residual = residualValue(replacement, c.ageMonths)
  const covered = c.cover.covered
  let decision: RepairDecision
  let rationale: string

  if (covered && c.repairable) {
    decision = 'repair'
    rationale = c.cover.excessGBP
      ? `Covered by ${c.cover.label} — repair authorised for a £${c.cover.excessGBP} excess.`
      : `Covered by ${c.cover.label} — repair authorised at no cost to the customer.`
  } else if (covered) {
    decision = 'replace'
    rationale = `Covered by ${c.cover.label}, but the fault isn't economically repairable — authorised for a like-for-like replacement.`
  } else if (c.repairCostGBP <= 0.5 * residual) {
    decision = 'repair'
    rationale = `Out of cover, but the £${c.repairCostGBP} repair is well below the unit's current value (£${residual}) — worth repairing.`
  } else if (residual >= 0.45 * replacement) {
    decision = 'replace'
    rationale = `The £${c.repairCostGBP} repair isn't economical, but the unit still holds value (£${residual}) — replacement is the better outcome.`
  } else {
    decision = 'write-off'
    rationale = `An ageing unit (£${residual} residual) with an uneconomic £${c.repairCostGBP} repair and no cover — recommend write-off and goodwill.`
  }

  const savingGBP = !covered
    ? 0
    : decision === 'replace'
      ? replacement
      : Math.max(0, c.repairCostGBP - (c.cover.excessGBP ?? 0))

  return {
    decision,
    covered,
    replacementValueGBP: replacement,
    residualValueGBP: residual,
    repairCostGBP: c.repairCostGBP,
    savingGBP,
    rationale,
  }
}

/** Labels, action verbs and tone for each decision — shared by the Repair Desk UI. */
export const DECISION_META: Record<
  RepairDecision,
  { label: string; action: string; done: string; cls: string }
> = {
  repair: {
    label: 'Repair',
    action: 'Book repair',
    done: 'Repair booked',
    cls: 'border-success/30 bg-success/10 text-success',
  },
  replace: {
    label: 'Replace',
    action: 'Order replacement',
    done: 'Replacement ordered',
    cls: 'border-warning/30 bg-warning/10 text-warning',
  },
  'write-off': {
    label: 'Write-off',
    action: 'Write off',
    done: 'Written off · goodwill logged',
    cls: 'border-danger/30 bg-danger/10 text-danger',
  },
}
