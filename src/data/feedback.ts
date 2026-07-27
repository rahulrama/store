import type { CustomerFeedback } from '@/types'
import { fromNow } from '@/data/now'

// In-store customer sentiment — from the shop-floor feedback buttons plus
// colleague-flagged complaints and external survey/review channels. 100% PII-free
// by design: structured categories only, never a customer name, contact detail or
// anything identifying.

export const SENTIMENT_OPTIONS = [
  { value: 'negative', label: 'Negative' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'positive', label: 'Positive' },
] as const

// Voice-of-Customer channels: in-store feedback (shop-floor buttons + colleague-flagged complaints) plus external survey and review sources.
export const FEEDBACK_SOURCES = ['In-store', 'Qualtrics', 'Google', 'Trustpilot'] as const

export const AGE_BANDS = [
  'Under 18',
  '18–24',
  '25–34',
  '35–44',
  '45–54',
  '55–64',
  '65+',
  'Prefer not to say',
]

export const DEPARTMENT_OPTIONS = [
  'TV & Audio',
  'Computing',
  'Gaming',
  'Mobile & Wearables',
  'Smart Home',
  'Large Appliances',
  'Customer Service',
  'Multiple / Other',
]

export const ISSUE_CATEGORIES = [
  'Price — too expensive',
  'Price — cheaper elsewhere',
  'Out of stock here',
  'Not in our range',
  'Delivery lead time',
  'Installation & setup support',
  'Not enough help / advice',
  'Waiting / staff availability',
  'Tech / repair support',
  'Finance & credit options',
  'Returns / faulty product',
  'Online vs store mismatch',
  'Store experience (queue, layout, parking)',
  'Other',
]

export const POSITIVE_DRIVERS = [
  'Great colleague help',
  'Good price / deal',
  'Had it in stock',
  'Fast checkout',
  'Great demo / try before buy',
  'Good trade-in offer',
  'Knowledgeable advice',
  'Other',
]

export const INTENT_STAGES = [
  'Just browsing',
  'Researching',
  'Comparing prices',
  'Ready to buy',
  'Came to collect',
  'Support / returns',
]

export const OUTCOMES = [
  'Bought in store',
  'Bought online now',
  'Ordered for delivery',
  'Still deciding',
  'Left without buying',
  'Went to a competitor',
  'Support only',
]

