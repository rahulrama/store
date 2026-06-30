import { useAppStore } from '@/store/useAppStore'
import { Sparkles } from 'lucide-react'

/** Floating Copilot launcher, always available bottom-right. */
export function CopilotLauncher() {
  const open = useAppStore((s) => s.copilotOpen)
  const setCopilotOpen = useAppStore((s) => s.setCopilotOpen)
  if (open) return null
  return (
    <button
      type="button"
      onClick={() => setCopilotOpen(true)}
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
    >
      <Sparkles className="size-5" />
      Copilot
    </button>
  )
}
