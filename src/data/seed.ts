import type { Priority, Task, TaskTemplate } from '@/types'
import { SIGNALS } from '@/data/signals'
import { buildTasksFromSignals } from '@/engine/signalsEngine'
import { TASK_TEMPLATE_BY_ID } from '@/data/taskTemplates'
import { DOMAIN_BY_ID, pillarOfDomain } from '@/data/domains'
import { managerOfStore } from '@/data/stores'
import { computePriority } from '@/engine/priority'
import { DUE_HOURS_BY_SEVERITY } from '@/engine/priority'
import { fromNow, hoursFromNow } from '@/data/now'
import type { Severity } from '@/types'

/** Bump to invalidate persisted demo state when the seed changes. */
export const SEED_VERSION = 13

let manualSeq = 0

/**
 * Day-start task ownership at #214 — department-matched to on-shift colleagues.
 * Rahul Ramakrishna (the Colleague persona) gets two TV & Audio jobs. Tasks left
 * out stay unassigned so the manager can hand them out live in the demo.
 */
const SEED_ASSIGNMENTS: Record<string, string> = {
  'task-sig-214-display': 'c-214-11', // TV wall demo loop & soundbar prompt — Rahul (TV & Audio)
  'task-sig-214-attach': 'c-214-11', // Soundbar attach on 4K TVs — Rahul (TV & Audio)
  'task-sig-214-promo': 'c-214-1', // Console bundle end cap — Liam (Gaming)
  'task-sig-214-price': 'c-214-2', // Surface ticket reprice — Zara (Computing)
  'task-sig-214-training': 'c-214-2', // Age-restricted cert renewal — Zara (her own)
  'task-sig-214-replen-fan': 'c-214-5', // Tower fan replenish — Jack (Large Appliances)
  'task-sig-214-cc': 'c-214-6', // Click & Collect pick — Emily (Customer Service)
}

interface InstantiateOpts {
  id?: string
  source?: Task['source']
  status?: Task['status']
  priority?: Priority
  severity?: Severity
  estImpactGBP?: number
  rationale?: string
  suggestedAction?: string
  dueInHours?: number
  completedMinsAgo?: number
  ownerUserId?: string
}

export function instantiateTemplate(
  template: TaskTemplate,
  storeId: string,
  opts: InstantiateOpts = {},
): Task {
  const domain = DOMAIN_BY_ID[template.domainId]
  const pillar = pillarOfDomain(template.domainId)
  const severity: Severity = opts.severity ?? 'medium'
  const estImpactGBP = opts.estImpactGBP ?? 0
  const dueAt = hoursFromNow(opts.dueInHours ?? DUE_HOURS_BY_SEVERITY[severity])
  const { score, band } = computePriority(severity, estImpactGBP, dueAt)
  const owner = opts.ownerUserId ?? managerOfStore(storeId)?.id ?? 'u-hq'
  const id = opts.id ?? `task-tmpl-${template.id}-${storeId}-${manualSeq++}`
  const completed = opts.completedMinsAgo != null
  void domain

  return {
    id,
    title: template.title,
    rationale: opts.rationale ?? `Standing ${template.recurring ?? 'operational'} task.`,
    suggestedAction: opts.suggestedAction ?? 'Complete the steps and mark done.',
    source: opts.source ?? 'template',
    domainId: template.domainId,
    pillarId: pillar.id,
    priority: opts.priority ?? band,
    priorityScore: score,
    status: completed ? 'complete' : opts.status ?? 'not_started',
    storeId,
    ownerUserId: owner,
    dueAt,
    createdAt: fromNow(-240),
    estImpactGBP,
    evidenceRequired: template.evidenceRequired,
    steps: template.steps.map((s, i) => ({
      id: `${id}-s${i}`,
      label: s.label,
      type: s.type,
      done: completed,
    })),
    evidence: [],
    completedAt: completed ? fromNow(-(opts.completedMinsAgo ?? 0)) : undefined,
  }
}

/** Build the full initial task list for the demo estate. */
export function buildSeedTasks(): Task[] {
  manualSeq = 0
  const aiTasks = buildTasksFromSignals(SIGNALS)

  // A few standing/manual tasks so the Store views feel like a real day.
  const standing: Task[] = [
    instantiateTemplate(TASK_TEMPLATE_BY_ID['tt-opening'], 's-214', {
      id: 'task-214-opening',
      completedMinsAgo: 180,
      rationale: 'Opening routine completed by the duty manager this morning.',
    }),
    instantiateTemplate(TASK_TEMPLATE_BY_ID['tt-huddle'], 's-214', {
      id: 'task-214-huddle',
      completedMinsAgo: 165,
      rationale: 'Start-of-shift huddle held — today’s promos and priorities shared.',
    }),
    instantiateTemplate(TASK_TEMPLATE_BY_ID['tt-closing'], 's-214', {
      id: 'task-214-closing',
      rationale: 'Closing routine due at the end of trade.',
      dueInHours: 9,
    }),
    instantiateTemplate(TASK_TEMPLATE_BY_ID['tt-policy-ack'], 's-214', {
      id: 'task-214-policy',
      source: 'manual',
      rationale: 'HQ published an updated returns & refunds policy — please read and acknowledge.',
      suggestedAction: 'Read the updated policy and confirm understood.',
      priority: 'P3',
    }),
  ]

  const all = [...aiTasks, ...standing]
  // Day-start ownership: most #214 tasks land with a department-matched colleague;
  // a few stay unassigned for the manager to hand out live (see SEED_ASSIGNMENTS).
  return all.map((t) =>
    SEED_ASSIGNMENTS[t.id] ? { ...t, assignedColleagueId: SEED_ASSIGNMENTS[t.id] } : t,
  )
}
