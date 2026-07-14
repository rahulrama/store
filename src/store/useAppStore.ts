import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CustomerFeedback,
  Department,
  Escalation,
  EscalationTarget,
  Evidence,
  FulfilmentLog,
  Priority,
  Role,
  Task,
} from '@/types'
import { DEFAULT_PERSONA_USER, USER_BY_ID, managerOfStore } from '@/data/stores'
import { DOMAIN_BY_ID, pillarOfDomain } from '@/data/domains'
import { computePriority } from '@/engine/priority'
import { SLA_HOURS_BY_TARGET } from '@/engine/sla'
import { buildSeedTasks, SEED_VERSION } from '@/data/seed'
import { SEED_FEEDBACK } from '@/data/feedback'
import { DEMO_NOW, demoDayKey, hoursFromNow } from '@/data/now'

export interface CreateTaskInput {
  title: string
  rationale: string
  domainId: Task['domainId']
  storeId: string
  priority: Priority
  evidenceRequired: boolean
  estImpactGBP: number
  department?: Department
}

interface AppState {
  // Persona
  role: Role
  currentUserId: string
  /** The store currently being acted on / viewed (store persona or region drilldown). */
  activeStoreId: string

  // Data
  tasks: Task[]
  /** Local day key the estate was seeded for; re-seeds when the day rolls over. */
  seededOn: string

  // UI
  copilotOpen: boolean

  // Fulfilment ("save the sale") log
  fulfilments: FulfilmentLog[]

  // Customer sentiment captured in store
  feedback: CustomerFeedback[]

  // Persona actions
  setPersona: (role: Role) => void
  setActiveStore: (storeId: string) => void
  enterStore: (storeId: string) => void

  // Task actions
  startTask: (taskId: string) => void
  toggleStep: (taskId: string, stepId: string) => void
  setStepValue: (taskId: string, stepId: string, value: string) => void
  addEvidence: (taskId: string, evidence: Omit<Evidence, 'id' | 'capturedByUserId' | 'capturedAt'>) => void
  completeTask: (taskId: string) => void
  escalateTask: (taskId: string, target: EscalationTarget, reason: string) => void
  addEscalationUpdate: (taskId: string, note: string) => void
  resolveEscalation: (taskId: string) => void
  reassignTask: (taskId: string, ownerUserId: string) => void
  createTask: (input: CreateTaskInput) => string

  // UI actions
  setCopilotOpen: (open: boolean) => void
  addFulfilment: (entry: Omit<FulfilmentLog, 'id' | 'at'>) => void
  addFeedback: (entry: Omit<CustomerFeedback, 'id' | 'capturedAt' | 'capturedByUserId'>) => void

  resetDemo: () => void
}

function updateTask(tasks: Task[], taskId: string, fn: (t: Task) => Task): Task[] {
  return tasks.map((t) => (t.id === taskId ? fn(t) : t))
}

let createSeq = 0

