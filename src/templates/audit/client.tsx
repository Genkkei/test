'use client'

import { useEffect, useRef, useState } from 'react'

/** Галочки закрытия месяца ставятся по одной, когда карточка в кадре; потом цикл начинается заново. */
export function Checklist({ items, done }: { items: string[]; done: string }) {
  const ref = useRef<HTMLOListElement>(null)
  const [n, setN] = useState(items.length)
  useEffect(() => {
    if (document.documentElement.classList.contains('reduce-motion')) return
    let id = 0
    let on = false
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting
    })
    io.observe(ref.current!)
    setN(0)
    id = window.setInterval(() => {
      if (!on) return
      setN((x) => (x > items.length + 2 ? 0 : x + 1))
    }, 900)
    return () => {
      clearInterval(id)
      io.disconnect()
    }
  }, [items.length])
  return (
    <>
      <ol ref={ref} className="audit-check">
        {items.map((it, i) => (
          <li key={i} className={i < n ? 'is-done' : ''}>
            <i aria-hidden="true" />
            <span>{it}</span>
          </li>
        ))}
      </ol>
      <p className={`audit-check__done${n >= items.length ? ' is-on' : ''}`}>{done}</p>
    </>
  )
}
