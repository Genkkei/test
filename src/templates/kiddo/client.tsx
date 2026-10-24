'use client'

import { useEffect } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * Движение «Кубиков». Детская собирается CSS-анимацией с первой отрисовки. Здесь: кубики с буквами под
 * заголовком переворачиваются на новое слово (каждый — поворот на ребро, по 60 мс друг за другом, лишние
 * кубики уходят вниз, недостающие запрыгивают), появление при прокрутке (data-kd → .is-in).
 */
export function KiddoMotion() {
  useEffect(() => {
    const offs: (() => void)[] = []
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    document.querySelectorAll('.tpl-kiddo [data-kd]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    const row = document.querySelector<HTMLElement>('[data-kiddo-cubes]')
    const json = document.querySelector('[data-kiddo-words]')?.textContent
    const words: string[] = json ? JSON.parse(json) : []
    if (row && words.length > 1 && !reduced()) {
      const cubes = [...row.querySelectorAll<HTMLElement>('.kiddo-cube')]
      let w = 0
      const id = setInterval(() => {
        if (document.hidden) return
        w = (w + 1) % words.length
        const letters = [...words[w]]
        cubes.forEach((cube, i) => {
          const face = cube.querySelector('b')!
          const next = letters[i] || ''
          const was = !cube.hasAttribute('data-empty')
          if (!was && !next) return
          setTimeout(() => {
            const a = cube.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }], { duration: 160, easing: 'ease-in' })
            a.onfinish = () => {
              face.textContent = next || ' '
              cube.toggleAttribute('data-empty', !next)
              cube.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' })
            }
          }, i * 60)
        })
      }, 3000)
      offs.push(() => clearInterval(id))
    }
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