// Seeded feedback so the rollups read well on load — a strongly positive picture
// across the estate, with a few neutral "areas to watch" (delivery, setup, finance).
export const SEED_FEEDBACK: CustomerFeedback[] = [
  { id: 'fb-seed-1', storeId: 's-214', capturedByUserId: 'u-col-214', capturedAt: fromNow(-25), sentiment: 'positive', department: 'Gaming', skus: ['GM-CONSOLE-BUNDLE'], issues: ['Great colleague help', 'Had it in stock'], intent: 'Ready to buy', outcome: 'Bought in store', ageBand: '25–34', notes: 'Loved the PS5 bundle demo — added a second controller.', source: 'In-store' },
  { id: 'fb-seed-2', storeId: 's-214', capturedByUserId: 'u-col-214', capturedAt: fromNow(-70), sentiment: 'positive', department: 'Computing', skus: ['CM-LAPTOP-STUDENT'], issues: ['Good price / deal', 'Knowledgeable advice'], intent: 'Ready to buy', outcome: 'Bought in store', ageBand: '18–24', notes: 'Matched the online price on the Surface and gave great advice — bought it.', source: 'In-store' },
  { id: 'fb-seed-3', storeId: 's-214', capturedByUserId: 'u-col-214', capturedAt: fromNow(-140), sentiment: 'positive', department: 'TV & Audio', skus: ['TV-OLED-65'], issues: ['Great demo / try before buy'], intent: 'Ready to buy', outcome: 'Ordered for delivery', ageBand: '45–54', notes: 'The 65" big-match demo sold it — arranged delivery before the weekend.', source: 'Qualtrics' },
  { id: 'fb-seed-4', storeId: 's-301', capturedByUserId: 'u-sm-301', capturedAt: fromNow(-30), sentiment: 'positive', department: 'Gaming', skus: ['GM-CONSOLE-BUNDLE'], issues: ['Had it in stock', 'Fast checkout'], intent: 'Ready to buy', outcome: 'Bought in store', ageBand: '25–34', notes: 'Grabbed the console bundle — quick and easy.', source: 'Trustpilot' },
  { id: 'fb-seed-5', storeId: 's-309', capturedByUserId: 'u-sm-309', capturedAt: fromNow(-45), sentiment: 'neutral', department: 'Large Appliances', skus: ['LA-AIRCON'], issues: ['Delivery lead time'], intent: 'Ready to buy', outcome: 'Ordered for delivery', ageBand: '35–44', notes: 'Portable AC ordered for home delivery in the heatwave.', source: 'Google' },
  { id: 'fb-seed-6', storeId: 's-317', capturedByUserId: 'u-sm-317', capturedAt: fromNow(-60), sentiment: 'positive', department: 'Large Appliances', skus: ['LA-AIRCON'], issues: ['Knowledgeable advice', 'Had it in stock'], intent: 'Ready to buy', outcome: 'Bought in store', ageBand: '55–64', notes: 'Great advice on cooling — took a unit home the same day.', source: 'Qualtrics' },
  { id: 'fb-seed-7', storeId: 's-301', capturedByUserId: 'u-sm-301', capturedAt: fromNow(-90), sentiment: 'positive', department: 'Mobile & Wearables', skus: ['MB-PHONE-PRO'], issues: ['Good trade-in offer', 'Knowledgeable advice'], intent: 'Ready to buy', outcome: 'Bought in store', ageBand: '25–34', notes: 'Strong trade-in plus a Flexpay plan — walked out happy.', source: 'In-store' },
  { id: 'fb-seed-8', storeId: 's-204', capturedByUserId: 'u-sm-204', capturedAt: fromNow(-50), sentiment: 'positive', department: 'TV & Audio', skus: ['TV-OLED-65', 'TV-SOUNDBAR'], issues: ['Great demo / try before buy', 'Knowledgeable advice'], intent: 'Ready to buy', outcome: 'Bought in store', ageBand: '45–54', notes: 'Great big-match TV demo, added a soundbar.', source: 'Google' },
  { id: 'fb-seed-9', storeId: 's-118', capturedByUserId: 'u-sm-118', capturedAt: fromNow(-80), sentiment: 'positive', department: 'Computing', skus: ['CM-LAPTOP-CREATOR'], issues: ['Good price / deal', 'Great colleague help'], intent: 'Ready to buy', outcome: 'Bought in store', ageBand: '18–24', notes: 'Back-to-school laptop bundle, happy with the deal.', source: 'Trustpilot' },
  { id: 'fb-seed-10', storeId: 's-126', capturedByUserId: 'u-sm-126', capturedAt: fromNow(-110), sentiment: 'positive', department: 'TV & Audio', skus: ['TV-OLED-65'], issues: ['Great demo / try before buy', 'Knowledgeable advice'], intent: 'Ready to buy', outcome: 'Ordered for delivery', ageBand: '35–44', notes: '65" OLED demo won them over — arranged home delivery.', source: 'Qualtrics' },
  { id: 'fb-seed-11', storeId: 's-228', capturedByUserId: 'u-sm-228', capturedAt: fromNow(-100), sentiment: 'positive', department: 'Customer Service', skus: [], issues: ['Great colleague help', 'Fast checkout'], intent: 'Support / returns', outcome: 'Support only', ageBand: '65+', notes: 'Friendly, quick help at the service desk.', source: 'Google' },
  { id: 'fb-seed-12', storeId: 's-322', capturedByUserId: 'u-sm-322', capturedAt: fromNow(-75), sentiment: 'neutral', department: 'Smart Home', skus: ['SH-DOORBELL'], issues: ['Installation & setup support'], intent: 'Researching', outcome: 'Still deciding', ageBand: '35–44', notes: 'Wanted help installing the video doorbell.', source: 'In-store' },
  { id: 'fb-seed-13', storeId: 's-211', capturedByUserId: 'u-sm-211', capturedAt: fromNow(-65), sentiment: 'positive', department: 'Gaming', skus: ['GM-HANDHELD'], issues: ['Had it in stock', 'Fast checkout'], intent: 'Ready to buy', outcome: 'Bought in store', ageBand: 'Under 18', notes: 'Switch OLED birthday gift — quick and easy.', source: 'Trustpilot' },
  { id: 'fb-seed-14', storeId: 's-309', capturedByUserId: 'u-sm-309', capturedAt: fromNow(-120), sentiment: 'positive', department: 'Large Appliances', skus: ['LA-FAN-TOWER'], issues: ['Had it in stock', 'Good price / deal'], intent: 'Ready to buy', outcome: 'Bought in store', ageBand: '45–54', notes: 'Picked up a tower fan for the hot spell — good price.', source: 'In-store' },
  { id: 'fb-seed-15', storeId: 's-214', capturedByUserId: 'u-col-214', capturedAt: fromNow(-200), sentiment: 'neutral', department: 'Mobile & Wearables', skus: ['MB-PHONE-PRO'], issues: ['Finance & credit options'], intent: 'Researching', outcome: 'Still deciding', ageBand: '25–34', notes: 'Interested in a trade-in plus monthly credit.', source: 'In-store' },
  { id: 'fb-seed-16', storeId: 's-309', capturedByUserId: 'u-sm-309', capturedAt: fromNow(-150), sentiment: 'positive', department: 'Large Appliances', skus: ['LA-AIRCON'], issues: ['Had it in stock', 'Knowledgeable advice'], intent: 'Ready to buy', outcome: 'Bought in store', ageBand: '45–54', notes: 'AC in stock with great advice — bought it on the spot.', source: 'Google' },
]
