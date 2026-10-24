'use client'

import { useEffect } from 'react'

/*
 * Движение «Стола». Схема зала, часы и занятые места — CSS с первой отрисовки (@property --hour).
 * Здесь только появление при прокрутке: data-dk → .is-in (точки мест в зонах загораются, бейджи качнутся).
 */
export function DeskMotion() {
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
    document.querySelectorAll('.tpl-desk [data-dk]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
