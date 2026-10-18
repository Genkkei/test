'use client'

import { useEffect, useRef } from 'react'

/**
 * Капли туши за курсором: 2D-холст размером с первый экран, капля растекается и гаснет.
 * Рисуем, только пока экран виден; при reduced motion — ничего.
 */
export function InkTrail({ color }: { color: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    if (document.documentElement.classList.contains('reduce-motion') || !window.matchMedia('(hover: hover)').matches) return
    const ctx = c.getContext('2d')!
    const drops: { x: number; y: number; r: number; a: number; v: number }[] = []
    let raf = 0, visible = true, lx = -1, ly = -1
    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 1.5)
      c.width = c.clientWidth * d
      c.height = c.clientHeight * d
      ctx.setTransform(d, 0, 0, d, 0, 0)
    }
    size()
    const move = (e: PointerEvent) => {
      const b = c.getBoundingClientRect()
      const x = e.clientX - b.left, y = e.clientY - b.top
      if (y < 0 || y > b.height) return
      const dist = lx < 0 ? 99 : Math.hypot(x - lx, y - ly)
      if (dist < 14) return
      lx = x
      ly = y
      drops.push({ x, y, r: 2 + Math.random() * 3, a: 0.9, v: 0.35 + Math.random() * 0.5 })
      if (drops.length > 90) drops.shift()
    }
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      ctx.clearRect(0, 0, c.clientWidth, c.clientHeight)
      ctx.fillStyle = color
      for (const d of drops) {
        d.r += d.v
        d.v *= 0.97
        d.a *= 0.975
        ctx.globalAlpha = d.a * 0.55
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
      while (drops.length && drops[0].a < 0.02) drops.shift()
    }
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(c)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('resize', size)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('resize', size)
    }
  }, [color])
  return <canvas ref={ref} className="ink-trail" aria-hidden="true" />
}
