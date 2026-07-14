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
const DATE_FMT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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

const LONG_DATE_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** "Saturday 25 July 2026" — full weekday + month + year, e.g. for page headers. */
export function longDateOf(iso: string | Date): string {
  return LONG_DATE_FMT.format(typeof iso === 'string' ? new Date(iso) : iso)
}

const DATE_YEAR_FMT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/** "23 Jul 2026" — day + short month + year for date-only ISO strings (parsed as UTC midnight). */
export function dateYearOf(iso: string | Date): string {
  return DATE_YEAR_FMT.format(typeof iso === 'string' ? new Date(iso) : iso)
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
