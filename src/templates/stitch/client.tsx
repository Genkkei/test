'use client'

import { useEffect, useRef } from 'react'

/** Сантиметровая лента: бегущая шкала с делениями, сдвиг привязан к прокрутке страницы. */
export function Tape({ className = 'stitch-tape' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion')) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => el.style.setProperty('--shift', `${-(window.scrollY * 0.35) % 400}px`))
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
    }
  }, [])
  const marks = Array.from({ length: 60 }, (_, i) => i)
  return (
    <div ref={ref} className={className} aria-hidden="true">
      <div className="stitch-tape__track">
        {marks.map((i) => (
          <span key={i} className="stitch-tape__cm">
            <b>{i % 10 === 0 ? i : ''}</b>
          </span>
        ))}
      </div>
    </div>
  )
}

/** Нить: пунктир «прошивается» один раз, когда блок попадает в кадр. */
export function Seam({ d, className = 'stitch-seam', viewBox = '0 0 1200 120' }: { d: string; className?: string; viewBox?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const el = ref.current!
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-sewn')
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <svg ref={ref} className={className} viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true">
      <path className="stitch-seam__thread" d={d} pathLength={1} />
      <path className="stitch-seam__dash" d={d} />
    </svg>
  )
}
