'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Пластинка: крутится всегда (33⅓ об/мин — 1,8 с на оборот), прокрутка страницы её подгоняет,
 * как палец на диске. Угол пишется в --a на корень, без перерисовки React.
 */
export function Record({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let a = 0
    let boost = 0
    let lastY = window.scrollY
    let last = performance.now()
    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)
    const loop = (t: number) => {
      const dt = Math.min(64, t - last)
      last = t
      const y = window.scrollY
      boost = boost * 0.92 + Math.abs(y - lastY) * 0.6
      lastY = y
      if (visible) {
        a = (a + dt * (0.2 + Math.min(boost, 40) * 0.02)) % 360
        el.style.setProperty('--a', `${a}deg`)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])
  return (
    <div ref={ref} className="vinyl-record">
      {children}
    </div>
  )
}

/** «Сейчас играет»: слова первого экрана сменяются как треки. Первое есть в HTML. */
export function NowPlaying({ words, label }: { words: string[]; label: string }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2400)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <p className="vinyl-now">
      <span className="vinyl-eq" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <small>{label}</small>
      <b key={i}>{words[i]}</b>
    </p>
  )
}
