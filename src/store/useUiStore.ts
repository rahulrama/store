import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type VatMode = 'inc' | 'ex'

interface UiState {
  /** Whether money is shown VAT-inclusive (as a customer sees it) or ex-VAT (the finance view). */
  vatMode: VatMode
  setVatMode: (mode: VatMode) => void
  toggleVat: () => void
}

/** Small cross-cutting UI preferences that should persist across reloads. */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      vatMode: 'inc',
      setVatMode: (vatMode) => set({ vatMode }),
      toggleVat: () => set((s) => ({ vatMode: s.vatMode === 'inc' ? 'ex' : 'inc' })),
    }),
    { name: 'ui-prefs' },
  ),
)
