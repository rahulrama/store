import { useNavigate } from 'react-router-dom'
import type { StockStatus } from '@/types'
import { STORE_BY_ID } from '@/data/stores'
import { stockMatrix } from '@/engine/stock'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const CELL: Record<StockStatus, string> = {
  in_stock: 'text-foreground',
  low: 'bg-warning/10 font-semibold text-warning',
  out_of_stock: 'bg-danger/10 font-semibold text-danger',
}

/** SKU (rows) × store (columns) stock heatmap. Cells link to the store drill-down. */
export function StockMatrix({ storeIds, skus }: { storeIds: string[]; skus?: string[] }) {
  const navigate = useNavigate()
  const rows = stockMatrix(storeIds, skus)

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 bg-card">Product</TableHead>
            {storeIds.map((id) => (
              <TableHead key={id} className="whitespace-nowrap text-center">
                #{STORE_BY_ID[id].code}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.sku}>
              <TableCell className="sticky left-0 z-10 bg-card">
                <div className="max-w-[180px] truncate text-sm font-medium">{row.product?.name ?? row.sku}</div>
                <div className="text-xs text-muted-foreground">{row.product?.category}</div>
              </TableCell>
              {row.cells.map((cell, i) => (
                <TableCell
                  key={storeIds[i]}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/region/store/${storeIds[i]}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/region/store/${storeIds[i]}`)
                    }
                  }}
                  className={cn(
                    'cursor-pointer text-center text-sm tabular-nums',
                    cell ? CELL[cell.status] : 'text-muted-foreground',
                  )}
                  title={
                    cell
                      ? `${STORE_BY_ID[storeIds[i]].name}: ${cell.onHand} on hand${cell.onOrder ? `, ${cell.onOrder} on order` : ''}`
                      : undefined
                  }
                >
                  {cell ? cell.onHand : '—'}
                  {cell && cell.onOrder > 0 && (
                    <span className="ml-0.5 text-[10px] text-muted-foreground">+{cell.onOrder}</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
