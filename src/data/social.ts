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
  sentiment: 81,
  sentimentDelta: 9,
  mentions24h: 21800,
  mentionsDelta: 54,
  reach24h: '3.4M',
  trends: [
    {
      id: 'st-console',
      platform: 'TikTok',
      topic: 'PS5 × Grand Theft Auto VI unboxing',
      note: 'Creator unboxing hit 2.1M views overnight — bundle searches up sharply and stock is moving fast.',
      changePct: 38,
      direction: 'up',
      sku: 'GM-CONSOLE-BUNDLE',
    },
    {
      id: 'st-sauna',
      platform: 'TikTok',
      topic: 'Saunas in a heatwave 🧖',
      note: 'Our cheeky “sauna szn… in 30°C?” post is splitting the comments — massive reach, wellness-range searches climbing.',
      changePct: 64,
      direction: 'up',
    },
    {
      id: 'st-cooling',
      platform: 'Instagram',
      topic: '#HeatwaveHacks',
      note: 'Gen-Z “beat the heat” trend lifting fans & portable AC — shoppers tagging us for stock checks.',
      changePct: 41,
      direction: 'up',
      sku: 'LA-AIRCON',
    },
    {
      id: 'st-tv',
      platform: 'Instagram',
      topic: '#NewSeasonTV',
      note: 'Our new-season TV Reel is driving “is it in stock near me?” comments to local stores.',
      changePct: 27,
      direction: 'up',
      sku: 'TV-OLED-65',
    },
    {
      id: 'st-service',
      platform: 'X',
      topic: 'Click & Collect waits',
      note: 'A handful of posts flag long Click & Collect waits at Bristol Cribbs Causeway — worth a quick look.',
      changePct: 12,
      direction: 'down',
    },
  ],
  topPosts: [
    {
      id: 'sp-sauna',
      platform: 'Instagram',
      handle: '@currys',
      caption: 'saunas… in a HEATWAVE?? 🧖‍♂️🔥 hear us out — recovery szn doesn’t take summers off. the home sauna range just landed 👀',
      likes: 41200,
      comments: 1870,
      when: '3h ago',
    },
    {
      id: 'sp-1',
      platform: 'TikTok',
      handle: '@gamerjae',
      caption: 'POV: Currys actually had the PS5 × GTA VI bundle in stock 😭🔥 run don’t walk',
      likes: 184000,
      comments: 3200,
      when: '6h ago',
    },
    {
      id: 'sp-2',
      platform: 'Instagram',
      handle: '@currys',
      caption: 'tell me it’s match day without telling me ⚽📺 65" OLED + soundbar = main character energy #BigMatchTV',
      likes: 22400,
      comments: 540,
      when: '9h ago',
    },
    {
      id: 'sp-3',
      platform: 'TikTok',
      handle: '@homewithmaya',
      caption: 'ngl this little tower fan is the only thing keeping me alive rn 🥵❄️ ty @currys',
      likes: 15800,
      comments: 410,
      when: '12h ago',
    },
  ],
}
