'use client'

import { useEffect } from 'react'

/*
 * Движение «Карамели». Карамель первого экрана стекает CSS с первой отрисовки. Здесь только появление при
 * прокрутке: data-cr → .is-in (ярусы тортов ставятся снизу вверх, остальное поднимается).
 */
export function CaramelMotion() {
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
    document.querySelectorAll('.tpl-caramel [data-cr]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
