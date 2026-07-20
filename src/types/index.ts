// ─────────────────────────────────────────────────────────────────────────────
// wattsRus Store Operations Copilot — domain types
// All data is synthetic. No backend. See /src/data for the seeded estate.
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'HQ' | 'Regional' | 'Store' | 'Colleague'

/** The 5 operational pillars that group the 14 domains. */
export type PillarId = 'people' | 'trading' | 'stock' | 'risk' | 'enablement'

/** The 14 operational task domains (the canonical operating model). */
export type DomainId =
  | 'people-hr' // 1  People, HR & workforce admin
  | 'scheduling' // 2  Scheduling, labour & shift ops
  | 'comms-knowledge' // 3  Communications & knowledge access
  | 'opening-closing' // 4  Opening, closing & daily trading
  | 'task-execution' // 5  Task management & operational execution
  | 'stock-replenishment' // 6  Stock, replenishment & back-of-house
  | 'fulfilment' // 7  Customer fulfilment (C&C, delivery)
  | 'merchandising' // 8  Merchandising, pricing & promotions
  | 'safety-compliance' // 9  Quality, safety & regulatory compliance
  | 'loss-prevention' // 10 Loss prevention, security & risk
  | 'equipment-it' // 11 Equipment, IT & operational support
  | 'training-coaching' // 12 Training, coaching & performance
  | 'supplier' // 13 Supplier & partner interactions
  | 'returns-service' // 14 Customer service & returns

export type DemoDepth = 'deep' | 'represented' | 'catalogued'

export interface Pillar {
  id: PillarId
  name: string
  /** CSS token name, e.g. "pillar-people" → bg-pillar-people */
  color: string
  blurb: string
  domainIds: DomainId[]
}

export interface Domain {
  id: DomainId
  /** 1–14, matches the requirements list ordering. */
  index: number
  name: string
  pillarId: PillarId
  depth: DemoDepth
  blurb: string
  /** Representative line items from the requirements (used by the catalogue). */
  examples: string[]
}

// ── Org & estate ────────────────────────────────────────────────────────────

export interface Region {
  id: string
  name: string
  managerUserId: string
}

export type StoreFormat = 'Superstore' | 'High Street' | 'Retail Park' | 'Outlet'

export interface Store {
  id: string
  /** Branch number shown to users, e.g. "214". */
  code: string
  name: string
  town: string
  regionId: string
  format: StoreFormat
  managerUserId: string
  departments: Department[]
}

export type Department =
  | 'TV & Audio'
  | 'Computing'
  | 'Gaming'
  | 'Mobile & Wearables'
  | 'Smart Home'
  | 'Large Appliances'
  | 'Customer Service'

export interface User {
  id: string
  name: string
  role: Role
  jobTitle: string
  regionId?: string
  storeId?: string
  initials: string
}

// ── Catalogue, promotions & inventory ───────────────────────────────────────

export type ProductCategory = Department

export interface Product {
  id: string
  sku: string
  name: string
  brand: string
  category: ProductCategory
  price: number
  /** Short merchandising blurb used by the Copilot recommender. */
  blurb: string
  /** Free-text tags for clienteling matches (e.g. "student", "video editing"). */
  tags: string[]
  /** SKUs that pair well — used for attach suggestions. */
  attachSkus?: string[]
  /** Eligible for a protection/care plan attach. */
  carePlan?: boolean
}

export type PromoMechanic =
  | 'Bundle'
  | 'Price cut'
  | 'Trade-in'
  | 'Cashback'
  | 'Multibuy'
  | 'Clearance'

export interface Promotion {
  id: string
  name: string
  mechanic: PromoMechanic
  description: string
  startDate: string
  endDate: string
  productSkus: string[]
  /** Target sales uplift vs baseline, as a fraction (0.2 = +20%). */
  targetUplift: number
  /** Headline merchandising instruction for stores. */
  executionNote: string
}

export type StockStatus = 'in_stock' | 'low' | 'out_of_stock'

export interface InventoryItem {
  storeId: string
  sku: string
  onHand: number
  onOrder: number
  status: StockStatus
}

/** A "save the sale" record — an out-of-stock line fulfilled from another store. */
export interface FulfilmentLog {
  id: string
  sku: string
  /** The store where the customer was standing (out of stock). */
  fromStoreId: string
  /** The store the stock is sourced from. */
  sourceStoreId: string
  type: 'reserve-collect' | 'store-transfer' | 'same-day-courier' | 'ship-from-store'
  valueGBP: number
  at: string
}

export type FeedbackSentiment = 'negative' | 'neutral' | 'positive'

/** Where a piece of customer feedback came from — in-store capture or an external review/survey channel. */
export type FeedbackSource = 'In-store' | 'Qualtrics' | 'Google' | 'Trustpilot'

/**
 * In-store customer sentiment captured by a colleague. PII-free by design:
 * no customer name or contact — only the staff member, an age *band*, and
 * structured categories.
 */
