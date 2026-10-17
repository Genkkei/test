'use client'

import { useEffect, useRef } from 'react'

/** Лепестки: несколько десятков эллипсов падают, вращаясь; холст рисуется только пока виден. */
export function Petals({ colors }: { colors: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')
    if (!ctx || document.documentElement.classList.contains('reduce-motion')) return
    let w = 0, h = 0, raf = 0, visible = true
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const N = window.innerWidth < 700 ? 22 : 42
    const P = Array.from({ length: N }, (_, i) => ({
      x: Math.random(), y: Math.random(), s: 6 + Math.random() * 12, r: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.02, vy: 0.0006 + Math.random() * 0.0012, sw: Math.random() * 6.28, c: colors[i % colors.length],
    }))
    const size = () => {
      w = c.clientWidth; h = c.clientHeight
      c.width = w * dpr; c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      ctx.clearRect(0, 0, w, h)
      for (const p of P) {
        p.y += p.vy; p.r += p.vr; p.sw += 0.01
        if (p.y > 1.05) { p.y = -0.05; p.x = Math.random() }
        const x = (p.x + Math.sin(p.sw + t * 0.0003) * 0.03) * w, y = p.y * h
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.r); ctx.scale(1, Math.abs(Math.sin(p.sw * 1.7)) * 0.6 + 0.4)
        ctx.globalAlpha = 0.55; ctx.fillStyle = p.c
        ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 6.283); ctx.fill(); ctx.restore()
      }
    }
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(c)
    size()
    window.addEventListener('resize', size)
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', size) }
  }, [colors])
  return <canvas ref={ref} className="vw-petals" aria-hidden="true" />
}

/** Линия дня: центральная нить растёт с прокруткой, пройденные часы загораются. */
export function DayLine({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const el = ref.current!
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const mid = window.innerHeight * 0.6
        const k = Math.min(1, Math.max(0, (mid - r.top) / r.height))
        el.style.setProperty('--k', String(k))
        el.querySelectorAll<HTMLElement>(':scope > li').forEach((li) => {
          li.classList.toggle('is-lit', li.getBoundingClientRect().top < mid)
        })
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <ol ref={ref} className="vw-day">
      {children}
    </ol>
  )
}
