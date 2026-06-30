import type { TaskTemplate } from '@/types'

// Reusable task templates per domain. Used by the "Create task" form and to show
// that every one of the 14 domains is a first-class part of the operating model.
export const TASK_TEMPLATES: TaskTemplate[] = [
  // 2 Scheduling
  { id: 'tt-redeploy', title: 'Redeploy cover to a department', domainId: 'scheduling', defaultPriority: 'P1', evidenceRequired: false, steps: [{ label: 'Identify available skilled colleague', type: 'check' }, { label: 'Brief colleague on the move', type: 'check' }, { label: 'Update the rota', type: 'check' }] },
  { id: 'tt-huddle', title: 'Run start-of-shift huddle', domainId: 'scheduling', defaultPriority: 'P3', evidenceRequired: false, recurring: 'daily', steps: [{ label: 'Share today’s priorities & promos', type: 'check' }, { label: 'Confirm department cover', type: 'check' }] },

  // 3 Comms & knowledge
  { id: 'tt-policy-ack', title: 'Acknowledge policy update', domainId: 'comms-knowledge', defaultPriority: 'P3', evidenceRequired: false, steps: [{ label: 'Read the update', type: 'check' }, { label: 'Confirm understood', type: 'check' }] },
  { id: 'tt-recall', title: 'Action a product recall / safety notice', domainId: 'comms-knowledge', defaultPriority: 'P1', evidenceRequired: true, steps: [{ label: 'Locate affected stock', type: 'check' }, { label: 'Quarantine items', type: 'count' }, { label: 'Photo evidence of removal', type: 'photo' }] },

  // 4 Opening/closing
  { id: 'tt-opening', title: 'Complete store opening checklist', domainId: 'opening-closing', defaultPriority: 'P1', evidenceRequired: false, recurring: 'daily', steps: [{ label: 'Disarm alarm & lone-working check', type: 'check' }, { label: 'Safety walk', type: 'check' }, { label: 'Power tills & demo units', type: 'check' }, { label: 'Set up cash office float', type: 'check' }] },
  { id: 'tt-closing', title: 'Complete store closing checklist', domainId: 'opening-closing', defaultPriority: 'P1', evidenceRequired: false, recurring: 'daily', steps: [{ label: 'Cash up & bank', type: 'check' }, { label: 'Waste & cleaning', type: 'check' }, { label: 'Shutters & alarm', type: 'check' }] },

  // 5 Task execution
  { id: 'tt-endcap', title: 'Build & verify a promotional end-cap', domainId: 'merchandising', defaultPriority: 'P1', evidenceRequired: true, steps: [{ label: 'Collect promo kit', type: 'check' }, { label: 'Build display & apply tickets', type: 'check' }, { label: 'Power demo unit & loop', type: 'check' }, { label: 'Photo of finished end-cap', type: 'photo' }] },
  { id: 'tt-label', title: 'Print & apply shelf-edge labels', domainId: 'merchandising', defaultPriority: 'P2', evidenceRequired: false, steps: [{ label: 'Print updated tickets', type: 'check' }, { label: 'Apply & verify prices', type: 'price' }] },

  // 6 Stock
  { id: 'tt-replen', title: 'Replenishment run to shop floor', domainId: 'stock-replenishment', defaultPriority: 'P2', evidenceRequired: false, steps: [{ label: 'Pick from stockroom', type: 'count' }, { label: 'Fill facings', type: 'check' }] },
  { id: 'tt-cyclecount', title: 'Cycle count a bay', domainId: 'stock-replenishment', defaultPriority: 'P3', evidenceRequired: false, steps: [{ label: 'Count on-hand', type: 'count' }, { label: 'Submit adjustment', type: 'check' }] },

  // 7 Fulfilment
  { id: 'tt-pick', title: 'Pick & stage a Click & Collect order', domainId: 'fulfilment', defaultPriority: 'P1', evidenceRequired: false, steps: [{ label: 'Pick items', type: 'check' }, { label: 'Stage in collection area', type: 'check' }, { label: 'Mark ready for collection', type: 'check' }] },

  // 9 Safety & compliance
  { id: 'tt-temp', title: 'Log stockroom temperature', domainId: 'safety-compliance', defaultPriority: 'P3', evidenceRequired: true, recurring: 'daily', steps: [{ label: 'Read chiller temperature', type: 'count' }, { label: 'Record on digital form', type: 'check' }] },
  { id: 'tt-fire', title: 'Fire-door & evacuation route check', domainId: 'safety-compliance', defaultPriority: 'P2', evidenceRequired: true, recurring: 'weekly', steps: [{ label: 'Check routes clear', type: 'check' }, { label: 'Photo of fire exits', type: 'photo' }] },

  // 10 Loss prevention
  { id: 'tt-refusal', title: 'Log an age-restricted refusal', domainId: 'loss-prevention', defaultPriority: 'P3', evidenceRequired: false, steps: [{ label: 'Record time & reason', type: 'check' }] },

  // 11 Equipment / IT
  { id: 'tt-fault', title: 'Log an equipment / facilities fault', domainId: 'equipment-it', defaultPriority: 'P1', evidenceRequired: true, steps: [{ label: 'Make area safe', type: 'check' }, { label: 'Open fault ticket', type: 'check' }, { label: 'Photo of issue', type: 'photo' }] },

  // 12 Training
  { id: 'tt-training', title: 'Complete a mandatory training renewal', domainId: 'training-coaching', defaultPriority: 'P2', evidenceRequired: false, steps: [{ label: 'Schedule training time', type: 'check' }, { label: 'Complete module', type: 'check' }] },

  // 1 People HR
  { id: 'tt-rtw', title: 'Complete right-to-work check for new starter', domainId: 'people-hr', defaultPriority: 'P2', evidenceRequired: true, steps: [{ label: 'Verify documents', type: 'check' }, { label: 'Photo / scan documents', type: 'photo' }] },

  // 13 Supplier
  { id: 'tt-vendor', title: 'Log a vendor delivery discrepancy', domainId: 'supplier', defaultPriority: 'P3', evidenceRequired: true, steps: [{ label: 'Count delivered units', type: 'count' }, { label: 'Photo of discrepancy', type: 'photo' }] },

  // 14 Returns
  { id: 'tt-return', title: 'Triage a returned item', domainId: 'returns-service', defaultPriority: 'P3', evidenceRequired: false, steps: [{ label: 'Assess resalable vs damaged', type: 'check' }, { label: 'Route to correct process', type: 'check' }] },
]

export const TASK_TEMPLATE_BY_ID = Object.fromEntries(
  TASK_TEMPLATES.map((t) => [t.id, t]),
) as Record<string, TaskTemplate>
