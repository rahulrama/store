import { useNavigate } from 'react-router-dom'
import { SOCIAL_PULSE, type SocialPlatform, type TrendDirection } from '@/data/social'
import { HelpTip } from '@/components/help/HelpTip'
import { DemoBadge } from '@/components/shared/DemoBadge'
import { cn } from '@/lib/utils'
import { Camera, Heart, MessageCircle, TrendingUp, TrendingDown, Minus, Music2, Hash, Radio, ChevronRight } from 'lucide-react'

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

export function SocialPulseCard() {
  const navigate = useNavigate()
  const p = SOCIAL_PULSE

  return (
    <div className="rounded-lg border border-border bg-card">
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate('/hq/social')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate('/hq/social')
          }
        }}
        className="flex w-full cursor-pointer items-center gap-2 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Radio className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Social pulse</h3>
        <HelpTip id="socialPulse" />
        <DemoBadge className="ml-auto" />
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <Metric label="Sentiment" value={`${p.sentiment}`} delta={p.sentimentDelta} suffix="/100" />
        <Metric label="Mentions 24h" value={compact(p.mentions24h)} delta={p.mentionsDelta} />
        <Metric label="Reach 24h" value={p.reach24h} />
      </div>

      {/* Trending */}
      <div className="px-4 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Trending now
        </p>
        <div className="space-y-2">
          {p.trends.map((t) => {
            const PIcon = PLATFORM_ICON[t.platform]
            const DIcon = DIR_ICON[t.direction]
            return (
              <div key={t.id} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <PIcon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{t.topic}</span>
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
                  </div>
                  <p className="text-xs text-muted-foreground">{t.note}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top post */}
      <div className="border-t border-border px-4 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Top posts
        </p>
        <div className="space-y-2">
          {p.topPosts.map((post) => {
            const PIcon = PLATFORM_ICON[post.platform]
            return (
              <div key={post.id} className="rounded-md border border-border bg-muted/30 p-2.5">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <PIcon className="size-3.5 text-muted-foreground" />
                  {post.handle}
                  <span className="font-normal text-muted-foreground">· {post.when}</span>
                </div>
                <p className="mt-1 text-sm">{post.caption}</p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
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
    </div>
  )
}

function Metric({
  label,
  value,
  delta,
  suffix,
}: {
  label: string
  value: string
  delta?: number
  suffix?: string
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-lg font-semibold tabular-nums">{value}</span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      {delta != null && (
        <span className={cn('text-[11px] font-medium', delta >= 0 ? 'text-success' : 'text-danger')}>
          {delta >= 0 ? '+' : ''}
          {delta}% vs last week
        </span>
      )}
    </div>
  )
}
