import { useAppStore } from '@/store/useAppStore'
import { USER_BY_ID, REGION_BY_ID, storesInRegion } from '@/data/stores'
import { tasksForRegion, openExceptions, completionRate, overdueTasks } from '@/store/selectors'
import { SectionHeading, KpiStat } from '@/components/shared/Stat'
import { StoreLeagueTable } from '@/components/estate/StoreLeagueTable'
import { ExceptionInbox } from '@/components/estate/ExceptionInbox'
import { ExplainerBanner } from '@/components/help/ExplainerBanner'
import { LabelWithHelp } from '@/components/help/HelpTip'
import { DEMO_NOW } from '@/data/now'
import { longDateOf } from '@/lib/format'
import { Store as StoreIcon, TriangleAlert, Clock, CheckCircle2 } from 'lucide-react'

export function RegionCockpit() {
  const tasks = useAppStore((s) => s.tasks)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const regionId = USER_BY_ID[currentUserId]?.regionId ?? 'r-north'
  const region = REGION_BY_ID[regionId]
  const stores = storesInRegion(regionId)
  const storeIds = stores.map((s) => s.id)
  const regionTasks = tasksForRegion(tasks, regionId)

  return (
    <div className="space-y-6">
      <SectionHeading
        title={`${region.name} — Store Cockpit`}
        description={`${longDateOf(DEMO_NOW)} · ${stores.length} stores · improve every store, every day.`}
      />

      <ExplainerBanner text="Your group of stores at a glance. The league table ranks them; the inbox on the right shows blockers that have been escalated for help, each on a clock (SLA)." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiStat label="Stores" value={stores.length} icon={<StoreIcon className="size-4" />} />
        <KpiStat label={<LabelWithHelp helpId="openExceptions">Open exceptions</LabelWithHelp>} value={openExceptions(regionTasks).length} tone="danger" icon={<TriangleAlert className="size-4" />} />
        <KpiStat label={<LabelWithHelp helpId="overdueActions">Overdue</LabelWithHelp>} value={overdueTasks(regionTasks, DEMO_NOW).length} tone="warning" icon={<Clock className="size-4" />} />
        <KpiStat label={<LabelWithHelp helpId="completionRate">Completion</LabelWithHelp>} value={`${completionRate(regionTasks)}%`} tone="success" icon={<CheckCircle2 className="size-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeading title="League table" description="Your stores, ranked." className="mb-3" />
          <StoreLeagueTable tasks={tasks} storeIds={storeIds} />
        </div>
        <div data-tour="region-exceptions">
          <SectionHeading title="Exceptions & SLAs" description="Sorted by urgency." className="mb-3" />
          <ExceptionInbox tasks={regionTasks} />
        </div>
      </div>
    </div>
  )
}
