'use client'

import { useEffect } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * Движение «Венчика». Чаша, «М», пена — CSS с первой отрисовки. Здесь: таймер взбивания досчитывает до
 * своего значения ровно за время, пока венчик ходит (1,1–3,3 с), — секунды идут быстрее настоящих, но
 * синхронно с пеной; появление при прокрутке (data-wk → .is-in). Без скрипта таймер сразу показывает итог.
 */
export function WhiskMotion() {
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
    document.querySelectorAll('.tpl-whisk [data-wk]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    const dd = document.querySelector<HTMLElement>('[data-whisk-count]')
    const node = dd?.firstChild
    const to = Number(dd?.dataset.whiskCount)
    if (dd && node && node.nodeType === 3 && Number.isFinite(to) && !reduced() && performance.now() < 1500) {
      const start = performance.now() + Math.max(0, 1100 - performance.now())
      node.textContent = '0'
      let raf = 0
      const tick = (now: number) => {
        const k = Math.min(1, Math.max(0, (now - start) / 2200))
        node.textContent = String(Math.round(to * k))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      offs.push(() => cancelAnimationFrame(raf))
    }
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
