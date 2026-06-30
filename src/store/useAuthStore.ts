import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Demo-only credentials. This is a 100% synthetic, backend-free demo — there is
// no real authentication here, just a gate so the experience opens on a login screen.
const DEMO_USERNAME = 'admin'
const DEMO_PASSWORD = 'demostore'

interface AuthState {
  isAuthenticated: boolean
  /** Returns true on success, false on bad credentials. */
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (username, password) => {
        const ok =
          username.trim().toLowerCase() === DEMO_USERNAME && password === DEMO_PASSWORD
        if (ok) set({ isAuthenticated: true })
        return ok
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'wattsrus-auth',
      version: 1,
      partialize: (s) => ({ isAuthenticated: s.isAuthenticated }),
    },
  ),
)
