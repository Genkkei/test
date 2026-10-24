'use client'

import { useEffect } from 'react'

/*
 * Движение «Позолоты». Решётка первого экрана и золочение — CSS с первой отрисовки. Здесь только появление
 * при прокрутке: data-gl → .is-in (фото золотятся светом, числа — бликом фольги, прут пути — золотом).
 */
export function GiltMotion() {
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
    document.querySelectorAll('.tpl-gilt [data-gl]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
