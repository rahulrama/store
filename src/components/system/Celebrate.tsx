import { useEffect, useState } from 'react'

interface Piece {
  id: number
  left: number
  color: string
  delay: number
  duration: number
  size: number
}

const COLORS = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--chart-4)', 'var(--info)']
let seq = 0

/** Listens for `wattsrus:celebrate` and rains a short burst of confetti. */
export function Celebrate() {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    function burst() {
      const batch: Piece[] = Array.from({ length: 36 }, () => ({
        id: seq++,
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.25,
        duration: 1.1 + Math.random() * 0.8,
        size: 6 + Math.random() * 6,
      }))
      setPieces((p) => [...p, ...batch])
      const ids = new Set(batch.map((b) => b.id))
      window.setTimeout(() => setPieces((p) => p.filter((x) => !ids.has(x.id))), 2200)
    }
    window.addEventListener('wattsrus:celebrate', burst)
    return () => window.removeEventListener('wattsrus:celebrate', burst)
  }, [])

  if (pieces.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
