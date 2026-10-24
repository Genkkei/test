'use client'

import { useEffect } from 'react'

/*
 * Движение «Моно». Вычитание первого экрана — CSS с первой отрисовки. Здесь только появление при прокрутке:
 * data-mn → .is-in (строки предметов открываются шторкой).
 */
export function MonoMotion() {
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
    document.querySelectorAll('.tpl-mono [data-mn]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
