import type { Task } from '@/types'
import { STORE_BY_ID } from '@/data/stores'

export function tasksForStore(tasks: Task[], storeId: string): Task[] {
  return tasks.filter((t) => t.storeId === storeId)
}

export function tasksForRegion(tasks: Task[], regionId: string): Task[] {
  return tasks.filter((t) => STORE_BY_ID[t.storeId]?.regionId === regionId)
}

const PRIORITY_RANK: Record<Task['priority'], number> = { P1: 0, P2: 1, P3: 2 }

/** Open, sorted: by priority band then by priority score (desc). */
export function rankedOpenTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => t.status !== 'complete')
    .sort((a, b) => {
      if (a.priority !== b.priority) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      return b.priorityScore - a.priorityScore
    })
}

export function completedTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status === 'complete')
}

export function openExceptions(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.escalation && t.escalation.status !== 'resolved')
}

export function completionRate(tasks: Task[]): number {
  const actionable = tasks.length
  if (actionable === 0) return 100
  return Math.round((tasks.filter((t) => t.status === 'complete').length / actionable) * 100)
}

export function overdueTasks(tasks: Task[], now: Date): Task[] {
  return tasks.filter((t) => t.status !== 'complete' && new Date(t.dueAt).getTime() < now.getTime())
}
