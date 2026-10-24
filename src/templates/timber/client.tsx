'use client'

import { useEffect } from 'react'

/*
 * Движение «Бруса». Доска, рубанок, выжигание заголовка и кольца торцов первого экрана — CSS с первой
 * отрисовки. Здесь только появление при прокрутке: data-tm → .is-in (клейма выжигаются, кольца растут,
 * метр раскладывается). Без скрипта всё видно сразу.
 */
export function TimberMotion() {
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
    document.querySelectorAll('.tpl-timber [data-tm]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
