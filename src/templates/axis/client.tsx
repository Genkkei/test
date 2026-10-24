'use client'

import { useEffect } from 'react'

/*
 * Движение «Оси». Стойка и барабан окончаний — CSS с первой отрисовки. Здесь только появление при прокрутке:
 * data-ax → .is-in (бокалы наливаются слоями, фото выходит из полумрака, лампа над дверью загорается).
 */
export function AxisMotion() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    document.querySelectorAll('.tpl-axis [data-ax]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
