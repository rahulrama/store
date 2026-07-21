# Currys Store Operations Copilot — Handbook

> Reference for the team. The app is a self-contained, **100% synthetic, no-backend, installable PWA**. Log in with `admin` / `demostore`. Reset any time from the overflow menu (⋯ → **Reset demo**).

---

## 1. What this is
A Currys-branded **Store Operations Copilot**. It turns the operational data of a busy trading day into **prioritised action**, tracks execution with **proof**, **escalates** exceptions on SLAs, and rolls everything up into **measurable impact** — across four roles, plus customer-facing capabilities (clienteling, omnichannel fulfilment, in-store sentiment, and an exportable scorecard). The base project is "wattsRus"; it is re-skinned to Currys via **Admin & branding**.

---

## 2. The two loops

**Operations loop (the spine):**
`Signals → Copilot prioritises → Tasks (with evidence) → Escalations (SLAs) → Impact`

**Customer loop (the extension):**
`Customer need → Copilot recommends → sell / fulfil from another store → capture sentiment → action`

Unifying idea: **one Copilot, many skills** — *Prioritise* (runs the day), *Store* (ask your store — plain-English answers on your live numbers), *Ask* (SOP knowledge), *Recommend* (clienteling), *Explain* (why it prioritised something).

---

## 3. Personas (switch in the top bar)

| Persona | Who | What they see |
|---|---|---|
| **HQ** | Priya Shah (Central Retail Ops Director) | Estate Control Tower, Signals Explorer, Social Pulse, Voice of Customer, Analytics, Stock, Scorecard, Impact |
| **Regional** | Daniel Okafor (North) | Store Cockpit (league table), Escalations & SLAs, Stock, Voice of Customer, Scorecard |
| **Store** | Aisha Rahman — Manchester Fort #214 | Today (Daily Brief), Checklists, Stock, Team, Assist, Repairs, Feedback, Scorecard, Knowledge |
| **Colleague** | Rahul Ramakrishna — #214 | A focused mobile view: Today, Assist, Feedback capture |

*(Colleague is a distinct fourth persona — the shop-floor associate on a phone.)*

---

## 4. Operating model — 5 pillars, 14 domains
Every signal, task and KPI hangs off one of 14 domains, grouped into five pillars: **People & Workforce · Trading & Execution · Stock & Fulfilment · Risk, Safety & Compliance · Enablement & Support.**

### Domain Catalogue depth badges (what they mean, where they feed from)
Each domain card carries a build-depth badge (a `depth` field in `src/data/domains.ts`, rendered by `src/pages/DomainCatalogue.tsx`):

| Badge | Meaning | Examples |
|---|---|---|
| **Deep in demo** (green) | Fully built and worked end-to-end — interactive | Task execution, Merchandising & promotions, Scheduling, Opening/closing, Comms & knowledge, Customer service & returns (Repair Desk) |
| **Represented** (amber) | Present with real data/signals and visible, but not worked end-to-end in the scripted flow | Stock & replenishment, Customer fulfilment, Quality/safety/compliance |
| **Catalogued** (grey) | Listed for completeness as part of the operating model, not exercised in this demo | People/HR & workforce admin (and a couple of others) |

The "**N task templates**" count on each card feeds from `src/data/taskTemplates.ts`. Purpose: it shows the *whole* 14-domain model while being transparent about what is deeply built vs represented vs catalogued.

---

## 5. Feature reference

