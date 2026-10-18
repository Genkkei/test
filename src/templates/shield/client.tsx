'use client'

import { useState } from 'react'
import { Icon } from './icons'

type Item = { title: string; text: string; price: string; tag: string }

/** «Что защитить?» — вкладки как в Lemonade: слева выбор, справа карточка полиса. Все карточки есть в HTML. */
export function Picker({ items, cta, ctaHref, fromLabel }: { items: Item[]; cta: string; ctaHref: string; fromLabel: string }) {
  const [a, setA] = useState(0)
  return (
    <div className="shield-picker">
      <div className="shield-picker__tabs" role="tablist">
        {items.map((it, i) => (
          <button key={i} type="button" role="tab" aria-selected={a === i} className={a === i ? 'is-on' : ''} onClick={() => setA(i)}>
            <Icon i={i} />
            <span>{it.title}</span>
          </button>
        ))}
      </div>
      <div className="shield-picker__panels">
        {items.map((it, i) => (
          <article key={i} role="tabpanel" className={`shield-policy${a === i ? ' is-on' : ''}`} aria-hidden={a !== i}>
            <div className="shield-policy__icon">
              <Icon i={i} />
            </div>
            {it.tag ? <p className="shield-policy__tag">{it.tag}</p> : null}
            <h3>{it.title}</h3>
            <p className="shield-policy__text">{it.text}</p>
            <div className="shield-policy__foot">
              {it.price ? (
                <p className="shield-policy__price">
                  <small>{fromLabel}</small>
                  {it.price}
                </p>
              ) : null}
              <a className="shield-btn" href={ctaHref} tabIndex={a === i ? 0 : -1}>
                {cta}
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
