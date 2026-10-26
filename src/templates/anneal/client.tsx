'use client'

import { useEffect } from 'react'

/*
 * Движение «Отпуска». Угли, побежалость, термометр и тонкий лист первого экрана — CSS с первой отрисовки
 * (@property --t, --mm). Здесь только появление при прокрутке: data-an → .is-in (шкала побежалости
 * загорается по шагам, снимки работ нагреваются из серого).
 */
export function AnnealMotion() {
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
    document.querySelectorAll('.tpl-anneal [data-an]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
