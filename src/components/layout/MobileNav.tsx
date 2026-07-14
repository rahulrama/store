import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, Store as StoreIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import type { Role } from '@/types'
import { navItemsFor } from '@/components/layout/SideNav'
import { cn } from '@/lib/utils'

/**
 * Mobile section navigation for HQ / Regional roles. On desktop the SideNav is
 * always visible; below `md` it's hidden, so this hamburger + slide-in drawer
 * gives the same navigation on phones. Store / Colleague roles use the
 * scrollable tab bar instead and don't render this.
 */
export function MobileNav({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const items = navItemsFor(role)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <StoreIcon className="size-3.5" />
            {role === 'HQ' ? 'Central Operations' : 'Regional'}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  )
}
