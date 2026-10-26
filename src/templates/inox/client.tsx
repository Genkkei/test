'use client'

import { useEffect } from 'react'

/*
 * Движение «Нержавейки». Панели, полировка и отражение первого экрана — CSS с первой отрисовки.
 * Здесь: блик на поручне следует за курсором (--mx на лестнице, только мышь) и появление при прокрутке:
 * data-ix → .is-in (по рамкам пробегает блик, шаги поднимаются по ступеням).
 */
export function InoxMotion() {
  useEffect(() => {
    const stair = document.querySelector<HTMLElement>('.tpl-inox .ix-stair')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let raf = 0
    const onMove = (e: PointerEvent) => {
      if (!stair) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = stair.getBoundingClientRect()
        stair.style.setProperty('--mx', String(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))))
      })
    }
    if (fine) window.addEventListener('pointermove', onMove, { passive: true })
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    document.querySelectorAll('.tpl-inox [data-ix]').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])
  return null
}
