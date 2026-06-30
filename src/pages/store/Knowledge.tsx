import { useAppStore } from '@/store/useAppStore'
import { SOPS } from '@/data/sops'
import { SectionHeading } from '@/components/shared/Stat'
import { DomainChip, SourceTag } from '@/components/shared/badges'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Sparkles, BookOpen } from 'lucide-react'

export function Knowledge() {
  const setCopilotOpen = useAppStore((s) => s.setCopilotOpen)

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Knowledge & SOPs"
        description="Just-in-time procedures — or ask the Copilot in your own words."
        action={
          <Button variant="outline" className="gap-1.5" onClick={() => setCopilotOpen(true)}>
            <Sparkles className="size-4 text-primary" />
            Ask the Copilot
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        {SOPS.map((sop) => (
          <div key={sop.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">{sop.title}</h3>
              </div>
            </div>
            <div className="mt-2">
              <DomainChip domainId={sop.domainId} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{sop.summary}</p>
            <Accordion type="single" collapsible className="mt-1">
              <AccordionItem value="steps" className="border-0">
                <AccordionTrigger className="py-2 text-sm">View steps</AccordionTrigger>
                <AccordionContent>
                  <ol className="space-y-1.5">
                    {sop.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-2">
                    <SourceTag sourceId={sop.sourceId} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  )
}
