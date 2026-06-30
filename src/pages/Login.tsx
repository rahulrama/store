import { useState, type FormEvent } from 'react'
import { Lock, User } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useActiveBrand } from '@/store/useBrandStore'
import { BrandGlyph } from '@/components/brand/BrandMark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function Login() {
  const brand = useActiveBrand()
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!login(username, password)) setError(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandGlyph className="size-16 rounded-2xl" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{brand.name}</h1>
            <p className="text-sm text-muted-foreground">{brand.tagline}</p>
          </div>
        </div>

        {/* Sign-in card */}
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError(false)
                }}
                placeholder="Enter your username"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                placeholder="Enter your password"
                className="pl-9"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              Incorrect username or password.
            </p>
          )}

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Fictional retailer and products · for demonstration only · not affiliated with any real brand
        </p>
      </div>
    </div>
  )
}
