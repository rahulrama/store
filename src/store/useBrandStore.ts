import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'
import type { Role } from '@/types'
import { BUILT_IN_BRANDS, DEFAULT_BRAND_ID, type Brand } from '@/data/brands'

export type AutoLaunch = 'off' | 'coached' | 'autoplay'

interface BrandState {
  // Branding
  customBrands: Brand[]
  activeBrandId: string

  // Appearance
  deviceFrame: boolean
  dark: boolean
  showHelp: boolean
  showDemoBadges: boolean

  // Demo / onboarding policy
  autoLaunch: AutoLaunch
  defaultPersona: Role
  tourSeen: boolean

  // Derived
  brands: () => Brand[]
  activeBrand: () => Brand

  // Branding actions
  setActiveBrand: (id: string) => void
  addBrand: (b: Omit<Brand, 'id' | 'builtIn'>) => string
  updateBrand: (id: string, patch: Partial<Omit<Brand, 'id' | 'builtIn'>>) => void
  deleteBrand: (id: string) => void
  importBrands: (brands: Brand[]) => void
  resetBrandsToDefault: () => void

  // Settings actions
  setDeviceFrame: (v: boolean) => void
  setDark: (v: boolean) => void
  setShowHelp: (v: boolean) => void
  setShowDemoBadges: (v: boolean) => void
  setAutoLaunch: (v: AutoLaunch) => void
  setDefaultPersona: (r: Role) => void
  markTourSeen: () => void
  resetTourSeen: () => void
}

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'brand'
  )
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set, get) => ({
      customBrands: [],
      activeBrandId: DEFAULT_BRAND_ID,
      deviceFrame: false,
      dark: false,
      showHelp: true,
      showDemoBadges: false,
      autoLaunch: 'off',
      defaultPersona: 'Store',
      tourSeen: false,

      brands: () => [...BUILT_IN_BRANDS, ...get().customBrands],
      activeBrand: () => {
        const all = get().brands()
        return all.find((b) => b.id === get().activeBrandId) ?? BUILT_IN_BRANDS[0]
      },

      setActiveBrand: (id) => set({ activeBrandId: id }),

      addBrand: (b) => {
        const base = slug(b.name)
        const existing = new Set(get().brands().map((x) => x.id))
        let id = base
        let i = 2
        while (existing.has(id)) id = `${base}-${i++}`
        const brand: Brand = { ...b, id, builtIn: false }
        set((s) => ({ customBrands: [...s.customBrands, brand], activeBrandId: id }))
        return id
      },

      updateBrand: (id, patch) =>
        set((s) => ({
          customBrands: s.customBrands.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),

      deleteBrand: (id) =>
        set((s) => {
          const target = s.customBrands.find((b) => b.id === id)
          if (!target) return s // built-ins are not deletable
          const customBrands = s.customBrands.filter((b) => b.id !== id)
          const activeBrandId = s.activeBrandId === id ? DEFAULT_BRAND_ID : s.activeBrandId
          return { customBrands, activeBrandId }
        }),

      importBrands: (incoming) =>
        set((s) => {
          const existing = new Set(get().brands().map((b) => b.id))
          const toAdd: Brand[] = []
          for (const b of incoming) {
            if (!b?.name || !b?.accent) continue
            let id = b.id && !existing.has(b.id) ? b.id : slug(b.name)
            let i = 2
            while (existing.has(id)) id = `${slug(b.name)}-${i++}`
            existing.add(id)
            toAdd.push({ id, name: b.name, tagline: b.tagline ?? 'Store Ops Copilot', accent: b.accent, logoDataUrl: b.logoDataUrl, builtIn: false })
          }
          return { customBrands: [...s.customBrands, ...toAdd] }
        }),

      resetBrandsToDefault: () => set({ activeBrandId: DEFAULT_BRAND_ID, dark: false, deviceFrame: false }),

      setDeviceFrame: (v) => set({ deviceFrame: v }),
      setDark: (v) => set({ dark: v }),
      setShowHelp: (v) => set({ showHelp: v }),
      setShowDemoBadges: (v) => set({ showDemoBadges: v }),
      setAutoLaunch: (v) => set({ autoLaunch: v }),
      setDefaultPersona: (r) => set({ defaultPersona: r }),
      markTourSeen: () => set({ tourSeen: true }),
      resetTourSeen: () => set({ tourSeen: false }),
    }),
    {
      name: 'wattsrus-brand',
      version: 2,
      partialize: (s) => ({
        customBrands: s.customBrands,
        activeBrandId: s.activeBrandId,
        deviceFrame: s.deviceFrame,
        dark: s.dark,
        showHelp: s.showHelp,
        showDemoBadges: s.showDemoBadges,
        autoLaunch: s.autoLaunch,
        defaultPersona: s.defaultPersona,
        tourSeen: s.tourSeen,
      }),
    },
  ),
)

// ── Stable derived hooks ─────────────────────────────────────────────────────
// Select primitives only, then memoize derived arrays/objects so React's
// useSyncExternalStore doesn't see a new snapshot every render.

/** All brands (built-in + custom), referentially stable per custom-list change. */
export function useBrands(): Brand[] {
  const custom = useBrandStore((s) => s.customBrands)
  return useMemo(() => [...BUILT_IN_BRANDS, ...custom], [custom])
}

/** The active brand, stable unless the id or custom list changes. */
export function useActiveBrand(): Brand {
  const custom = useBrandStore((s) => s.customBrands)
  const activeId = useBrandStore((s) => s.activeBrandId)
  return useMemo(() => {
    const all = [...BUILT_IN_BRANDS, ...custom]
    return all.find((b) => b.id === activeId) ?? BUILT_IN_BRANDS[0]
  }, [custom, activeId])
}
