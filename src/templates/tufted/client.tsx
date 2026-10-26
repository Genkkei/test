'use client'

import { useEffect } from 'react'

/*
 * Движение «Обивки». Снятие старой ткани, новая ткань и пуговицы первого экрана — CSS с первой отрисовки.
 * Здесь только появление при прокрутке: data-tf → .is-in (образцы раскрываются веером, шов прошивает этапы,
 * бирки прошиваются по краю, пуговицы цифр вдавливаются).
 */
export function TuftedMotion() {
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
    document.querySelectorAll('.tpl-tufted [data-tf]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
