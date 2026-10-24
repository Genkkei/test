'use client'

import { useEffect } from 'react'

/*
 * Движение «Главы». Книга первого экрана открывается CSS с первой отрисовки. Здесь только появление при
 * прокрутке: data-ch → .is-in (книги выдвигаются с полки, на формуляры ставится штамп).
 */
export function ChapterMotion() {
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
    document.querySelectorAll('.tpl-chapter [data-ch]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
