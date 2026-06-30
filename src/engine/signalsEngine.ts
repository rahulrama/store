import type {
  Escalation,
  EscalationTarget,
  Signal,
  SignalType,
  Task,
  TaskStep,
  StepType,
} from '@/types'
import { DOMAIN_BY_ID, pillarOfDomain } from '@/data/domains'
import { PRODUCT_BY_SKU } from '@/data/products'
import { PROMO_BY_ID } from '@/data/promotions'
import { managerOfStore } from '@/data/stores'
import { COLLEAGUE_BY_ID } from '@/data/colleagues'
import { stockOf } from '@/data/inventory'
import { computePriority, DUE_HOURS_BY_SEVERITY } from '@/engine/priority'
import { SLA_HOURS_BY_TARGET } from '@/engine/sla'
import { hoursFromNow } from '@/data/now'

interface RuleOutput {
  title: string
  suggestedAction: string
  evidenceRequired: boolean
  steps: { label: string; type: StepType }[]
  /** Force a status other than not_started (e.g. auto-escalated). */
  status?: Task['status']
  escalation?: Omit<Escalation, 'id' | 'thread'> & { note: string }
}

/** Plain-English description of each rule for the Signals Explorer / Copilot "Explain". */
export const RULE_BY_SIGNAL_TYPE: Record<SignalType, string> = {
  PromoUnderperforming:
    'IF a promotion is live AND units sold are below threshold AND the display is unverified → raise a P1 “build & verify end cap” task with photo evidence.',
  DisplayUnverified:
    'IF a promotional display is not verified (demo loop off / attach prompt missing) → raise a task to fix and photograph it.',
  PriceMismatch:
    'IF a shelf ticket price ≠ the live promo price → raise a task to reprint and re-ticket.',
  OutOfStock:
    'IF a hot SKU is out of stock: with stock on order → replenish; with NONE on order → auto-block and escalate to the Stock team.',
  LowAttachRate:
    'IF accessory/care-plan attach is below benchmark → prompt the team to offer the attach at the till.',
  ClickCollectAgeing:
    'IF a Click & Collect order is older than the Fast Track promise → raise a P1 pick-and-stage task.',
  ColleagueAbsence:
    'IF a colleague is absent on a peak day → suggest a real-time redeployment to keep cover.',
  TrainingExpiring:
    'IF a mandatory training renewal is due soon → raise a task to book the training in the rota.',
  EquipmentFault:
    'IF equipment faults (fridge/till/printer) → log a repair and escalate to Facilities or IT with an SLA.',
  ComplianceDue:
    'IF a compliance check is due/overdue → raise a recurring compliance task with evidence capture.',
  AgeRestrictedRefusal:
    'IF an age-restricted sale was refused → raise a task to log it in the refusals register.',
  ShrinkAnomaly:
    'IF an exception-based shrink pattern appears → raise a loss-prevention investigation task.',
  NegativeFeedback:
    'IF customer feedback dips below threshold → raise a service-recovery follow-up task.',
  SocialTrend:
    'IF a product is trending on social media (Instagram/TikTok) → raise a task to bring stock forward and make sure the display is built before the rush.',
}

function equipmentTarget(signal: Signal): EscalationTarget {
  const m = (signal.message + ' ' + (signal.metric?.label ?? '')).toLowerCase()
  if (/(fridge|chiller|temperature|heating|leak|light|freezer)/.test(m)) return 'Facilities'
  return 'IT'
}

function equipmentLabel(signal: Signal): string {
  const m = signal.message.toLowerCase()
  if (m.includes('chiller') || m.includes('fridge')) return 'stockroom chiller'
  if (m.includes('printer')) return 'label printer'
  if (m.includes('till')) return 'till'
  return 'equipment'
}

function complianceLabel(signal: Signal): string {
  const m = signal.message.toLowerCase()
  if (m.includes('temperature')) return 'stockroom temperature log'
  if (m.includes('fire')) return 'fire-door & evacuation check'
  return 'compliance check'
}

