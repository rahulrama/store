import { useEffect, useRef, useState } from 'react'

/** Eased count-up to a target number; re-animates when the target changes. */
export function useCountUp(target: number, duration = 750): number {
  const [val, setVal] = useState(target)
  const prev = useRef(target)

  useEffect(() => {
    const from = prev.current
    const to = target
    prev.current = target
    if (from === to) {
      setVal(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(from + (to - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return val
}

export function CountUp({
  value,
  format,
}: {
  value: number
  format?: (n: number) => string
}) {
  const v = useCountUp(value)
  return <>{format ? format(v) : Math.round(v).toLocaleString('en-GB')}</>
}
