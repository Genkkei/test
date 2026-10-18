'use client'

import { useEffect, useRef, useState } from 'react'

/** Чашка заполняется по мере прокрутки секции «Как варим»: доля пишется в --drip-fill. */
export function PourCup({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(1)
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion')) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const v = (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.2)
        setP(Math.max(0, Math.min(1, v)))
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
    <div ref={ref} className="drip-pour" style={{ ['--drip-fill' as string]: String(p) }}>
      {children}
    </div>
  )
}
