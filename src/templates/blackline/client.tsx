'use client'

import { useEffect } from 'react'

/*
 * Движение «Чёрной линии». Линия, металл, воск и свечи первого экрана — CSS с первой отрисовки.
 * Здесь только появление при прокрутке: data-bl → .is-in (работы открываются мазком кисти, линия этапов
 * прорисовывается, рамки эскизов рисуются от руки).
 */
export function BlacklineMotion() {
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
    document.querySelectorAll('.tpl-blackline [data-bl]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
