import { NavLink } from 'react-router-dom'
import type { ComponentType } from 'react'
import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  BarChart3,
  LayoutGrid,
  TrendingUp,
  Plus,
  TriangleAlert,
  Radio,
  Store as StoreIcon,
} from 'lucide-react'
import type { Role } from '@/types'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

const HQ_NAV: NavItem[] = [
  { to: '/hq', label: 'Control Tower', icon: LayoutDashboard, end: true },
  { to: '/hq/campaign/promo-console-bundle', label: 'Campaign Centre', icon: Megaphone },
  { to: '/hq/social', label: 'Social Pulse', icon: Radio },
  { to: '/hq/signals', label: 'Signals Explorer', icon: Sparkles },
  { to: '/hq/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/domains', label: 'Domain Catalogue', icon: LayoutGrid },
  { to: '/impact', label: 'Impact', icon: TrendingUp },
  { to: '/tasks/new', label: 'Create Task', icon: Plus },
]

const REGION_NAV: NavItem[] = [
  { to: '/region', label: 'Store Cockpit', icon: LayoutDashboard, end: true },
  { to: '/region/escalations', label: 'Escalations & SLAs', icon: TriangleAlert },
  { to: '/hq/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/domains', label: 'Domain Catalogue', icon: LayoutGrid },
  { to: '/impact', label: 'Impact', icon: TrendingUp },
  { to: '/tasks/new', label: 'Create Task', icon: Plus },
]

export function SideNav({ role }: { role: Role }) {
  const items = role === 'HQ' ? HQ_NAV : REGION_NAV
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
      <nav className="flex flex-col gap-1 p-3">
        <div className="mb-1 flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <StoreIcon className="size-3.5" />
          {role === 'HQ' ? 'Central Operations' : 'Regional'}
        </div>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
