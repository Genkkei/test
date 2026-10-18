'use client'

import { useEffect, useRef, useState } from 'react'
import { FurnitureObject, kindOf } from './objects'

/* Подиумы первого экрана: три предмета на цветных постаментах, как в лукбуках HAY.
 * Чипы «палитра сезона» перекрашивают постаменты; предметы чуть следуют за курсором. */
export function PodiumStage({ seasons, label, body, wood, line }: { seasons: { name: string; colors: string[] }[]; label: string; body: string[]; wood: string; line: string }) {
  const [i, setI] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover)').matches) return
    let raf = 0
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--oak-mx', String((e.clientX - r.left) / r.width - 0.5))
        el.style.setProperty('--oak-my', String((e.clientY - r.top) / r.height - 0.5))
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  const c = seasons[i]?.colors ?? seasons[0].colors
  return (
    <div className="oak-stage" ref={ref}>
      <div className="oak-stage__set">
        <div className="oak-pod oak-pod--arch" style={{ background: c[0] }}>
          <FurnitureObject kind="lamp" body={body[0]} wood={wood} line={line} className="oak-pod__obj" />
        </div>
        <div className="oak-pod oak-pod--round" style={{ background: c[1] }}>
          <FurnitureObject kind="armchair" body={body[1]} wood={wood} line={line} className="oak-pod__obj" />
        </div>
        <div className="oak-pod oak-pod--box" style={{ background: c[2] }}>
          <FurnitureObject kind="vase" body={body[2]} wood={wood} line={line} className="oak-pod__obj" />
        </div>
      </div>
      <div className="oak-stage__chips" role="group" aria-label={label}>
        <span>{label}</span>
        {seasons.map((s, n) => (
          <button key={s.name} type="button" aria-pressed={n === i} title={s.name} onClick={() => setI(n)} style={{ ['--oak-a' as string]: s.colors[0], ['--oak-b' as string]: s.colors[1] }}>
            <span className="oak-sr">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

type Item = { title: string; text: string; price: string; tag: string }

/* Каталог: фильтр по категории — без перезагрузки; без скрипта видны все карточки. */
export function Catalog({ items, all, add, href, tiles, body, wood, line }: { items: Item[]; all: string; add: string; href: string; tiles: string[]; body: string[]; wood: string; line: string }) {
  const tags = [...new Set(items.map((i) => i.tag).filter(Boolean))]
  const [tag, setTag] = useState('')
  return (
    <>
      {tags.length > 1 ? (
        <div className="oak-filter" role="group">
          <button type="button" aria-pressed={!tag} onClick={() => setTag('')}>
            {all}
          </button>
          {tags.map((t) => (
            <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(t)}>
              {t}
            </button>
          ))}
        </div>
      ) : null}
      <ul className="oak-grid">
        {items.map((it, n) => (
          <li key={n} className="oak-card" hidden={!!tag && it.tag !== tag} data-reveal="up" data-delay={String((n % 4) * 0.06)}>
            <div className="oak-card__tile" style={{ background: tiles[n % tiles.length] }}>
              <FurnitureObject kind={kindOf(it.tag, it.title)} body={body[n % body.length]} wood={wood} line={line} className="oak-card__obj" title={it.title} />
              {it.tag ? <span className="oak-card__tag">{it.tag}</span> : null}
            </div>
            <div className="oak-card__info">
              <h3>{it.title}</h3>
              {it.price ? <p className="oak-card__price">{it.price}</p> : null}
            </div>
            {it.text ? <p className="oak-card__text">{it.text}</p> : null}
            <a className="oak-card__add" href={href} aria-label={`${add}: ${it.title}`}>
              + {add}
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
