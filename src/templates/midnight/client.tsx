'use client'

import { useEffect } from 'react'

/*
 * Движение «Полуночи». Часы, гаснущие окна, луна и вывеска первого экрана — CSS с первой отрисовки.
 * Здесь только появление при прокрутке: data-md → .is-in (строки меню зажигаются неоном, курьер идёт по маршруту,
 * в окнах зала включается свет).
 */
export function MidnightMotion() {
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
    document.querySelectorAll('.tpl-midnight [data-md]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
