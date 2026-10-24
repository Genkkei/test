'use client'

import { useEffect } from 'react'

/*
 * Движение «Уголка». Солнечные пятна, часы и розетка первого экрана — CSS с первой отрисовки (@property --h).
 * Здесь только появление при прокрутке: data-nk → .is-in (тени карточек вытягиваются, солнце идёт по дуге).
 */
export function NookMotion() {
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
    document.querySelectorAll('.tpl-nook [data-nk]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
