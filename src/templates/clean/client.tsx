'use client'

import { useEffect, useRef, useState } from 'react'

/*
 * Мыльные пузыри на 2D-холсте: поднимаются, покачиваются, лопаются от касания курсора.
 * Рисуются только пока холст в кадре и вкладка видна; плотность пикселей ≤ 1,5.
 */
type B = { x: number; y: number; r: number; vy: number; ph: number; pop: number }

export function Bubbles({ className = 'clean-bubbles' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const reduce = document.documentElement.classList.contains('reduce-motion')
    let w = 0, h = 0, dpr = 1, raf = 0, vis = true
    const mouse = { x: -999, y: -999 }
    const bs: B[] = []
    const spawn = (b?: B, fresh = false): B => {
      const n = b ?? ({} as B)
      n.r = 10 + Math.random() * 38
      n.x = Math.random() * w
      n.y = fresh ? Math.random() * h : h + n.r + Math.random() * 80
      n.vy = 0.25 + Math.random() * 0.6
      n.ph = Math.random() * 6.28
      n.pop = 0
      return n
    }
    const size = () => {
      const r = cv.getBoundingClientRect()
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      w = r.width
      h = r.height
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const want = Math.round(Math.min(26, Math.max(10, (w * h) / 42000)))
      while (bs.length < want) bs.push(spawn(undefined, true))
      bs.length = want
    }
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const b of bs) {
        if (b.pop > 0) {
          b.pop += 0.08
          ctx.strokeStyle = `rgba(24,193,165,${Math.max(0, 1 - b.pop)})`
          ctx.lineWidth = 1.5
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * 6.28
            const d = b.r * (1 + b.pop * 0.8)
            ctx.beginPath()
            ctx.moveTo(b.x + Math.cos(a) * d * 0.8, b.y + Math.sin(a) * d * 0.8)
            ctx.lineTo(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d)
            ctx.stroke()
          }
          if (b.pop >= 1) spawn(b)
          continue
        }
        if (!reduce) {
          b.y -= b.vy
          b.x += Math.sin(t / 900 + b.ph) * 0.35
        }
        if (b.y < -b.r) spawn(b)
        const dx = b.x - mouse.x, dy = b.y - mouse.y
        if (dx * dx + dy * dy < b.r * b.r) b.pop = 0.01
        // плёнка: прозрачное тело, радужная кромка и блик
        const g = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r)
        g.addColorStop(0, 'rgba(255,255,255,.55)')
        g.addColorStop(0.55, 'rgba(255,255,255,.06)')
        g.addColorStop(0.86, 'rgba(120,220,255,.18)')
        g.addColorStop(0.95, 'rgba(255,160,230,.32)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, 6.283)
        ctx.fill()
        ctx.strokeStyle = 'rgba(14,42,40,.12)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
    const loop = (t: number) => {
      draw(t)
      if (vis && !reduce) raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting && !document.hidden
      cancelAnimationFrame(raf)
      if (vis) raf = requestAnimationFrame(loop)
    })
    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    size()
    draw(0)
    io.observe(cv)
    const ro = new ResizeObserver(size)
    ro.observe(cv)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', move, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', move)
    }
  }, [])
  return <canvas ref={ref} className={className} aria-hidden="true" />
}

/** До/после: ручка тянется мышью или пальцем, слева «до», справа «после». С клавиатуры — стрелки. */
export function BeforeAfter({ before, after, labelBefore, labelAfter, hint }: { before: React.ReactNode; after: React.ReactNode; labelBefore: string; labelAfter: string; hint: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(50)
  const drag = useRef(false)
  useEffect(() => {
    // подсказка движением: ручка один раз проходит туда-обратно
    if (document.documentElement.classList.contains('reduce-motion')) return
    let t0 = 0, raf = 0
    const run = (t: number) => {
      if (!t0) t0 = t
      const k = (t - t0) / 2200
      if (k >= 1 || drag.current) return setP(50)
      setP(50 + Math.sin(k * Math.PI * 2) * 22)
      raf = requestAnimationFrame(run)
    }
    const id = setTimeout(() => (raf = requestAnimationFrame(run)), 1400)
    return () => {
      clearTimeout(id)
      cancelAnimationFrame(raf)
    }
  }, [])
  const at = (x: number) => {
    const r = box.current!.getBoundingClientRect()
    setP(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)))
  }
  return (
    <div
      ref={box}
      className="clean-ba"
      style={{ ['--p' as string]: `${p}%` }}
      onPointerDown={(e) => {
        drag.current = true
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        at(e.clientX)
      }}
      onPointerMove={(e) => drag.current && at(e.clientX)}
      onPointerUp={() => (drag.current = false)}
    >
      <div className="clean-ba__after">{after}</div>
      <div className="clean-ba__before">{before}</div>
      <span className="clean-ba__tag clean-ba__tag--l">{labelBefore}</span>
      <span className="clean-ba__tag clean-ba__tag--r">{labelAfter}</span>
      <button
        type="button"
        className="clean-ba__handle"
        aria-label={hint}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setP((x) => Math.max(0, x - 5))
          if (e.key === 'ArrowRight') setP((x) => Math.min(100, x + 5))
        }}
      >
        <span aria-hidden="true">‹ ›</span>
      </button>
    </div>
  )
}