function ruleFor(signal: Signal): RuleOutput {
  const product = signal.sku ? PRODUCT_BY_SKU[signal.sku] : undefined
  const promo = signal.promotionId ? PROMO_BY_ID[signal.promotionId] : undefined
  const promoShort = promo ? promo.name.split('—')[0].trim() : 'promotion'

  switch (signal.type) {
    case 'PromoUnderperforming':
      return {
        title: `Build & verify the ${promoShort} end cap`,
        suggestedAction:
          'Set up the end cap, apply the bundle ticket and run the demo, then photograph it to verify compliance.',
        evidenceRequired: true,
        steps: [
          { label: 'Collect the promo kit from the comms folder', type: 'check' },
          { label: 'Build the display and apply the bundle ticket', type: 'check' },
          { label: 'Power the demo unit and load the featured title', type: 'check' },
          { label: 'Photograph the finished end cap', type: 'photo' },
        ],
      }
    case 'DisplayUnverified':
      return {
        title: `Verify the ${promoShort} display`,
        suggestedAction: 'Restart the demo loop, add the attach prompt and photograph the display.',
        evidenceRequired: true,
        steps: [
          { label: 'Restart the demo loop on the display', type: 'check' },
          { label: 'Add the attach / barker prompt', type: 'check' },
          { label: 'Photograph the verified display', type: 'photo' },
        ],
      }
    case 'LowAttachRate':
      return {
        title: `Boost ${product?.name ?? 'accessory'} attach at the till`,
        suggestedAction: 'Brief the team to offer the attach with every relevant sale and enable the till prompt.',
        evidenceRequired: false,
        steps: [
          { label: 'Brief the department team', type: 'check' },
          { label: 'Enable the till attach prompt', type: 'check' },
        ],
      }
    case 'PriceMismatch':
      return {
        title: `Correct the shelf ticket for ${product?.name ?? 'the product'}`,
        suggestedAction: 'Reprint the shelf-edge label to the live promo price and verify on the floor.',
        evidenceRequired: false,
        steps: [
          { label: 'Reprint the shelf-edge ticket', type: 'check' },
          { label: 'Apply and price-check on the floor', type: 'price' },
        ],
      }
    case 'OutOfStock': {
      const inv = stockOf(signal.storeId, signal.sku ?? '')
      const onHand = inv?.onHand ?? 0
      const onOrder = inv?.onOrder ?? 0
      const name = product?.name ?? 'the product'
      if (onHand <= 0 && onOrder <= 0) {
        return {
          title: `Raise an emergency stock transfer for ${name}`,
          suggestedAction:
            'Stock is exhausted with none on order during a live promo — raise a transfer and escalate to the Stock team.',
          evidenceRequired: false,
          status: 'escalated',
          steps: [
            { label: 'Check stock at nearby stores', type: 'check' },
            { label: 'Raise an inter-store transfer request', type: 'check' },
          ],
          escalation: {
            target: 'Stock',
            reason: `${name} sold out with none on order while the promo is live.`,
            slaHours: SLA_HOURS_BY_TARGET.Stock,
            startedAt: signal.detectedAt,
            status: 'open',
            note: 'Auto-escalated to the Stock team — none on order, promo live.',
          },
        }
      }
      if (onHand <= 0 && onOrder > 0) {
        return {
          title: `Bridge the gap on ${name} until delivery`,
          suggestedAction: `Confirm the delivery ETA (${onOrder} inbound) and signpost an alternative to customers.`,
          evidenceRequired: false,
          steps: [
            { label: 'Confirm the inbound delivery ETA', type: 'check' },
            { label: 'Signpost an alternative model on the floor', type: 'check' },
          ],
        }
      }
      return {
        title: `Replenish ${name} to the shop floor`,
        suggestedAction: `Pick from the stockroom (${onOrder} available) and fill the facings.`,
        evidenceRequired: false,
        steps: [
          { label: 'Pick from the stockroom', type: 'count' },
          { label: 'Fill the shop-floor facings', type: 'check' },
        ],
      }
    }
    case 'ClickCollectAgeing':
      return {
        title: 'Pick & stage the waiting Click & Collect order',
        suggestedAction: 'Pick the order now to meet the Fast Track collection promise.',
        evidenceRequired: false,
        steps: [
          { label: 'Pick the items', type: 'check' },
          { label: 'Stage in the collection area', type: 'check' },
          { label: 'Mark ready for collection', type: 'check' },
        ],
      }
    case 'ColleagueAbsence': {
      const colleague = signal.colleagueId ? COLLEAGUE_BY_ID[signal.colleagueId] : undefined
      const dept = colleague?.department ?? 'the floor'
      return {
        title: `Redeploy cover to ${dept}`,
        suggestedAction: `${colleague?.name ?? 'A colleague'} is absent — move a skilled colleague to ${dept} for the peak.`,
        evidenceRequired: false,
        steps: [
          { label: 'Identify an available skilled colleague', type: 'check' },
          { label: 'Brief them on the redeployment', type: 'check' },
          { label: 'Update the rota', type: 'check' },
        ],
      }
    }
    case 'TrainingExpiring': {
      const colleague = signal.colleagueId ? COLLEAGUE_BY_ID[signal.colleagueId] : undefined
      return {
        title: `Schedule training renewal for ${colleague?.name ?? 'colleague'}`,
        suggestedAction: 'Book training time in the rota before the renewal lapses.',
        evidenceRequired: false,
        steps: [
          { label: 'Book training time in the rota', type: 'check' },
          { label: 'Confirm completion', type: 'check' },
        ],
      }
    }
    case 'EquipmentFault': {
      const target = equipmentTarget(signal)
      const label = equipmentLabel(signal)
      return {
        title: `Log a repair: ${label}`,
        suggestedAction: `Make the area safe, raise a fault ticket and escalate to ${target}.`,
        evidenceRequired: true,
        status: 'escalated',
        steps: [
          { label: 'Make the area safe / out of use', type: 'check' },
          { label: 'Open the fault ticket', type: 'check' },
          { label: 'Photograph the issue', type: 'photo' },
        ],
        escalation: {
          target,
          reason: signal.message,
          slaHours: SLA_HOURS_BY_TARGET[target],
          startedAt: signal.detectedAt,
          status: 'open',
          note: `Logged via handheld and routed to ${target}. Area made safe.`,
        },
      }
    }
    case 'ComplianceDue': {
      const label = complianceLabel(signal)
      const isFire = label.includes('fire')
      return {
        title: `Complete the ${label}`,
        suggestedAction: 'Complete the check and capture the evidence to stay audit-ready.',
        evidenceRequired: true,
        steps: isFire
          ? [
              { label: 'Check routes and fire doors are clear', type: 'check' },
              { label: 'Photograph the fire exits', type: 'photo' },
            ]
          : [
              { label: 'Read the chiller temperature', type: 'count' },
              { label: 'Record on the digital form', type: 'check' },
            ],
      }
    }
    case 'AgeRestrictedRefusal':
      return {
        title: 'Log the age-restricted refusal',
        suggestedAction: 'Record the refusal in the register with time and reason to stay audit-ready.',
        evidenceRequired: false,
        steps: [{ label: 'Record time and reason in the refusals register', type: 'check' }],
      }
    case 'ShrinkAnomaly':
      return {
        title: 'Investigate the shrink exception',
        suggestedAction: 'Review the exception report and follow up the voids/refunds flagged.',
        evidenceRequired: false,
        steps: [
          { label: 'Review the exception report', type: 'check' },
          { label: 'Follow up the flagged transactions', type: 'check' },
        ],
      }
    case 'NegativeFeedback':
      return {
        title: 'Service recovery follow-up',
        suggestedAction: 'Review the feedback and put a queue-busting plan in place at Customer Service.',
        evidenceRequired: false,
        steps: [
          { label: 'Review the customer feedback', type: 'check' },
          { label: 'Brief the Customer Service team', type: 'check' },
        ],
      }
    case 'SocialTrend': {
      const name = product?.name ?? 'the trending product'
      return {
        title: `Get ready for social demand: ${name}`,
        suggestedAction:
          'A product is going viral on social media — bring stock to the floor and make sure the display is built before the rush.',
        evidenceRequired: true,
        steps: [
          { label: 'Bring stock forward to the shop floor', type: 'check' },
          { label: 'Check the display is built and priced', type: 'check' },
          { label: 'Photograph the ready display', type: 'photo' },
        ],
      }
    }
  }
}

