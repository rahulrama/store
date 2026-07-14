// Plain-English explanations used by both the inline help tips (ⓘ popovers) and
// the onboarding guide. One source of truth so they never drift apart.
// Everything here is written for a layman / a brand-new store colleague.

export interface HelpEntry {
  id: string
  term: string
  /** Short one-liner shown as the popover heading context. */
  short: string
  /** Full plain-English explanation. Length is fine — clarity over brevity. */
  body: string
  /** Optional "what to do" guidance. */
  whatToDo?: string
}

export const HELP: Record<string, HelpEntry> = {
  estateHealth: {
    id: 'estateHealth',
    term: 'Estate health',
    short: 'One score for how the whole chain is running right now.',
    body: 'A single 0–100 score for how well the whole chain of stores is running at this moment. It blends four things together: are tasks getting done, are stores following the rules (compliance), is popular stock actually on the shelf, and are service promises (like Click & Collect) being met. Think of it as the “are we OK today?” number for the person running every store.',
    whatToDo:
      '85 or above is healthy. 75–84 is worth a look. Under 75 needs action — start with the “Stores needing attention” list.',
  },
  operationalThemes: {
    id: 'operationalThemes',
    term: 'Operational themes (the 5 pillars)',
    short: 'Every store job grouped into five buckets.',
    body: 'Every job a store does is grouped into five buckets so leaders can see at a glance where the trouble is: People & Workforce, Trading & Execution, Stock & Fulfilment, Risk/Safety/Compliance, and Enablement & Support. Each tile shows a 0–100 health score for that area across the estate — the lower it is, the more attention that part of the business needs today.',
    whatToDo: 'Click a low-scoring tile to see which stores and tasks are dragging it down.',
  },
  pillarPeople: {
    id: 'pillarPeople',
    term: 'People & Workforce',
    short: 'Colleagues: hiring, rotas, shift cover, training.',
    body: 'Everything about the people who work in the store: bringing new colleagues on board and inducting them, building rotas and covering shifts, and keeping training and coaching up to date. A low score usually means stores are short-staffed for the day, or colleagues are behind on training they are legally required to have (like age-restricted sales).',
  },
  pillarTrading: {
    id: 'pillarTrading',
    term: 'Trading & Execution',
    short: 'The day-to-day of actually trading the store.',
    body: 'The core day-to-day of running the shop floor: opening and closing the store correctly, getting the daily list of tasks done, and setting up promotions and displays the way Head Office intended. A low score means promotions or daily routines are not being carried out properly — for example a deal is live but the display was never built, so customers never see it.',
  },
  pillarStock: {
    id: 'pillarStock',
    term: 'Stock & Fulfilment',
    short: 'Right products, right place, right time.',
    body: 'Having the right products in the right place at the right time: refilling shelves from the stockroom, organising the back of house, picking Click & Collect and delivery orders, and handling supplier deliveries. A low score means items are out of stock on the shop floor, or online orders are not being picked and handed over on time.',
  },
  pillarRisk: {
    id: 'pillarRisk',
    term: 'Risk, Safety & Compliance',
    short: 'Keeping the store safe and legal.',
    body: 'Keeping the store safe and on the right side of the law: health & safety checks, fire safety, selling age-restricted items correctly (like 18-rated games), preventing theft, and handling returns properly. A low score means required checks are overdue or rules are not being followed — which is a legal and safety risk, not just a sales one.',
  },
  pillarEnablement: {
    id: 'pillarEnablement',
    term: 'Enablement & Support',
    short: 'The tools and info colleagues need to do the job.',
    body: 'The tools and information colleagues need to do their jobs well: store-wide communications, easy access to “how do I…” knowledge, and getting broken equipment or IT fixed (tills, label printers, fridges, handhelds). A low score means broken kit or missing information is slowing the team down.',
  },
  priority: {
    id: 'priority',
    term: 'Priority (P1 / P2 / P3)',
    short: 'How urgent an action is.',
    body: 'How urgent an action is. P1 (Critical) means do it now — it is high impact or has a tight deadline. P2 (High) is important, do it today. P3 (Routine) is a standard task to fit around the priorities. The Copilot works this out automatically from how serious the issue is, how much money is at risk, and how soon it is due — so the team always knows what to do first.',
  },
  openExceptions: {
    id: 'openExceptions',
    term: 'Open exceptions',
    short: 'Problems a store escalated for help.',
    body: 'Problems a store could not fix on its own and has escalated for help — for example a broken fridge sent to Facilities, or a sold-out promo line sent to the supply team. Each one is on a clock (an SLA). A high number means there are lots of unresolved blockers across the estate.',
    whatToDo: 'Open the Escalations board to see who owns each one and how long is left on its clock.',
  },
  overdueActions: {
    id: 'overdueActions',
    term: 'Overdue actions',
    short: 'Tasks past their due time, not done.',
    body: 'Tasks that have gone past their due time without being completed. A rising count is an early warning that a store is falling behind on the day’s plan.',
  },
  completionRate: {
    id: 'completionRate',
    term: 'Completion rate',
    short: 'Share of today’s tasks finished.',
    body: 'The percentage of today’s tasks that have been finished. Higher is better — it shows how well the plan is actually being carried out on the shop floor, not just how good the plan looks on paper.',
  },
  storesAtRisk: {
    id: 'storesAtRisk',
    term: 'Stores at risk / needing attention',
    short: 'Stores flagged because something is off.',
    body: 'Stores the system has flagged because something is off — low compliance, sales well below target, open exceptions, or high out-of-stock. These are the stores a regional manager should focus on first today.',
  },
  sla: {
    id: 'sla',
    term: 'SLA (Service Level Agreement)',
    short: 'The agreed time limit to fix an escalation.',
    body: 'The agreed time limit to deal with an escalated problem — for example IT has 4 hours, Facilities has 24. The coloured chip shows On track, At risk (time running low) or Breached (over the limit), so nothing important quietly gets forgotten.',
  },
  compliance: {
    id: 'compliance',
    term: 'Compliance %',
    short: 'How consistently a store follows procedures.',
    body: 'How consistently a store follows the required procedures and standards — safety checks, correct pricing, promotion set-up, age checks, and so on. A higher number means fewer mistakes and less legal or safety risk.',
  },
  attachRate: {
    id: 'attachRate',
    term: 'Attach rate',
    short: 'How often an add-on sells with a main product.',
    body: 'How often an add-on is sold alongside a main product — like a case with a phone, or a protection plan with a laptop. It is a simple measure of whether colleagues are offering the right extras; a higher attach rate means bigger baskets and more value per customer.',
  },
  conversion: {
    id: 'conversion',
    term: 'Conversion %',
    short: 'Share of visitors who actually buy.',
    body: 'Of the customers who come into the store, the percentage who actually buy something. When conversion is low but the store is busy, it usually means something is getting in the way — no stock, no display, or nobody free to help.',
  },
  oosRate: {
    id: 'oosRate',
    term: 'Out-of-stock (OOS) rate',
    short: 'Share of tracked products not on the floor.',
    body: 'The share of tracked products that are not available on the shop floor. A high out-of-stock rate means lost sales and frustrated customers who came in specifically for that item.',
  },
  csat: {
    id: 'csat',
    term: 'CSAT',
    short: 'Customer satisfaction score.',
    body: 'Customer satisfaction score, from 0–100, drawn from feedback and reviews. A quick read on how shoppers actually feel about the store experience.',
  },
  signals: {
    id: 'signals',
    term: 'Signals',
    short: 'The raw alerts the Copilot turns into actions.',
    body: 'The raw operational “alerts” the system picks up from data across all 14 job areas — a promotion not selling, stock running out, a colleague off sick, a fridge fault. On their own they are just noise. The Copilot reads them, works out which matter most, and turns them into the ranked, plain-English action list that is the heart of the tool.',
  },
  socialPulse: {
    id: 'socialPulse',
    term: 'Social pulse',
    short: 'What’s trending on social media right now.',
    body: 'A read on what is happening on social media (Instagram, TikTok) that could affect stores today — products going viral, the brand’s own posts driving footfall, and overall customer sentiment. When something trends, the Copilot can turn it into a store action, like bringing stock forward or making sure the display is built before the rush.',
    whatToDo: 'A spike here often means a busy day coming for that product — get the stock and display ready.',
  },
  priorityScore: {
    id: 'priorityScore',
    term: 'Priority score',
    short: 'The number behind the ranking.',
    body: 'The number the Copilot calculates to rank actions: severity × money at risk × how close the deadline is. You don’t need to do the maths — it just guarantees the most valuable, most urgent job sits at the top of the list.',
  },
  personas: {
    id: 'personas',
    term: 'HQ / Region / Store views',
    short: 'The same platform, three viewpoints.',
    body: 'The same platform seen from three angles. HQ sees the whole estate and sets direction. Region manages a group of stores and clears blockers. Store is the colleague on the shop floor doing the work and proving it’s done. Use the buttons at the top-left to switch between them.',
  },
  evidence: {
    id: 'evidence',
    term: 'Proof of execution (evidence)',
    short: 'Showing a task was really done.',
    body: 'Some tasks ask for proof that the work was actually done — a photo of the finished display, a stock count, or a quick note. This “evidence” means a manager at Region or HQ can trust the job is complete without driving to the store to check.',
  },
  valueAtRisk: {
    id: 'valueAtRisk',
    term: 'Value at risk',
    short: 'The money the open tasks could lose if ignored.',
    body: 'The total estimated money the store could lose today if the open tasks are not actioned — for example, a promotion that isn’t selling because the display was never built, or sales lost while a popular item is off the shelf. It’s the Copilot’s way of putting a pound value on “why this matters”, so the team can see the cost of doing nothing.',
    whatToDo: 'Work the priorities top-down — each task you complete removes its slice of the value at risk. Start with the P1s, where the money and urgency are highest.',
  },
  riskMitigated: {
    id: 'riskMitigated',
    term: 'Risk mitigated',
    short: 'The money protected by work done today.',
    body: 'The opposite of value at risk: the total money the team has already protected today by completing tasks — sales saved, lost stock avoided, compliance breaches prevented. It’s the running tally of the difference the work has made since this morning.',
  },
  weeksOfSupply: {
    id: 'weeksOfSupply',
    term: 'Weeks of supply',
    short: 'How many weeks the stock on hand will last.',
    body: 'How long the current stock of a line will last at the rate it’s selling — the amount on hand divided by how many sell in a week. A low number means it will run out soon and needs reordering; a very high number means there’s more on the shelf than is selling. It’s a smarter signal than a raw count, because three units is fine for a slow seller but a stockout tomorrow for a fast one.',
  },
  vocSentiment: {
    id: 'vocSentiment',
    term: 'Voice of Customer sentiment',
    short: 'How customers feel, from in-store feedback.',
    body: 'A 0–100 score for how customers feel, built from short, anonymous notes colleagues capture after talking to them in store. It’s first-party feedback — no names or personal details, just how the conversation went and what the issue was — and it rolls up from a single store to the region and the whole estate. It sits alongside the external Social Pulse to give both the inside and outside view.',
  },
  recoveredSales: {
    id: 'recoveredSales',
    term: 'Recovered sales',
    short: 'Money saved when an out-of-stock item is fulfilled from another store.',
    body: 'The value of sales that would have been lost because an item was out of stock locally, but were rescued by sourcing it from another store — reserved, couriered same-day, or shipped from that store to the customer. It turns a customer walking out empty-handed into a completed sale, and the running total shows how much revenue that has saved today.',
  },
  scorecard: {
    id: 'scorecard',
    term: 'Scorecard',
    short: 'A shareable, role-scoped snapshot of the numbers.',
    body: 'A one-page summary of the key numbers for whatever you are responsible for — a single store, a region, or the whole estate — covering trading, execution, stock, customer sentiment and recovered sales, with a plain-English summary you can print or copy into an email. Everything on it is scoped to what you own, so the figures always add up to your part of the business.',
  },
  pushToStore: {
    id: 'pushToStore',
    term: 'Push to store',
    short: 'Send this as an action to the store team.',
    body: 'Turns an insight (like a product trending on social media) into a real task on that store’s list, so the colleagues on the floor know exactly what to do — bring stock forward, build the display — before the rush arrives. It’s how a signal at HQ becomes action on the shop floor.',
  },
  campaignAdoption: {
    id: 'campaignAdoption',
    term: 'Display adoption',
    short: 'Share of stores that have built the promo display.',
    body: 'The percentage of stores that have actually set up the promotion’s display the way Head Office intended. Low adoption means a deal is live but customers in many stores never see it — a common reason a good promotion underperforms.',
  },
  salesLift: {
    id: 'salesLift',
    term: 'Sales uplift vs target',
    short: 'Extra sales the promo is generating vs the goal.',
    body: 'How much extra sales the promotion is driving compared with the target Head Office set for it. Comparing the actual uplift to the target — and to other regions — shows whether the promotion is working on the ground, not just on paper.',
  },
}

export function getHelp(id: string): HelpEntry | undefined {
  return HELP[id]
}
