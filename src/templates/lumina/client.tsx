'use client'

import { useEffect } from 'react'

/*
 * Движение «Люмины». Сумерки, шнур, абажур и конус первого экрана — CSS с первой отрисовки (@property --k).
 * Здесь: кнопки кельвинов меняют цвет света (data-k на комнате) и появление при прокрутке: data-lm → .is-in
 * (ярлыки каталога раскачиваются на шнурах, выключатели этапов щёлкают по очереди).
 */
export function LuminaMotion() {
  useEffect(() => {
    const room = document.querySelector<HTMLElement>('.tpl-lumina .lm-room')
    const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('.tpl-lumina .lm-kelvin button'))
    const onClick = (e: Event) => {
      const b = e.currentTarget as HTMLButtonElement
      room?.setAttribute('data-k', b.value)
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
    document.querySelectorAll('.tpl-lumina [data-lm]').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      btns.forEach((b) => b.removeEventListener('click', onClick))
    }
  }, [])
  return null
}
