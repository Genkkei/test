'use client'

import { useEffect, useRef } from 'react'

/** Наклейки первого экрана: плавают сами, их можно схватить и переставить (мышь и палец). */
export function Stickers({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const box = ref.current!
    const items = Array.from(box.querySelectorAll<HTMLElement>('.cr-sticker'))
    const cleanups = items.map((el) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, drag = false
      const down = (e: PointerEvent) => {
        drag = true
        el.setPointerCapture(e.pointerId)
        sx = e.clientX - ox; sy = e.clientY - oy
        el.classList.add('is-held')
      }
      const move = (e: PointerEvent) => {
        if (!drag) return
        ox = e.clientX - sx; oy = e.clientY - sy
        el.style.translate = `${ox}px ${oy}px`
      }
      const up = () => {
        drag = false
        el.classList.remove('is-held')
      }
      el.addEventListener('pointerdown', down)
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointercancel', up)
      return () => {
        el.removeEventListener('pointerdown', down)
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerup', up)
        el.removeEventListener('pointercancel', up)
      }
    })
    return () => cleanups.forEach((f) => f())
  }, [])
  return (
    <div ref={ref} className="cr-stickers">
      {children}
    </div>
  )
}

/** Тропинка шагов: пунктир прорисовывается по мере прокрутки. */
export function Trail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const k = Math.min(1, Math.max(0, (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.3)))
        el.style.setProperty('--k', k.toFixed(3))
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <div ref={ref} className="cr-trail">
      <svg className="cr-trail__path" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 60 C 120 0, 220 120, 340 60 S 560 0, 680 60 S 880 120, 1000 60" pathLength={1} />
      </svg>
      {children}
    </div>
  )
}
