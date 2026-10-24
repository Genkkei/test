'use client'

import { useEffect } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * Движение «Складки». Сценарий комнаты — атрибут data-mode у первого экрана (0 день, 1 ночь, 2 гости),
 * всё остальное делает CSS: кровать поворачивается на петле, стол раскладывается, небо меняется, толщина
 * заголовка следует за сценарием. Один раз сценарии проходят сами (день → ночь → гости → день), нажатие
 * на сегмент прерывает показ. Плюс появление при прокрутке: data-fd → .is-in.
 */
export function FoldMotion() {
  useEffect(() => {
    const offs: (() => void)[] = []
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    document.querySelectorAll('.tpl-fold [data-fd]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    const hero = document.querySelector<HTMLElement>('[data-fold-hero]')
    if (hero) {
      const btns = [...hero.querySelectorAll<HTMLButtonElement>('[data-mode-btn]')]
      const set = (m: number) => {
        hero.dataset.mode = String(m)
        btns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === m)))
      }
      const timers: number[] = []
      const stop = () => timers.splice(0).forEach((t) => clearTimeout(t))
      btns.forEach((b, i) => {
        const on = () => {
          stop()
          set(i)
        }
        b.addEventListener('click', on)
        offs.push(() => b.removeEventListener('click', on))
      })
      if (!reduced()) {
        timers.push(window.setTimeout(() => set(1), 1900), window.setTimeout(() => set(2), 4300), window.setTimeout(() => set(0), 6900))
      }
      offs.push(stop)
    }
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
