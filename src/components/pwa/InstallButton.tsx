import { useState } from 'react'
import { Download, Share, Plus, MoreVertical, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useInstall } from '@/pwa/install'
import { useActiveBrand } from '@/store/useBrandStore'
import { toast } from 'sonner'

export function InstallButton({ compact = false, asMenuItem = false }: { compact?: boolean; asMenuItem?: boolean }) {
  const { installed, canPrompt, ios, promptInstall } = useInstall()
  const brand = useActiveBrand()
  const [open, setOpen] = useState(false)

  if (installed) return null

  async function handleClick() {
    if (canPrompt) {
      const outcome = await promptInstall()
      if (outcome === 'accepted') toast.success(`${brand.name} installed`, { description: 'Find it on your home screen / desktop.' })
      else if (outcome === 'dismissed') toast('Install dismissed', { description: 'You can add it any time from here.' })
      else setOpen(true)
    } else {
      setOpen(true)
    }
  }

  return (
    <>
      {asMenuItem ? (
        <DropdownMenuItem
          onSelect={(e) => {
            // Chromium: fire the native prompt inside the user gesture (let the menu close).
            // iOS / no prompt available: keep the menu open so it doesn't steal focus from the dialog.
            if (!canPrompt) e.preventDefault()
            void handleClick()
          }}
        >
          <Download className="size-4" /> Add to device
        </DropdownMenuItem>
      ) : (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleClick}>
          <Download className="size-4" />
          {compact ? 'Install' : 'Add to device'}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {brand.name} to your device</DialogTitle>
            <DialogDescription>
              Install it like a native app — it works offline and opens full-screen.
            </DialogDescription>
          </DialogHeader>

          {ios ? (
            <ol className="space-y-3">
              <Step n={1} icon={<Share className="size-4" />}>
                Tap the <strong>Share</strong> button in Safari's toolbar.
              </Step>
              <Step n={2} icon={<Plus className="size-4" />}>
                Choose <strong>Add to Home Screen</strong>.
              </Step>
              <Step n={3} icon={<Check className="size-4" />}>
                Tap <strong>Add</strong> — the app appears on your home screen.
              </Step>
            </ol>
          ) : (
            <ol className="space-y-3">
              <Step n={1} icon={<MoreVertical className="size-4" />}>
                Open the browser menu (or the <strong>install</strong> icon in the address bar).
              </Step>
              <Step n={2} icon={<Download className="size-4" />}>
                Choose <strong>Install {brand.name}</strong> / <strong>Add to Home screen</strong>.
              </Step>
              <Step n={3} icon={<Check className="size-4" />}>
                Confirm — it installs as an app on your device.
              </Step>
            </ol>
          )}

          <p className="text-xs text-muted-foreground">
            Tip: in Chrome or Edge this is usually a one-tap install. On iPhone/iPad, Safari requires
            the manual steps above.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {n}
      </span>
      <div className="flex min-w-0 items-start gap-2 pt-0.5 text-sm">
        <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
        <span className="min-w-0">{children}</span>
      </div>
    </li>
  )
}
