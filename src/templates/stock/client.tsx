'use client'

import { useEffect, useState } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const pad = (n: number) => String(n).padStart(2, '0')
const ABC = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789'

/** Часы базы (Ташкент, UTC+5). На сервере — прочерки: время только в браузере, иначе гидрация не совпадёт. */
export function StockClock({ className = 'stock-clock', withDate = false }: { className?: string; withDate?: boolean }) {
  const [t, setT] = useState('')
  useEffect(() => {
    const tick = () => {
      const d = new Date(Date.now() + (new Date().getTimezoneOffset() + 300) * 60000)
      const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      setT(withDate ? `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${time}` : time)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [withDate])
  return (
    <span className={className} aria-hidden="true">
      {t || (withDate ? '--.--.---- --:--:--' : '--:--:--')}
    </span>
  )
}

/*
 * Движение «Табло». Вход первого экрана — CSS. Здесь: третья строка табло перещёлкивается словами
 * (каждый флажок пролистывает две случайные буквы и встаёт на нужную, слева направо по 38 мс — как Solari),
 * появление при прокрутке (data-st → .is-in), рулетка (--p), видео играет только в кадре.
 */
export function StockMotion() {
  useEffect(() => {
    const offs: (() => void)[] = []

    const els = document.querySelectorAll<HTMLElement>('.tpl-stock [data-st]')
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    els.forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    // табло: смена слова
    const row = document.querySelector<HTMLElement>('[data-stock-row="live"]')
    const json = document.querySelector('[data-stock-words]')?.textContent
    const words: string[] = json ? JSON.parse(json) : []
    if (row && words.length > 1 && !reduced()) {
      const cells = [...row.querySelectorAll<HTMLElement>('.stock-flap__ch')]
      let w = 0
      let visible = true
      const vio = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
      vio.observe(row)
      offs.push(() => vio.disconnect())
      const flip = (el: HTMLElement, ch: string) =>
        new Promise<void>((done) => {
          const a = el.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }], { duration: 70, easing: 'ease-in' })
          a.onfinish = () => {
            el.textContent = ch
            const b = el.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], { duration: 90, easing: 'cubic-bezier(.2,1.4,.5,1)' })
            b.onfinish = () => done()
          }
        })
      const next = () => {
        if (!visible || document.hidden) return
        w = (w + 1) % words.length
        const target = [...words[w]]
        cells.forEach((el, i) => {
          const final = target[i] && target[i] !== ' ' ? target[i] : ' '
          if (el.textContent === final) return
          setTimeout(async () => {
            for (let k = 0; k < 2; k++) await flip(el, ABC[(Math.random() * ABC.length) | 0])
            await flip(el, final)
          }, i * 38)
        })
      }
      const id = setInterval(next, 3400)
      offs.push(() => clearInterval(id))
    }

    // рулетка
    const tape = document.querySelector<HTMLElement>('[data-stock-tape]')
    let raf = 0
    const frame = () => {
      raf = 0
      if (!tape) return
      const r = tape.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height * 0.8)))
      tape.style.setProperty('--p', p.toFixed(4))
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

    // видео камер — только в кадре
    document.querySelectorAll<HTMLVideoElement>('.tpl-stock .stock-cam video').forEach((v) => {
      const vo = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.05 })
      vo.observe(v)
      offs.push(() => vo.disconnect())
    })
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
