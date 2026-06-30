import { useEffect, type ReactNode } from 'react'
import { useBrandStore, useActiveBrand } from '@/store/useBrandStore'
import { applyBrand, applyDark } from '@/branding/applyBrand'

/** Applies the active brand + dark mode to the document whenever they change. */
export function BrandProvider({ children }: { children: ReactNode }) {
  const brand = useActiveBrand()
  const dark = useBrandStore((s) => s.dark)

  useEffect(() => {
    applyBrand(brand)
  }, [brand])

  useEffect(() => {
    applyDark(dark)
  }, [dark])

  return <>{children}</>
}
