'use client'

import { useEffect } from 'react'

/*
 * Движение «Макарона». Чайник, струя, капли, уровень кофе, таймер и пар первого экрана — CSS с первой отрисовки
 * (@property --s). Здесь только появление при прокрутке: data-mc → .is-in (меню раскрывается, листки календаря
 * перелистываются, снимки зала проявляются).
 */
export function MacaronMotion() {
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
    document.querySelectorAll('.tpl-macaron [data-mc]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
