'use client'

import { useEffect, useRef } from 'react'

/*
 * Заголовок точечной матрицей, как дисплей Nothing: текст рисуется в скрытый холст, по нему
 * снимается сетка точек, точки разлетаются от курсора и пружиной возвращаются. Пока скрипт не
 * загрузился, виден обычный <h1> — холст лежит поверх и только после первого кадра его прячет.
 */
export function DotMatrix({ text, color, accent }: { text: string; color: string; accent: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const box = wrap.current!, canvas = cv.current!
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = document.documentElement.classList.contains('reduce-motion')
    type Dot = { x: number; y: number; ox: number; oy: number; vx: number; vy: number; red: boolean }
    let dots: Dot[] = [], step = 8, r = 2.6, W = 0, H = 0, raf = 0, mx = -9999, my = -9999, visible = true
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    const build = () => {
      const h1 = box.querySelector('h1') as HTMLElement
      W = box.clientWidth
      const cs = getComputedStyle(h1)
      const size = parseFloat(cs.fontSize)
      step = Math.max(4, Math.round(size / 15))
      r = step * 0.36
      // раскладка строк — та же, что у настоящего заголовка: берём его прямоугольники строк
      const off = document.createElement('canvas')
      H = h1.offsetHeight
      off.width = W; off.height = H
      const o = off.getContext('2d')!
      o.fillStyle = '#000'
      o.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`
      ;(o as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = cs.letterSpacing
      o.textBaseline = 'alphabetic'
      const range = document.createRange()
      const words = h1.textContent || text
      // разбиваем по строкам по позиции слов
      const node = h1.querySelector('span') || h1
      const tn = [...node.childNodes].find((n) => n.nodeType === 3) as Text | undefined
      const base = h1.getBoundingClientRect()
      if (tn) {
        let lineTop = -1, line = '', lineLeft = 0
        const flush = () => { if (line) o.fillText(line.trim(), lineLeft, lineTop + size * 0.84) }
        let i = 0
        for (const w of tn.data.split(/(\s+)/)) {
          if (!w) continue
          range.setStart(tn, i); range.setEnd(tn, i + w.length); i += w.length
          if (/^\s+$/.test(w)) { line += w; continue }
          const rc = range.getBoundingClientRect()
          const top = Math.round(rc.top - base.top)
          if (Math.abs(top - lineTop) > size * 0.4) { flush(); line = ''; lineTop = top; lineLeft = rc.left - base.left }
          line += w
        }
        flush()
      } else {
        o.fillText(words, 0, size * 0.84)
      }
      const data = o.getImageData(0, 0, W, H).data
      const prev = dots
      dots = []
      for (let y = step / 2; y < H; y += step)
        for (let x = step / 2; x < W; x += step) {
          if (data[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 120) {
            const d = prev[dots.length]
            dots.push({ x: d ? d.x : x + (Math.random() - .5) * 300, y: d ? d.y : y + (Math.random() - .5) * 200, ox: x, oy: y, vx: 0, vy: 0, red: Math.random() < 0.025 })
          }
        }
      canvas.width = W * dpr; canvas.height = H * dpr
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduce) dots.forEach((d) => { d.x = d.ox; d.y = d.oy })
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (const d of dots) {
        if (!reduce) {
          const dx = d.x - mx, dy = d.y - my, dist = Math.hypot(dx, dy)
          if (dist < 90) { const f = (90 - dist) / 90 * 2.4; d.vx += (dx / (dist || 1)) * f; d.vy += (dy / (dist || 1)) * f }
          d.vx += (d.ox - d.x) * 0.06; d.vy += (d.oy - d.y) * 0.06
          d.vx *= 0.82; d.vy *= 0.82
          d.x += d.vx; d.y += d.vy
        }
        ctx.fillStyle = d.red ? accent : color
        ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2); ctx.fill()
      }
    }
    const loop = () => { if (visible) draw(); raf = requestAnimationFrame(loop) }

    const move = (e: PointerEvent) => { const b = canvas.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top }
    const leave = () => { mx = my = -9999 }
    const ro = new ResizeObserver(() => build())
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    document.fonts?.ready.then(() => {
      build()
      box.dataset.ready = '1'
      ro.observe(box); io.observe(box)
      if (reduce) draw(); else raf = requestAnimationFrame(loop)
    })
    window.addEventListener('pointermove', move, { passive: true })
    box.addEventListener('pointerleave', leave)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', move); box.removeEventListener('pointerleave', leave) }
  }, [text, color, accent])

  return (
    <div ref={wrap} className="pixel-matrix">
      <h1 className="pixel-hero__title">
        <span>{text}</span>
      </h1>
      <canvas ref={cv} className="pixel-matrix__cv" aria-hidden="true" />
    </div>
  )
}
