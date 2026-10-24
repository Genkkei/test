'use client'

import { useEffect } from 'react'

/*
 * Движение «Партитуры». Нотный стан, падающие ноты и бегунок — CSS с первой отрисовки. Здесь только
 * появление при прокрутке: data-sc → .is-in (клавиши поднимаются по одной, как гамма).
 */
export function ScoreMotion() {
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
    document.querySelectorAll('.tpl-score [data-sc]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
