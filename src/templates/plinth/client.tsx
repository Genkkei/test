'use client'

import { useEffect, useRef } from 'react'

/** Перекрестье чертёжника: две волосяные линии за курсором и координаты в миллиметрах
 *  от угла листа. Только там, где есть наведение; на телефоне не рисуется. */
export function Crosshair({ unit = "мм" }: { unit?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    const host = el.parentElement!
    if (!window.matchMedia('(hover: hover)').matches) return
    const label = el.querySelector('span')!
    let raf = 0, x = 0, y = 0
    const draw = () => {
      raf = 0
      el.style.setProperty('--x', `${x}px`)
      el.style.setProperty('--y', `${y}px`)
      label.textContent = `X ${String(Math.round(x * 2.5)).padStart(4, '0')} · Y ${String(Math.round(y * 2.5)).padStart(4, '0')} ${unit}`
    }
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      x = e.clientX - r.left
      y = e.clientY - r.top
      el.dataset.on = '1'
      if (!raf) raf = requestAnimationFrame(draw)
    }
    const leave = () => delete el.dataset.on
    host.addEventListener('pointermove', move, { passive: true })
    host.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
    }
  }, [])
  return (
    <div ref={ref} className="plx-cross" aria-hidden="true">
      <i />
      <b />
      <span />
    </div>
  )
}

/** Список проектов OMA-стиля: слева номера и названия, справа кадр выбранного,
 *  он меняется при наведении и при прокрутке (тот, что ближе к середине экрана). */
export function ProjectIndex({ rows, frames }: { rows: React.ReactNode[]; frames: React.ReactNode[] }) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = box.current!
    const items = [...root.querySelectorAll<HTMLElement>('.plx-idx__row')]
    const setActive = (i: number) => {
      root.style.setProperty('--active', String(i))
      items.forEach((it, n) => it.classList.toggle('is-active', n === i))
      root.querySelectorAll<HTMLElement>('.plx-idx__frame').forEach((f, n) => f.classList.toggle('is-on', n === i))
    }
    setActive(0)
    const hover = items.map((it, i) => {
      const h = () => setActive(i)
      it.addEventListener('pointerenter', h)
      return h
    })
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(items.indexOf(e.target as HTMLElement))),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    items.forEach((it) => io.observe(it))
    return () => {
      io.disconnect()
      items.forEach((it, i) => it.removeEventListener('pointerenter', hover[i]))
    }
  }, [])
  return (
    <div ref={box} className="plx-idx">
      <ol className="plx-idx__list">{rows}</ol>
      <div className="plx-idx__stage" aria-hidden="true">
        {frames}
      </div>
    </div>
  )
}
