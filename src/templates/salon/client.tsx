'use client'

import { useEffect } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * Движение «Джезвы». Три подъёма окна и рамка гириха — CSS с первой отрисовки. Здесь: «сегодня варим»
 * перещёлкивает добавку — слово опускается и всплывает новое, как пена (пружина .34,1.56,.64,1); появление
 * при прокрутке (data-sa → .is-in); видео играет, пока первый экран в кадре.
 */
export function SalonMotion() {
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
    document.querySelectorAll('.tpl-salon [data-sa]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    const word = document.querySelector<HTMLElement>('[data-salon-word]')
    const json = document.querySelector('[data-salon-words]')?.textContent
    const words: string[] = json ? JSON.parse(json) : []
    if (word && words.length > 1 && !reduced()) {
      let i = 0
      const id = setInterval(() => {
        if (document.hidden) return
        i = (i + 1) % words.length
        const out = word.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(60%)', opacity: 0 }], { duration: 220, easing: 'ease-in' })
        out.onfinish = () => {
          word.textContent = words[i]
          word.animate([{ transform: 'translateY(-70%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.34,1.56,.64,1)' })
        }
      }, 2800)
      offs.push(() => clearInterval(id))
    }

    const vid = document.querySelector<HTMLVideoElement>('[data-salon-hero] video')
    if (vid) {
      const vo = new IntersectionObserver(([e]) => (e.isIntersecting ? vid.play().catch(() => {}) : vid.pause()), { threshold: 0.05 })
      vo.observe(vid)
      offs.push(() => vo.disconnect())
    }
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
