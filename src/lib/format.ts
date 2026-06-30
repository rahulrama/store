import { DEMO_NOW } from '@/data/now'

export function gbp(value: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function pct(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

const TIME_FMT = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const DATE_FMT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const DATETIME_FMT = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function timeOf(iso: string | Date): string {
  return TIME_FMT.format(typeof iso === 'string' ? new Date(iso) : iso)
}

export function dateOf(iso: string | Date): string {
  return DATE_FMT.format(typeof iso === 'string' ? new Date(iso) : iso)
}

export function dateTimeOf(iso: string | Date): string {
  return DATETIME_FMT.format(typeof iso === 'string' ? new Date(iso) : iso)
}

/** "in 2h 10m" / "12m ago" / "due now", relative to the deterministic demo clock. */
export function relativeToNow(iso: string): string {
  const diffMs = new Date(iso).getTime() - DEMO_NOW.getTime()
  const past = diffMs < 0
  const mins = Math.round(Math.abs(diffMs) / 60_000)
  if (mins < 1) return 'now'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const label = h > 0 ? `${h}h ${m}m` : `${m}m`
  return past ? `${label} ago` : `in ${label}`
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
