'use client'

import { useEffect } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * Движение «Происхождения». Карта чертится CSS-анимацией с первой отрисовки. Здесь: «в чашке сегодня»
 * меняет ноту (стирается слева направо, новая пишется), тропа «пути зерна» дорисовывается прокруткой (--p),
 * появление при прокрутке (data-te → .is-in), видео обжарки играет, пока карта в кадре.
 */
export function TerroirMotion() {
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
    document.querySelectorAll('.tpl-terroir [data-te]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    const word = document.querySelector<HTMLElement>('[data-terroir-word]')
    const json = document.querySelector('[data-terroir-words]')?.textContent
    const words: string[] = json ? JSON.parse(json) : []
    if (word && words.length > 1 && !reduced()) {
      let i = 0
      const id = setInterval(() => {
        if (document.hidden) return
        i = (i + 1) % words.length
        const out = word.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 260, easing: 'ease-in' })
        out.onfinish = () => {
          word.textContent = words[i]
          word.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 520, easing: 'cubic-bezier(.65,0,.35,1)' })
        }
      }, 2600)
      offs.push(() => clearInterval(id))
    }

    const path = document.querySelector<HTMLElement>('[data-terroir-path]')
    let raf = 0
    const frame = () => {
      raf = 0
      if (!path) return
      const r = path.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (r.height * 0.8)))
      path.style.setProperty('--p', p.toFixed(4))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    frame()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    offs.push(() => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', on)
      removeEventListener('resize', on)
    })

    const vid = document.querySelector<HTMLVideoElement>('[data-terroir-chart] video')
    if (vid) {
      const vo = new IntersectionObserver(([e]) => (e.isIntersecting ? vid.play().catch(() => {}) : vid.pause()), { threshold: 0.05 })
      vo.observe(vid)
      offs.push(() => vo.disconnect())
    }
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
