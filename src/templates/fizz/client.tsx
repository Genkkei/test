'use client'

import { useEffect, useRef } from 'react'

/*
 * Банка без WebGL: цилиндр — это плоская этикетка, которая едет вбок под
 * неподвижной светотенью. Глаз читает это как вращение, а стоит это один transform.
 * Скорость вращения: время + прокрутка + курсор; наклон — от курсора.
 */
export function Can({ name, flavor, color, ink = '#191917', live = true, className = '' }: { name: string; flavor: string; color: string; ink?: string; live?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!live) return
    const el = ref.current!
    const reduce = document.documentElement.classList.contains('reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let mx = 0, my = 0, tx = 0, ty = 0
    let spin = 0
    let lastY = scrollY
    let vel = 0
    let last = performance.now()
    const move = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth - 0.5) * 2
      ty = (e.clientY / innerHeight - 0.5) * 2
    }
    const loop = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      const y = scrollY
      vel += (y - lastY - vel) * 0.15
      lastY = y
      mx += (tx - mx) * 0.06
      my += (ty - my) * 0.06
      spin += dt * 0.04 + vel * 0.9 + mx * 0.6
      const w = (el.querySelector('.can__strip') as HTMLElement | null)?.offsetWidth || 200
      const m = ((spin % (2 * w)) + 2 * w) % (2 * w)
      el.style.setProperty('--spin', `${m.toFixed(1)}px`)
      el.style.setProperty('--tilt', `${(mx * 9 + vel * 0.15).toFixed(2)}deg`)
      el.style.setProperty('--lift', `${(my * -10 + Math.sin(now / 900) * 8).toFixed(1)}px`)
      raf = requestAnimationFrame(loop)
    }
    if (!reduce) {
      addEventListener('pointermove', move, { passive: true })
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', move)
    }
  }, [live])
  const label = (
    <span className="can__strip">
      <b>{name}</b>
      <em>{flavor}</em>
      <i>0% сахара · 250 мл</i>
    </span>
  )
  return (
    <div ref={ref} className={`can ${className}`} style={{ ['--can' as string]: color, ['--ink' as string]: ink }} aria-hidden="true">
      <div className="can__body">
        <div className="can__label">
          {label}
          {label}
          {label}
          {label}
        </div>
        <div className="can__shade" />
      </div>
      <div className="can__top" />
      <div className="can__bottom" />
    </div>
  )
}

/** Шторка загрузки: бренд на весь экран, уезжает вверх. Без JS её нет вовсе. */
export function Curtain({ word }: { word: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (!document.documentElement.classList.contains('motion')) {
      el.remove()
      return
    }
    el.classList.add('is-run')
    const t = setTimeout(() => el.remove(), 2200)
    return () => clearTimeout(t)
  }, [])
  return (
    <div ref={ref} className="fizz-curtain" aria-hidden="true">
      <span>{word}</span>
    </div>
  )
}

export function FizzHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const on = () => ref.current?.classList.toggle('is-scrolled', scrollY > 80)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="fizz-header">
      {children}
    </header>
  )
}
