'use client'

import { useEffect, useRef, useState } from 'react'

/*
 * Ритуал заваривания: слева закреплённая воронка, справа шаги. Активный шаг — тот,
 * что пересёк середину экрана; уровень воды в воронке и в чашке = доля пройденных шагов.
 * Без скрипта видны все шаги, воронка просто стоит наполненной наполовину.
 */
export function Ritual({ steps, stepLabel }: { steps: { title: string; text: string }[]; stepLabel: string }) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLLIElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [steps.length])

  const fill = steps.length ? (active + 1) / steps.length : 0.5
  return (
    <div className="brew-ritual" style={{ ['--brew-fill' as string]: fill }}>
      <div className="brew-ritual__stage" aria-hidden="true">
        <svg className="brew-ritual__v60" viewBox="0 0 220 300">
          <defs>
            <clipPath id="brew-cone">
              <path d="M30 40 H190 L124 140 H96 Z" />
            </clipPath>
            <clipPath id="brew-cup">
              <path d="M44 196 H176 V226 C176 270 150 286 110 286 C70 286 44 270 44 226 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#brew-cone)">
            <rect className="brew-ritual__bloom" x="0" y="0" width="220" height="140" />
          </g>
          <g clipPath="url(#brew-cup)">
            <rect className="brew-ritual__coffee" x="0" y="0" width="220" height="290" />
          </g>
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M30 40 H190 L124 140 H96 Z" />
            <path d="M92 140 h36 v10 h-36 z" />
            <path d="M44 196 H176 V226 C176 270 150 286 110 286 C70 286 44 270 44 226 Z" />
            <path d="M176 210 C204 210 206 250 176 254" />
          </g>
          <path className="brew-ritual__stream" d="M110 150 V196" />
        </svg>
        <p className="brew-ritual__count">
          {stepLabel} <b>{String(active + 1).padStart(2, '0')}</b> / {String(steps.length).padStart(2, '0')}
        </p>
      </div>
      <ol className="brew-ritual__steps">
        {steps.map((st, i) => (
          <li
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            data-i={i}
            className={`brew-ritual__step${i === active ? ' is-on' : ''}${i < active ? ' is-done' : ''}`}
          >
            <span className="brew-ritual__no">{String(i + 1).padStart(2, '0')}</span>
            <h3>{st.title}</h3>
            <p>{st.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
