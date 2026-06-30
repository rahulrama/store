import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Wifi, BatteryFull, Signal as SignalIcon } from 'lucide-react'
import { timeOf } from '@/lib/format'
import { DEMO_NOW } from '@/data/now'

/**
 * Wraps colleague/store views in a tablet-style frame to convey that the app is
 * used inside the store on a handheld or tablet.
 */
export function DeviceFrame({
  children,
  title,
  subtitle,
  tabs,
}: {
  children: ReactNode
  title: string
  subtitle?: string
  tabs?: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="overflow-hidden rounded-[28px] border-[6px] border-neutral-800 bg-neutral-800 shadow-xl">
        {/* Device status bar */}
        <div className="flex items-center justify-between bg-neutral-800 px-5 py-1.5 text-[11px] font-medium text-neutral-300">
          <span>{timeOf(DEMO_NOW)}</span>
          <span className="flex items-center gap-1.5">
            wattsRus Colleague
          </span>
          <span className="flex items-center gap-1.5">
            <SignalIcon className="size-3" />
            <Wifi className="size-3" />
            <BatteryFull className="size-3.5" />
          </span>
        </div>
        {/* App canvas */}
        <div className="bg-canvas">
          <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
            <div>
              <h1 className="text-base font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {tabs && (
            <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 scrollbar-thin">
              {tabs}
            </div>
          )}
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-4 scrollbar-thin">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function DeviceTab({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
