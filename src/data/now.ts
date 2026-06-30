// The demo "now". Anchored to *today* at mid-morning so the experience always
// reads as "today", while preserving the busy-trading-morning story (opening
// done earlier, closing due later). Evaluated once at module load so SLA
// countdowns, due-times and the morning impact snapshot stay internally
// consistent for the whole session.
function computeDemoNow(): Date {
  const d = new Date()
  d.setHours(10, 24, 0, 0)
  return d
}

export const DEMO_NOW = computeDemoNow()

export function demoNow(): Date {
  return new Date(DEMO_NOW)
}

/** Local YYYY-MM-DD key for the demo day — used to re-seed when the day rolls over. */
export function demoDayKey(): string {
  const m = String(DEMO_NOW.getMonth() + 1).padStart(2, '0')
  const day = String(DEMO_NOW.getDate()).padStart(2, '0')
  return `${DEMO_NOW.getFullYear()}-${m}-${day}`
}

/** ISO string offset from demo-now by the given minutes (negative = past). */
export function fromNow(minutes: number): string {
  return new Date(DEMO_NOW.getTime() + minutes * 60_000).toISOString()
}

export function hoursFromNow(hours: number): string {
  return fromNow(hours * 60)
}
