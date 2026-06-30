import type { Sop } from '@/types'

// Just-in-time SOP / knowledge cards. The Copilot "Ask" skill keyword-matches
// against these to return grounded answers during the demo.
export const SOPS: Sop[] = [
  {
    id: 'sop-endcap',
    title: 'Build & verify a promotional end cap',
    domainId: 'merchandising',
    department: 'Gaming',
    summary: 'How to set up a promotional end cap so it is compliant and selling within 30 minutes.',
    keywords: ['endcap', 'end cap', 'display', 'promo', 'merchandising', 'gondola', 'set up display', 'console bundle'],
    steps: [
      'Collect the promo kit (header card, shelf tickets, barker cards) from the comms folder.',
      'Clear the gondola end and clean the shelves before building.',
      'Place hero stock at eye level; ensure at least 6 facings of the bundle.',
      'Apply the bundle ticket and check the price matches the promo guidance.',
      'Power the demo unit and load the featured title/loop.',
      'Photograph the finished end cap and mark the task complete to verify compliance.',
    ],
  },
  {
    id: 'sop-age-restricted',
    title: 'Age-restricted sale & refusal process (Challenge 25)',
    domainId: 'loss-prevention',
    summary: 'Selling PEGI 18 games and other age-restricted lines, and how to log a refusal.',
    keywords: ['age', 'age restricted', 'pegi', 'pegi 18', 'challenge 25', 'refusal', 'id check', 'underage'],
    steps: [
      'If the customer looks under 25, ask for valid photo ID (passport, driving licence, PASS card).',
      'Check the date of birth confirms they are 18 or over for PEGI 18 titles.',
      'If ID is not provided or is invalid, politely refuse the sale.',
      'Log the refusal in the refusals register with time and reason.',
      'Never feel pressured — escalate aggression to the duty manager / security.',
    ],
  },
  {
    id: 'sop-trade-in',
    title: 'Process a smartphone trade-in + cashback',
    domainId: 'returns-service',
    department: 'Mobile & Wearables',
    summary: 'Taking an old handset in trade and registering the cashback claim.',
    keywords: ['trade-in', 'trade in', 'cashback', 'phone', 'handset', 'part exchange'],
    steps: [
      'Run the device through the trade-in calculator on the kiosk to grade it.',
      'Confirm the customer has signed out of all accounts and removed the SIM/SD card.',
      'Factory-reset the device and verify it powers to setup screen.',
      'Apply the trade-in value against the new handset at the till.',
      'Help the customer scan the cashback QR card to register their claim.',
    ],
  },
  {
    id: 'sop-click-collect',
    title: 'Click & Collect handover and ID verification',
    domainId: 'fulfilment',
    department: 'Customer Service',
    summary: 'Handing over a collection order correctly, including ID checks for high-value items.',
    keywords: ['click and collect', 'click & collect', 'collection', 'handover', 'fast track', 'pick up', 'id verification'],
    steps: [
      'Ask for the order reference and the collector’s name.',
      'For high-value or age-restricted items, verify photo ID matches the order.',
      'Retrieve the order from the staging area and check the items against the pick list.',
      'Confirm the customer is happy, then scan to close the collection.',
      'Capture proof of collection (signature or scan) on the handheld.',
    ],
  },
  {
    id: 'sop-temperature-log',
    title: 'Stockroom temperature & equipment check',
    domainId: 'safety-compliance',
    summary: 'Daily temperature log for the stockroom chiller and the staff vending area.',
    keywords: ['temperature', 'temp log', 'fridge', 'chiller', 'compliance check', 'safety check'],
    steps: [
      'Read the chiller thermometer and record the temperature on the digital form.',
      'Acceptable range is 1°C to 5°C — if outside, raise an equipment fault immediately.',
      'Check the door seal and that nothing is blocking airflow.',
      'Sign and timestamp the log; the task captures this as evidence.',
    ],
  },
  {
    id: 'sop-equipment-fault',
    title: 'Log an equipment / facilities fault',
    domainId: 'equipment-it',
    summary: 'Reporting a broken till, display fridge, printer or facilities issue to the right team.',
    keywords: ['fault', 'broken', 'repair', 'facilities', 'till down', 'printer', 'fridge', 'equipment', 'escalate'],
    steps: [
      'Make the area safe and put any affected equipment out of use.',
      'Open a fault ticket and select the category (IT for tills/printers, Facilities for fridges/heating/lighting).',
      'Add a short description and a photo of the issue.',
      'The system routes it to the right team with an SLA — track it on the Escalations board.',
    ],
  },
  {
    id: 'sop-escalation-matrix',
    title: 'Who to contact for what (escalation matrix)',
    domainId: 'comms-knowledge',
    summary: 'The right team and SLA for common store exceptions.',
    keywords: ['escalation', 'who to contact', 'contact', 'matrix', 'help', 'support', 'raise'],
    steps: [
      'Tills, handhelds, network, passwords → IT Service Desk (4h SLA).',
      'Fridges, heating, lighting, leaks → Facilities (24h SLA, sooner if safety).',
      'Out-of-stock with none on order → Stock / Supply team (8h SLA).',
      'People, pay, absence, conduct → HR / Regional Manager.',
      'Theft, aggression, shrink → Loss Prevention (immediate if in progress).',
    ],
  },
  {
    id: 'sop-care-plan',
    title: 'Explain care & protection plan benefits',
    domainId: 'returns-service',
    summary: 'Talking points to attach a care plan at the point of sale.',
    keywords: ['care plan', 'protection', 'warranty', 'attach', 'cover', 'knowhow'],
    steps: [
      'Lead with peace of mind: accidental damage and breakdown cover beyond the guarantee.',
      'Mention fast repair or replacement and no-quibble support.',
      'Tailor to the product (e.g. screen damage for laptops/phones, parts & labour for appliances).',
      'Offer monthly or one-off payment options.',
    ],
  },
  {
    id: 'sop-opening',
    title: 'Store opening checklist',
    domainId: 'opening-closing',
    summary: 'The safe-start routine before the doors open.',
    keywords: ['opening', 'open up', 'morning', 'checklist', 'alarm', 'safety walk'],
    steps: [
      'Disarm the alarm and complete the lone-working check-in.',
      'Walk the floor for safety hazards and overnight issues.',
      'Power up tills, kiosks and the demo units; verify the network is up.',
      'Check the cash office float and set up tills.',
      'Brief the team on today’s priorities and promos before opening the doors.',
    ],
  },
  {
    id: 'sop-redeploy',
    title: 'Real-time redeployment during a peak',
    domainId: 'scheduling',
    summary: 'Covering an absence or a queue surge by moving colleagues to where demand is.',
    keywords: ['redeploy', 'redeployment', 'absence', 'cover', 'queue', 'peak', 'staffing', 'move colleague'],
    steps: [
      'Check live cover by department against expected footfall.',
      'Identify a colleague with the right skills who can move without leaving a gap.',
      'Brief them on the move and the priority (e.g. man the TV wall during the promo).',
      'Update the rota so the change is visible to the team and region.',
    ],
  },
]

export function searchSops(query: string): Sop[] {
  const q = query.toLowerCase()
  const terms = q.split(/\s+/).filter(Boolean)
  return SOPS.map((sop) => {
    let score = 0
    for (const kw of sop.keywords) {
      if (q.includes(kw)) score += 3
    }
    for (const term of terms) {
      if (sop.title.toLowerCase().includes(term)) score += 2
      if (sop.keywords.some((kw) => kw.includes(term))) score += 1
      if (sop.summary.toLowerCase().includes(term)) score += 1
    }
    return { sop, score }
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.sop)
}
