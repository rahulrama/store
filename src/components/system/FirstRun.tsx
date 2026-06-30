import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrandStore } from '@/store/useBrandStore'
import { useTourStore } from '@/store/useTourStore'
import { useAppStore } from '@/store/useAppStore'
import type { Role } from '@/types'

const ROLE_HOME: Record<Role, string> = { HQ: '/hq', Regional: '/region', Store: '/store' }

/** Runs once on first ever open: applies the default persona and the auto-launch policy. */
export function FirstRun() {
  const navigate = useNavigate()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const { tourSeen, autoLaunch, defaultPersona, markTourSeen } = useBrandStore.getState()
    if (tourSeen) return
    markTourSeen()

    if (autoLaunch !== 'off') {
      // small delay so the shell is mounted before the tour drives navigation
      window.setTimeout(() => useTourStore.getState().start(autoLaunch), 400)
    } else {
      useAppStore.getState().setPersona(defaultPersona)
      navigate(ROLE_HOME[defaultPersona])
    }
  }, [navigate])

  return null
}
