'use client'

import { useEffect } from 'react'

/*
 * Движение «Льна». Рулетка, сантиметры, шторы и плед первого экрана — CSS с первой отрисовки (@property --w, --h).
 * Здесь только появление при прокрутке: data-ln → .is-in (развороты раскрываются, у образцов загибается
 * уголок, лента этапов разматывается).
 */
export function LinenMotion() {
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
    document.querySelectorAll('.tpl-linen [data-ln]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
