'use client'

import { useEffect } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * Движение «Банки». Первый экран — CSS с первой отрисовки. Здесь: появление при прокрутке (data-tb → .is-in;
 * у полки это открывает дверь холодильника) и наклон банки за мышью — только у мыши, плавно, через rAF.
 */
export function TubeMotion() {
  useEffect(() => {
    const offs: (() => void)[] = []
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    document.querySelectorAll('.tpl-tube [data-tb]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    const hero = document.querySelector<HTMLElement>('[data-tube-hero]')
    if (hero && !reduced() && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let tx = 0
      let cx = 0
      let raf = 0
      const loop = () => {
        cx += (tx - cx) * 0.08
        hero.style.setProperty('--tilt', cx.toFixed(3))
        raf = Math.abs(tx - cx) > 0.001 ? requestAnimationFrame(loop) : 0
      }
      const move = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect()
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2
        if (!raf) raf = requestAnimationFrame(loop)
      }
      const leave = () => {
        tx = 0
        if (!raf) raf = requestAnimationFrame(loop)
      }
      hero.addEventListener('pointermove', move)
      hero.addEventListener('pointerleave', leave)
      offs.push(() => {
        hero.removeEventListener('pointermove', move)
        hero.removeEventListener('pointerleave', leave)
        cancelAnimationFrame(raf)
      })
    }
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
