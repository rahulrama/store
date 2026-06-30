// Mock "Social pulse" data for the HQ Control Tower. This is synthetic — in a
// real build it would come from a server-side connector to the Instagram /
// TikTok Graph APIs (a static app can't call those safely from the browser).
// Shaped roughly like a social-listening API response so the integration point
// is obvious.

export type SocialPlatform = 'Instagram' | 'TikTok' | 'X'
export type TrendDirection = 'up' | 'down' | 'flat'

export interface SocialTrendItem {
  id: string
  platform: SocialPlatform
  /** What's trending — a product, hashtag or campaign. */
  topic: string
  /** Why it matters in one line. */
  note: string
  /** Change in mentions/engagement vs last week, as a percentage. */
  changePct: number
  direction: TrendDirection
  /** Related product SKU, when the trend maps to something we sell. */
  sku?: string
}

export interface SocialPost {
  id: string
  platform: SocialPlatform
  handle: string
  caption: string
  likes: number
  comments: number
  /** Relative time label for display. */
  when: string
}

export interface SocialPulse {
  /** Overall sentiment 0–100 (higher = more positive). */
  sentiment: number
  sentimentDelta: number
  /** Total brand mentions in the last 24h. */
  mentions24h: number
  mentionsDelta: number
  /** Reach of the brand's own posts in the last 24h. */
  reach24h: string
  trends: SocialTrendItem[]
  topPosts: SocialPost[]
}

export const SOCIAL_PULSE: SocialPulse = {
  sentiment: 78,
  sentimentDelta: 6,
  mentions24h: 14200,
  mentionsDelta: 23,
  reach24h: '1.9M',
  trends: [
    {
      id: 'st-console',
      platform: 'TikTok',
      topic: 'Nexus 5 × Star Voyager unboxing',
      note: 'Creator unboxing hit 2.1M views overnight — searches for the bundle up sharply.',
      changePct: 38,
      direction: 'up',
      sku: 'GM-CONSOLE-BUNDLE',
    },
    {
      id: 'st-tv',
      platform: 'Instagram',
      topic: '#BigMatchTV',
      note: 'Our Big Match TV Reel is driving footfall questions to stores.',
      changePct: 27,
      direction: 'up',
      sku: 'TV-OLED-65',
    },
    {
      id: 'st-cooling',
      platform: 'Instagram',
      topic: 'Heatwave cooling hacks',
      note: 'Gen-Z “beat the heat” trend lifting fans & portable AC interest.',
      changePct: 41,
      direction: 'up',
      sku: 'LA-AIRCON',
    },
    {
      id: 'st-service',
      platform: 'X',
      topic: 'Bristol store mentions',
      note: 'A few posts mention long Click & Collect waits at Bristol Cabot.',
      changePct: 12,
      direction: 'down',
    },
  ],
  topPosts: [
    {
      id: 'sp-1',
      platform: 'TikTok',
      handle: '@gamerjae',
      caption: 'wattsRus had the Nexus 5 Star Voyager bundle in stock 😭🔥 run don’t walk',
      likes: 184000,
      comments: 3200,
      when: '6h ago',
    },
    {
      id: 'sp-2',
      platform: 'Instagram',
      handle: '@wattsRus',
      caption: 'Match day sorted. 65" OLED + soundbar = the squad’s new HQ ⚽📺 #BigMatchTV',
      likes: 22400,
      comments: 540,
      when: '9h ago',
    },
    {
      id: 'sp-3',
      platform: 'Instagram',
      handle: '@homewithmaya',
      caption: 'this little portable AC is saving my life this week 🥵❄️ @wattsRus',
      likes: 15800,
      comments: 410,
      when: '12h ago',
    },
  ],
}
