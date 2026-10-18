'use client'

import { useEffect, useState } from 'react'

/**
 * Трекер заявки на первом экране: статусы из hero.words переключаются по кругу,
 * время приезда убывает, машинка едет по пунктиру. Первый статус есть в HTML.
 */
export function Tracker({ steps, eta, labels }: { steps: string[]; eta: number; labels: { order: string; eta: string; min: string; pro: string } }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (steps.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % steps.length), 2600)
    return () => clearInterval(id)
  }, [steps.length])
  const left = Math.max(0, Math.round(eta * (1 - i / Math.max(1, steps.length - 1))))
  return (
    <div className="pipe-track" data-step={i} style={{ ['--p' as string]: String(i / Math.max(1, steps.length - 1)) }}>
      <div className="pipe-track__top">
        <span className="pipe-track__id">{labels.order} №&nbsp;24‑0817</span>
        <span className="pipe-track__live">
          <i aria-hidden="true" /> live
        </span>
      </div>
      <div className="pipe-track__map" aria-hidden="true">
        <svg viewBox="0 0 320 150" preserveAspectRatio="none">
          <path className="pipe-track__grid" d="M0 30H320M0 75H320M0 120H320M60 0V150M140 0V150M220 0V150M290 0V150" />
          <path className="pipe-track__road" d="M24 124 C 80 124, 90 40, 150 52 S 230 118, 296 30" pathLength={1} />
          <path className="pipe-track__done" d="M24 124 C 80 124, 90 40, 150 52 S 230 118, 296 30" pathLength={1} />
        </svg>
        <span className="pipe-track__pin" />
        <span className="pipe-track__car" />
      </div>
      <div className="pipe-track__eta">
        <span>{labels.eta}</span>
        <b suppressHydrationWarning>
          {left} <small>{labels.min}</small>
        </b>
      </div>
      <ol className="pipe-track__steps">
        {steps.map((s, k) => (
          <li key={s} className={k < i ? 'is-done' : k === i ? 'is-now' : ''}>
            <i aria-hidden="true" />
            {s}
          </li>
        ))}
      </ol>
      <div className="pipe-track__pro">
        <span className="pipe-track__ava" aria-hidden="true">
          {labels.pro.trim()[0]}
        </span>
        <span>{labels.pro}</span>
      </div>
    </div>
  )
}
