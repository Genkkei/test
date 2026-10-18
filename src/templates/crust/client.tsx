'use client'

import { useEffect, useRef, useState } from 'react'

/** Пицца вращается вместе с прокруткой: угол пишется в CSS-переменную, кадр — один rAF. */
export function SpinPizza({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion')) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => el.style.setProperty('--spin', `${window.scrollY * 0.18}deg`))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
    }
  }, [])
  return (
    <div ref={ref} className="crust-spin">
      {children}
    </div>
  )
}

/** Трек доставки: курьер едет по линии по мере прокрутки секции, пройденные шаги загораются. */
export function Tracker({ steps }: { steps: { title: string; text: string }[] }) {
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
        const v = (window.innerHeight * 0.8 - r.top) / (r.height + window.innerHeight * 0.3)
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
  return (
    <div ref={ref} className="crust-track" style={{ ['--crust-p' as string]: String(p) }}>
      <div className="crust-track__line" aria-hidden="true">
        <span className="crust-track__fill" />
        <span className="crust-track__rider">
          <svg viewBox="0 0 64 44">
            <circle cx="14" cy="34" r="8" fill="#fff3e2" stroke="#1d1a16" strokeWidth="3" />
            <circle cx="50" cy="34" r="8" fill="#fff3e2" stroke="#1d1a16" strokeWidth="3" />
            <path d="M14 34 L24 22 H42 L50 34 M42 22 L46 10 H54" fill="none" stroke="#1d1a16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="4" y="6" width="22" height="16" rx="3" fill="#e63b1e" stroke="#1d1a16" strokeWidth="3" />
          </svg>
        </span>
      </div>
      <ol className="crust-track__steps">
        {steps.map((s, i) => (
          <li key={i} className={`crust-track__step${p >= (i + 0.2) / n ? ' is-on' : ''}`}>
            <span className="crust-track__dot">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
