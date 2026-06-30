import { useEffect, useState } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    __wattsrusInstall?: { event: BeforeInstallPromptEvent | null; installed: boolean }
  }
}

export function isIOS(): boolean {
  const ua = navigator.userAgent
  const iOS = /iphone|ipad|ipod/i.test(ua)
  // iPadOS 13+ masquerades as desktop Safari — detect via touch points.
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return iOS || iPadOS
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari uses a non-standard navigator.standalone
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

/**
 * Platform-aware install state.
 * - Chromium: a deferred `beforeinstallprompt` event is available → real one-tap install.
 * - iOS Safari: no programmatic install exists → caller shows "Add to Home Screen" steps.
 * - Installed: hide the affordance entirely.
 */
export function useInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    () => window.__wattsrusInstall?.event ?? null,
  )
  const [installed, setInstalled] = useState(
    () => isStandalone() || !!window.__wattsrusInstall?.installed,
  )

  useEffect(() => {
    const onInstallable = () => setDeferred(window.__wattsrusInstall?.event ?? null)
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('wattsrus:installable', onInstallable)
    window.addEventListener('wattsrus:installed', onInstalled)
    const mq = window.matchMedia('(display-mode: standalone)')
    const onMode = () => setInstalled(isStandalone())
    mq.addEventListener?.('change', onMode)
    return () => {
      window.removeEventListener('wattsrus:installable', onInstallable)
      window.removeEventListener('wattsrus:installed', onInstalled)
      mq.removeEventListener?.('change', onMode)
    }
  }, [])

  async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferred) return 'unavailable'
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferred(null)
    if (window.__wattsrusInstall) window.__wattsrusInstall.event = null
    return outcome
  }

  return {
    installed,
    canPrompt: !!deferred,
    ios: isIOS(),
    promptInstall,
  }
}
