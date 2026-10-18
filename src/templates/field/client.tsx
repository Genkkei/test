'use client'

import { useEffect, useRef } from 'react'

/** Маршрут доставки: доля пройденного пути (--p) считается по положению блока на экране. */
export function Route({ children, count }: { children: React.ReactNode; count: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const vh = window.innerHeight
        const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.2)))
        el.style.setProperty('--p', p.toFixed(3))
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
  return (
    <div ref={ref} className="field-route" style={{ ['--n' as string]: count }}>
      <div className="field-route__line" aria-hidden="true">
        <span className="field-route__done" />
        <svg className="field-route__van" viewBox="0 0 64 36">
          <rect x="2" y="6" width="38" height="22" rx="3" fill="currentColor" />
          <path d="M40 12 h12 l8 9 v7 h-20 z" fill="currentColor" />
          <rect x="44" y="14" width="8" height="6" rx="1" fill="#fff" opacity=".8" />
          <circle cx="14" cy="30" r="5" fill="#1f2b17" />
          <circle cx="50" cy="30" r="5" fill="#1f2b17" />
          <circle cx="14" cy="30" r="2" fill="#fff" />
          <circle cx="50" cy="30" r="2" fill="#fff" />
        </svg>
      </div>
      {children}
    </div>
  )
}
