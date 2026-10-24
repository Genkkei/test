'use client'

import { useEffect } from 'react'

/*
 * Движение «Арки». Эскиз первого экрана — CSS с первой отрисовки. Здесь только появление при прокрутке:
 * data-ar → .is-in (кадры проявляются, лучший обводится карандашом, плёнка въезжает).
 */
export function ArcMotion() {
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
    document.querySelectorAll('.tpl-arc [data-ar]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
