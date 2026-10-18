'use client'

import { useMemo, useState } from 'react'
import type { Rate } from './rates'

/* Конфигуратор шкафа: ширина, высота, число секций, тип фасада и дополнения.
 * Ставки берутся из блока цен сайта (владелец меняет их в админке): позиция с «м²» в периоде —
 * тип фасада за квадратный метр, остальные — дополнения за штуку. Считает браузер, ничего не отправляет. */

export type Labels = {
  width: string
  height: string
  sections: string
  doors: string
  extras: string
  total: string
  term: string
  days: string
  cm: string
  approx: string
  order: string
  sum: string
}

const fmt = (n: number, lang: string) => new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ru-RU').format(n).replace(/,/g, lang === 'en' ? ',' : ' ')

function Drawing({ w, h, n, kind, drawers, cm }: { w: number; h: number; n: number; kind: 'swing' | 'slide' | 'open'; drawers: number; cm: string }) {
  // масштаб: ширина рисунка 300 при 400 см
  const W = 60 + (w / 400) * 260
  const H = 120 + ((h - 200) / 80) * 90
  const x0 = (360 - W) / 2
  const y0 = 230 - H
  const sw = W / n
  return (
    <svg viewBox="0 0 360 270" className="module-draw" aria-hidden="true">
      <defs>
        <pattern id="module-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0H0V12" fill="none" stroke="currentColor" strokeOpacity=".08" />
        </pattern>
      </defs>
      <rect width="360" height="270" fill="url(#module-grid)" />
      <rect x={x0} y={y0} width={W} height={H} stroke="currentColor" strokeWidth="2.5" style={{ fill: "var(--surface)", transition: "all .5s" }} />
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * sw
        const dh = drawers > i ? 34 : 0
        return (
          <g key={i} style={{ transition: 'all .5s' }}>
            {i > 0 ? <line x1={x} y1={y0} x2={x} y2={y0 + H} stroke="currentColor" strokeWidth="1.5" /> : null}
            {kind === 'open'
              ? [0.25, 0.45, 0.65].map((f) => <line key={f} x1={x + 4} x2={x + sw - 4} y1={y0 + H * f} y2={y0 + H * f} stroke="currentColor" strokeOpacity=".5" />)
              : kind === 'swing'
                ? <line x1={x + (i % 2 ? 7 : sw - 7)} x2={x + (i % 2 ? 7 : sw - 7)} y1={y0 + H * 0.42} y2={y0 + H * 0.56} style={{ stroke: "var(--accent)" }} strokeWidth="4" strokeLinecap="round" />
                : <rect x={x + 2} y={y0 + 2} width={sw - 4} height={H - 4 - dh} style={{ fill: i % 2 ? 'var(--accent)' : 'none' }} fillOpacity=".25" stroke="currentColor" strokeOpacity=".35" />}
            {dh ? (
              <g>
                <rect x={x + 3} y={y0 + H - dh} width={sw - 6} height={dh - 3} style={{ fill: "var(--accent)" }} stroke="currentColor" strokeWidth="1.2" />
                <line x1={x + sw / 2 - 8} x2={x + sw / 2 + 8} y1={y0 + H - dh / 2 - 1} y2={y0 + H - dh / 2 - 1} stroke="currentColor" strokeWidth="2" />
              </g>
            ) : null}
          </g>
        )
      })}
      <rect x={x0 - 4} y={y0 + H} width={W + 8} height="6" fill="currentColor" />
      {/* размерные линии */}
      <g stroke="currentColor" strokeWidth="1" fill="currentColor" fontSize="11" style={{ fontFamily: "var(--font-body)" }}>
        <line x1={x0} x2={x0 + W} y1={252} y2={252} />
        <line x1={x0} x2={x0} y1={246} y2={258} />
        <line x1={x0 + W} x2={x0 + W} y1={246} y2={258} />
        <text x={180} y={268} textAnchor="middle" stroke="none">{`${w} ${cm}`}</text>
        <line x1={x0 + W + 16} x2={x0 + W + 16} y1={y0} y2={y0 + H} />
        <line x1={x0 + W + 10} x2={x0 + W + 22} y1={y0} y2={y0} />
        <line x1={x0 + W + 10} x2={x0 + W + 22} y1={y0 + H} y2={y0 + H} />
        <text x={x0 + W + 26} y={y0 + H / 2} stroke="none" dominantBaseline="middle">{`${h}`}</text>
      </g>
    </svg>
  )
}

