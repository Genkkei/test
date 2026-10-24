'use client'

import { useEffect } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * Движение «Скульптуры». Кольцо листов вращается само (5°/с), прокрутка докручивает его, палец или мышь
 * крутят с инерцией (бросок — скорость уходит в затухание 0.94 за кадр). Свет — солнце слева спереди:
 * лист темнеет, когда отворачивается, — затемнение через непрозрачность слоя ::after (дёшево, без filter).
 * Пока первый экран не виден, кадров нет. Остальное — появление при прокрутке (data-sc → .is-in).
 */
export function SculptMotion() {
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
    document.querySelectorAll('.tpl-sculpt [data-sc]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    const stage = document.querySelector<HTMLElement>('[data-sculpt-stage]')
    const ring = stage?.querySelector<HTMLElement>('[data-sculpt-ring]')
    const leaves = stage ? [...stage.querySelectorAll<HTMLElement>('[data-sculpt-leaf]')] : []
    if (!stage || !ring || !leaves.length) return () => offs.forEach((f) => f())

    const calm = reduced()
    const SUN = -38
    let angle = 18
    let vel = 0
    let drag: { x: number; t: number } | null = null
    let visible = true
    let last = performance.now()
    let raf = 0

    const paint = () => {
      const rot = angle + (calm ? 0 : scrollY * 0.06)
      ring.style.transform = `rotateX(-9deg) rotateY(${rot.toFixed(2)}deg)`
      leaves.forEach((el) => {
        const a = Number(el.dataset.sculptLeaf) + rot
        const facing = Math.cos(((a - SUN) * Math.PI) / 180)
        el.style.setProperty('--d', (0.48 - 0.46 * Math.max(0, facing) + (facing < 0 ? -facing * 0.12 : 0)).toFixed(3))
      })
    }
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!visible) return
      if (!drag) {
        angle += vel * dt + (calm ? 0 : 5 * dt)
        vel *= Math.pow(0.94, dt * 60)
      }
      paint()
    }
    paint()
    if (!calm) raf = requestAnimationFrame(frame)
    else addEventListener('scroll', paint, { passive: true })

    const vio = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    vio.observe(stage)

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, t: performance.now() }
      vel = 0
      stage.setPointerCapture(e.pointerId)
      stage.classList.add('is-grab')
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      const now = performance.now()
      const dx = e.clientX - drag.x
      angle += dx * 0.35
      vel = (dx * 0.35) / Math.max(0.008, (now - drag.t) / 1000)
      drag = { x: e.clientX, t: now }
      if (calm) paint()
    }
    const up = () => {
      drag = null
      vel = Math.max(-400, Math.min(400, vel))
      stage.classList.remove('is-grab')
    }
    stage.addEventListener('pointerdown', down)
    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerup', up)
    stage.addEventListener('pointercancel', up)
    offs.push(() => {
      cancelAnimationFrame(raf)
      vio.disconnect()
      removeEventListener('scroll', paint)
      stage.removeEventListener('pointerdown', down)
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerup', up)
      stage.removeEventListener('pointercancel', up)
    })
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
