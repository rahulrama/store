import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTourStore } from '@/store/useTourStore'
import { useAppStore } from '@/store/useAppStore'
import { TOUR_STEPS } from '@/tour/steps'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Play, Pause, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export function TourOverlay() {
  const navigate = useNavigate()
  const active = useTourStore((s) => s.active)
  const mode = useTourStore((s) => s.mode)
  const index = useTourStore((s) => s.index)
  const playing = useTourStore((s) => s.playing)
  const next = useTourStore((s) => s.next)
  const prev = useTourStore((s) => s.prev)
  const stop = useTourStore((s) => s.stop)
  const togglePlaying = useTourStore((s) => s.togglePlaying)

  const [rect, setRect] = useState<Rect | null>(null)
  const stepRef = useRef(index)
  stepRef.current = index

  const step = active ? TOUR_STEPS[index] : undefined
  const isLast = index === TOUR_STEPS.length - 1

  // Apply step side effects: persona → route → action, then locate the target.
  useEffect(() => {
    if (!active || !step) return
    let cancelled = false

    if (step.persona) useAppStore.getState().setPersona(step.persona)
    if (step.route) navigate(step.route)
    step.action?.()

    setRect(null)
    const start = performance.now()
    function locate() {
      if (cancelled || stepRef.current !== index) return
      if (!step!.target) {
        setRect(null)
        return
      }
      const el = document.querySelector<HTMLElement>(`[data-tour="${step!.target}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // measure after the scroll settles
        window.setTimeout(() => {
          if (cancelled || stepRef.current !== index) return
          const r = el.getBoundingClientRect()
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
        }, 260)
      } else if (performance.now() - start < 2000) {
        window.setTimeout(locate, 80)
      }
    }
    // let the route/persona render first
    const t = window.setTimeout(locate, 120)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, index])

  // Keep the spotlight aligned on scroll/resize.
  useEffect(() => {
    if (!active || !step?.target) return
    function reposition() {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step!.target}"]`)
      if (el) {
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      }
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [active, step?.target])

  // Autoplay timer.
  useEffect(() => {
    if (!active || !playing || !step) return
    const dwell = step.advanceMs ?? 5000
    const t = window.setTimeout(() => {
      if (isLast) stop()
      else next()
    }, dwell)
    return () => window.clearTimeout(t)
  }, [active, playing, index, step, isLast, next, stop])

  // Keyboard controls.
  useEffect(() => {
    if (!active) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') stop()
      else if (e.key === 'ArrowRight') {
        if (isLast) stop()
        else next()
      } else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, isLast, next, prev, stop])

  if (!active || !step) return null

  const pad = 8
  const spotlight: Rect | null = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : null

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {/* Dim + spotlight */}
      {spotlight ? (
        <div
          className="absolute rounded-xl ring-2 ring-primary/70 transition-all duration-300"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.55)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(2,6,23,0.55)]" />
      )}

      {/* Control card (fixed bottom-centre) */}
      <div className="pointer-events-auto fixed inset-x-0 bottom-0 flex justify-center p-4">
        <div className="w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {mode === 'autoplay' ? 'Auto demo' : 'Guided tour'} · {index + 1} of {TOUR_STEPS.length}
                </p>
                <h3 className="text-sm font-semibold leading-tight">{step.title}</h3>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={stop}>
              <X className="size-4" />
            </Button>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>

          {/* Progress */}
          <div className="mt-3 flex items-center gap-1">
            {TOUR_STEPS.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i <= index ? 'bg-primary' : 'bg-muted',
                )}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={stop}>
              Exit
            </Button>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="gap-1" onClick={prev} disabled={index === 0}>
                <ChevronLeft className="size-4" /> Back
              </Button>
              <Button variant="outline" size="icon" className="size-9" onClick={togglePlaying} title={playing ? 'Pause' : 'Play'}>
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              </Button>
              <Button size="sm" className="gap-1" onClick={() => (isLast ? stop() : next())}>
                {isLast ? 'Finish' : 'Next'}
                {!isLast && <ChevronRight className="size-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
