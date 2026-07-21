import type { Role } from '@/types'
import { useAppStore } from '@/store/useAppStore'

export interface TourStep {
  id: string
  /** Persona to switch to before the step. */
  persona?: Role
  /** Route to navigate to before the step. */
  route?: string
  /** data-tour anchor to spotlight. Omit for a centred message. */
  target?: string
  title: string
  body: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  /** Side effect to run on entering the step (e.g. complete a task). */
  action?: () => void
  /** Dwell time in autoplay mode (ms). */
  advanceMs?: number
}

const PROMO_TASK = 'task-sig-214-promo'

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    persona: 'HQ',
    route: '/hq',
    title: 'Welcome to the Store Operations Copilot',
    body: 'A quick tour of how operational signals become prioritised actions, proof of execution and escalations — across HQ, region and store. Use Next, or hit Play to watch it run.',
    placement: 'center',
    advanceMs: 6000,
  },
  {
    id: 'estate-health',
    persona: 'HQ',
    route: '/hq',
    target: 'estate-health',
    title: 'Estate health at a glance',
    body: 'HQ opens on a single composite score across compliance, execution, stock and service for the whole estate.',
    advanceMs: 5500,
  },
  {
    id: 'pillar-tiles',
    persona: 'HQ',
    route: '/hq',
    target: 'pillar-tiles',
    title: 'Operational themes',
    body: 'The five pillars show where attention is needed today — Trading and Stock are dipping.',
    advanceMs: 5500,
  },
  {
    id: 'signals',
    persona: 'HQ',
    route: '/hq/signals',
    target: 'signals-first',
    title: 'Why the Copilot prioritised these',
    body: 'Every signal maps to a transparent rule that produces a ranked, evidence-required task. No black box.',
    advanceMs: 6500,
  },
  {
    id: 'store-priorities',
    persona: 'Store',
    route: '/store',
    target: 'priority-1',
    title: 'The colleague’s prioritised day',
    body: 'On the in-store device, the same signals arrive as a ranked plan — highest impact first. Top of the list: build & verify the promo end cap, £3,200 at risk.',
    advanceMs: 6500,
  },
  {
    id: 'task-detail',
    persona: 'Store',
    route: `/store/task/${PROMO_TASK}`,
    target: 'task-steps',
    title: 'Work the task with proof',
    body: 'Clear steps, with photo and count evidence required so execution is verifiable end-to-end.',
    advanceMs: 6000,
  },
  {
    id: 'task-complete',
    persona: 'Store',
    route: '/store',
    title: '£3,200 protected — instantly',
    body: 'Completing the task updates KPIs and re-ranks the list in real time, and it rolls up to region and HQ.',
    placement: 'center',
    action: () => useAppStore.getState().completeTask(PROMO_TASK),
    advanceMs: 5500,
  },
  {
    id: 'clienteling',
    persona: 'Store',
    route: '/store/assist?q=' + encodeURIComponent('Laptop for a student doing video editing, around £700'),
    target: 'assist-results',
    title: 'The Copilot also helps you sell',
    body: 'Clienteling: a customer need becomes in-stock matches with accessory and care-plan attach — same assistant, different skill.',
    advanceMs: 7000,
  },
  {
    id: 'save-the-sale',
    persona: 'Store',
    route: '/store/assist?q=' + encodeURIComponent('portable air conditioner for the heatwave'),
    target: 'assist-results',
    title: 'Never lose the sale to “out of stock”',
    body: 'When a line is short here, the Copilot sources it from the nearest store — reserve, same-day courier or ship-from-store — and drops it into the same basket. A walk-out becomes a saved sale.',
    advanceMs: 7000,
  },
  {
    id: 'signal-to-shelf',
    persona: 'Store',
    route: '/store/stock',
    target: 'signal-to-shelf',
    title: 'Signal-to-Shelf: catch the gap before it costs',
    body: 'Demand signals — social buzz, a live promo, the heatwave — become days of cover, the delivery gap and the £ at risk on each line, with a one-tap transfer (pick which store to pull from) or a PO to close it.',
    advanceMs: 7000,
  },
  {
    id: 'repair-desk',
    persona: 'Store',
    route: '/store/repairs',
    target: 'repair-desk',
    title: 'A whole repair, in one place',
    body: 'Screen the fault, get an automatic repair / replace / write-off recommendation, check the customer’s cover — a Care & Repair plan, warranty or Currys Mobile Insurance — and resolve it in a single guided flow.',
    advanceMs: 7000,
  },
  {
    id: 'my-team',
    persona: 'Store',
    route: '/store/workforce',
    target: 'my-team',
    title: 'Your team at a glance',
    body: 'Every colleague with their shift, skills, training renewals and how their day is going — and when someone is absent, a suggested cover matched on skills and availability.',
    advanceMs: 7000,
  },
  {
    id: 'social',
    persona: 'HQ',
    route: '/hq/social',
    target: 'social-trends',
    title: 'Social media is a demand signal',
    body: 'When a product trends on Instagram or TikTok, HQ can push a “get ready” action straight to the right stores — stocked and merchandised before the rush.',
    advanceMs: 6500,
  },
  {
    id: 'region-sla',
    persona: 'Regional',
    route: '/region',
    target: 'region-exceptions',
    title: 'Exceptions escalate with SLAs',
    body: 'Regional managers see a live league table and an SLA-tracked exception inbox — and can nudge a lagging store in one tap.',
    advanceMs: 6500,
  },
  {
    id: 'impact',
    persona: 'HQ',
    route: '/impact',
    target: 'impact-headlines',
    title: 'Closing the loop',
    body: 'Completed actions become measurable outcomes — compliance up, risk mitigated in £. Execution tied to ROI.',
    advanceMs: 6500,
  },
  {
    id: 'end',
    title: 'That’s the loop',
    body: 'Signals → prioritised actions → proof → escalation → measurable impact. Hit Reset any time to run it again. Enjoy exploring!',
    placement: 'center',
    advanceMs: 7000,
  },
]
