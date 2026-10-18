'use client'

import { useEffect, useRef, useState } from 'react'

/** Следующая суббота 10:00 по Ташкенту (UTC+5, без перехода на летнее время). */
function nextDrop(now: number) {
  const tz = 5 * 3600e3
  const local = new Date(now + tz)
  const day = local.getUTCDay()
  let add = (6 - day + 7) % 7
  const target = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + add, 10) - tz
  if (target <= now) add = 7
  return Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + add, 10) - tz
}

export function Countdown({ labels }: { labels: { d: string; h: string; m: string; s: string; when: string } }) {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setLeft(nextDrop(Date.now()) - Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  const parts = left === null ? null : [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60]
  const names = [labels.d, labels.h, labels.m, labels.s]
  return (
    <div className="sole-timer" aria-label={labels.when}>
      <ol>
        {names.map((n, i) => (
          <li key={n}>
            <b suppressHydrationWarning>{parts ? String(parts[i]).padStart(2, '0') : '--'}</b>
            <small>{n}</small>
          </li>
        ))}
      </ol>
      <p>{labels.when}</p>
    </div>
  )
}

/** Пара следует за курсором: лёгкий наклон и парение, как на витрине. */
export function Tilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches || document.documentElement.classList.contains('reduce-motion')) return
    const el = ref.current!
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0
    const loop = () => {
      cx += (x - cx) * 0.08
      cy += (y - cy) * 0.08
      el.style.transform = `translate3d(${cx * 18}px, ${cy * 12}px, 0) rotate(${-8 + cx * 6}deg)`
      raf = requestAnimationFrame(loop)
    }
    const move = (e: PointerEvent) => {
      x = e.clientX / window.innerWidth - 0.5
      y = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [])
  return (
    <div className="sole-tilt">
      <div ref={ref} className="sole-tilt__inner">
        {children}
      </div>
    </div>
  )
}
