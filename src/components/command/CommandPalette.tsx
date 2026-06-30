import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'
import { useTourStore } from '@/store/useTourStore'
import { STORES } from '@/data/stores'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Megaphone,
  BarChart3,
  TriangleAlert,
  Store as StoreIcon,
  RotateCcw,
  PlayCircle,
  Settings,
  LayoutGrid,
  Plus,
  BookOpen,
  Radio,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

interface Command {
  id: string
  label: string
  group: string
  icon: LucideIcon
  keywords?: string
  run: () => void
}

export function CommandPalette() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const setPersona = useAppStore((s) => s.setPersona)
  const enterStore = useAppStore((s) => s.enterStore)
  const resetDemo = useAppStore((s) => s.resetDemo)
  const setCopilotOpen = useAppStore((s) => s.setCopilotOpen)
  const startTour = useTourStore((s) => s.start)

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      { id: 'p-hq', group: 'Personas', label: 'View as HQ / Central Ops', icon: LayoutDashboard, run: () => { setPersona('HQ'); navigate('/hq') } },
      { id: 'p-region', group: 'Personas', label: 'View as Regional Manager', icon: LayoutDashboard, run: () => { setPersona('Regional'); navigate('/region') } },
      { id: 'p-store', group: 'Personas', label: 'View as Store Manager', icon: StoreIcon, run: () => { setPersona('Store'); navigate('/store') } },
      { id: 'go-tower', group: 'Go to', label: 'Control Tower', icon: LayoutDashboard, run: () => { setPersona('HQ'); navigate('/hq') } },
      { id: 'go-signals', group: 'Go to', label: 'Signals Explorer', icon: Sparkles, run: () => { setPersona('HQ'); navigate('/hq/signals') } },
      { id: 'go-campaign', group: 'Go to', label: 'Campaign Centre', icon: Megaphone, run: () => { setPersona('HQ'); navigate('/hq/campaign/promo-console-bundle') } },
      { id: 'go-social', group: 'Go to', label: 'Social Pulse', icon: Radio, keywords: 'instagram tiktok trending', run: () => { setPersona('HQ'); navigate('/hq/social') } },
      { id: 'go-analytics', group: 'Go to', label: 'Analytics', icon: BarChart3, run: () => { setPersona('HQ'); navigate('/hq/analytics') } },
      { id: 'go-region', group: 'Go to', label: 'Region Cockpit', icon: LayoutDashboard, run: () => { setPersona('Regional'); navigate('/region') } },
      { id: 'go-esc', group: 'Go to', label: 'Escalations & SLAs', icon: TriangleAlert, run: () => { setPersona('Regional'); navigate('/region/escalations') } },
      { id: 'go-impact', group: 'Go to', label: 'Impact since morning', icon: TrendingUp, run: () => navigate('/impact') },
      { id: 'go-domains', group: 'Go to', label: 'Domain Catalogue', icon: LayoutGrid, run: () => navigate('/domains') },
      { id: 'go-new', group: 'Go to', label: 'Create Task', icon: Plus, run: () => { setPersona('Regional'); navigate('/tasks/new') } },
      { id: 'go-admin', group: 'Go to', label: 'Admin & Branding', icon: Settings, run: () => navigate('/admin') },
      { id: 'go-guide', group: 'Go to', label: 'Onboarding guide', icon: BookOpen, keywords: 'help learn explain', run: () => navigate('/guide') },
      { id: 'a-coached', group: 'Actions', label: 'Start guided tour', icon: PlayCircle, keywords: 'walkthrough demo tour', run: () => startTour('coached') },
      { id: 'a-auto', group: 'Actions', label: 'Play auto demo', icon: PlayCircle, keywords: 'autoplay presentation', run: () => startTour('autoplay') },
      { id: 'a-copilot', group: 'Actions', label: 'Open Copilot', icon: Sparkles, run: () => setCopilotOpen(true) },
      { id: 'a-reset', group: 'Actions', label: 'Reset demo', icon: RotateCcw, run: () => { resetDemo(); navigate('/store'); toast.success('Demo reset') } },
    ]
    for (const s of STORES) {
      list.push({
        id: `store-${s.id}`,
        group: 'Stores',
        label: `${s.name} · #${s.code}`,
        icon: StoreIcon,
        keywords: `${s.town} ${s.format}`,
        run: () => { setPersona('Regional'); navigate(`/region/store/${s.id}`) },
      })
    }
    void enterStore
    return list
  }, [navigate, setPersona, enterStore, resetDemo, setCopilotOpen, startTour])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || c.keywords?.toLowerCase().includes(q),
    )
  }, [query, commands])

  // Global hotkey.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSel(0)
    }
  }, [open])

  useEffect(() => setSel(0), [query])

  function runAt(i: number) {
    const cmd = filtered[i]
    if (!cmd) return
    setOpen(false)
    cmd.run()
  }

  let lastGroup = ''

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className="top-[20%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setSel((s) => Math.min(filtered.length - 1, s + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setSel((s) => Math.max(0, s - 1))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              runAt(sel)
            }
          }}
          placeholder="Search personas, pages, stores, actions…"
          className="h-12 rounded-none border-0 border-b border-border text-base focus-visible:ring-0"
        />
        <div ref={listRef} className="max-h-80 overflow-y-auto p-1 scrollbar-thin">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</p>
          )}
          {filtered.map((cmd, i) => {
            const showGroup = cmd.group !== lastGroup
            lastGroup = cmd.group
            return (
              <div key={cmd.id}>
                {showGroup && (
                  <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {cmd.group}
                  </p>
                )}
                <button
                  type="button"
                  onMouseEnter={() => setSel(i)}
                  onClick={() => runAt(i)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm',
                    i === sel ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
                  )}
                >
                  <cmd.icon className="size-4 text-muted-foreground" />
                  {cmd.label}
                </button>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
          <span>↑↓ navigate · ↵ select · esc close</span>
          <span>⌘/Ctrl + K</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
