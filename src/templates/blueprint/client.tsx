'use client'

import { useEffect } from 'react'

/*
 * Движение «Чертежа». Расчётная схема и слова заголовка — CSS с первой отрисовки. Здесь только появление
 * при прокрутке: data-bp → .is-in (полосы Ганта растут по очереди).
 */
export function BlueprintMotion() {
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
    document.querySelectorAll('.tpl-blueprint [data-bp]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
