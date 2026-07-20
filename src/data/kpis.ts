import type { StoreKpi } from '@/types'

// Explicit per-store KPIs so the league table, estate-health score and the
// "impact since morning" deltas all read intentionally during the demo.
// `morning` is the start-of-day snapshot; live values reflect the trading day.
export const STORE_KPIS: StoreKpi[] = [
  // North
  { storeId: 's-214', salesVsTargetPct: 96, conversionPct: 23, attachRatePct: 31, carePlanAttachPct: 18, oosRatePct: 6, compliancePct: 82, csat: 88, salesTodayGBP: 98400, onlineSharePct: 22, grossMarginPct: 16, morning: { compliancePct: 78, attachRatePct: 29, conversionPct: 22 } },
  { storeId: 's-118', salesVsTargetPct: 104, conversionPct: 27, attachRatePct: 38, carePlanAttachPct: 24, oosRatePct: 4, compliancePct: 91, csat: 90, salesTodayGBP: 112600, onlineSharePct: 26, grossMarginPct: 18, morning: { compliancePct: 90, attachRatePct: 37, conversionPct: 26 } },
  { storeId: 's-126', salesVsTargetPct: 84, conversionPct: 19, attachRatePct: 26, carePlanAttachPct: 13, oosRatePct: 11, compliancePct: 69, csat: 81, salesTodayGBP: 61300, onlineSharePct: 19, grossMarginPct: 13, morning: { compliancePct: 68, attachRatePct: 26, conversionPct: 19 } },
  { storeId: 's-133', salesVsTargetPct: 92, conversionPct: 22, attachRatePct: 30, carePlanAttachPct: 16, oosRatePct: 7, compliancePct: 79, csat: 85, salesTodayGBP: 74800, onlineSharePct: 21, grossMarginPct: 15, morning: { compliancePct: 79, attachRatePct: 30, conversionPct: 22 } },
  // Midlands
  { storeId: 's-204', salesVsTargetPct: 108, conversionPct: 29, attachRatePct: 41, carePlanAttachPct: 27, oosRatePct: 3, compliancePct: 94, csat: 92, salesTodayGBP: 124900, onlineSharePct: 28, grossMarginPct: 19, morning: { compliancePct: 93, attachRatePct: 40, conversionPct: 28 } },
  { storeId: 's-211', salesVsTargetPct: 99, conversionPct: 24, attachRatePct: 33, carePlanAttachPct: 19, oosRatePct: 6, compliancePct: 86, csat: 87, salesTodayGBP: 88200, onlineSharePct: 23, grossMarginPct: 16, morning: { compliancePct: 85, attachRatePct: 33, conversionPct: 24 } },
  { storeId: 's-219', salesVsTargetPct: 88, conversionPct: 20, attachRatePct: 28, carePlanAttachPct: 14, oosRatePct: 9, compliancePct: 74, csat: 82, salesTodayGBP: 66500, onlineSharePct: 20, grossMarginPct: 14, morning: { compliancePct: 74, attachRatePct: 28, conversionPct: 20 } },
  { storeId: 's-228', salesVsTargetPct: 81, conversionPct: 18, attachRatePct: 24, carePlanAttachPct: 12, oosRatePct: 12, compliancePct: 66, csat: 78, salesTodayGBP: 48700, onlineSharePct: 17, grossMarginPct: 12, morning: { compliancePct: 66, attachRatePct: 24, conversionPct: 18 } },
  // South
  { storeId: 's-301', salesVsTargetPct: 90, conversionPct: 21, attachRatePct: 29, carePlanAttachPct: 15, oosRatePct: 8, compliancePct: 76, csat: 84, salesTodayGBP: 79400, onlineSharePct: 24, grossMarginPct: 15, morning: { compliancePct: 76, attachRatePct: 29, conversionPct: 21 } },
  { storeId: 's-309', salesVsTargetPct: 86, conversionPct: 20, attachRatePct: 27, carePlanAttachPct: 14, oosRatePct: 10, compliancePct: 72, csat: 80, salesTodayGBP: 63900, onlineSharePct: 18, grossMarginPct: 14, morning: { compliancePct: 72, attachRatePct: 27, conversionPct: 20 } },
  { storeId: 's-317', salesVsTargetPct: 101, conversionPct: 26, attachRatePct: 36, carePlanAttachPct: 22, oosRatePct: 5, compliancePct: 89, csat: 89, salesTodayGBP: 103300, onlineSharePct: 27, grossMarginPct: 18, morning: { compliancePct: 88, attachRatePct: 36, conversionPct: 26 } },
  { storeId: 's-322', salesVsTargetPct: 95, conversionPct: 23, attachRatePct: 32, carePlanAttachPct: 18, oosRatePct: 7, compliancePct: 83, csat: 86, salesTodayGBP: 91600, onlineSharePct: 22, grossMarginPct: 16, morning: { compliancePct: 83, attachRatePct: 32, conversionPct: 23 } },
]

export const KPI_BY_STORE = Object.fromEntries(STORE_KPIS.map((k) => [k.storeId, k])) as Record<
  string,
  StoreKpi
>
