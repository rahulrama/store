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
export const SEED_VERSION = 9

let manualSeq = 0

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

  return [...aiTasks, ...standing]
}
