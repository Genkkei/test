'use client'

import { useEffect, useRef, useState } from 'react'

/** Поли — маскот из геометрии: глаза следят за курсором, моргает, на нажатие подпрыгивает. */
export function Mascot({ className = 'pl-mascot', label }: { className?: string; label: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const [jump, setJump] = useState(0)
  useEffect(() => {
    const svg = ref.current!
    const pupils = [...svg.querySelectorAll<SVGCircleElement>('[data-pupil]')]
    let raf = 0
    let tx = 0, ty = 0, x = 0, y = 0
    const move = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height * 0.42)
      const d = Math.hypot(dx, dy) || 1
      const k = Math.min(1, d / 300)
      tx = (dx / d) * 7 * k
      ty = (dy / d) * 7 * k
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const loop = () => {
      x += (tx - x) * 0.18
      y += (ty - y) * 0.18
      pupils.forEach((p) => p.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`))
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(loop) : 0
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <svg ref={ref} className={className} viewBox="0 0 240 260" role="img" aria-label={label} onPointerDown={() => setJump((j) => j + 1)} data-jump={jump % 2}>
      <ellipse cx="120" cy="248" rx="70" ry="9" fill="currentColor" opacity=".12" className="pl-mascot__shadow" />
      <g className="pl-mascot__body">
        <rect x="58" y="150" width="124" height="82" rx="38" fill="var(--c2)" />
        <circle cx="120" cy="104" r="86" fill="var(--accent)" />
        <path d="M60 40 L78 4 L98 34Z" fill="var(--c3)" />
        <path d="M142 34 L164 2 L180 44Z" fill="var(--c1)" />
        <g className="pl-mascot__eyes">
          <circle cx="88" cy="96" r="25" fill="#fff" />
          <circle cx="152" cy="96" r="25" fill="#fff" />
          <circle cx="88" cy="96" r="11" fill="var(--fg)" data-pupil />
          <circle cx="152" cy="96" r="11" fill="var(--fg)" data-pupil />
        </g>
        <path d="M100 140 Q120 160 140 140" fill="none" stroke="var(--fg)" strokeWidth="7" strokeLinecap="round" />
        <circle cx="66" cy="132" r="9" fill="var(--c4)" opacity=".8" />
        <circle cx="174" cy="132" r="9" fill="var(--c4)" opacity=".8" />
        <rect x="16" y="150" width="48" height="22" rx="11" fill="var(--c2)" className="pl-mascot__arm" />
      </g>
    </svg>
  )
}

/** Фигуры первого экрана немного разъезжаются от курсора — как будто их можно толкнуть. */
export function Playground({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches || document.documentElement.classList.contains('reduce-motion')) return
    const root = ref.current!
    const shapes = [...root.querySelectorAll<HTMLElement>('[data-depth]')]
    let raf = 0
    let mx = 0, my = 0
    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      mx = (e.clientX - r.left) / r.width - 0.5
      my = (e.clientY - r.top) / r.height - 0.5
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const apply = () => {
      raf = 0
      shapes.forEach((s) => {
        const d = Number(s.dataset.depth)
        s.style.translate = `${(-mx * d * 60).toFixed(1)}px ${(-my * d * 60).toFixed(1)}px`
      })
    }
    root.addEventListener('pointermove', move)
    return () => root.removeEventListener('pointermove', move)
  }, [])
  return (
    <div ref={ref} className="pl-playground">
      {children}
    </div>
  )
}

/** Шапка-«пилюля»: при прокрутке поднимается тень. */
export function PlayHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-lifted', window.scrollY > 20)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="pl-header">
      {children}
    </header>
  )
}
