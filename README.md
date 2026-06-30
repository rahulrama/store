# wattsRus — Store Operations Copilot

A self-contained **demo** of a retail store operations management platform for a fictional
UK electronics & gaming retailer, **wattsRus**. It shows how a "Store Operations Copilot"
turns operational signals into **prioritised daily actions**, tracks execution with
**proof/evidence**, and **escalates exceptions** across HQ, regional and store roles.

> 100% synthetic data · no backend · runs entirely in the browser (installable, offline-capable PWA).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to /dist (generates the PWA manifest + service worker)
npm run preview  # serve the production build (use this to test install / offline)
```

> Icons are generated from `public/brand-icon.svg` via `node scripts/gen-icons.mjs` (already run).

## What's inside

- **Three personas** (switch in the top bar) — the **whole app works on every device**:
  - **HQ / Central Ops** — Estate Control Tower, Campaign Command Centre, Analytics, Signals Explorer.
  - **Regional Manager** — Store Cockpit (league table), Escalations & SLAs, store drill-down.
  - **Store / Colleague** — Daily Brief, Task detail + evidence, Checklists, Workforce, Knowledge,
    and Customer Assist (clienteling with a live basket).
- **wattsRus Copilot** — one assistant, five skills: **Prioritise**, **Ask** (SOP knowledge),
  **Recommend** (product clienteling), **Explain** (Signals Explorer), reachable from the launcher.
- **Operating model** — the **14 store task domains** grouped into **5 pillars** (People & Workforce,
  Trading & Execution, Stock & Fulfilment, Risk/Safety/Compliance, Enablement & Support).
- **Reset demo** button restores the seeded start-of-day state for a clean re-run.

## Installable PWA

- Manifest + offline service worker + maskable/apple-touch icons; opens full-screen once installed.
- **Add to device** button is **platform-aware**: native one-tap install on Android/desktop Chromium,
  guided "Share → Add to Home Screen" steps on iOS Safari, and auto-hides once installed.
- Note: the installed home-screen **icon/name come from the manifest** (default wattsRus). Runtime
  rebranding (below) changes the **in-app** identity, not an icon already on someone's home screen.

## Guided experiences (one engine, two modes)

From the **Demo** menu in the top bar:

- **Guided tour** — spotlight tooltips, manual Next/Back; actions fire as you advance.
- **Auto demo** — hands-free; auto-advances and performs actions (e.g. completes the £3,200 task so
  KPIs visibly move). Play/Pause/Back/Next/Exit + progress.

Both run the same ~90-second script: HQ tower → Signals Explorer → store priorities → complete task
with evidence → Copilot clienteling → region SLAs → Impact. Admin sets which mode (if any)
**auto-launches on first open** — ideal for the PWA hand-out.

## Admin & branding (`/admin`)

Rebrand the demo on the fly; settings persist on the device and **survive Reset demo**:

- Switch/active brand, edit **name · tagline · accent colour · logo upload**, add/delete custom
  brands, **export/import** brands as JSON, reset to wattsRus.
- Appearance: **Show help tips** (on by default), optional **in-store device frame** (off by
  default), **dark mode**.
- Demo policy: **auto-launch** (off / guided / auto), default persona, replay first-run.
- **GitHub model:** built-in presets live in the repo (committed = permanent defaults); runtime
  uploads save on-device; **export → commit** a brand JSON to make it permanent. A static PWA can't
  write to the repo at runtime without leaking a token, so this split is by design.
- **Logo upload:** PNG, JPG, WebP, GIF or SVG all work — images are auto-downscaled to a small
  square before being stored on-device, so large photos no longer fail.

## Help & onboarding

Three complementary layers, all on-theme to the demo data:

- **Inline help tips** — ⓘ icons next to key labels open a plain-English explanation on tap (mobile)
  or hover (desktop). Short explainer banners sit at the top of each main view. Toggle all of it with
  **Show help tips** in Admin (on by default — great for onboarding new colleagues).
- **Onboarding guide** (`/guide`) — a browsable reference: what the tool is, the loop, the three
  views, the 5 themes / 14 domains, and a glossary. Reachable from the overflow menu, ⌘K, and the
  banners.
- **Guided tour / auto demo** — the end-to-end walkthrough from the Demo menu.

## Social pulse (mock)

The HQ Control Tower includes a **Social pulse** card — trending products, sentiment, mention volume
and top posts (Instagram/TikTok) — plus a couple of social-driven store tasks (e.g. a TikTok unboxing
going viral → “get ready for the rush”). All synthetic, shaped like a social-listening API response;
a real build would proxy the Instagram/TikTok Graph APIs through a small server-side connector.

## Interactivity

- **⌘/Ctrl-K command palette** — jump to any persona, page or store.
- Count-up KPI numbers, route fade transitions, completion **confetti**, clienteling **basket** with
  running total, install/offline-ready toasts.

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
   store; then **Impact since morning** (actions done, compliance ↑, £ risk mitigated).

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
