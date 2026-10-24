'use client'

import { useEffect } from 'react'

/*
 * Движение «Мудборда». Доска первого экрана собирается CSS с первой отрисовки. Здесь только появление при
 * прокрутке: data-md → .is-in (карточки «прикалываются», размерные линии вытягиваются).
 */
export function MoodMotion() {
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
    document.querySelectorAll('.tpl-moodboard [data-md]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
