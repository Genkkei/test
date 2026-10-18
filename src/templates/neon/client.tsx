'use client'

import { useEffect, useRef, useState } from 'react'

export function Rotator({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2300)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span className="neon-rot" aria-live="off">
      <span key={i} className="neon-rot__word">
        {words[i]}
      </span>
    </span>
  )
}

type Group = { name: string; items: { name: string; text: string; price: string }[] }

/** Меню-автомат: кнопки с блюдами; нажатие «печатает» билет с номером. Без JS — обычный список. */
export function TicketMachine({ groups, labels }: { groups: Group[]; labels: { machine: string; ticket: string; hint: string; take: string } }) {
  const [ticket, setTicket] = useState<{ name: string; price: string; no: number } | null>(null)
  const counter = useRef(100)
  return (
    <div className="neon-machine">
      <div className="neon-machine__panel">
        <p className="neon-machine__hint">{labels.hint}</p>
        {groups.map((g, gi) => (
          <div key={gi} className="neon-machine__group">
            <h3 className="neon-machine__gname">{g.name}</h3>
            <ul className="neon-machine__grid">
              {g.items.map((it, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className="neon-key"
                    onClick={() => {
                      counter.current += 1
                      setTicket({ name: it.name, price: it.price, no: counter.current })
                    }}
                  >
                    <span className="neon-key__name">{it.name}</span>
                    {it.text ? <span className="neon-key__text">{it.text}</span> : null}
                    <span className="neon-key__price">{it.price}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <aside className="neon-machine__slot" aria-live="polite">
        <span className="neon-machine__label">{labels.machine} · 券売機</span>
        <div className="neon-machine__mouth" />
        {ticket ? (
          <div key={ticket.no} className="neon-ticket">
            <span className="neon-ticket__head">
              {labels.ticket} № {ticket.no}
            </span>
            <strong>{ticket.name}</strong>
            <span>{ticket.price}</span>
            <small>{labels.take}</small>
          </div>
        ) : (
          <div className="neon-ticket neon-ticket--idle">
            <span className="neon-ticket__head">{labels.ticket}</span>
            <strong>—</strong>
          </div>
        )}
      </aside>
    </div>
  )
}
