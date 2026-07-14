import { useAppStore } from '@/store/useAppStore'
import { USER_BY_ID, REGION_BY_ID, storesInRegion } from '@/data/stores'
import { tasksForRegion, openExceptions } from '@/store/selectors'
import { slaStatus } from '@/engine/sla'
import { SectionHeading, KpiStat } from '@/components/shared/Stat'
import { HelpTip } from '@/components/help/HelpTip'
import { ExceptionInbox } from '@/components/estate/ExceptionInbox'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

export function Escalations() {
  const tasks = useAppStore((s) => s.tasks)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const regionId = USER_BY_ID[currentUserId]?.regionId ?? 'r-north'
  const region = REGION_BY_ID[regionId]
  const stores = storesInRegion(regionId)
  const regionTasks = tasksForRegion(tasks, regionId)

  const exceptions = openExceptions(regionTasks)
  const states = exceptions.map((t) => (t.escalation ? slaStatus(t.escalation).state : 'on_track'))
  const onTrack = states.filter((s) => s === 'on_track').length
  const atRisk = states.filter((s) => s === 'at_risk').length
  const breached = states.filter((s) => s === 'breached').length

  return (
    <div className="space-y-6">
      <SectionHeading
        title={`${region.name} — Escalations & SLAs`}
        description={`Live exception tracking across ${stores.length} stores.`}
        action={<HelpTip id="sla" />}
      />

      <div className="grid grid-cols-3 gap-4">
        <KpiStat label="On track" value={onTrack} tone="success" icon={<CheckCircle2 className="size-4" />} />
        <KpiStat label="At risk" value={atRisk} tone="warning" icon={<AlertCircle className="size-4" />} />
        <KpiStat label="Breached" value={breached} tone="danger" icon={<XCircle className="size-4" />} />
      </div>

      <ExceptionInbox tasks={regionTasks} />
    </div>
  )
}
