'use client'

import { useEffect } from 'react'

/*
 * Движение «Вафельницы». Первый экран (буквы, прожим ячеек, пар, наклейки) — CSS с первой отрисовки.
 * Здесь: появление при прокрутке (data-w → .is-in, один раз), шкала прожарки в доставке (--p от прокрутки)
 * и видео, которое играет только пока первый экран виден. Без скрипта всё видно: прячет только html.motion.
 */
export function WaffleMotion() {
  useEffect(() => {
    const offs: (() => void)[] = []
    const els = document.querySelectorAll<HTMLElement>('.tpl-waffle [data-w]')
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (!e.isIntersecting) return
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }),
        { rootMargin: '0px 0px -12% 0px' },
      )
      els.forEach((el) => io.observe(el))
      offs.push(() => io.disconnect())
    } else els.forEach((el) => el.classList.add('is-in'))

    const proc = document.querySelector<HTMLElement>('[data-waffle-process]')
    let raf = 0
    const frame = () => {
      raf = 0
      if (!proc) return
      const r = proc.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (r.height * 0.85)))
      proc.style.setProperty('--p', p.toFixed(4))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    frame()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    offs.push(() => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', on)
      removeEventListener('resize', on)
    })

    const vid = document.querySelector<HTMLVideoElement>('[data-waffle-hero] video')
    if (vid && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? vid.play().catch(() => {}) : vid.pause()), { threshold: 0.05 })
      io.observe(vid)
      offs.push(() => io.disconnect())
    }
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
