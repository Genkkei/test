'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

/** Живая панель показателей: точки въезжают в диапазоны, кривая пишется заново каждые несколько секунд. */
export function Panel({ markers, title, ok, live }: { markers: { name: string; v: number }[]; title: string; ok: string; live: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const el = ref.current!
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-on', e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    if (document.documentElement.classList.contains('reduce-motion')) return () => io.disconnect()
    const id = setInterval(() => setTick((x) => x + 1), 3200)
    return () => {
      io.disconnect()
      clearInterval(id)
    }
  }, [])
  // кривая — суммой синусов от номера такта: в SSR и первом кадре одинаковая
  const path = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= 60; i++) {
      const x = (i / 60) * 300
      const y = 40 + Math.sin(i * 0.35 + tick) * 12 + Math.sin(i * 0.9 + tick * 1.7) * 6 + (i % 15 === 7 ? -18 : 0)
      pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [tick])
  return (
    <div ref={ref} className="lb-panel">
      <div className="lb-panel__head">
        <span>{title}</span>
        <span className="lb-live">
          <i />
          {live}
        </span>
      </div>
      <svg className="lb-panel__wave" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true">
        <path key={tick} d={path} pathLength={1} />
      </svg>
      <ul className="lb-panel__list">
        {markers.map((m, i) => {
          const v = Math.min(0.92, Math.max(0.08, m.v + Math.sin(tick * 1.3 + i) * 0.04))
          return (
            <li key={m.name} style={{ ['--v' as string]: v, ['--d' as string]: `${i * 90}ms` }}>
              <span className="lb-panel__name">{m.name}</span>
              <span className="lb-range" aria-hidden="true">
                <b />
                <i />
              </span>
              <span className="lb-panel__ok">{ok}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Каталог анализов с фильтром по разделу: без скрипта видно всё. */
export function Catalog({ all, groups, children }: { all: string; groups: string[]; children: React.ReactNode }) {
  const [g, setG] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current!.querySelectorAll<HTMLElement>('[data-group]').forEach((el) => {
      el.hidden = !!g && el.dataset.group !== g
    })
  }, [g])
  return (
    <div ref={ref} className="lb-cat">
      {groups.length > 1 ? (
        <div className="lb-chips" role="group">
          {['', ...groups].map((x) => (
            <button key={x || 'all'} type="button" aria-pressed={g === x} onClick={() => setG(x)}>
              {x || all}
            </button>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  )
}