function makeSteps(taskId: string, defs: { label: string; type: StepType }[]): TaskStep[] {
  return defs.map((d, i) => ({ id: `${taskId}-s${i}`, label: d.label, type: d.type, done: false }))
}

/** Convert a single signal into a prioritised, actionable task. */
export function signalToTask(signal: Signal): Task {
  const out = ruleFor(signal)
  const domain = DOMAIN_BY_ID[signal.domainId]
  const pillar = pillarOfDomain(signal.domainId)
  const dueHours = DUE_HOURS_BY_SEVERITY[signal.severity]
  const dueAt = hoursFromNow(dueHours)
  const { score, band } = computePriority(signal.severity, signal.estImpactGBP, dueAt)
  const owner = managerOfStore(signal.storeId)
  const taskId = `task-${signal.id}`
  const product = signal.sku ? PRODUCT_BY_SKU[signal.sku] : undefined
  void domain

  const escalation: Escalation | undefined = out.escalation
    ? {
        id: `esc-${signal.id}`,
        target: out.escalation.target,
        reason: out.escalation.reason,
        slaHours: out.escalation.slaHours,
        startedAt: out.escalation.startedAt,
        status: out.escalation.status,
        thread: [
          { at: out.escalation.startedAt, byUserId: owner?.id ?? 'u-hq', note: out.escalation.note },
        ],
      }
    : undefined

  const rationaleMetric = signal.metric
    ? ` (${signal.metric.label}: ${signal.metric.value}${signal.metric.unit ?? ''} vs ${signal.metric.threshold}${signal.metric.unit ?? ''})`
    : ''

  return {
    id: taskId,
    title: out.title,
    rationale: `${signal.message}${rationaleMetric}`,
    suggestedAction: out.suggestedAction,
    source: 'ai',
    domainId: signal.domainId,
    pillarId: pillar.id,
    priority: band,
    priorityScore: score,
    status: out.status ?? 'not_started',
    storeId: signal.storeId,
    ownerUserId: owner?.id ?? 'u-hq',
    dueAt,
    createdAt: signal.detectedAt,
    estImpactGBP: signal.estImpactGBP,
    evidenceRequired: out.evidenceRequired,
    sourceSignalId: signal.id,
    steps: makeSteps(taskId, out.steps),
    evidence: [],
    escalation,
    department: product?.category,
  }
}

export function buildTasksFromSignals(signals: Signal[]): Task[] {
  return signals.map(signalToTask)
}
