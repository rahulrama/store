import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Wifi, BatteryFull, Signal as SignalIcon } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { SideNav } from '@/components/layout/SideNav'
import { CopilotPanel } from '@/components/copilot/CopilotPanel'
import { CopilotLauncher } from '@/components/copilot/CopilotLauncher'
import { TourOverlay } from '@/components/tour/TourOverlay'
import { CommandPalette } from '@/components/command/CommandPalette'
import { FirstRun } from '@/components/system/FirstRun'
import { Celebrate } from '@/components/system/Celebrate'
import { useAppStore } from '@/store/useAppStore'
import { useBrandStore, useActiveBrand } from '@/store/useBrandStore'
import { STORE_BY_ID } from '@/data/stores'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { dateOf, timeOf } from '@/lib/format'
import { DEMO_NOW } from '@/data/now'

const STORE_TABS = [
  { to: '/store', label: 'Today', end: true },
  { to: '/store/checklists', label: 'Checklists' },
  { to: '/store/stock', label: 'Stock' },
  { to: '/store/workforce', label: 'Team' },
  { to: '/store/assist', label: 'Assist' },
  { to: '/store/repairs', label: 'Repairs' },
  { to: '/store/feedback', label: 'Feedback' },
  { to: '/store/reports', label: 'Scorecard' },
  { to: '/store/knowledge', label: 'Knowledge' },
]

const COLLEAGUE_TABS = [
  { to: '/store', label: 'Today', end: true },
  { to: '/store/assist', label: 'Assist' },
  { to: '/store/feedback', label: 'Feedback', end: true },
]

function StoreLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = useAppStore((s) => s.role)
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const store = STORE_BY_ID[activeStoreId] ?? STORE_BY_ID['s-214']
  const tabs = role === 'Colleague' ? COLLEAGUE_TABS : STORE_TABS

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Store identity */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight">
            {store.name} · #{store.code}
          </h1>
          <p className="text-xs text-muted-foreground">
            {dateOf(DEMO_NOW)} · {store.format} · {store.town}
          </p>
        </div>
      </div>
      {/* Tabs */}
      <div
        className="sticky top-14 z-20 flex flex-wrap gap-1 border-b border-border bg-card px-3 py-2 print:hidden"
        data-tour="store-tabs"
      >
        {tabs.map((t) => {
          const active = t.end ? location.pathname === t.to : location.pathname.startsWith(t.to)
          return (
            <button
              key={t.to}
              type="button"
              onClick={() => navigate(t.to)}
              className={cn(
                'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div className="p-4">
        <div key={location.pathname} className="animate-in fade-in duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

/** Optional cosmetic "in-store device" bezel (toggle in /admin, off by default). */
function TabletBezel({ children }: { children: ReactNode }) {
  const brand = useActiveBrand()
  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] border-[6px] border-neutral-800 bg-neutral-800 shadow-xl">
        <div className="flex items-center justify-between bg-neutral-800 px-5 py-1.5 text-[11px] font-medium text-neutral-300">
          <span>{timeOf(DEMO_NOW)}</span>
          <span>{brand.name} Colleague</span>
          <span className="flex items-center gap-1.5">
            <SignalIcon className="size-3" />
            <Wifi className="size-3" />
            <BatteryFull className="size-3.5" />
          </span>
        </div>
        <div className="bg-canvas">{children}</div>
      </div>
    </div>
  )
}

export function AppShell() {
  const role = useAppStore((s) => s.role)
  const deviceFrame = useBrandStore((s) => s.deviceFrame)
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <TopBar />
      <div className="flex flex-1">
        {role !== 'Store' && role !== 'Colleague' && <SideNav role={role} />}
        <main className="min-w-0 flex-1">
          {role === 'Store' || role === 'Colleague' ? (
            deviceFrame ? (
              <TabletBezel>
                <StoreLayout />
              </TabletBezel>
            ) : (
              <StoreLayout />
            )
          ) : (
            <div className="mx-auto max-w-7xl p-4 md:p-6">
              <div key={location.pathname} className="animate-in fade-in duration-300">
                <Outlet />
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Persistent disclaimer — shows on every in-app page */}
      <footer className="border-t border-border bg-card px-4 py-3">
        <p className="mx-auto max-w-4xl text-center text-xs leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">Disclaimer:</strong> Brands, logos,
          product names, and trademarks are the property of their respective owners and are used
          for illustrative purposes only. No affiliation, endorsement, sponsorship, partnership, or
          commercial relationship is intended or implied. Any persons, user profiles, data,
          transactions, scenarios, and workflows depicted are fictitious or simulated and do not
          represent actual individuals, customers, or business operations.
        </p>
      </footer>
      <CopilotLauncher />
      <CopilotPanel />
      <CommandPalette />
      <TourOverlay />
      <Celebrate />
      <FirstRun />
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
