'use client'

import { useEffect, useRef, useState } from 'react'

/*
 * Движение «Устья». Вход первого экрана — CSS с первой отрисовки (style.css), здесь только то, что
 * требует скрипта: термометр досчитывает (anime.js), купол раскрывается прокруткой, линия доставки
 * загорается по мере чтения, тарелка меню меняет пиццу. Всё — transform/opacity, при «меньше движения» —
 * сразу конечные значения.
 */
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function HearthMotion() {
  useEffect(() => {
    if (reduced()) return
    let dead = false
    const offs: (() => void)[] = []

    // термометр: числа набегают, когда жар уже разгорелся (вход ~1.3 с)
    import('animejs').then(({ animate, utils }) => {
      if (dead) return
      document.querySelectorAll<HTMLElement>('[data-hearth-count]').forEach((el, i) => {
        const to = parseFloat(el.dataset.hearthCount || '0')
        if (!Number.isFinite(to)) return
        const v = { n: 0 }
        el.textContent = '0'
        const a = animate(v, {
          n: to,
          delay: 900 + i * 110,
          duration: 1100 + Math.min(700, to * 1.2),
          ease: 'out(4)',
          modifier: utils.round(0),
          onUpdate: () => (el.textContent = String(v.n)),
        })
        offs.push(() => a.revert())
      })
    })

    // купол раскрывается прокруткой первого экрана; линия доставки — прокруткой своей секции
    const hero = document.querySelector<HTMLElement>('[data-hearth-hero]')
    const mouth = document.querySelector<HTMLElement>('[data-hearth-mouth]')
    const proc = document.querySelector<HTMLElement>('[data-hearth-process]')
    let raf = 0
    const frame = () => {
      raf = 0
      const vh = innerHeight
      if (hero && mouth) {
        const r = hero.getBoundingClientRect()
        const p = Math.min(1, Math.max(0, -r.top / (r.height * 0.7)))
        mouth.style.setProperty('--open', p.toFixed(4))
        hero.style.setProperty('--open', p.toFixed(4))
      }
      if (proc) {
        const r = proc.getBoundingClientRect()
        const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height * 0.8)))
        proc.style.setProperty('--p', p.toFixed(4))
      }
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

    // видео огня — только пока первый экран виден (экономия батареи телефона)
    const vid = mouth?.querySelector('video')
    if (vid && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? vid.play().catch(() => {}) : vid.pause()), { threshold: 0.05 })
      io.observe(vid)
      offs.push(() => io.disconnect())
    }
    return () => {
      dead = true
      offs.forEach((f) => f())
    }
  }, [])
  return null
}

/**
 * Тарелка меню: наведение или фокус на строку чека ставит её пиццу на тарелку. Смена — короткое марево
 * жара (blur 6px → 0, scale .96 → 1, 0.45 с), прежняя уходит быстрее (0.2 с): выход короче входа.
 */
export function MenuPlate({ photos, names }: { photos: string[]; names: string[] }) {
  const [cur, setCur] = useState(Math.max(0, photos.findIndex(Boolean)))
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const list = box.current?.parentElement?.querySelectorAll<HTMLElement>('[data-hearth-dish]')
    if (!list) return
    const offs: (() => void)[] = []
    list.forEach((el) => {
      const i = Number(el.dataset.hearthDish)
      if (!photos[i]) return
      const go = () => setCur(i)
      el.addEventListener('pointerenter', go)
      el.addEventListener('focus', go)
      offs.push(() => {
        el.removeEventListener('pointerenter', go)
        el.removeEventListener('focus', go)
      })
    })
    return () => offs.forEach((f) => f())
  }, [photos])
  return (
    <div className="hearth-plate" ref={box} aria-hidden="true">
      <div className="hearth-plate__disc">
        {photos.map((src, i) =>
          src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" data-on={i === cur || undefined} />
          ) : null,
        )}
      </div>
      <p className="hearth-plate__name">{names[cur]}</p>
    </div>
  )
}
