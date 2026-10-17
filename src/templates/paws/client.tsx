'use client'

import { useEffect, useRef, useState } from 'react'

/** Следы лап за курсором: каждые ~70 px пути остаётся отпечаток, который тает. */
export function PawTrail() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || document.documentElement.classList.contains('reduce-motion')) return
    const host = ref.current!
    const zone = host.parentElement!
    let lx = -999, ly = -999, flip = false
    const move = (e: PointerEvent) => {
      const r = zone.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const dx = x - lx, dy = y - ly
      if (dx * dx + dy * dy < 70 * 70) return
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90
      lx = x
      ly = y
      flip = !flip
      const paw = document.createElement('span')
      paw.className = 'pw-print'
      const side = flip ? 10 : -10
      const rad = (angle * Math.PI) / 180
      paw.style.left = `${x + Math.cos(rad) * side}px`
      paw.style.top = `${y + Math.sin(rad) * side}px`
      paw.style.rotate = `${angle}deg`
      host.appendChild(paw)
      setTimeout(() => paw.remove(), 1600)
    }
    zone.addEventListener('pointermove', move)
    return () => zone.removeEventListener('pointermove', move)
  }, [])
  return <div ref={ref} className="pw-trail" aria-hidden="true" />
}

/** Кот моргает и поворачивает голову к курсору; на нажатие — «мур». */
export function Cat() {
  const ref = useRef<SVGSVGElement>(null)
  const [purr, setPurr] = useState(false)
  useEffect(() => {
    const svg = ref.current!
    const head = svg.querySelector<SVGGElement>('[data-head]')!
    const move = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth
      const dy = (e.clientY - (r.top + r.height * 0.4)) / window.innerHeight
      head.style.transform = `translate(${(dx * 14).toFixed(1)}px, ${(dy * 8).toFixed(1)}px) rotate(${(dx * 10).toFixed(1)}deg)`
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  useEffect(() => {
    if (!purr) return
    const t = setTimeout(() => setPurr(false), 1400)
    return () => clearTimeout(t)
  }, [purr])
  return (
    <div className="pw-pet">
      <svg ref={ref} viewBox="0 0 300 300" className="pw-cat" role="img" aria-label="Рыжий кот — талисман клиники" onPointerDown={() => setPurr(true)}>
        <ellipse cx="150" cy="284" rx="96" ry="10" fill="var(--fg)" opacity=".1" />
        <path className="pw-cat__tail" d="M222 250 C 286 246, 290 170, 250 150" fill="none" stroke="var(--accent)" strokeWidth="22" strokeLinecap="round" />
        <path d="M78 284 C 70 200, 100 160, 150 160 C 200 160, 230 200, 222 284 Z" fill="var(--accent)" />
        <path d="M118 284 C 116 236, 130 210, 150 210 C 170 210, 184 236, 182 284 Z" fill="#fff4e4" />
        <g data-head className="pw-cat__head">
          <path d="M84 70 L 96 18 L 132 52 Z" fill="var(--accent)" />
          <path d="M216 70 L 204 18 L 168 52 Z" fill="var(--accent)" />
          <path d="M98 56 L 101 34 L 120 52 Z" fill="#ffc9a8" />
          <path d="M202 56 L 199 34 L 180 52 Z" fill="#ffc9a8" />
          <ellipse cx="150" cy="104" rx="76" ry="64" fill="var(--accent)" />
          <path d="M126 50 q 4 14 0 26 M150 46 q 4 16 0 30 M174 50 q -4 14 0 26" stroke="color-mix(in srgb, var(--accent) 70%, black)" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".45" />
          <g className="pw-cat__eyes">
            <ellipse cx="122" cy="102" rx="10" ry="13" fill="var(--fg)" />
            <ellipse cx="178" cy="102" rx="10" ry="13" fill="var(--fg)" />
            <circle cx="125" cy="97" r="3.5" fill="#fff" />
            <circle cx="181" cy="97" r="3.5" fill="#fff" />
          </g>
          <path d="M143 122 h 14 l -7 8 z" fill="#ff8fa0" />
          <path d="M150 130 q -6 10 -16 8 M150 130 q 6 10 16 8" stroke="var(--fg)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M96 118 h -34 M98 128 l -32 8 M204 118 h 34 M202 128 l 32 8" stroke="var(--fg)" strokeWidth="2.5" strokeLinecap="round" opacity=".5" />
        </g>
      </svg>
      <span className="pw-purr" data-on={purr || undefined} aria-hidden="true">
        мур-р!
      </span>
    </div>
  )
}

/** Шапка с прокруткой: появляется тень. */
export function PawsHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-solid', window.scrollY > 20)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="pw-header">
      {children}
    </header>
  )
}
