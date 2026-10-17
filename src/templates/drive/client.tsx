'use client'

import { useEffect, useRef, useState } from 'react'

/** Парк лентой: палец листает родной прокруткой со snap, мышь — протяжкой и стрелками;
 *  полоса снизу и счётчик показывают, где вы в парке. */
export function FleetRail({ children, count, prev, next }: { children: React.ReactNode; count: number; prev: string; next: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [cur, setCur] = useState(1)
  useEffect(() => {
    const el = ref.current!
    let down = false, x0 = 0, s0 = 0, moved = false
    const onScroll = () => {
      const max = Math.max(1, el.scrollWidth - el.clientWidth)
      const p = el.scrollLeft / max
      if (bar.current) bar.current.style.transform = `scaleX(${0.12 + p * 0.88})`
      const card = el.querySelector<HTMLElement>('.drv-fleet__item')
      const w = (card?.offsetWidth ?? 300) + 20
      setCur(Math.min(count, Math.round(el.scrollLeft / w) + 1))
    }
    const pd = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      down = true; moved = false; x0 = e.clientX; s0 = el.scrollLeft
      el.classList.add('is-drag')
    }
    const pm = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - x0
      if (Math.abs(dx) > 4) moved = true
      el.scrollLeft = s0 - dx
    }
    const pu = () => { down = false; el.classList.remove('is-drag') }
    const click = (e: MouseEvent) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false } }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('pointerdown', pd)
    window.addEventListener('pointermove', pm, { passive: true })
    window.addEventListener('pointerup', pu)
    el.addEventListener('click', click, true)
    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('pointerdown', pd)
      window.removeEventListener('pointermove', pm)
      window.removeEventListener('pointerup', pu)
      el.removeEventListener('click', click, true)
    }
  }, [count])
  const go = (d: number) => {
    const el = ref.current!
    const card = el.querySelector<HTMLElement>('.drv-fleet__item')
    el.scrollBy({ left: d * ((card?.offsetWidth ?? 300) + 20), behavior: 'smooth' })
  }
  return (
    <div className="drv-fleet">
      <div ref={ref} className="drv-fleet__track">
        {children}
      </div>
      <div className="drv-fleet__ui">
        <span className="drv-fleet__count">
          {String(cur).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
        <span className="drv-fleet__bar">
          <span ref={bar} />
        </span>
        <button type="button" onClick={() => go(-1)} aria-label={prev}>
          ←
        </button>
        <button type="button" onClick={() => go(1)} aria-label={next}>
          →
        </button>
      </div>
    </div>
  )
}

/** Маршрут: пишет в --p долю пройденного секцией пути (0…1) — по ней едет машинка по линии этапов. */
export function RouteProgress({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    let raf = 0
    const on = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.2)))
      el.style.setProperty('--p', p.toFixed(4))
      el.querySelectorAll<HTMLElement>('[data-stop]').forEach((s) => s.classList.toggle('is-passed', Number(s.dataset.stop) <= p + 0.001))
    }
    const tick = () => { if (!raf) raf = requestAnimationFrame(on) }
    on()
    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
    }
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
