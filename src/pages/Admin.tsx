import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Role } from '@/types'
import type { Brand } from '@/data/brands'
import { useBrandStore, useBrands, type AutoLaunch } from '@/store/useBrandStore'
import { useTourStore } from '@/store/useTourStore'
import { processLogoFile } from '@/branding/logo'
import { SectionHeading } from '@/components/shared/Stat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Check,
  Pencil,
  Trash2,
  Upload,
  Download,
  RotateCcw,
  Plus,
  Image as ImageIcon,
  Palette,
  PlayCircle,
  Info,
  BookOpen,
} from 'lucide-react'

const PERSONAS: { value: Role; label: string }[] = [
  { value: 'HQ', label: 'HQ / Central Ops' },
  { value: 'Regional', label: 'Regional Manager' },
  { value: 'Store', label: 'Store / Colleague' },
]

export function Admin() {
  const brands = useBrands()
  const activeBrandId = useBrandStore((s) => s.activeBrandId)
  const setActiveBrand = useBrandStore((s) => s.setActiveBrand)
  const addBrand = useBrandStore((s) => s.addBrand)
  const updateBrand = useBrandStore((s) => s.updateBrand)
  const deleteBrand = useBrandStore((s) => s.deleteBrand)
  const importBrands = useBrandStore((s) => s.importBrands)
  const resetBrandsToDefault = useBrandStore((s) => s.resetBrandsToDefault)

  const deviceFrame = useBrandStore((s) => s.deviceFrame)
  const setDeviceFrame = useBrandStore((s) => s.setDeviceFrame)
  const dark = useBrandStore((s) => s.dark)
  const setDark = useBrandStore((s) => s.setDark)
  const showHelp = useBrandStore((s) => s.showHelp)
  const setShowHelp = useBrandStore((s) => s.setShowHelp)
  const showDemoBadges = useBrandStore((s) => s.showDemoBadges)
  const setShowDemoBadges = useBrandStore((s) => s.setShowDemoBadges)
  const autoLaunch = useBrandStore((s) => s.autoLaunch)
  const setAutoLaunch = useBrandStore((s) => s.setAutoLaunch)
  const defaultPersona = useBrandStore((s) => s.defaultPersona)
  const setDefaultPersona = useBrandStore((s) => s.setDefaultPersona)
  const resetTourSeen = useBrandStore((s) => s.resetTourSeen)
  const startTour = useTourStore((s) => s.start)
  const navigate = useNavigate()

  // Editor state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('Store Ops Copilot')
  const [accent, setAccent] = useState('#464feb')
  const [logo, setLogo] = useState<string | undefined>(undefined)
  const fileRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)

  function resetEditor() {
    setEditingId(null)
    setName('')
    setTagline('Store Ops Copilot')
    setAccent('#464feb')
    setLogo(undefined)
  }

  function loadForEdit(b: Brand) {
    setEditingId(b.id)
    setName(b.name)
    setTagline(b.tagline)
    setAccent(b.accent)
    setLogo(b.logoDataUrl)
  }

  function onLogoFile(file?: File) {
    if (!file) return
    processLogoFile(file)
      .then((dataUrl) => setLogo(dataUrl))
      .catch((err: Error) =>
        toast.error('Could not use that image', { description: err.message }),
      )
  }

  function save() {
    if (!name.trim()) {
      toast.error('Give the brand a name')
      return
    }
    if (editingId) {
      updateBrand(editingId, { name: name.trim(), tagline: tagline.trim(), accent, logoDataUrl: logo })
      toast.success('Brand updated')
    } else {
      const id = addBrand({ name: name.trim(), tagline: tagline.trim(), accent, logoDataUrl: logo })
      setActiveBrand(id)
      toast.success('Brand added & activated')
    }
    resetEditor()
  }

  function exportBrands() {
    const custom = brands.filter((b) => !b.builtIn)
    if (custom.length === 0) {
      toast('Nothing to export', { description: 'Add a custom brand first.' })
      return
    }
    const blob = new Blob([JSON.stringify(custom, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wattsrus-brands.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported brands JSON', { description: 'Commit it to the repo to make it permanent.' })
  }

  function onImportFile(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const arr: Brand[] = Array.isArray(parsed) ? parsed : [parsed]
        importBrands(arr)
        toast.success(`Imported ${arr.length} brand(s)`)
      } catch {
        toast.error('Could not read that file', { description: 'Expected a brands JSON export.' })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Admin & Branding"
        description="Rebrand the demo on the fly, tune the guided experiences and appearance. Settings persist on this device and survive Reset demo."
      />

      {/* Handbook & reference */}
      <section className="flex flex-col items-start justify-between gap-3 rounded-lg border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-2">
          <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">Handbook & reference</p>
            <p className="text-xs text-muted-foreground">
              The onboarding guide is the in-app handbook — what the tool is, the loop, the four views, the
              customer skills and a glossary. The full presenter handbook lives in <code>docs/handbook.md</code>.
            </p>
          </div>
        </div>
        <Button variant="outline" className="shrink-0 gap-1.5" onClick={() => navigate('/guide')}>
          <BookOpen className="size-4" /> Open handbook
        </Button>
      </section>

      {/* Brand presets */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Brand</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => {
            const active = b.id === activeBrandId
            return (
              <div
                key={b.id}
                className={cn(
                  'group relative rounded-lg border bg-card p-4 transition-colors',
                  active ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-primary/40',
                )}
              >
                <button type="button" onClick={() => setActiveBrand(b.id)} className="flex w-full items-center gap-3 text-left">
                  {b.logoDataUrl ? (
                    <img src={b.logoDataUrl} alt="" className="size-10 rounded-lg object-contain" />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-lg text-lg font-bold text-white" style={{ background: b.accent }}>
                      {b.name[0]}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold">{b.name}</span>
                      {b.builtIn && <Badge variant="secondary" className="h-4 px-1 text-[10px]">Built-in</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">{b.tagline}</span>
                  </div>
                </button>
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="size-3 rounded-full" style={{ background: b.accent }} />
                    {b.accent}
                  </span>
                  <div className="flex items-center gap-1">
                    {active && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        <Check className="size-3" /> Active
                      </span>
                    )}
                    {!b.builtIn && (
                      <>
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => loadForEdit(b)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-danger hover:text-danger"
                          onClick={() => {
                            deleteBrand(b.id)
                            toast.success('Brand deleted')
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Editor */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="text-sm font-semibold">{editingId ? 'Edit brand' : 'Add a brand'}</h4>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="b-name">Name</Label>
              <Input id="b-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Brightwave Electricals" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-tag">Tagline</Label>
              <Input id="b-tag" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Store Ops Copilot" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-accent">Accent colour</Label>
              <div className="flex items-center gap-2">
                <input
                  id="b-accent"
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="size-9 cursor-pointer rounded-md border border-border bg-card"
                />
                <Input value={accent} onChange={(e) => setAccent(e.target.value)} className="w-32 font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Logo (optional)</Label>
              <div className="flex items-center gap-2">
                {logo ? (
                  <img src={logo} alt="" className="size-9 rounded-md border border-border object-contain" />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                    <ImageIcon className="size-4" />
                  </span>
                )}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onLogoFile(e.target.files?.[0])} />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
                  <Upload className="size-4" /> Upload
                </Button>
                {logo && (
                  <Button variant="ghost" size="sm" onClick={() => setLogo(undefined)}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button className="gap-1.5" onClick={save}>
              {editingId ? <Check className="size-4" /> : <Plus className="size-4" />}
              {editingId ? 'Save changes' : 'Add brand'}
            </Button>
            {editingId && (
              <Button variant="ghost" onClick={resetEditor}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Import / export */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportBrands}>
            <Download className="size-4" /> Export brands
          </Button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => onImportFile(e.target.files?.[0])} />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => importRef.current?.click()}>
            <Upload className="size-4" /> Import brands
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              resetBrandsToDefault()
              toast.success('Reset to wattsRus default')
            }}
          >
            <RotateCcw className="size-4" /> Reset to wattsRus
          </Button>
        </div>

        <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            Built-in brands live in the repo (committed to GitHub) as permanent defaults. Brands you
            add here are saved on <strong>this device</strong> — great for rebranding on the move.
            To make a custom brand permanent for everyone, <strong>Export</strong> it and commit the
            JSON to the repo. A static app can’t write back to GitHub at runtime, and the installed
            home-screen icon/name come from the app manifest (so they stay as the default).
          </p>
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Appearance</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingRow
            title="Show help tips"
            desc="Show the ⓘ info icons and short explainer banners that describe what each part of the dashboard means. Great for onboarding new colleagues."
            checked={showHelp}
            onCheckedChange={setShowHelp}
          />
          <SettingRow
            title="Show “Demo data” labels"
            desc="Off by default so the app looks real. Turn on to mark synthetic data (e.g. the Social Pulse) with a small badge."
            checked={showDemoBadges}
            onCheckedChange={setShowDemoBadges}
          />
          <SettingRow
            title="In-store device frame"
            desc="Wrap the Store view in a tablet bezel. Off by default — show the real app on any device."
            checked={deviceFrame}
            onCheckedChange={setDeviceFrame}
          />
          <SettingRow
            title="Dark mode"
            desc="Switch the neutral surfaces to a dark theme. Your brand accent still applies."
            checked={dark}
            onCheckedChange={setDark}
          />
        </div>
      </section>

      {/* Demo & onboarding */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <PlayCircle className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Demo & onboarding</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Auto-launch on first open</Label>
            <Select value={autoLaunch} onValueChange={(v) => setAutoLaunch(v as AutoLaunch)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="coached">Guided tour</SelectItem>
                <SelectItem value="autoplay">Auto demo (hands-free)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              What new users see the first time they open the app (e.g. after installing the PWA).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Default persona</Label>
            <Select value={defaultPersona} onValueChange={(v) => setDefaultPersona(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERSONAS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Which view the app opens on.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => startTour('coached')}>
            <PlayCircle className="size-4" /> Preview guided tour
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => startTour('autoplay')}>
            <PlayCircle className="size-4" /> Preview auto demo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              resetTourSeen()
              toast.success('First-run reset', { description: 'The auto-launch will trigger again next open.' })
            }}
          >
            <RotateCcw className="size-4" /> Replay first-run
          </Button>
        </div>
      </section>
    </div>
  )
}

function SettingRow({
  title,
  desc,
  checked,
  onCheckedChange,
}: {
  title: string
  desc: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
