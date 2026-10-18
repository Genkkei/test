'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Кривая обжарки: температура зерна во времени. Линия прорисовывается вместе с прокруткой
 * секции, этапы — точки на кривой, загораются, когда линия до них дошла.
 */
export function RoastCurve({ steps, axis }: { steps: { title: string; text: string }[]; axis: [string, string] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(1)
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion')) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const v = (window.innerHeight * 0.8 - r.top) / (r.height * 0.9)
        setP(Math.max(0, Math.min(1, v)))
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
  const n = steps.length
  // классическая кривая обжарки: после загрузки температура зерна проседает, затем растёт и выходит на плато
  const yAt = (t: number) => (t < 0.12 ? 130 + 70 * Math.sin(((t / 0.12) * Math.PI) / 2) : 200 - 155 * Math.sqrt((t - 0.12) / 0.88))
  const xAt = (t: number) => 40 + t * 920
  const d = Array.from({ length: 61 }, (_, i) => i / 60).map((t, i) => `${i ? 'L' : 'M'}${xAt(t).toFixed(1)} ${yAt(t).toFixed(1)}`).join(' ')
  const pts = steps.map((_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1)
    return { x: xAt(t), y: yAt(t) }
  })
  return (
    <div ref={ref} className="reserve-curve" style={{ ['--reserve-p' as string]: String(p) }}>
      <svg viewBox="0 0 1000 300" className="reserve-curve__svg" aria-hidden="true">
        {[60, 120, 180, 240].map((y) => (
          <line key={y} x1="30" x2="970" y1={y} y2={y} className="reserve-curve__grid" />
        ))}
        <path d={d} className="reserve-curve__line" pathLength={1} />
        {pts.map((q, i) => (
          <circle key={i} cx={q.x} cy={q.y} r="9" className={`reserve-curve__dot${p >= (i + 0.3) / n ? ' is-on' : ''}`} />
        ))}
        <text x="34" y="292" className="reserve-curve__axis">
          {axis[0]}
        </text>
        <text x="966" y="292" textAnchor="end" className="reserve-curve__axis">
          {axis[1]}
        </text>
      </svg>
      <ol className="reserve-curve__steps">
        {steps.map((s, i) => (
          <li key={i} className={p >= (i + 0.3) / n ? 'is-on' : ''}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
