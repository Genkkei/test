'use client'

import { useEffect, useRef, useState } from 'react'

/** Окна квартала зажигаются и гаснут по одному, как вечером. */
export function Windows({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion')) return
    const wins = Array.from(el.querySelectorAll<SVGRectElement>('.nest-win'))
    if (!wins.length) return
    const id = setInterval(() => {
      for (let k = 0; k < 3; k++) wins[Math.floor(Math.random() * wins.length)].classList.toggle('is-on')
    }, 380)
    return () => clearInterval(id)
  }, [])
  return (
    <div ref={ref} className="nest-hero__sky">
      {children}
    </div>
  )
}

type Plan = { title: string; area: string; price: string; text: string; plan: React.ReactNode }

/** Планировки: вкладки по типам; все чертежи в разметке, видим один. */
export function Plans({ items, label, areaLabel, priceLabel }: { items: Plan[]; label: string; areaLabel: string; priceLabel: string }) {
  const [i, setI] = useState(0)
  return (
    <div className="nest-plans">
      <div className="nest-plans__tabs" role="tablist" aria-label={label}>
        {items.map((it, k) => (
          <button key={k} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)}>
            {it.title}
          </button>
        ))}
      </div>
      <div className="nest-plans__stage">
        {items.map((it, k) => (
          <article key={k} className={`nest-plans__item${k === i ? ' is-on' : ''}`} aria-hidden={k !== i}>
            <div className="nest-plans__draw">{it.plan}</div>
            <div className="nest-plans__info">
              <h3>{it.title}</h3>
              <dl>
                {it.area ? (
                  <div>
                    <dt>{areaLabel}</dt>
                    <dd>{it.area}</dd>
                  </div>
                ) : null}
                {it.price ? (
                  <div>
                    <dt>{priceLabel}</dt>
                    <dd>{it.price}</dd>
                  </div>
                ) : null}
              </dl>
              {it.text ? <p>{it.text}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
