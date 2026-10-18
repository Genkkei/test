'use client'

import { useEffect, useRef, useState } from 'react'

type Item = { name: string; text: string; price: string }

/**
 * Меню-табло с выбором размера. Цена «16 000 / 20 000 / 24 000 сум» читается как три размера:
 * кнопки S·M·L переключают все цены разом. Без скрипта видна строка цен целиком.
 */
export function SizeBoard({ groups, sizes, orderHref, orderLabel }: { groups: { name: string; items: Item[] }[]; sizes: string[]; orderHref: string; orderLabel: string }) {
  const [size, setSize] = useState(1)
  const [js, setJs] = useState(false)
  useEffect(() => setJs(true), [])
  const show = (price: string) => {
    if (!js) return price
    const parts = price.split('/').map((p) => p.trim())
    if (parts.length < 3) return price
    const unit = parts[2].replace(/^[\d\s.,]+/, '')
    const pick = parts[size].replace(/[^\d\s.,]+$/, '').trim()
    return `${pick} ${unit}`.trim()
  }
  return (
    <div className="kiosk-board">
      <div className="kiosk-sizes" role="group" aria-label="size">
        {sizes.map((s, i) => (
          <button key={s} type="button" className={i === size ? 'is-on' : ''} onClick={() => setSize(i)} aria-pressed={i === size}>
            <b>{['S', 'M', 'L'][i]}</b>
            <small>{s}</small>
          </button>
        ))}
      </div>
      {groups.map((g, gi) => (
        <div key={gi} className="kiosk-board__group">
          <h3 className="kiosk-board__name">{g.name}</h3>
          <ul className="kiosk-board__grid">
            {g.items.map((it, i) => (
              <li key={i} className="kiosk-tile" data-reveal="up" data-delay={String((i % 4) * 0.06)}>
                <span className="kiosk-tile__num">{String(gi * 10 + i + 1).padStart(2, '0')}</span>
                <h4>{it.name}</h4>
                {it.text ? <p>{it.text}</p> : null}
                <span className="kiosk-tile__foot">
                  <span key={size} className="kiosk-tile__price">
                    {show(it.price)}
                  </span>
                  <a className="kiosk-tile__add" href={orderHref} aria-label={`${orderLabel}: ${it.name}`}>
                    +
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/** Стакан наклоняется вслед за прокруткой, как будто его несут к окошку. */
export function TiltCup({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion')) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => el.style.setProperty('--kiosk-tilt', `${Math.min(window.scrollY * 0.04, 18)}deg`))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
    }
  }, [])
  return (
    <div ref={ref} className="kiosk-cupwrap">
      {children}
    </div>
  )
}

/** Номер «готовится» на табло: крутится вверх каждые 2,4 с. */
export function Ticket({ label }: { label: string }) {
  const [n, setN] = useState(47)
  useEffect(() => {
    if (document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setN((x) => (x >= 99 ? 12 : x + 1)), 2400)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="kiosk-ticket" aria-hidden="true">
      <small>{label}</small>
      <b key={n}>№{n}</b>
    </span>
  )
}
