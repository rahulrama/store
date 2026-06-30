import { useNavigate } from 'react-router-dom'
import type { Task } from '@/types'
import { STORES, STORE_BY_ID, REGION_BY_ID } from '@/data/stores'
import { KPI_BY_STORE } from '@/data/kpis'
import { tasksForStore, openExceptions } from '@/store/selectors'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ProgressBar } from '@/components/shared/Stat'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

export interface LeagueRow {
  storeId: string
  score: number
}

export function storeScore(storeId: string): number {
  const kpi = KPI_BY_STORE[storeId]
  return Math.round(0.5 * kpi.compliancePct + 0.3 * Math.min(100, kpi.salesVsTargetPct) + 0.2 * (100 - kpi.oosRatePct * 4))
}

export function StoreLeagueTable({
  tasks,
  storeIds,
  limit,
}: {
  tasks: Task[]
  storeIds?: string[]
  limit?: number
}) {
  const navigate = useNavigate()
  const ids = storeIds ?? STORES.map((s) => s.id)
  const rows = ids
    .map((storeId) => ({ storeId, score: storeScore(storeId) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Region</TableHead>
            <TableHead className="w-40">Compliance</TableHead>
            <TableHead className="text-right">Sales</TableHead>
            <TableHead className="text-right">Open</TableHead>
            <TableHead className="text-right">Exceptions</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const store = STORE_BY_ID[row.storeId]
            const kpi = KPI_BY_STORE[row.storeId]
            const st = tasksForStore(tasks, row.storeId)
            const open = st.filter((t) => t.status !== 'complete').length
            const exceptions = openExceptions(st).length
            return (
              <TableRow
                key={row.storeId}
                className="cursor-pointer"
                onClick={() => navigate(`/region/store/${row.storeId}`)}
              >
                <TableCell className="font-semibold tabular-nums text-muted-foreground">{i + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{store.name}</div>
                  <div className="text-xs text-muted-foreground">#{store.code} · {store.format}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{REGION_BY_ID[store.regionId].name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={kpi.compliancePct}
                      tone={kpi.compliancePct >= 85 ? 'success' : kpi.compliancePct >= 75 ? 'warning' : 'danger'}
                    />
                    <span className="w-9 text-right text-xs tabular-nums">{kpi.compliancePct}%</span>
                  </div>
                </TableCell>
                <TableCell className={cn('text-right text-sm tabular-nums', kpi.salesVsTargetPct < 90 ? 'text-danger' : 'text-foreground')}>
                  {kpi.salesVsTargetPct}%
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">{open}</TableCell>
                <TableCell className="text-right">
                  {exceptions > 0 ? (
                    <span className="inline-flex items-center rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                      {exceptions}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
