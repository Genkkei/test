'use client'

import { useEffect, useRef } from 'react'

/** Доля прокрутки блока (--p, 0..1): по ней заполняется шкала плана. */
export function Progress({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const vh = window.innerHeight
        const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / Math.max(1, r.height)))
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
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}

/** Подсветка позвонков: волна идёт сверху вниз и следует за курсором по высоте. */
export function SpineLight({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    const reduce = document.documentElement.classList.contains('reduce-motion')
    let raf = 0
    let target = -1
    let cur = 0
    const t0 = performance.now()
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const y = (e.clientY - r.top) / r.height
      target = y >= 0 && y <= 1 ? y : -1
    }
    const loop = (now: number) => {
      const auto = ((now - t0) / 4200) % 1.3
      const want = target >= 0 ? target : auto
      cur += (want - cur) * 0.08
      el.style.setProperty('--w', cur.toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    if (!reduce) {
      raf = requestAnimationFrame(loop)
      window.addEventListener('pointermove', move, { passive: true })
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [])
  return (
    <div ref={ref} className="spine-light" style={{ ['--w' as string]: 0.4 }}>
      {children}
    </div>
  )
}
