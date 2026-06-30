import type { Source } from '@/types'

// Public sources used to define the GENERIC category requirements for this demo.
// Shown in the Sources panel so the demo can be described as "based on public
// category research" rather than copied from any single vendor.
export const SOURCES: Source[] = [
  {
    id: 'src-axonify',
    name: 'Axonify — “Top 10 retail execution software compared for 2026”',
    type: 'Public blog',
    url: 'https://axonify.com/blog/retail-execution-platforms/',
    informed:
      'Capability taxonomy: task management & digital checklists, escalation workflows, frontline comms, training, mobile/offline, performance analytics, POS/HRIS integration; the five common execution challenges.',
  },
  {
    id: 'src-quorso',
    name: 'Quorso — Intelligent Management Platform',
    type: 'Vendor site',
    url: 'https://www.quorso.com/',
    informed:
      'The “Missions” model: turning operational data into prioritised daily actions per manager; Store / District / Central personas; closing the loop from insight to measured impact.',
  },
  {
    id: 'src-currys',
    name: 'Currys',
    type: 'Retailer site',
    url: 'https://www.currys.co.uk/',
    informed:
      'Electronics service operations vocabulary: repairs & setup, video shopping expert, care & repair plans, trade-in and price-match.',
  },
  {
    id: 'src-argos',
    name: 'Argos',
    type: 'Retailer site',
    url: 'https://www.argos.co.uk/',
    informed:
      'Fast Track collection & Click & Collect, protection plans, loyalty points, buy-now-pay-later, cashback / clearance deals, plus category & promotion language.',
  },
  {
    id: 'src-leaders',
    name: 'Yoobic · Reflexis (Zebra) · GoSpotCheck · Repsly · StoreForce',
    type: 'Category leaders',
    informed:
      'Cross-reference for frontline communications, labour + task integration, photo evidence / compliance audits, and store league tables & performance tracking.',
  },
  {
    id: 'src-requirements',
    name: 'Customer-provided 14-domain store task list',
    type: 'Requirements',
    informed:
      'The canonical operating model: 14 task domains spanning People & HR, Scheduling, Comms, Trading routines, Task execution, Stock, Fulfilment, Merchandising, Safety, Loss prevention, Equipment/IT, Training, Supplier and Returns.',
  },
]

export const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s])) as Record<
  string,
  Source
>
