'use client'

import { useEffect, useRef } from 'react'

/** Сварной шов: доля прокрутки раздела → --forge-seam (0..1). Шов «проваривается» вниз вслед за читателем. */
export function Seam({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion')) {
      el.style.setProperty('--forge-seam', '1')
      return
    }
    let raf = 0
    const on = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const k = (window.innerHeight * 0.62 - r.top) / Math.max(1, r.height)
      el.style.setProperty('--forge-seam', String(Math.min(1, Math.max(0, k))))
    }
    const ask = () => {
      if (!raf) raf = requestAnimationFrame(on)
    }
    on()
    window.addEventListener('scroll', ask, { passive: true })
    window.addEventListener('resize', ask)
    return () => {
      window.removeEventListener('scroll', ask)
      window.removeEventListener('resize', ask)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
