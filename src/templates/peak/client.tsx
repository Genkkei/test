'use client'

import { useEffect, useRef } from 'react'

/** Путь маршрута рисуется прокруткой: доля пройденного пишется в --p, точки загораются по очереди. */
export function Trail({ children, points }: { children: React.ReactNode; points: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const vh = window.innerHeight
        const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)))
        el.style.setProperty('--p', p.toFixed(3))
        el.querySelectorAll<HTMLElement>('[data-wp]').forEach((w, i) => w.classList.toggle('is-on', p >= (i + 0.3) / points))
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [points])
  return (
    <div ref={ref} className="peak-trail" style={{ ['--p' as string]: 1 }}>
      {children}
    </div>
  )
}

/** Высотомер: число набирается вместе с прокруткой первого экрана — будто поднимаешься. */
export function Altimeter({ base, label }: { base: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => {
      const k = Math.min(1, window.scrollY / Math.max(1, window.innerHeight))
      el.textContent = String(Math.round(base + k * 900)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [base])
  return (
    <p className="peak-alt" aria-hidden="true">
      <small>{label}</small>
      <span ref={ref}>{base}</span>
      <i>m</i>
    </p>
  )
}
