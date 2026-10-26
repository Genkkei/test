'use client'

import { useEffect } from 'react'

/*
 * Движение «Профиля». Рёбра, шов, столешница и размеры первого экрана — CSS с первой отрисовки.
 * Здесь: кнопки RAL перекрашивают раму (data-ral) и появление при прокрутке: data-pf → .is-in
 * (строки раскроя размечаются, метки совмещения сходятся к углам).
 */
export function ProfileMotion() {
  useEffect(() => {
    const room = document.querySelector<HTMLElement>('.tpl-profile .pf-draw')
    const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('.tpl-profile .pf-ral button'))
    const onClick = (e: Event) => {
      const b = e.currentTarget as HTMLButtonElement
      room?.setAttribute('data-ral', b.value)
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
    }
    btns.forEach((b) => b.addEventListener('click', onClick))

    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    document.querySelectorAll('.tpl-profile [data-pf]').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      btns.forEach((b) => b.removeEventListener('click', onClick))
    }
  }, [])
  return null
}
