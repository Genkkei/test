'use client'

import { useEffect, useRef, useState } from 'react'

/* Шоурум первого экрана: бархатный диван под софитом. Софит идёт за курсором, образцы ткани
 * перекрашивают обивку — блик бархата нарисован градиентами, поэтому цвет меняется целиком. */

export type Fabric = { name: string; color: string }

function Sofa({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 640 300" className="velvet-sofa" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-sheen`} cx=".5" cy=".2" r=".7">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".45" />
        </linearGradient>
      </defs>
      <ellipse cx="320" cy="282" rx="290" ry="14" fill="#000" opacity=".45" />
      {/* спинка — три мягкие подушки-валика */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={70 + i * 170} y="40" width="160" height="130" rx="60" style={{ fill: "var(--velvet-c)" }} />
          <rect x={70 + i * 170} y="40" width="160" height="130" rx="60" fill={`url(#${id}-sheen)`} />
          <rect x={70 + i * 170} y="40" width="160" height="130" rx="60" fill={`url(#${id}-shade)`} />
        </g>
      ))}
      {/* подлокотники */}
      {[18, 562].map((x) => (
        <g key={x}>
          <rect x={x} y="96" width="60" height="160" rx="30" style={{ fill: "var(--velvet-c)" }} />
          <rect x={x} y="96" width="60" height="160" rx="30" fill={`url(#${id}-sheen)`} />
          <rect x={x} y="96" width="60" height="160" rx="30" fill={`url(#${id}-shade)`} />
        </g>
      ))}
      {/* сиденье */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={72 + i * 167} y="160" width="164" height="70" rx="26" style={{ fill: "var(--velvet-c)" }} />
          <rect x={72 + i * 167} y="160" width="164" height="70" rx="26" fill={`url(#${id}-sheen)`} />
          <path d={`M${88 + i * 167} 168 Q${154 + i * 167} 158 ${220 + i * 167} 168`} stroke="#fff" strokeOpacity=".18" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      ))}
      <rect x="60" y="226" width="520" height="36" rx="14" style={{ fill: "var(--velvet-c)" }} />
      <rect x="60" y="226" width="520" height="36" rx="14" fill={`url(#${id}-shade)`} />
      {/* латунные ножки */}
      {[96, 544].map((x) => (
        <path key={x} d={`M${x} 262 L${x + 6} 284 L${x + 14} 284 L${x + 8} 262 Z`} style={{ fill: "var(--accent)" }} />
      ))}
    </svg>
  )
}

export function Showroom({ fabrics, label }: { fabrics: Fabric[]; label: string }) {
  const [i, setI] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--velvet-x', `${((e.clientX - r.left) / r.width) * 100}%`)
        el.style.setProperty('--velvet-y', `${((e.clientY - r.top) / r.height) * 100}%`)
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  const f = fabrics[i] ?? fabrics[0]
  return (
    <div className="velvet-room" ref={ref} style={{ ['--velvet-c' as string]: f.color }}>
      <div className="velvet-room__light" aria-hidden="true" />
      <Sofa id="vs" />
      <div className="velvet-fabrics" role="group" aria-label={label}>
        <p className="velvet-fabrics__name" aria-live="polite">
          <span>{label}</span> {f.name}
        </p>
        <div className="velvet-fabrics__list">
          {fabrics.map((x, n) => (
            <button key={x.name} type="button" title={x.name} aria-pressed={n === i} onClick={() => setI(n)} style={{ background: x.color }}>
              <span className="velvet-sr">{x.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
