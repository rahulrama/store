import { useNavigate } from 'react-router-dom'
import { SOCIAL_PULSE, type SocialPlatform, type TrendDirection } from '@/data/social'
import { PRODUCT_BY_SKU } from '@/data/products'
import { STORES, STORE_BY_ID } from '@/data/stores'
import { useAppStore } from '@/store/useAppStore'
import { SectionHeading, KpiStat } from '@/components/shared/Stat'
import { ExplainerBanner } from '@/components/help/ExplainerBanner'
import { HelpTip } from '@/components/help/HelpTip'
import { DemoBadge } from '@/components/shared/DemoBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { gbp } from '@/lib/format'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Camera,
  Music2,
  Hash,
  Heart,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Radio,
  Smile,
  Send,
  ArrowRight,
} from 'lucide-react'

const PLATFORM_ICON: Record<SocialPlatform, typeof Camera> = {
  Instagram: Camera,
  TikTok: Music2,
  X: Hash,
}
const DIR_ICON: Record<TrendDirection, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
}

function compact(n: number): string {
  return new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

// Recommended action per trend, derived from the product/sentiment.
function actionFor(sku: string | undefined, direction: TrendDirection): string {
  if (direction === 'down') return 'Brief Customer Service to clear the queue and recover sentiment.'
  if (!sku) return 'Share the trend with stores and watch footfall.'
  return 'Bring stock forward and make sure the display is built before the rush.'
}

export function SocialHub() {
  const navigate = useNavigate()
  const createTask = useAppStore((s) => s.createTask)
  const p = SOCIAL_PULSE

  // Default the "push to store" target to the flagship demo store.
  const [storeBySku, setStoreBySku] = useState<Record<string, string>>({})

  function pushToStore(trendId: string, sku: string | undefined, topic: string, estImpact: number) {
    const storeId = storeBySku[trendId] ?? 's-214'
    const product = sku ? PRODUCT_BY_SKU[sku] : undefined
    createTask({
      title: `Social trend: get ready for ${product?.name ?? topic}`,
      rationale: `Trending on social media (${topic}). Bring stock forward and make sure the display is built before the rush.`,
      domainId: 'merchandising',
      storeId,
      priority: 'P2',
      evidenceRequired: true,
      estImpactGBP: estImpact,
    })
    toast.success('Pushed to store', {
      description: `${STORE_BY_ID[storeId].name} now has the action on its list.`,
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Social Pulse"
        description="What customers are saying and sharing — turned into actions for the right stores."
        action={<DemoBadge />}
      />

      <ExplainerBanner text="Social media is an early-warning signal for demand. When a product trends, push the action to the relevant stores so they’re stocked and merchandised before the rush — or recover fast when sentiment dips." />

      {/* Headline metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiStat label="Sentiment" value={`${p.sentiment}/100`} delta={p.sentimentDelta} tone="success" icon={<Smile className="size-4" />} />
        <KpiStat label="Mentions 24h" value={compact(p.mentions24h)} delta={p.mentionsDelta} icon={<MessageCircle className="size-4" />} />
        <KpiStat label="Reach 24h" value={p.reach24h} icon={<Radio className="size-4" />} />
        <KpiStat label="Active trends" value={p.trends.length} icon={<TrendingUp className="size-4" />} />
      </div>

      {/* Trends with push-to-store */}
      <div data-tour="social-trends">
        <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold">
          Trends &amp; recommended actions <HelpTip id="pushToStore" />
        </h3>
        <div className="space-y-3">
          {p.trends.map((t) => {
            const PIcon = PLATFORM_ICON[t.platform]
            const DIcon = DIR_ICON[t.direction]
            const product = t.sku ? PRODUCT_BY_SKU[t.sku] : undefined
            const estImpact = t.direction === 'down' ? 0 : Math.round((t.changePct / 10) * 250)
            const targetStore = storeBySku[t.id] ?? 's-214'
            return (
              <div key={t.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <PIcon className="size-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{t.topic}</span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-0.5 text-xs font-semibold',
                            t.direction === 'down' ? 'text-danger' : 'text-success',
                          )}
                        >
                          <DIcon className="size-3" />
                          {t.changePct > 0 ? '+' : ''}
                          {t.changePct}%
                        </span>
                        <Badge variant="secondary" className="text-[10px]">{t.platform}</Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{t.note}</p>
                      {product && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Linked product: <span className="font-medium text-foreground">{product.name}</span> · {gbp(product.price)}
                        </p>
                      )}
                      <p className="mt-2 text-sm">
                        <span className="font-medium text-primary">Recommended: </span>
                        {actionFor(t.sku, t.direction)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Push to store */}
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Push to:</span>
                  <Select value={targetStore} onValueChange={(v) => setStoreBySku((m) => ({ ...m, [t.id]: v }))}>
                    <SelectTrigger className="h-8 w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STORES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} · #{s.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {t.direction !== 'down' && estImpact > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">
                      ~{gbp(estImpact, { compact: true })} opportunity
                    </span>
                  )}
                  <Button
                    size="sm"
                    className="ml-auto gap-1.5"
                    onClick={() => pushToStore(t.id, t.sku, t.topic, estImpact)}
                  >
                    <Send className="size-4" /> Push to store
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top posts */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Top posts</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {p.topPosts.map((post) => {
            const PIcon = PLATFORM_ICON[post.platform]
            return (
              <div key={post.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <PIcon className="size-3.5 text-muted-foreground" />
                  {post.handle}
                  <span className="font-normal text-muted-foreground">· {post.when}</span>
                </div>
                <p className="mt-1.5 text-sm">{post.caption}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-3" /> {compact(post.likes)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="size-3" /> {compact(post.comments)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Pushed actions appear on the store’s daily brief and roll up to Region and HQ like any other task.
        </p>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/hq')}>
          Back to Control Tower <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
