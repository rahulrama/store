import { useBrandStore } from '@/store/useBrandStore'
import { cn } from '@/lib/utils'

/**
 * A small "Demo data" pill. Hidden unless the admin "Show 'Demo data' labels"
 * setting is on, so by default the app reads as real.
 */
export function DemoBadge({ className }: { className?: string }) {
  const show = useBrandStore((s) => s.showDemoBadges)
  if (!show) return null
  return (
    <span
      className={cn(
        'rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground',
        className,
      )}
    >
      Demo data
    </span>
  )
}
