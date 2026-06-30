import { Link } from 'react-router-dom'
import { Info, BookOpen } from 'lucide-react'
import { useBrandStore } from '@/store/useBrandStore'

/**
 * A short, friendly one-liner at the top of a view explaining what it is for.
 * Only shown when the admin "Show help tips" setting is on, so power users can
 * hide them. Links to the full onboarding guide.
 */
export function ExplainerBanner({ text }: { text: string }) {
  const showHelp = useBrandStore((s) => s.showHelp)
  if (!showHelp) return null

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm">
      <Info className="size-4 shrink-0 text-primary" />
      <p className="text-muted-foreground">{text}</p>
      <Link
        to="/guide"
        className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <BookOpen className="size-3.5" />
        Guide
      </Link>
    </div>
  )
}
