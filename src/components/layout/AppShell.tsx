import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { SideNav } from '@/components/layout/SideNav'
import { DeviceFrame, DeviceTab } from '@/components/layout/DeviceFrame'
import { CopilotPanel } from '@/components/copilot/CopilotPanel'
import { SourcesPanel } from '@/components/sources/SourcesPanel'
import { CopilotLauncher } from '@/components/copilot/CopilotLauncher'
import { useAppStore } from '@/store/useAppStore'
import { STORE_BY_ID } from '@/data/stores'
import { Toaster } from '@/components/ui/sonner'
import { dateOf } from '@/lib/format'
import { DEMO_NOW } from '@/data/now'

const STORE_TABS = [
  { to: '/store', label: 'Daily Brief', end: true },
  { to: '/store/checklists', label: 'Checklists' },
  { to: '/store/workforce', label: 'Workforce' },
  { to: '/store/knowledge', label: 'Knowledge' },
  { to: '/store/assist', label: 'Assist' },
]

function StoreLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const store = STORE_BY_ID[activeStoreId] ?? STORE_BY_ID['s-214']

  const tabs = STORE_TABS.map((t) => {
    const active = t.end ? location.pathname === t.to : location.pathname.startsWith(t.to)
    return (
      <DeviceTab key={t.to} active={active} onClick={() => navigate(t.to)}>
        {t.label}
      </DeviceTab>
    )
  })

  return (
    <div className="p-4 md:p-6">
      <DeviceFrame
        title={`${store.name} · #${store.code}`}
        subtitle={`${dateOf(DEMO_NOW)} · ${store.format} · ${store.town}`}
        tabs={tabs}
      >
        <Outlet />
      </DeviceFrame>
    </div>
  )
}

export function AppShell() {
  const role = useAppStore((s) => s.role)

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <TopBar />
      <div className="flex flex-1">
        {role !== 'Store' && <SideNav role={role} />}
        <main className="min-w-0 flex-1">
          {role === 'Store' ? (
            <StoreLayout />
          ) : (
            <div className="mx-auto max-w-7xl p-4 md:p-6">
              <Outlet />
            </div>
          )}
        </main>
      </div>
      <CopilotLauncher />
      <CopilotPanel />
      <SourcesPanel />
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