export function Configurator({ rates, labels, lang, href }: { rates: Rate[]; labels: Labels; lang: string; href: string }) {
  const doors = rates.filter((r) => r.perM2)
  const extras = rates.filter((r) => !r.perM2)
  const [w, setW] = useState(240)
  const [h, setH] = useState(250)
  const [n, setN] = useState(3)
  const [d, setD] = useState(0)
  const [qty, setQty] = useState<number[]>(() => extras.map((_, i) => (i === 0 ? 1 : 0)))
  const door = doors[d]
  const kind: 'swing' | 'slide' | 'open' = /купе|slid|sür|kupe|siljit/i.test(door?.name ?? '') ? 'slide' : /откр|open|ochiq|стеллаж/i.test(door?.name ?? '') ? 'open' : 'swing'
  const total = useMemo(() => {
    const area = (w / 100) * (h / 100)
    const sum = area * (door?.price ?? 0) + extras.reduce((a, e, i) => a + e.price * (qty[i] ?? 0), 0)
    return Math.round(sum / 10000) * 10000
  }, [w, h, door, extras, qty])
  const days = 10 + n + Math.ceil(w / 100)
  return (
    <div className="module-conf">
      <div className="module-conf__view">
        <Drawing w={w} h={h} n={n} kind={kind} drawers={extras[0] ? Math.min(qty[0] ?? 0, n) : 0} cm={labels.cm} />
      </div>
      <div className="module-conf__panel">
        <label className="module-range">
          <span>
            {labels.width} <b>{w} {labels.cm}</b>
          </span>
          <input type="range" min={100} max={400} step={10} value={w} onChange={(e) => setW(+e.target.value)} />
        </label>
        <label className="module-range">
          <span>
            {labels.height} <b>{h} {labels.cm}</b>
          </span>
          <input type="range" min={200} max={280} step={5} value={h} onChange={(e) => setH(+e.target.value)} />
        </label>
        <div className="module-field">
          <span>{labels.sections}</span>
          <div className="module-seg">
            {[2, 3, 4, 5, 6].map((x) => (
              <button key={x} type="button" aria-pressed={n === x} onClick={() => setN(x)}>
                {x}
              </button>
            ))}
          </div>
        </div>
        {doors.length ? (
          <div className="module-field">
            <span>{labels.doors}</span>
            <div className="module-seg module-seg--wide">
              {doors.map((x, i) => (
                <button key={x.name} type="button" aria-pressed={d === i} onClick={() => setD(i)} title={x.note}>
                  {x.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {extras.length ? (
          <div className="module-field">
            <span>{labels.extras}</span>
            {extras.map((x, i) => (
              <div key={x.name} className="module-extra">
                <span>
                  {x.name}
                  <small>
                    {fmt(x.price, lang)} {labels.sum}
                  </small>
                </span>
                <div className="module-step">
                  <button type="button" aria-label="−" onClick={() => setQty((q) => q.map((v, j) => (j === i ? Math.max(0, v - 1) : v)))}>
                    −
                  </button>
                  <output>{qty[i] ?? 0}</output>
                  <button type="button" aria-label="+" onClick={() => setQty((q) => q.map((v, j) => (j === i ? Math.min(12, v + 1) : v)))}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <div className="module-total">
          <p>
            <span>{labels.total}</span>
            <b>
              {labels.approx} {fmt(total, lang)} {labels.sum}
            </b>
          </p>
          <p>
            <span>{labels.term}</span>
            <b>
              {days}–{days + 4} {labels.days}
            </b>
          </p>
          <a className="btn btn--primary" href={href}>
            {labels.order}
          </a>
        </div>
      </div>
    </div>
  )
}
