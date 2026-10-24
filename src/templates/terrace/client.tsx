'use client'

import { useEffect } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const OPEN = 9
const CLOSE = 19

/*
 * Солнечные часы «Сада». Солнце идёт по дуге от 9:00 (восток) через юг к 19:00 (запад). Тень — против
 * солнца, длиннее утром и вечером: сдвиг (--sx, --sy) на плане, высокие предметы (деревья, зонт) тянут её
 * дальше (--h в CSS). При входе солнце проходит от 9:00 до текущего времени Ташкента (вне часов работы —
 * до 17:00), прокрутка первого экрана ведёт его ещё на три часа к вечеру. Без скрипта — полдень.
 */
export function TerraceMotion() {
  useEffect(() => {
    const offs: (() => void)[] = []
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    document.querySelectorAll('.tpl-terrace [data-tr]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    const hero = document.querySelector<HTMLElement>('[data-terrace-hero]')
    const plan = document.querySelector<HTMLElement>('[data-terrace-plan]')
    const dial = document.querySelector<HTMLElement>('[data-terrace-dial]')
    const sun = dial?.querySelector<SVGCircleElement>('.terrace-dial__sun')
    const time = dial?.querySelector<HTMLElement>('[data-terrace-time]')
    if (!hero || !plan || !sun || !time) return () => offs.forEach((f) => f())

    const now = new Date(Date.now() + (new Date().getTimezoneOffset() + 300) * 60000)
    const h = now.getHours() + now.getMinutes() / 60
    const base = h >= OPEN && h <= CLOSE ? h : 17
    const paint = (hour: number) => {
      const t = Math.min(1, Math.max(0, (hour - OPEN) / (CLOSE - OPEN)))
      const a = Math.PI * t // 0 — восток, π/2 — юг, π — запад
      const len = 9 + 22 * Math.abs(t - 0.5) * 2
      plan.style.setProperty('--sx', `${(-Math.cos(a) * len).toFixed(2)}px`)
      plan.style.setProperty('--sy', `${(-Math.sin(a) * len * 0.55 - 3).toFixed(2)}px`)
      sun.setAttribute('cx', (110 - Math.cos(a) * 96).toFixed(1))
      sun.setAttribute('cy', (108 - Math.sin(a) * 96).toFixed(1))
      const hh = Math.floor(hour)
      time.textContent = `${hh}:${String(Math.floor((hour - hh) * 60)).padStart(2, '0')}`
    }

    if (reduced()) {
      paint(base)
      return () => offs.forEach((f) => f())
    }
    let intro = OPEN
    let scrollH = 0
    const t0 = performance.now() + 1300
    let raf = 0
    const tick = (now2: number) => {
      const k = Math.min(1, Math.max(0, (now2 - t0) / 1600))
      const e = 1 - Math.pow(1 - k, 3)
      intro = OPEN + (base - OPEN) * e
      paint(Math.min(CLOSE, intro + scrollH))
      if (k < 1) raf = requestAnimationFrame(tick)
      else raf = 0
    }
    raf = requestAnimationFrame(tick)
    const onScroll = () => {
      const r = hero.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))
      scrollH = p * 3
      if (!raf) paint(Math.min(CLOSE, intro + scrollH))
    }
    addEventListener('scroll', onScroll, { passive: true })
    offs.push(() => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', onScroll)
    })
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