| Feature (where) | What it does |
|---|---|
| **Estate Control Tower** (HQ) | Health score, five pillar tiles, stores-at-risk, live signals feed |
| **Signals Explorer** (HQ) | Each signal → a transparent rule → a ranked, evidence-required task |
| **Today (Daily Brief)** (Store) | The prioritised day; KPIs incl. Value at risk; live promos; a Recovered sales card |
| **Task detail + evidence** | Steps, photo + count capture, Complete → KPIs move |
| **Escalations & SLAs** (Region) | Exception inbox with SLA countdowns; nudge a store |
| **Store Cockpit / league table** (Region) | Stores ranked by compliance / sales / stock |
| **Customer Assist — clienteling** (Store) | Need → in-stock matches + attach + care plan → running basket → Complete sale |
| **Fulfil from nearest store** (in Assist) | Out of stock/low → reserve / same-day courier / ship-from-store / transfer → same basket → recovered sale |
| **Stock** (Store/Region/HQ) | Weeks of supply, SKU×store heatmap, rebalance suggestions, "sold out — none on order" |
| **Signal-to-Shelf** (in Stock) | Demand signal (social / promo / heatwave / competitor) → days of cover → delivery gap → £ at risk → one-tap transfer (pick the donor store) or PO |
| **Repair Desk** (Store) | One place for a repair: fault + initial checks → auto repair / replace / write-off → cover (Care & Repair / manufacturer warranty / Currys Mobile Insurance) → resolve |
| **My Team** (Store) | Colleague 360 — shift, skills, training renewals, day stats + Recognise; suggested cover for an absence, matched on skills & availability; exception-first rota |
| **Ask your store** (Copilot) | Plain-English questions about live scope numbers — stock risk, sales vs target, margin, top complaint — answered from the same engines the pages use |
| **Voice of Customer + capture** (Colleague/HQ/Region) | PII-free mobile form → sentiment score, top issues, clusters → service-recovery task; multi-source (in-store, Qualtrics, Google, Trustpilot) |
| **Social Pulse** (HQ) | External social sentiment/trends as a demand signal |
| **Campaign Centre** (HQ) | Promo execution across the estate; promo↔stock alert when a promoted line is out of stock (£ at risk → Stock) |
| **Scorecard** (Store/Region/HQ) | Role-scoped KPIs + recovered sales + VoC + Today/7-day trends + narrative + Print / Copy; inc/ex-VAT toggle, online mix, gross margin, peer rank |
| **Impact** (HQ) | Since-morning outcomes — compliance ↑, risk mitigated (£), recovered sales across the estate |
| **Admin & branding** | Rebrand, device frame, auto-launch, reset |
| **Guided tour / Auto demo** (Demo menu) | ~90-sec cross-role script incl. a "save the sale" beat |

---

## 6. Metric glossary

- **Estate health** — composite of compliance, execution, stock and service across the estate.
- **Value at risk** — the estimated £ each open task could cost if ignored (lost sales, spoilage, compliance breach). Set per signal as `estImpactGBP` in `src/data/signals.ts`. On the **Daily Brief** it sums the **open** tasks.
- **Risk mitigated / value at risk protected** — the same pounds once the task is **done**. On **Impact** it is a £4,200 baseline (actions cleared before the session) plus the value of tasks completed today (e.g., "£7.4k protected" = baseline + completed-task values).
- **Compliance %** — share of required checks/tasks done to standard.
- **Conversion %** — browsers → buyers.
- **Attach rate / Care-plan attach** — % of sales with an add-on / a protection plan.
- **Out-of-stock (OOS) rate** — % of tracked lines out of stock.
- **Weeks of supply** — on-hand ÷ weekly sales rate ("weeks of cover").
- **VoC sentiment** — first-party in-store sentiment, 0–100, from the colleague capture form.
- **Recovered sales (£)** — value rescued from a local stockout by sourcing from another store.
- **SLA** — the agreed time to resolve an escalation.
- **Completion rate / CSAT** — tasks done / customer satisfaction.

---

## 7. Under the hood
- **Data (synthetic):** `src/data` — stores, kpis, signals, products, promotions, inventory, feedback, social, domains.
- **Logic (pure):** `src/engine` — priority, signalsEngine, analytics, stock, fulfilment, voiceOfCustomer, reporting, sla.
- **State:** a Zustand store (`src/store/useAppStore.ts`).
- **No backend.** A real build would swap the data files for connectors (inventory/POS, social listening, comms/rota).

## 8. What is illustrative in this build
All data is synthetic. The £ figures are estimates (a production build would model them from real sales, margin and velocity data); social/AI content is mocked; fulfilment ETAs and prices use a simple distance model; trend charts are illustrative but end on the real current number. In-store sentiment capture is PII-free by design — no names or contact details, only structured categories and an age band.
