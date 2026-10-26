'use client'

import { useEffect } from 'react'

/*
 * Движение «Мороза». Метка, машина по маршруту, трекер, минуты и дуга первого экрана — CSS с первой отрисовки
 * (offset-path, @property --m). Здесь только появление при прокрутке: data-fr → .is-in (шов проваривается
 * под ценой, сообщения диспетчера приходят по одному).
 */
export function FrostMotion() {
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
    document.querySelectorAll('.tpl-frost [data-fr]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
