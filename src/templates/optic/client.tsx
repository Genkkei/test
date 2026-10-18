'use client'

import { useEffect, useRef, useState } from 'react'
import { Frame, SHAPES, lensPath, type Shape } from './frames'

/*
 * Примерочная первого экрана: оправа меняет форму и цвет, а в линзах — глаза, которые следят
 * за курсором (на телефоне — плавают сами). Только transform, никакой перерисовки разметки.
 */
export function TryOn({ shapes, colors, label }: { shapes: string[]; colors: { name: string; value: string }[]; label: string }) {
  const [shape, setShape] = useState<Shape>('round')
  const [color, setColor] = useState(0)
  const svg = useRef<SVGSVGElement>(null)
  const eyes = useRef<(SVGGElement | null)[]>([])

  useEffect(() => {
    const el = svg.current!
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, last = performance.now()
    const reduce = document.documentElement.classList.contains('reduce-motion')
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
      const len = Math.hypot(dx, dy) || 1
      const k = Math.min(1, len / 400)
      tx = (dx / len) * 14 * k
      ty = (dy / len) * 10 * k
      last = performance.now()
    }
    const loop = (t: number) => {
      // без курсора глаза сами осматриваются
      if (t - last > 2500) { tx = Math.sin(t / 1300) * 12; ty = Math.cos(t / 1700) * 6 }
      x += (tx - x) * 0.12; y += (ty - y) * 0.12
      eyes.current.forEach((g) => g && g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`))
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move, { passive: true })
    if (!reduce) raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move) }
  }, [])

  const c = colors[color]?.value ?? 'currentColor'
  return (
    <div className="optic-tryon">
      <svg ref={svg} viewBox="-20 -10 440 180" className="optic-tryon__svg" role="img" aria-label={label} style={{ ['--frame' as string]: c }}>
        <defs>
          {[110, 290].map((cx, i) => (
            <clipPath key={cx} id={`optic-clip-${i}`}>
              <path d={lensPath(shape)} transform={`translate(${cx} 80)${i ? ' scale(-1 1)' : ''}`} />
            </clipPath>
          ))}
        </defs>
        {[110, 290].map((cx, i) => (
          <g key={cx} clipPath={`url(#optic-clip-${i})`}>
            <g ref={(n) => { eyes.current[i] = n }}>
              <ellipse cx={cx} cy={84} rx={30} ry={20} className="optic-eye" />
              <circle cx={cx} cy={84} r={13} className="optic-iris" />
              <circle cx={cx} cy={84} r={6} className="optic-pupil" />
              <circle cx={cx + 4} cy={79} r={2.5} className="optic-glint" />
            </g>
          </g>
        ))}
        <g key={shape} className="optic-pop">
          <Frame shape={shape} className="optic-frame" />
        </g>
      </svg>
      <div className="optic-tryon__controls">
        <div className="optic-seg" role="radiogroup" aria-label={label}>
          {SHAPES.map((s, i) => (
            <button key={s} type="button" role="radio" aria-checked={shape === s} className={shape === s ? 'is-on' : ''} onClick={() => setShape(s)}>
              {shapes[i] ?? s}
            </button>
          ))}
        </div>
        <div className="optic-swatches">
          {colors.map((cl, i) => (
            <button key={cl.value} type="button" aria-label={cl.name} title={cl.name} aria-pressed={color === i} className={color === i ? 'is-on' : ''} style={{ background: cl.value }} onClick={() => setColor(i)} />
          ))}
        </div>
      </div>
    </div>
  )
}
