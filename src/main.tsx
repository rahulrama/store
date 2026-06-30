import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { toast } from 'sonner'
import './index.css'
import App from './App.tsx'
import { BrandProvider } from '@/branding/BrandProvider'

// Service worker: offline-first, auto-update with a gentle reload prompt.
const updateSW = registerSW({
  onNeedRefresh() {
    toast('Update available', {
      description: 'A new version is ready to install.',
      action: { label: 'Reload', onClick: () => updateSW(true) },
      duration: 10000,
    })
  },
  onOfflineReady() {
    toast.success('Ready to work offline', {
      description: 'The app is cached on this device.',
    })
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrandProvider>
      <App />
    </BrandProvider>
  </StrictMode>,
)
