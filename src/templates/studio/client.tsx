'use client'

import { useEffect } from 'react'

/*
 * Движение «Студии». Шоурум первого экрана — CSS с первой отрисовки. Здесь только появление при прокрутке:
 * data-st → .is-in (фото «зажигается» светом, латунная линия этапов прочерчивается).
 */
export function StudioMotion() {
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
    document.querySelectorAll('.tpl-studio [data-st]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