export interface CustomerFeedback {
  id: string
  storeId: string
  capturedByUserId: string
  capturedAt: string
  sentiment: FeedbackSentiment
  /** What the customer was looking at (department label, may be "Multiple / Other"). */
  department: string
  skus: string[]
  /** Issue categories (non-positive) or positive drivers, depending on sentiment. */
  issues: string[]
  intent?: string
  outcome?: string
  ageBand?: string
  notes?: string
  /** Channel the feedback arrived through (defaults to in-store capture when unset). */
  source?: FeedbackSource
}

// ── KPIs ─────────────────────────────────────────────────────────────────────

export interface StoreKpi {
  storeId: string
  salesVsTargetPct: number // 100 = on target
  conversionPct: number
  attachRatePct: number // accessory / care-plan attach
  carePlanAttachPct: number
  oosRatePct: number
  compliancePct: number
  csat: number // 0–100
  /** Day sales so far, VAT-inclusive (£) — the base figure the ex/inc-VAT toggle works from. */
  salesTodayGBP: number
  /** Share of sales that are online / click & collect (omnichannel mix), 0–100. */
  onlineSharePct: number
  /** Gross margin on sales, 0–100. */
  grossMarginPct: number
  /** Snapshot of the same KPIs at the start of the day (for "impact since morning"). */
  morning: {
    compliancePct: number
    attachRatePct: number
    conversionPct: number
  }
}

// ── Signals → Tasks ───────────────────────────────────────────────────────────

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export type SignalType =
  | 'PromoUnderperforming'
  | 'DisplayUnverified'
  | 'PriceMismatch'
  | 'OutOfStock'
  | 'LowAttachRate'
  | 'ClickCollectAgeing'
  | 'ColleagueAbsence'
  | 'TrainingExpiring'
  | 'EquipmentFault'
  | 'ComplianceDue'
  | 'AgeRestrictedRefusal'
  | 'ShrinkAnomaly'
  | 'NegativeFeedback'
  | 'SocialTrend'

export interface Signal {
  id: string
  type: SignalType
  severity: Severity
  domainId: DomainId
  storeId: string
  sku?: string
  promotionId?: string
  colleagueId?: string
  detectedAt: string
  /** Human-readable explanation of what tripped. */
  message: string
  /** The measured value and the threshold it breached (drives the rule). */
  metric?: { label: string; value: number | string; threshold: number | string; unit?: string }
  /** Estimated financial value at risk, GBP. */
  estImpactGBP: number
}

export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete' | 'escalated'
export type Priority = 'P1' | 'P2' | 'P3'
export type TaskSource = 'ai' | 'manual' | 'template'
export type StepType = 'check' | 'photo' | 'count' | 'price'

export interface TaskStep {
  id: string
  label: string
  type: StepType
  done: boolean
  /** Captured value for count/price steps. */
  value?: string
}

export interface Evidence {
  id: string
  type: 'photo' | 'note' | 'count' | 'price'
  label: string
  value: string
  capturedByUserId: string
  capturedAt: string
}

export type EscalationTarget = 'IT' | 'Facilities' | 'Regional' | 'Stock' | 'LossPrevention' | 'HR'

export interface EscalationUpdate {
  at: string
  byUserId: string
  note: string
}

export interface Escalation {
  id: string
  target: EscalationTarget
  reason: string
  slaHours: number
  startedAt: string
  status: 'open' | 'acknowledged' | 'resolved'
  thread: EscalationUpdate[]
}

export interface Task {
  id: string
  title: string
  /** "Why this matters" — the rationale shown on the priority card. */
  rationale: string
  /** Suggested action text. */
  suggestedAction: string
  source: TaskSource
  domainId: DomainId
  pillarId: PillarId
  priority: Priority
  priorityScore: number
  status: TaskStatus
  storeId: string
  ownerUserId: string
  dueAt: string
  createdAt: string
  estImpactGBP: number
  evidenceRequired: boolean
  sourceSignalId?: string
  steps: TaskStep[]
  evidence: Evidence[]
  escalation?: Escalation
  /** Department this task belongs to, when relevant. */
  department?: Department
  /** Completed timestamp. */
  completedAt?: string
}

export interface TaskTemplate {
  id: string
  title: string
  domainId: DomainId
  defaultPriority: Priority
  evidenceRequired: boolean
  recurring?: 'daily' | 'weekly'
  steps: { label: string; type: StepType }[]
}

// ── Knowledge ────────────────────────────────────────────────────────────────

export interface Sop {
  id: string
  title: string
  domainId: DomainId
  department?: Department
  summary: string
  steps: string[]
  /** Keywords for the Copilot "Ask" skill. */
  keywords: string[]
}

// ── Workforce ──────────────────────────────────────────────────────────────

export interface Colleague {
  id: string
  name: string
  initials: string
  storeId: string
  department: Department
  /** Skills/badges, e.g. "Cash office", "Key holder", "First aider". */
  skills: string[]
  trainingExpiringDays?: number // days until a mandatory renewal lapses
}

export type ShiftStatus = 'scheduled' | 'clocked_in' | 'absent' | 'on_break'

export interface Shift {
  id: string
  colleagueId: string
  storeId: string
  department: Department
  start: string // "08:00"
  end: string // "16:30"
  status: ShiftStatus
}
