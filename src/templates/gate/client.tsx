'use client'

import { useEffect } from 'react'

/*
 * Движение «Ворот». Ворота первого экрана — CSS с первой отрисовки. Здесь: появление при прокрутке
 * (data-gt → .is-in: план чертится, полосы паспорта заполняются) и выбор пакета на генплане —
 * нажатие, а у мыши и наведение, переключает data-pk у раздела; без скрипта горит пакет по умолчанию.
 */
export function GateMotion() {
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
    document.querySelectorAll('.tpl-gate [data-gt]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    document.querySelectorAll<HTMLElement>('[data-gate-plan]').forEach((plan) => {
      const btns = [...plan.querySelectorAll<HTMLButtonElement>('[data-pk-btn]')]
      const pick = (b: HTMLButtonElement) => {
        plan.dataset.pk = b.dataset.pkBtn
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
      }
      const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
      btns.forEach((b) => {
        const on = () => pick(b)
        b.addEventListener('click', on)
        b.addEventListener('focus', on)
        if (fine) b.addEventListener('pointerenter', on)
        offs.push(() => {
          b.removeEventListener('click', on)
          b.removeEventListener('focus', on)
          b.removeEventListener('pointerenter', on)
        })
      })
    })
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