// A few out-of-stock rescues already logged across the estate today, so HQ's
// recovered-sales figure reads on load. Restored by Reset demo.
const SEED_FULFILMENTS: FulfilmentLog[] = [
  { id: 'ff-seed-1', sku: 'GM-CONSOLE-BUNDLE', fromStoreId: 's-301', sourceStoreId: 's-309', type: 'same-day-courier', valueGBP: 499.99, at: DEMO_NOW.toISOString() },
  { id: 'ff-seed-2', sku: 'LA-AIRCON', fromStoreId: 's-309', sourceStoreId: 's-301', type: 'ship-from-store', valueGBP: 329.99, at: DEMO_NOW.toISOString() },
  { id: 'ff-seed-3', sku: 'TV-OLED-65', fromStoreId: 's-126', sourceStoreId: 's-214', type: 'store-transfer', valueGBP: 1299.99, at: DEMO_NOW.toISOString() },
]

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: 'Store',
      currentUserId: DEFAULT_PERSONA_USER.Store,
      activeStoreId: 's-214',
      tasks: buildSeedTasks(),
      seededOn: demoDayKey(),
      copilotOpen: false,
      fulfilments: SEED_FULFILMENTS,
      feedback: SEED_FEEDBACK,

      setPersona: (role) =>
        set(() => {
          const userId = DEFAULT_PERSONA_USER[role]
          const user = USER_BY_ID[userId]
          return {
            role,
            currentUserId: userId,
            activeStoreId: role === 'Store' || role === 'Colleague' ? user.storeId ?? 's-214' : 's-214',
          }
        }),

      setActiveStore: (storeId) => set({ activeStoreId: storeId }),

      enterStore: (storeId) =>
        set({
          role: 'Store',
          currentUserId: managerOfStore(storeId)?.id ?? DEFAULT_PERSONA_USER.Store,
          activeStoreId: storeId,
        }),

      startTask: (taskId) =>
        set((s) => ({
          tasks: updateTask(s.tasks, taskId, (t) =>
            t.status === 'not_started' ? { ...t, status: 'in_progress' } : t,
          ),
        })),

      toggleStep: (taskId, stepId) =>
        set((s) => ({
          tasks: updateTask(s.tasks, taskId, (t) => {
            const steps = t.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st))
            const anyDone = steps.some((st) => st.done)
            const status =
              t.status === 'not_started' && anyDone ? 'in_progress' : t.status
            return { ...t, steps, status }
          }),
        })),

      setStepValue: (taskId, stepId, value) =>
        set((s) => ({
          tasks: updateTask(s.tasks, taskId, (t) => ({
            ...t,
            steps: t.steps.map((st) => (st.id === stepId ? { ...st, value, done: true } : st)),
          })),
        })),

      addEvidence: (taskId, evidence) =>
        set((s) => ({
          tasks: updateTask(s.tasks, taskId, (t) => ({
            ...t,
            evidence: [
              ...t.evidence,
              {
                ...evidence,
                id: `ev-${taskId}-${t.evidence.length}`,
                capturedByUserId: s.currentUserId,
                capturedAt: DEMO_NOW.toISOString(),
              },
            ],
          })),
        })),

      completeTask: (taskId) =>
        set((s) => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('wattsrus:celebrate'))
          }
          return {
            tasks: updateTask(s.tasks, taskId, (t) => ({
              ...t,
              status: 'complete',
              completedAt: DEMO_NOW.toISOString(),
              steps: t.steps.map((st) => ({ ...st, done: true })),
            })),
          }
        }),

      escalateTask: (taskId, target, reason) =>
        set((s) => {
          const user = USER_BY_ID[s.currentUserId]
          return {
            tasks: updateTask(s.tasks, taskId, (t) => {
              const escalation: Escalation = {
                id: `esc-${taskId}`,
                target,
                reason,
                slaHours: SLA_HOURS_BY_TARGET[target],
                startedAt: DEMO_NOW.toISOString(),
                status: 'open',
                thread: [
                  {
                    at: DEMO_NOW.toISOString(),
                    byUserId: user.id,
                    note: `Escalated to ${target} by ${user.name}. ${reason}`,
                  },
                ],
              }
              return { ...t, status: 'escalated', escalation }
            }),
          }
        }),

      addEscalationUpdate: (taskId, note) =>
        set((s) => {
          const user = USER_BY_ID[s.currentUserId]
          return {
            tasks: updateTask(s.tasks, taskId, (t) =>
              t.escalation
                ? {
                    ...t,
                    escalation: {
                      ...t.escalation,
                      status: 'acknowledged',
                      thread: [
                        ...t.escalation.thread,
                        { at: DEMO_NOW.toISOString(), byUserId: user.id, note },
                      ],
                    },
                  }
                : t,
            ),
          }
        }),

      resolveEscalation: (taskId) =>
        set((s) => {
          const user = USER_BY_ID[s.currentUserId]
          return {
            tasks: updateTask(s.tasks, taskId, (t) =>
              t.escalation
                ? {
                    ...t,
                    status: 'complete',
                    completedAt: DEMO_NOW.toISOString(),
                    escalation: {
                      ...t.escalation,
                      status: 'resolved',
                      thread: [
                        ...t.escalation.thread,
                        {
                          at: DEMO_NOW.toISOString(),
                          byUserId: user.id,
                          note: 'Marked resolved.',
                        },
                      ],
                    },
                  }
                : t,
            ),
          }
        }),

      reassignTask: (taskId, ownerUserId) =>
        set((s) => ({
          tasks: updateTask(s.tasks, taskId, (t) => ({ ...t, ownerUserId })),
        })),

      createTask: (input) => {
        const pillar = pillarOfDomain(input.domainId)
        const dueAt = hoursFromNow(input.priority === 'P1' ? 2 : input.priority === 'P2' ? 4 : 8)
        const severity = input.priority === 'P1' ? 'high' : input.priority === 'P2' ? 'medium' : 'low'
        const { score } = computePriority(severity, input.estImpactGBP, dueAt)
        const owner = managerOfStore(input.storeId)?.id ?? 'u-hq'
        const id = `task-manual-${createSeq++}`
        const domain = DOMAIN_BY_ID[input.domainId]
        const task: Task = {
          id,
          title: input.title,
          rationale: input.rationale,
          suggestedAction: 'Complete the steps and capture evidence if required.',
          source: 'manual',
          domainId: input.domainId,
          pillarId: pillar.id,
          priority: input.priority,
          priorityScore: score,
          status: 'not_started',
          storeId: input.storeId,
          ownerUserId: owner,
          dueAt,
          createdAt: DEMO_NOW.toISOString(),
          estImpactGBP: input.estImpactGBP,
          evidenceRequired: input.evidenceRequired,
          department: input.department,
          steps: [
            { id: `${id}-s0`, label: `Action: ${domain.name}`, type: 'check', done: false },
          ],
          evidence: [],
        }
        set((s) => ({ tasks: [task, ...s.tasks] }))
        return id
      },

      setCopilotOpen: (open) => set({ copilotOpen: open }),

      addFulfilment: (entry) =>
        set((s) => ({
          fulfilments: [
            { ...entry, id: `ff-${createSeq++}`, at: DEMO_NOW.toISOString() },
            ...s.fulfilments,
          ],
        })),

      addFeedback: (entry) =>
        set((s) => ({
          feedback: [
            {
              ...entry,
              id: `fb-${createSeq++}`,
              capturedByUserId: s.currentUserId,
              capturedAt: DEMO_NOW.toISOString(),
            },
            ...s.feedback,
          ],
        })),

      resetDemo: () =>
        set({
          tasks: buildSeedTasks(),
          seededOn: demoDayKey(),
          role: 'Store',
          currentUserId: DEFAULT_PERSONA_USER.Store,
          activeStoreId: 's-214',
          copilotOpen: false,
          fulfilments: SEED_FULFILMENTS,
          feedback: SEED_FEEDBACK,
        }),
    }),
    {
      name: 'wattsrus-store-ops',
      version: SEED_VERSION,
      partialize: (s) => ({
        role: s.role,
        currentUserId: s.currentUserId,
        activeStoreId: s.activeStoreId,
        tasks: s.tasks,
        seededOn: s.seededOn,
        fulfilments: s.fulfilments,
        feedback: s.feedback,
      }),
      migrate: () => ({ tasks: buildSeedTasks(), seededOn: demoDayKey() }) as Partial<AppState>,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>
        // Re-anchor the seeded estate to today whenever the saved demo day has
        // rolled over (or for a brand-new visitor), so every SLA/due time reads
        // correctly. Same-day reloads keep the user's progress.
        if (p.seededOn !== demoDayKey()) return { ...current, seededOn: demoDayKey() }
        return { ...current, ...p }
      },
    },
  ),
)
