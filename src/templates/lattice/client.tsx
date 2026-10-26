'use client'

import { useEffect } from 'react'

/*
 * Движение «Решётки». Занавес, свет, эскиз, ковка и створка первого экрана — CSS с первой отрисовки.
 * Здесь: кнопки узоров меняют решётку в окне (data-p на сцене) и появление при прокрутке: data-lt → .is-in
 * (афиши поднимаются, билеты отрывают корешок).
 */
export function LatticeMotion() {
  useEffect(() => {
    const scene = document.querySelector<HTMLElement>('.tpl-lattice .lt-scene')
    const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('.tpl-lattice .lt-patterns button'))
    const onClick = (e: Event) => {
      const b = e.currentTarget as HTMLButtonElement
      scene?.classList.add('is-picked')
      scene?.setAttribute('data-p', b.value)
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
    document.querySelectorAll('.tpl-lattice [data-lt]').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      btns.forEach((b) => b.removeEventListener('click', onClick))
    }
  }, [])
  return null
}
