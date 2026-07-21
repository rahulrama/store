import type { Colleague, Shift } from '@/types'

// Detailed roster for the primary demo store (#214 Manchester Fort), plus a
// lighter roster for a couple of others so region views have texture.
export const COLLEAGUES: Colleague[] = [
  // ── Store 214 ──────────────────────────────────────────────────────────
  { id: 'c-214-1', name: 'Liam Byrne', initials: 'LB', storeId: 's-214', department: 'Gaming', skills: ['Key holder', 'Till trained'] },
  { id: 'c-214-2', name: 'Zara Ahmed', initials: 'ZA', storeId: 's-214', department: 'Computing', skills: ['Cash office', 'Till trained'], trainingExpiringDays: 3, trainingRenewal: 'Age verification' },
  { id: 'c-214-3', name: 'Connor Walsh', initials: 'CW', storeId: 's-214', department: 'TV & Audio', skills: ['First aider', 'Till trained'] },
  { id: 'c-214-4', name: 'Priya Nair', initials: 'PN', storeId: 's-214', department: 'Mobile & Wearables', skills: ['Age-restricted trained', 'Till trained'] },
  { id: 'c-214-5', name: 'Jack Thompson', initials: 'JT', storeId: 's-214', department: 'Large Appliances', skills: ['Manual handling', 'Forklift'] },
  { id: 'c-214-6', name: 'Emily Stone', initials: 'ES', storeId: 's-214', department: 'Customer Service', skills: ['Cash office', 'Refund authoriser'] },
  { id: 'c-214-7', name: 'Mohammed Ali', initials: 'MA', storeId: 's-214', department: 'Gaming', skills: ['Till trained', 'Age-restricted trained'] },
  { id: 'c-214-8', name: 'Sophie Turner', initials: 'ST', storeId: 's-214', department: 'Smart Home', skills: ['Till trained'] },
  { id: 'c-214-9', name: 'Daniel Green', initials: 'DG', storeId: 's-214', department: 'Computing', skills: ['Key holder', 'First aider'] },
  { id: 'c-214-10', name: 'Chloe Adams', initials: 'CA', storeId: 's-214', department: 'TV & Audio', skills: ['Till trained'], trainingExpiringDays: 12, trainingRenewal: 'First aid' },

  // ── Store 301 (light) ──────────────────────────────────────────────────
  { id: 'c-301-1', name: 'Harry Evans', initials: 'HE', storeId: 's-301', department: 'Gaming', skills: ['Key holder', 'Till trained'] },
  { id: 'c-301-2', name: 'Amara Okeke', initials: 'AO', storeId: 's-301', department: 'Computing', skills: ['Cash office'] },
  { id: 'c-301-3', name: 'Lucy Webb', initials: 'LW', storeId: 's-301', department: 'Customer Service', skills: ['Refund authoriser'] },

  // ── Store 204 (light) ──────────────────────────────────────────────────
  { id: 'c-204-1', name: 'Ethan Scott', initials: 'ES', storeId: 's-204', department: 'TV & Audio', skills: ['Till trained'] },
  { id: 'c-204-2', name: 'Fatima Noor', initials: 'FN', storeId: 's-204', department: 'Mobile & Wearables', skills: ['Age-restricted trained'] },
]

// Today's shifts at store 214. Connor Walsh (TV & Audio) has called in sick →
// drives the real-time redeployment scenario on a busy Saturday.
export const SHIFTS: Shift[] = [
  { id: 'sh-1', colleagueId: 'c-214-1', storeId: 's-214', department: 'Gaming', start: '08:30', end: '17:00', status: 'clocked_in' },
  { id: 'sh-2', colleagueId: 'c-214-2', storeId: 's-214', department: 'Computing', start: '09:00', end: '17:30', status: 'clocked_in' },
  { id: 'sh-3', colleagueId: 'c-214-3', storeId: 's-214', department: 'TV & Audio', start: '08:30', end: '17:00', status: 'absent' },
  { id: 'sh-4', colleagueId: 'c-214-4', storeId: 's-214', department: 'Mobile & Wearables', start: '09:00', end: '17:30', status: 'clocked_in' },
  { id: 'sh-5', colleagueId: 'c-214-5', storeId: 's-214', department: 'Large Appliances', start: '08:00', end: '16:30', status: 'clocked_in' },
  { id: 'sh-6', colleagueId: 'c-214-6', storeId: 's-214', department: 'Customer Service', start: '09:00', end: '17:30', status: 'clocked_in' },
  { id: 'sh-7', colleagueId: 'c-214-7', storeId: 's-214', department: 'Gaming', start: '11:00', end: '19:30', status: 'scheduled' },
  { id: 'sh-8', colleagueId: 'c-214-8', storeId: 's-214', department: 'Smart Home', start: '10:00', end: '18:30', status: 'clocked_in' },
  { id: 'sh-9', colleagueId: 'c-214-9', storeId: 's-214', department: 'Computing', start: '12:00', end: '20:00', status: 'scheduled' },
  { id: 'sh-10', colleagueId: 'c-214-10', storeId: 's-214', department: 'TV & Audio', start: '13:00', end: '20:00', status: 'scheduled' },
]

export const COLLEAGUE_BY_ID = Object.fromEntries(COLLEAGUES.map((c) => [c.id, c])) as Record<
  string,
  Colleague
>

export function colleaguesInStore(storeId: string): Colleague[] {
  return COLLEAGUES.filter((c) => c.storeId === storeId)
}

export function shiftsInStore(storeId: string): Shift[] {
  return SHIFTS.filter((s) => s.storeId === storeId)
}
