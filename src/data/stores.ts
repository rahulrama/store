import type { Region, Store, User } from '@/types'

const ALL_DEPTS: Store['departments'] = [
  'TV & Audio',
  'Computing',
  'Gaming',
  'Mobile & Wearables',
  'Smart Home',
  'Large Appliances',
  'Customer Service',
]

const HIGH_ST_DEPTS: Store['departments'] = [
  'TV & Audio',
  'Computing',
  'Gaming',
  'Mobile & Wearables',
  'Customer Service',
]

export const REGIONS: Region[] = [
  { id: 'r-north', name: 'North', managerUserId: 'u-rm-north' },
  { id: 'r-midlands', name: 'Midlands', managerUserId: 'u-rm-midlands' },
  { id: 'r-south', name: 'South', managerUserId: 'u-rm-south' },
]

export const USERS: User[] = [
  {
    id: 'u-hq',
    name: 'Priya Shah',
    role: 'HQ',
    jobTitle: 'Central Retail Operations Director',
    initials: 'PS',
  },
  {
    id: 'u-rm-north',
    name: 'Daniel Okafor',
    role: 'Regional',
    jobTitle: 'Regional Manager — North',
    regionId: 'r-north',
    initials: 'DO',
  },
  {
    id: 'u-rm-midlands',
    name: 'Hannah Clarke',
    role: 'Regional',
    jobTitle: 'Regional Manager — Midlands',
    regionId: 'r-midlands',
    initials: 'HC',
  },
  {
    id: 'u-rm-south',
    name: 'Marcus Bennett',
    role: 'Regional',
    jobTitle: 'Regional Manager — South',
    regionId: 'r-south',
    initials: 'MB',
  },
  // Store managers
  { id: 'u-sm-214', name: 'Aisha Rahman', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-north', storeId: 's-214', initials: 'AR' },
  { id: 'u-sm-118', name: 'Tom Whitfield', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-north', storeId: 's-118', initials: 'TW' },
  { id: 'u-sm-126', name: 'Grace Liu', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-north', storeId: 's-126', initials: 'GL' },
  { id: 'u-sm-133', name: 'Ryan Patel', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-north', storeId: 's-133', initials: 'RP' },
  { id: 'u-sm-204', name: 'Sofia Romano', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-midlands', storeId: 's-204', initials: 'SR' },
  { id: 'u-sm-211', name: 'James Reid', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-midlands', storeId: 's-211', initials: 'JR' },
  { id: 'u-sm-219', name: 'Mei Chen', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-midlands', storeId: 's-219', initials: 'MC' },
  { id: 'u-sm-228', name: 'Olu Adeyemi', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-midlands', storeId: 's-228', initials: 'OA' },
  { id: 'u-sm-301', name: 'Charlotte Hughes', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-south', storeId: 's-301', initials: 'CH' },
  { id: 'u-sm-309', name: 'Daniel Foster', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-south', storeId: 's-309', initials: 'DF' },
  { id: 'u-sm-317', name: 'Nadia Khan', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-south', storeId: 's-317', initials: 'NK' },
  { id: 'u-sm-322', name: 'Ben Carter', role: 'Store', jobTitle: 'Store Manager', regionId: 'r-south', storeId: 's-322', initials: 'BC' },
]

export const STORES: Store[] = [
  // North
  { id: 's-214', code: '214', name: 'Manchester Arndale', town: 'Manchester', regionId: 'r-north', format: 'Superstore', managerUserId: 'u-sm-214', departments: ALL_DEPTS },
  { id: 's-118', code: '118', name: 'Leeds White Rose', town: 'Leeds', regionId: 'r-north', format: 'Retail Park', managerUserId: 'u-sm-118', departments: ALL_DEPTS },
  { id: 's-126', code: '126', name: 'Liverpool ONE', town: 'Liverpool', regionId: 'r-north', format: 'High Street', managerUserId: 'u-sm-126', departments: HIGH_ST_DEPTS },
  { id: 's-133', code: '133', name: 'Newcastle Eldon', town: 'Newcastle', regionId: 'r-north', format: 'High Street', managerUserId: 'u-sm-133', departments: HIGH_ST_DEPTS },
  // Midlands
  { id: 's-204', code: '204', name: 'Birmingham Bullring', town: 'Birmingham', regionId: 'r-midlands', format: 'Superstore', managerUserId: 'u-sm-204', departments: ALL_DEPTS },
  { id: 's-211', code: '211', name: 'Nottingham Victoria', town: 'Nottingham', regionId: 'r-midlands', format: 'Retail Park', managerUserId: 'u-sm-211', departments: ALL_DEPTS },
  { id: 's-219', code: '219', name: 'Leicester Highcross', town: 'Leicester', regionId: 'r-midlands', format: 'High Street', managerUserId: 'u-sm-219', departments: HIGH_ST_DEPTS },
  { id: 's-228', code: '228', name: 'Coventry Arena Park', town: 'Coventry', regionId: 'r-midlands', format: 'Outlet', managerUserId: 'u-sm-228', departments: HIGH_ST_DEPTS },
  // South
  { id: 's-301', code: '301', name: 'London Stratford', town: 'London', regionId: 'r-south', format: 'Superstore', managerUserId: 'u-sm-301', departments: ALL_DEPTS },
  { id: 's-309', code: '309', name: 'Reading Oracle', town: 'Reading', regionId: 'r-south', format: 'Retail Park', managerUserId: 'u-sm-309', departments: ALL_DEPTS },
  { id: 's-317', code: '317', name: 'Bristol Cabot', town: 'Bristol', regionId: 'r-south', format: 'High Street', managerUserId: 'u-sm-317', departments: HIGH_ST_DEPTS },
  { id: 's-322', code: '322', name: 'Brighton Marina', town: 'Brighton', regionId: 'r-south', format: 'Outlet', managerUserId: 'u-sm-322', departments: HIGH_ST_DEPTS },
]

export const STORE_BY_ID = Object.fromEntries(STORES.map((s) => [s.id, s])) as Record<string, Store>
export const REGION_BY_ID = Object.fromEntries(REGIONS.map((r) => [r.id, r])) as Record<string, Region>
export const USER_BY_ID = Object.fromEntries(USERS.map((u) => [u.id, u])) as Record<string, User>

/** Default identity used when switching to each persona. */
export const DEFAULT_PERSONA_USER: Record<User['role'], string> = {
  HQ: 'u-hq',
  Regional: 'u-rm-north',
  Store: 'u-sm-214',
}

export function storesInRegion(regionId: string): Store[] {
  return STORES.filter((s) => s.regionId === regionId)
}

export function managerOfStore(storeId: string): User | undefined {
  const store = STORE_BY_ID[storeId]
  return store ? USER_BY_ID[store.managerUserId] : undefined
}
