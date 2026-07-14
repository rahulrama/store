import type { Promotion } from '@/types'

// Multiple concurrent promotions running on the demo day, so the story is
// "a busy trading day across the estate", not a single product.
export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-console-bundle',
    name: 'PlayStation 5 + Grand Theft Auto VI Bundle — £40 off',
    mechanic: 'Bundle',
    description:
      'Headline gaming bundle for the weekend: PlayStation 5 console packaged with Grand Theft Auto VI, £40 cheaper than buying separately.',
    startDate: '2026-07-23',
    endDate: '2026-08-03',
    productSkus: ['GM-CONSOLE-BUNDLE', 'GM-CONSOLE-X', 'GM-GAME-HERO'],
    targetUplift: 0.35,
    executionNote:
      'Build the gaming end cap at the front of Gaming, bundle ticket on, demo unit powered with Grand Theft Auto VI running.',
  },
  {
    id: 'promo-bigmatch-tv',
    name: 'New Season 4K TV Event',
    mechanic: 'Price cut',
    description:
      'Get set for the new football season — OLED and LED 4K TVs reduced, free delivery on large screens.',
    startDate: '2026-07-18',
    endDate: '2026-08-16',
    productSkus: ['TV-OLED-65', 'TV-LED-50', 'TV-SOUNDBAR'],
    targetUplift: 0.3,
    executionNote:
      'TV wall set to the new-season sport showreel, soundbar attach prompt at till, “free delivery” barker card on 65" models.',
  },
  {
    id: 'promo-back-to-school',
    name: 'Back to School Laptops',
    mechanic: 'Multibuy',
    description:
      'Copilot+ PC + Microsoft 365 + mouse student bundles, with care plan add-on prompts.',
    startDate: '2026-07-14',
    endDate: '2026-08-31',
    productSkus: ['CM-LAPTOP-STUDENT', 'CM-LAPTOP-CREATOR', 'CM-OFFICE'],
    targetUplift: 0.2,
    executionNote: 'Student bundle pinboard in Computing, care plan benefits explained at point of sale.',
  },
  {
    id: 'promo-phone-tradein',
    name: 'Smartphone Trade-in + £100 Cashback',
    mechanic: 'Trade-in',
    description:
      'Trade in an old handset and claim up to £100 cashback on selected Samsung Galaxy smartphones.',
    startDate: '2026-07-10',
    endDate: '2026-07-31',
    productSkus: ['MB-PHONE-PRO', 'MB-PHONE-LITE'],
    targetUplift: 0.25,
    executionNote: 'Trade-in calculator on the kiosk, cashback claim QR card by the phone wall.',
  },
  {
    id: 'promo-summer-cooling',
    name: 'Summer Cooling — Heatwave Ready',
    mechanic: 'Price cut',
    description:
      'Fans and portable air conditioners promoted as the June heatwave drives demand.',
    startDate: '2026-07-11',
    endDate: '2026-08-02',
    productSkus: ['LA-FAN-TOWER', 'LA-AIRCON'],
    targetUplift: 0.5,
    executionNote: 'Cooling stack near the entrance, “beat the heatwave” signage, keep shop-floor stock topped up.',
  },
]

export const PROMO_BY_ID = Object.fromEntries(PROMOTIONS.map((p) => [p.id, p])) as Record<
  string,
  Promotion
>
