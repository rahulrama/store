import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  RotateCcw,
  ChevronDown,
  PlayCircle,
  Play,
  MonitorPlay,
  MoreHorizontal,
  Settings,
  Command,
  BookOpen,
  LogOut,
} from 'lucide-react'
import type { Role } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { useTourStore } from '@/store/useTourStore'
import { useAuthStore } from '@/store/useAuthStore'
import { USER_BY_ID, STORE_BY_ID } from '@/data/stores'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BrandMark } from '@/components/brand/BrandMark'
import { InstallButton } from '@/components/pwa/InstallButton'
import { MobileNav } from '@/components/layout/MobileNav'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ROLE_HOME: Record<Role, string> = {
  HQ: '/hq',
  Regional: '/region',
  Store: '/store',
  Colleague: '/store',
}
const ROLES: { role: Role; label: string }[] = [
  { role: 'HQ', label: 'HQ' },
  { role: 'Regional', label: 'Region' },
  { role: 'Store', label: 'Store' },
  { role: 'Colleague', label: 'Colleague' },
]

export function TopBar() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const setPersona = useAppStore((s) => s.setPersona)
  const setCopilotOpen = useAppStore((s) => s.setCopilotOpen)
  const resetDemo = useAppStore((s) => s.resetDemo)
  const startTour = useTourStore((s) => s.start)
  const logout = useAuthStore((s) => s.logout)

  const user = USER_BY_ID[currentUserId]
  const store = user.storeId ? STORE_BY_ID[user.storeId] : undefined

  function switchRole(next: Role) {
    setPersona(next)
    navigate(ROLE_HOME[next])
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-card px-3 md:gap-4 md:px-4 print:hidden">
      {/* Mobile section nav (HQ / Regional only — Store & Colleague use the tab bar) */}
      {(role === 'HQ' || role === 'Regional') && <MobileNav role={role} />}

      {/* Brand */}
      <button type="button" onClick={() => navigate(ROLE_HOME[role])} title="Home" className="shrink-0">
        <BrandMark />
      </button>

      {/* Persona switcher — segmented control on desktop, dropdown on mobile */}
      <div className="ml-1 shrink-0" data-tour="persona-switch">
        <div className="hidden items-center rounded-lg border border-border bg-muted p-0.5 md:flex">
          {ROLES.map((r) => (
            <button
              key={r.role}
              type="button"
              onClick={() => switchRole(r.role)}
              className={cn(
                'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors md:text-sm',
                role === r.role ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 md:hidden">
              {ROLES.find((r) => r.role === role)?.label ?? role}
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel>View as</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ROLES.map((r) => (
              <DropdownMenuItem
                key={r.role}
                onClick={() => switchRole(r.role)}
                className={cn(role === r.role && 'bg-accent text-accent-foreground')}
              >
                {r.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1" />

      {/* Demo launcher */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden gap-1.5 md:inline-flex" data-tour="demo-launch">
            <PlayCircle className="size-4 text-primary" />
            <span className="hidden sm:inline">Demo</span>
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Guided experiences</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => startTour('coached')}>
            <Play className="size-4" /> Guided tour
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => startTour('autoplay')}>
            <MonitorPlay className="size-4" /> Auto demo (hands-free)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ask Copilot (mobile uses the floating launcher instead) */}
      <Button variant="outline" size="sm" className="hidden gap-1.5 md:inline-flex" onClick={() => setCopilotOpen(true)} data-tour="ask-copilot">
        <Sparkles className="size-4 text-primary" />
        <span className="hidden sm:inline">Ask Copilot</span>
      </Button>

      {/* Install (auto-hides when installed) */}
      <div className="hidden md:block">
        <InstallButton />
      </div>

      {/* Overflow */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="md:hidden">
            <DropdownMenuLabel>Guided experiences</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => startTour('coached')}>
              <Play className="size-4" /> Guided tour
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startTour('autoplay')}>
              <MonitorPlay className="size-4" /> Auto demo (hands-free)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </div>
          <div className="md:hidden">
            <InstallButton asMenuItem />
          </div>
          <DropdownMenuItem onClick={() => navigate('/guide')}>
            <BookOpen className="size-4" /> Onboarding guide
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          >
            <Command className="size-4" /> Command palette
            <span className="ml-auto text-[11px] text-muted-foreground">⌘K</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <Settings className="size-4" /> Admin &amp; branding
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              resetDemo()
              navigate('/store')
              toast.success('Demo reset', { description: 'Seed data restored to the start of the day.' })
            }}
          >
            <RotateCcw className="size-4" /> Reset demo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Identity */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1 hover:bg-muted">
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{user.initials}</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start leading-tight lg:flex">
              <span className="text-xs font-semibold">{user.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {store ? `${store.name} · #${store.code}` : user.jobTitle}
              </span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user.jobTitle}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => switchRole('HQ')}>View as HQ / Central Ops</DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchRole('Regional')}>View as Regional Manager</DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchRole('Store')}>View as Store Manager</DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchRole('Colleague')}>View as Store Colleague</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="size-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
