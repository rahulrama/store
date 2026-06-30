import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useBrandStore } from '@/store/useBrandStore'
import { getHelp } from '@/data/help'
import { cn } from '@/lib/utils'

/**
 * A small info icon next to a label. Opens a plain-English explanation on
 * tap/click (reliable on touch) and on hover (nice on desktop). Hidden when the
 * admin "Show help tips" setting is off.
 */
export function HelpTip({ id, className }: { id: string; className?: string }) {
  const showHelp = useBrandStore((s) => s.showHelp)
  const [open, setOpen] = useState(false)
  const entry = getHelp(id)
  if (!showHelp || !entry) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`What is ${entry.term}?`}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={(e) => {
            e.stopPropagation()
            setOpen((o) => !o)
          }}
          className={cn(
            'inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-primary',
            className,
          )}
        >
          <HelpCircle className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 text-sm"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <p className="font-semibold">{entry.term}</p>
        <p className="mt-1 text-muted-foreground">{entry.body}</p>
        {entry.whatToDo && (
          <p className="mt-2 rounded-md bg-primary/5 p-2 text-xs">
            <span className="font-medium text-primary">What to do: </span>
            {entry.whatToDo}
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}

/** Inline label + help icon, a common pairing for headings and stat labels. */
export function LabelWithHelp({
  children,
  helpId,
  className,
}: {
  children: React.ReactNode
  helpId: string
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {children}
      <HelpTip id={helpId} />
    </span>
  )
}
