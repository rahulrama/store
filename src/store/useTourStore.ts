import { create } from 'zustand'
import { useAppStore } from '@/store/useAppStore'

export type TourMode = 'coached' | 'autoplay'

interface TourState {
  active: boolean
  mode: TourMode
  index: number
  playing: boolean
  start: (mode: TourMode, opts?: { reset?: boolean }) => void
  stop: () => void
  next: () => void
  prev: () => void
  goTo: (i: number) => void
  setPlaying: (p: boolean) => void
  togglePlaying: () => void
}

export const useTourStore = create<TourState>((set) => ({
  active: false,
  mode: 'coached',
  index: 0,
  playing: false,

  start: (mode, opts = { reset: true }) => {
    // Reset the demo so the scripted run is always deterministic.
    if (opts.reset !== false) useAppStore.getState().resetDemo()
    set({ active: true, mode, index: 0, playing: mode === 'autoplay' })
  },
  stop: () => set({ active: false, playing: false }),
  next: () => set((s) => ({ index: s.index + 1 })),
  prev: () => set((s) => ({ index: Math.max(0, s.index - 1) })),
  goTo: (i) => set({ index: Math.max(0, i) }),
  setPlaying: (p) => set({ playing: p }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
}))
