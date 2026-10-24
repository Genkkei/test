'use client'

import { useEffect } from 'react'

/*
 * Движение «Мастерской». Удары молота, искры, остывание и термометр — CSS с первой отрисовки
 * (@property --t). Здесь только появление при прокрутке: data-ws → .is-in (полоски каления
 * разогреваются, отметки ударов выбиваются по одной).
 */
export function WorkshopMotion() {
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
    document.querySelectorAll('.tpl-workshop [data-ws]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
