'use client'

import { useEffect } from 'react'

/*
 * Движение «Квартиры». План первого экрана и счётчик дней — CSS с первой отрисовки (@property --day).
 * Здесь только появление при прокрутке: data-fl → .is-in (дни календаря закрашиваются, кольца заполняются).
 */
export function FlatMotion() {
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
    document.querySelectorAll('.tpl-flat [data-fl]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
