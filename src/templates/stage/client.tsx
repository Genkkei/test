'use client'

import { useEffect, useRef } from 'react'

/** Прожектор: пятно света на сцене идёт за курсором (CSS-переменные --x/--y на сцене). */
export function Spotlight() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current!
    const host = el.parentElement!
    if (!window.matchMedia('(hover: hover)').matches || document.documentElement.classList.contains('reduce-motion')) return
    let x = 50, y = 46, cx = 50, cy = 46, raf = 0
    const move = (e: PointerEvent) => {
      const b = host.getBoundingClientRect()
      x = ((e.clientX - b.left) / b.width) * 100
      y = ((e.clientY - b.top) / b.height) * 100
    }
    const loop = () => {
      cx += (x - cx) * 0.06
      cy += (y - cy) * 0.06
      el.style.setProperty('--x', `${cx}%`)
      el.style.setProperty('--y', `${cy}%`)
      raf = requestAnimationFrame(loop)
    }
    host.addEventListener('pointermove', move)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener('pointermove', move)
    }
  }, [])
  return <span ref={ref} className="stage-spot" aria-hidden="true" />
}
