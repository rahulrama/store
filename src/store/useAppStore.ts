import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Department,
  Escalation,
  EscalationTarget,
  Evidence,
  Priority,
  Role,
  Task,
} from '@/types'
import { DEFAULT_PERSONA_USER, USER_BY_ID, managerOfStore } from '@/data/stores'
import { DOMAIN_BY_ID, pillarOfDomain } from '@/data/domains'
import { computePriority } from '@/engine/priority'
import { SLA_HOURS_BY_TARGET } from '@/engine/sla'
import { buildSeedTasks, SEED_VERSION } from '@/data/seed'
import { DEMO_NOW, hoursFromNow } from '@/data/now'

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

  // UI
  copilotOpen: boolean
  sourcesOpen: boolean

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
  createTask: (input: CreateTaskInput) => void

  // UI actions
  setCopilotOpen: (open: boolean) => void
  setSourcesOpen: (open: boolean) => void

  resetDemo: () => void
}

function updateTask(tasks: Task[], taskId: string, fn: (t: Task) => Task): Task[] {
  return tasks.map((t) => (t.id === taskId ? fn(t) : t))
}

let createSeq = 0

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: 'Store',
      currentUserId: DEFAULT_PERSONA_USER.Store,
      activeStoreId: 's-214',
      tasks: buildSeedTasks(),
      copilotOpen: false,
      sourcesOpen: false,

      setPersona: (role) =>
        set(() => {
          const userId = DEFAULT_PERSONA_USER[role]
          const user = USER_BY_ID[userId]
          return {
            role,
            currentUserId: userId,
            activeStoreId: role === 'Store' ? user.storeId ?? 's-214' : 's-214',
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
        set((s) => ({
          tasks: updateTask(s.tasks, taskId, (t) => ({
            ...t,
            status: 'complete',
            completedAt: DEMO_NOW.toISOString(),
            steps: t.steps.map((st) => ({ ...st, done: true })),
          })),
        })),

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

      createTask: (input) =>
        set((s) => {
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
          return { tasks: [task, ...s.tasks] }
        }),

      setCopilotOpen: (open) => set({ copilotOpen: open }),
      setSourcesOpen: (open) => set({ sourcesOpen: open }),

      resetDemo: () =>
        set({
          tasks: buildSeedTasks(),
          role: 'Store',
          currentUserId: DEFAULT_PERSONA_USER.Store,
          activeStoreId: 's-214',
          copilotOpen: false,
          sourcesOpen: false,
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
      }),
      migrate: () => ({ tasks: buildSeedTasks() }) as Partial<AppState>,
    },
  ),
)
