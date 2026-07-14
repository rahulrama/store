import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useAppStore } from '@/store/useAppStore'
import { DailyBrief } from '@/pages/store/DailyBrief'
import { TaskDetail } from '@/pages/store/TaskDetail'
import { Checklists } from '@/pages/store/Checklists'
import { Workforce } from '@/pages/store/Workforce'
import { Knowledge } from '@/pages/store/Knowledge'
import { Assist } from '@/pages/store/Assist'
import { Feedback } from '@/pages/store/Feedback'
import { ControlTower } from '@/pages/hq/ControlTower'
import { CampaignCentre } from '@/pages/hq/CampaignCentre'
import { Analytics } from '@/pages/hq/Analytics'
import { SignalsExplorer } from '@/pages/hq/SignalsExplorer'
import { SocialHub } from '@/pages/hq/SocialHub'
import { RegionCockpit } from '@/pages/region/Cockpit'
import { StoreDrilldown } from '@/pages/region/StoreDrilldown'
import { Escalations } from '@/pages/region/Escalations'
import { DomainCatalogue } from '@/pages/DomainCatalogue'
import { CreateTask } from '@/pages/CreateTask'
import { Impact } from '@/pages/Impact'
import { StockView } from '@/pages/StockView'
import { VoiceOfCustomer } from '@/pages/VoiceOfCustomer'
import { Reports } from '@/pages/Reports'
import { Admin } from '@/pages/Admin'
import { Guide } from '@/pages/Guide'
import { Login } from '@/pages/Login'
import { useAuthStore } from '@/store/useAuthStore'

function PersonaHome() {
  const role = useAppStore((s) => s.role)
  const to =
    role === 'HQ' ? '/hq' : role === 'Regional' ? '/region' : role === 'Colleague' ? '/store/feedback' : '/store'
  return <Navigate to={to} replace />
}

export default function App() {
  return (
    <HashRouter>
      <AuthGate />
    </HashRouter>
  )
}

function AuthGate() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Login />
  return (
    <Routes>
      <Route element={<AppShell />}>
          <Route path="/" element={<PersonaHome />} />

          {/* Store */}
          <Route path="/store" element={<DailyBrief />} />
          <Route path="/store/task/:id" element={<TaskDetail />} />
          <Route path="/store/checklists" element={<Checklists />} />
          <Route path="/store/stock" element={<StockView />} />
          <Route path="/store/workforce" element={<Workforce />} />
          <Route path="/store/knowledge" element={<Knowledge />} />
          <Route path="/store/assist" element={<Assist />} />
          <Route path="/store/feedback" element={<Feedback />} />
          <Route path="/store/reports" element={<Reports />} />

          {/* Region */}
          <Route path="/region" element={<RegionCockpit />} />
          <Route path="/region/store/:id" element={<StoreDrilldown />} />
          <Route path="/region/escalations" element={<Escalations />} />
          <Route path="/region/stock" element={<StockView />} />
          <Route path="/region/voice" element={<VoiceOfCustomer />} />
          <Route path="/region/reports" element={<Reports />} />

          {/* HQ */}
          <Route path="/hq" element={<ControlTower />} />
          <Route path="/hq/campaign/:id" element={<CampaignCentre />} />
          <Route path="/hq/analytics" element={<Analytics />} />
          <Route path="/hq/signals" element={<SignalsExplorer />} />
          <Route path="/hq/social" element={<SocialHub />} />
          <Route path="/hq/stock" element={<StockView />} />
          <Route path="/hq/voice" element={<VoiceOfCustomer />} />
          <Route path="/hq/reports" element={<Reports />} />

          {/* Shared */}
          <Route path="/domains" element={<DomainCatalogue />} />
          <Route path="/tasks/new" element={<CreateTask />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/guide" element={<Guide />} />

          <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
