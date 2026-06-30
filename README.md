# wattsRus — Store Operations Copilot

A self-contained **demo** of a retail store operations management platform for a fictional
UK electronics & gaming retailer, **wattsRus**. It shows how a "Store Operations Copilot"
turns operational signals into **prioritised daily actions**, tracks execution with
**proof/evidence**, and **escalates exceptions** across HQ, regional and store roles.

> 100% synthetic data · no backend · runs entirely in the browser (offline-capable SPA).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to /dist
npm run preview  # serve the production build
```

## What's inside

- **Three personas** (switch in the top bar):
  - **HQ / Central Ops** — Estate Control Tower, Campaign Command Centre, Analytics, Signals Explorer.
  - **Regional Manager** — Store Cockpit (league table), Escalations & SLAs, store drill-down.
  - **Store / Colleague** — in-store tablet: Daily Brief, Task detail + evidence, Checklists,
    Workforce, Knowledge, and Customer Assist (clienteling).
- **wattsRus Copilot** — one assistant, five skills: **Prioritise**, **Ask** (SOP knowledge),
  **Recommend** (product clienteling), **Explain** (Signals Explorer), reachable from the launcher.
- **Operating model** — the **14 store task domains** grouped into **5 pillars** (People & Workforce,
  Trading & Execution, Stock & Fulfilment, Risk/Safety/Compliance, Enablement & Support).
- **Sources panel** — lists the public category research the generic requirements are based on
  (Axonify, Quorso, Currys, Argos, plus named category leaders), so the demo is *based on public
  research, not copied from any single vendor*.
- **Reset demo** button restores the seeded start-of-day state for a clean re-run.

## The scenario — "a busy Saturday in June"

Multiple live promotions (console bundle, Big Match TV event, back-to-school laptops, phone
trade-in + cashback, summer cooling) and live operational signals across 12 stores / 3 regions
exercise ~10 of the 14 domains: promo execution, stock/replenishment, click & collect, a colleague
absence + redeployment, an equipment fault, compliance checks, an age-restricted refusal, and a
clienteling request.

## 15-minute talk track

1. **(2m) HQ Control Tower** — estate health 82; pillar tiles show **Trading & Stock dipping**;
   live signals feed lighting up; 4 stores need attention.
2. **(2m) Signals Explorer** — *"here's why the Copilot prioritised these"* — show a rule turning a
   promo + unverified-display signal into a ranked, evidence-required task (trust / explainability).
3. **(4m) Store tablet (#214 Manchester)** — Daily Brief priorities ranked across domains. Open the
   top promo task → work the checklist → **take a photo + capture a count** → **Mark complete** →
   "£3,200 protected" toast, list re-ranks, KPIs move.
4. **(2m) Copilot Assist (clienteling)** — ask *"laptop for a student doing video editing, ~£700"* →
   in-stock matches + accessory/care-plan attach. "The same Copilot that runs your day helps you sell."
5. **(2m) Exception** — the stockroom chiller fault and a console-bundle OOS-with-none-on-order
   **auto-escalate** (Facilities / Stock) with **SLA countdowns**; the colleague absence triggers a
   **redeployment** suggestion.
6. **(3m) Regional cockpit + Impact** — league table, exceptions/SLA inbox, **nudge** a lagging
   store; then **Impact since morning** (actions done, compliance ↑, £ risk mitigated). Open the
   **Sources** panel to close on "built on public category research."

## Tech

Vite · React 19 · TypeScript · React Router (hash) · Zustand (persisted) · Tailwind CSS v4 ·
shadcn/ui · Recharts. The "AI" is a transparent, deterministic rules engine over the seed data —
no network calls, so it is reliable offline and on stage.

## Project structure

```
src/
  data/        synthetic estate: domains, stores, products, promotions, inventory,
               KPIs, colleagues/shifts, signals, SOPs, sources, seed
  engine/      signals→tasks rules, priority, SLA, estate-health & impact analytics
  copilot/     clienteling recommender (Ask/Explain use data + engine)
  store/       Zustand store + selectors
  components/  layout, shared badges/stats, task, estate, copilot, sources, ui (shadcn)
  pages/       store/ · region/ · hq/ · shared (domains, create task, impact)
```

All data is fictional and for illustration only.
