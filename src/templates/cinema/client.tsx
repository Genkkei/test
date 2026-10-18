'use client'

import { useEffect, useState } from 'react'

/** Интертитры немого кино: слова первого экрана сменяются карточками с мерцанием. Первое есть в HTML. */
export function Titles({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 1900)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <p className="cinema-titles" aria-live="off">
      <span key={i} className="cinema-titles__card">
        {words[i]}
      </span>
    </p>
  )
}

/** Дни афиши вкладками. Без скрипта видны все дни подряд. */
export function DayTabs({ days, children, label }: { days: string[]; children: React.ReactNode[]; label: string }) {
  const [on, setOn] = useState(0)
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  return (
    <div className={`cinema-tabs${ready ? ' is-ready' : ''}`}>
      <div className="cinema-tabs__bar" role="tablist" aria-label={label}>
        {days.map((d, i) => (
          <button key={d} type="button" role="tab" aria-selected={on === i} className={on === i ? 'is-on' : ''} onClick={() => setOn(i)}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            {d}
          </button>
        ))}
      </div>
      {children.map((c, i) => (
        <div key={i} className={`cinema-day${on === i ? ' is-on' : ''}`} role="tabpanel">
          {c}
        </div>
      ))}
    </div>
  )
}
