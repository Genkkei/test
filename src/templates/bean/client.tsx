'use client'

import { useEffect, useState } from 'react'

/** Таймер обжарки: идёт от 00:00 до 11:42 вместе с прорисовкой кривой (6 с) и замирает. */
export function RoastClock() {
  const END = 11 * 60 + 42
  const [t, setT] = useState(END)
  useEffect(() => {
    if (document.documentElement.classList.contains('reduce-motion')) return
    const t0 = performance.now() + 500
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / 6000))
      setT(Math.round(k * END))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [END])
  const mm = String(Math.floor(t / 60)).padStart(2, '0')
  const ss = String(t % 60).padStart(2, '0')
  return (
    <span className="bean-clock" aria-hidden="true">
      <i />
      {mm}:{ss}
    </span>
  )
}
