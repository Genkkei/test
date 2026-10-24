'use client'

import { useEffect } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * Движение «Экспозиции». Софит на первом экране включается CSS-анимацией; здесь после неё луч идёт за
 * курсором с запаздыванием (лерп 0.12 — тяжёлый прожектор, а не указка) и возвращается к центру, когда
 * курсор ушёл. Афиша выставок — превью вида выставки под курсором. Зал — лента едет вбок, пока секция
 * закреплена. Появление при прокрутке — data-ex → .is-in.
 */
export function ExhibitMotion() {
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
    document.querySelectorAll('.tpl-exhibit [data-ex]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
    const calm = reduced()

    // луч
    const obj = document.querySelector<HTMLElement>('[data-exhibit-object]')
    if (obj && fine && !calm) {
      let tx = 50, ty = 42, x = 50, y = 42, raf = 0
      const loop = () => {
        x += (tx - x) * 0.12
        y += (ty - y) * 0.12
        obj.style.setProperty('--bx', `${x.toFixed(2)}%`)
        obj.style.setProperty('--by', `${y.toFixed(2)}%`)
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(loop) : 0
      }
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(loop)
      }
      const hero = obj.closest<HTMLElement>('[data-exhibit-hero]')!
      const move = (e: PointerEvent) => {
        if (!obj.classList.contains('is-live')) return
        const b = obj.getBoundingClientRect()
        tx = Math.max(-10, Math.min(110, ((e.clientX - b.left) / b.width) * 100))
        ty = Math.max(-10, Math.min(110, ((e.clientY - b.top) / b.height) * 100))
        kick()
      }
      const leave = () => {
        tx = 50
        ty = 42
        kick()
      }
      const live = setTimeout(() => obj.classList.add('is-live'), 2100)
      hero.addEventListener('pointermove', move)
      hero.addEventListener('pointerleave', leave)
      offs.push(() => {
        clearTimeout(live)
        cancelAnimationFrame(raf)
        hero.removeEventListener('pointermove', move)
        hero.removeEventListener('pointerleave', leave)
      })
    }

    // афиша: превью под курсором
    const shows = document.querySelector<HTMLElement>('[data-exhibit-shows]')
    const float = shows?.querySelector<HTMLElement>('[data-exhibit-float]')
    if (shows && float && fine && !calm) {
      const imgs = [...float.querySelectorAll<HTMLImageElement>('img')]
      let tx = 0, ty = 0, x = 0, y = 0, raf = 0, on = false
      const loop = () => {
        x += (tx - x) * 0.16
        y += (ty - y) * 0.16
        float.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
        raf = on || Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0
      }
      const move = (e: PointerEvent) => {
        const b = shows.getBoundingClientRect()
        tx = e.clientX - b.left
        ty = e.clientY - b.top
        const row = (e.target as Element).closest<HTMLElement>('[data-exhibit-show]')
        const i = row ? Number(row.dataset.exhibitShow) : -1
        imgs.forEach((im) => im.classList.toggle('is-on', Number(im.dataset.i) === i))
        float.classList.toggle('is-on', i >= 0)
        if (!on) {
          on = true
          x = tx
          y = ty
        }
        if (!raf) raf = requestAnimationFrame(loop)
      }
      const leave = () => {
        on = false
        float.classList.remove('is-on')
      }
      shows.addEventListener('pointermove', move)
      shows.addEventListener('pointerleave', leave)
      offs.push(() => {
        cancelAnimationFrame(raf)
        shows.removeEventListener('pointermove', move)
        shows.removeEventListener('pointerleave', leave)
      })
    }

    // зал: лента вбок
    const walk = document.querySelector<HTMLElement>('[data-exhibit-walk]')
    const track = walk?.querySelector<HTMLElement>('.exhibit-walk__track')
    const wide = matchMedia('(min-width: 900px)')
    let wraf = 0
    const frame = () => {
      wraf = 0
      if (!walk || !track) return
      if (!wide.matches || calm) {
        track.style.transform = ''
        return
      }
      const r = walk.getBoundingClientRect()
      const span = Math.max(1, r.height - innerHeight)
      const p = Math.min(1, Math.max(0, -r.top / span))
      const dist = Math.max(0, track.scrollWidth - track.clientWidth)
      track.style.transform = `translate3d(${(-dist * p).toFixed(1)}px, 0, 0)`
    }
    const on = () => {
      if (!wraf) wraf = requestAnimationFrame(frame)
    }
    frame()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    offs.push(() => {
      cancelAnimationFrame(wraf)
      removeEventListener('scroll', on)
      removeEventListener('resize', on)
    })
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
