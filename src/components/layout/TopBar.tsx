import { useNavigate } from 'react-router-dom'
import { Zap, Sparkles, FileSearch, RotateCcw, ChevronDown } from 'lucide-react'
import type { Role } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { USER_BY_ID, STORE_BY_ID } from '@/data/stores'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
}

const ROLES: { role: Role; label: string }[] = [
  { role: 'HQ', label: 'HQ' },
  { role: 'Regional', label: 'Regional' },
  { role: 'Store', label: 'Store' },
]

export function TopBar() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const setPersona = useAppStore((s) => s.setPersona)
  const setCopilotOpen = useAppStore((s) => s.setCopilotOpen)
  const setSourcesOpen = useAppStore((s) => s.setSourcesOpen)
  const resetDemo = useAppStore((s) => s.resetDemo)

  const user = USER_BY_ID[currentUserId]
  const store = user.storeId ? STORE_BY_ID[user.storeId] : undefined

  function switchRole(next: Role) {
    setPersona(next)
    navigate(ROLE_HOME[next])
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-card px-4">
      {/* Brand */}
      <button
        type="button"
        onClick={() => navigate(ROLE_HOME[role])}
        className="flex items-center gap-2"
        title="wattsRus Store Operations Copilot"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="size-5" fill="currentColor" />
        </span>
        <span className="flex flex-col items-start leading-none">
          <span className="text-sm font-bold tracking-tight">
            watts<span className="text-primary">Rus</span>
          </span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Store Ops Copilot</span>
        </span>
      </button>

      {/* Persona switcher */}
      <div className="ml-2 flex items-center rounded-lg border border-border bg-muted p-0.5">
        {ROLES.map((r) => (
          <button
            key={r.role}
            type="button"
            onClick={() => switchRole(r.role)}
            className={cn(
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              role === r.role
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Ask Copilot */}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCopilotOpen(true)}>
        <Sparkles className="size-4 text-primary" />
        Ask Copilot
      </Button>

      {/* Sources */}
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setSourcesOpen(true)}>
        <FileSearch className="size-4" />
        Sources
      </Button>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => {
          resetDemo()
          navigate('/store')
          toast.success('Demo reset', { description: 'Seed data restored to the start of the day.' })
        }}
      >
        <RotateCcw className="size-4" />
        Reset
      </Button>

      {/* Identity */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1 hover:bg-muted">
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start leading-tight md:flex">
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
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
