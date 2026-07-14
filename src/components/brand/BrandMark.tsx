import { Zap } from 'lucide-react'
import { useActiveBrand } from '@/store/useBrandStore'
import { cn } from '@/lib/utils'

/** The brand mark: an uploaded logo, or the default bolt glyph on the accent. */
export function BrandGlyph({ className }: { className?: string }) {
  const brand = useActiveBrand()
  if (brand.logoDataUrl) {
    return (
      <img
        src={brand.logoDataUrl}
        alt={brand.name}
        className={cn('size-8 rounded-lg object-contain', className)}
      />
    )
  }
  return (
    <span
      className={cn(
        'flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground',
        className,
      )}
    >
      <Zap className="size-5" fill="currentColor" />
    </span>
  )
}

/** Full lockup: glyph + wordmark + tagline. */
export function BrandMark({ withWordmark = true }: { withWordmark?: boolean }) {
  const brand = useActiveBrand()
  return (
    <span className="flex items-center gap-2">
      <BrandGlyph />
      {withWordmark && (
        <span className="hidden flex-col items-start leading-none md:flex">
          <span className="text-sm font-bold tracking-tight">{brand.name}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {brand.tagline}
          </span>
        </span>
      )}
    </span>
  )
}
