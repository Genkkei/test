'use client'

import { useEffect } from 'react'

/*
 * Движение «Барокко». Резьба гребня, патина, золото и годы на табличке — CSS с первой отрисовки (@property --y).
 * Здесь только появление при прокрутке: data-bq → .is-in (уголки паспортов прорисовываются, гирлянды провисают,
 * кадры в овальных рамах медленно приближаются).
 */
export function BaroqueMotion() {
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
    document.querySelectorAll('.tpl-baroque [data-bq]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
