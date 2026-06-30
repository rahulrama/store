import type { Promotion } from '@/types'

// Multiple concurrent promotions running on the demo Saturday, so the story is
// "a busy trading weekend across the estate", not a single product.
export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-console-bundle',
    name: 'Nexus 5 Console + Star Voyager Bundle — £40 off',
    mechanic: 'Bundle',
    description:
      'Headline gaming bundle for the weekend: Nexus 5 console packaged with Star Voyager, £40 cheaper than buying separately.',
    startDate: '2026-06-12',
    endDate: '2026-06-21',
    productSkus: ['GM-CONSOLE-BUNDLE', 'GM-CONSOLE-X', 'GM-GAME-HERO'],
    targetUplift: 0.35,
    executionNote:
      'Build the gaming end-cap at the front of Gaming, bundle ticket on, demo unit powered with Star Voyager running.',
  },
  {
    id: 'promo-bigmatch-tv',
    name: 'Big Match 4K TV Event',
    mechanic: 'Price cut',
    description:
      'Summer of football TV event — OLED and LED 4K TVs reduced, free delivery on large screens.',
    startDate: '2026-06-06',
    endDate: '2026-06-28',
    productSkus: ['TV-OLED-65', 'TV-LED-50', 'TV-SOUNDBAR'],
    targetUplift: 0.3,
    executionNote:
      'TV wall set to football demo loop, soundbar attach prompt at till, “free delivery” barker card on 65" models.',
  },
  {
    id: 'promo-back-to-school',
    name: 'Back to School Laptops',
    mechanic: 'Multibuy',
    description:
      'Laptop + WorkSuite 365 + mouse student bundles, with care plan add-on prompts.',
    startDate: '2026-06-10',
    endDate: '2026-07-31',
    productSkus: ['CM-LAPTOP-STUDENT', 'CM-LAPTOP-CREATOR', 'CM-OFFICE'],
    targetUplift: 0.2,
    executionNote: 'Student bundle pinboard in Computing, care plan benefits explained at point of sale.',
  },
  {
    id: 'promo-phone-tradein',
    name: 'Smartphone Trade-in + £100 Cashback',
    mechanic: 'Trade-in',
    description:
      'Trade in an old handset and claim up to £100 cashback on selected Astra smartphones.',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
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
    startDate: '2026-06-08',
    endDate: '2026-07-15',
    productSkus: ['LA-FAN-TOWER', 'LA-AIRCON'],
    targetUplift: 0.5,
    executionNote: 'Cooling stack near the entrance, “beat the heatwave” signage, keep shop-floor stock topped up.',
  },
]

export const PROMO_BY_ID = Object.fromEntries(PROMOTIONS.map((p) => [p.id, p])) as Record<
  string,
  Promotion
>
