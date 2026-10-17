'use client'

import { useEffect, useRef } from 'react'

/** Шапка ателье: после прокрутки сжимается в тонкую полосу с линейкой. */
export function PaperHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-compact', window.scrollY > 60)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="at-header">
      {children}
    </header>
  )
}

/** Лента десертов: едет сама, колесо и палец двигают её вручную. */
export function Ribbon({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let paused = false
    let visible = false
    const loop = () => {
      if (!paused && visible) {
        el.scrollLeft += 0.6
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) el.scrollLeft = 0
      }
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)
    const stop = () => (paused = true)
    const go = () => (paused = false)
    el.addEventListener('pointerenter', stop)
    el.addEventListener('pointerleave', go)
    el.addEventListener('touchstart', stop, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointerenter', stop)
      el.removeEventListener('pointerleave', go)
      el.removeEventListener('touchstart', stop)
    }
  }, [])
  return (
    <div ref={ref} className="at-ribbon" data-lenis-prevent-horizontal="">
      {children}
    </div>
  )
}
