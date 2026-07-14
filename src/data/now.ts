// The demo "now". Pinned to a fixed busy-trading Saturday (Sat 25 Jul 2026) at
// mid-morning so the whole experience is deterministic and internally
// consistent — the "peak Saturday" narrative, the live promotions and every
// SLA / due-time all line up, whatever the real calendar day it's opened on.
// Evaluated once at module load.
function computeDemoNow(): Date {
  const d = new Date(2026, 6, 25) // Sat 25 Jul 2026 (month is 0-indexed: 6 = July)
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
