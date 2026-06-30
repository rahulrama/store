import { useAppStore } from '@/store/useAppStore'
import { SOURCES } from '@/data/sources'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, FileSearch } from 'lucide-react'

export function SourcesPanel() {
  const open = useAppStore((s) => s.sourcesOpen)
  const setOpen = useAppStore((s) => s.setSourcesOpen)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileSearch className="size-5 text-primary" />
            Sources & research provenance
          </SheetTitle>
          <SheetDescription>
            This demo's requirements are derived from <strong>public category research</strong> — not
            copied from any single vendor. Every feature traces back to one of these sources.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 px-4 pb-8">
          {SOURCES.map((source) => (
            <div key={source.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{source.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {source.type}
                  </Badge>
                </div>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Visit <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Informed: </span>
                {source.informed}
              </p>
            </div>
          ))}

          <p className="px-1 pt-2 text-xs text-muted-foreground">
            All store, product, colleague and sales data in this demo is synthetic and for
            illustration only.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
