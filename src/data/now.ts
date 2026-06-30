// Deterministic "now" so SLA countdowns, due-times and the morning impact
// snapshot always read correctly during a live demo.
// The demo spine is "a busy Saturday in June".
export const DEMO_NOW = new Date('2026-06-13T10:24:00')

export function demoNow(): Date {
  return new Date(DEMO_NOW)
}

/** ISO string offset from demo-now by the given minutes (negative = past). */
export function fromNow(minutes: number): string {
  return new Date(DEMO_NOW.getTime() + minutes * 60_000).toISOString()
}

export function hoursFromNow(hours: number): string {
  return fromNow(hours * 60)
}
