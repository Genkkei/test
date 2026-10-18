'use client'

import { useMemo, useState } from 'react'
import { pick } from '@/lib/i18n'

export type CalcType = { name: string; rate: number; unit: string; features: string[] }

const fmt = (n: number, lang: string) => new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ru-RU').format(Math.round(n / 10000) * 10000)

/**
 * Калькулятор навеса: тип конструкции × площадь = ориентир «от». Цена за м² берётся из
 * тарифов сайта (её правят в админке), поэтому калькулятор не врёт после смены прайса.
 * Без JS виден первый тип и пример расчёта — разметка та же.
 */
export function Calculator({ types, lang, cta }: { types: CalcType[]; lang: string; cta: { label: string; href: string } }) {
  const [t, setT] = useState(0)
  const [w, setW] = useState(6)
  const [l, setL] = useState(8)
  const type = types[t] ?? types[0]
  const area = Math.max(0, w) * Math.max(0, l)
  const total = useMemo(() => area * (type?.rate ?? 0), [area, type])
  if (!type) return null
  const cur = pick(lang, { ru: 'сум', uz: 'so‘m', en: 'sum' })
  return (
    <div className="rivet-calc">
      <div className="rivet-calc__types" role="radiogroup" aria-label={pick(lang, { ru: 'Тип конструкции', uz: 'Konstruksiya turi', en: 'Structure type' })}>
        {types.map((x, i) => (
          <button key={i} type="button" role="radio" aria-checked={i === t} className={i === t ? 'is-on' : ''} onClick={() => setT(i)}>
            <b>{x.name}</b>
            <small>
              {fmt(x.rate, lang)} {x.unit}
            </small>
          </button>
        ))}
      </div>
      <div className="rivet-calc__body">
        <div className="rivet-calc__plan" aria-hidden="true">
          <div className="rivet-calc__rect" style={{ aspectRatio: `${Math.max(1, l)} / ${Math.max(1, w)}` }}>
            <span className="rivet-calc__dim rivet-calc__dim--l">{l} m</span>
            <span className="rivet-calc__dim rivet-calc__dim--w">{w} m</span>
          </div>
        </div>
        <div className="rivet-calc__inputs">
          <label>
            <span>{pick(lang, { ru: 'Ширина, м', uz: 'Eni, m', en: 'Width, m' })}</span>
            <input type="range" min={2} max={30} value={w} onChange={(e) => setW(+e.target.value)} />
            <output>{w}</output>
          </label>
          <label>
            <span>{pick(lang, { ru: 'Длина, м', uz: 'Uzunligi, m', en: 'Length, m' })}</span>
            <input type="range" min={2} max={60} value={l} onChange={(e) => setL(+e.target.value)} />
            <output>{l}</output>
          </label>
          <p className="rivet-calc__area">
            {pick(lang, { ru: 'Площадь', uz: 'Maydon', en: 'Area' })}: <b>{area} m²</b>
          </p>
          <p className="rivet-calc__total" aria-live="polite">
            <small>{pick(lang, { ru: 'Ориентир под ключ', uz: 'Taxminiy narx (kalit topshirish)', en: 'Turnkey estimate' })}</small>
            <span>
              ≈ {fmt(total, lang)} {cur}
            </span>
          </p>
          {type.features.length ? (
            <ul className="rivet-calc__feat">
              {type.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}
          {cta.label ? (
            <a className="rivet-btn" href={cta.href || '#order'}>
              {cta.label}
            </a>
          ) : null}
          <p className="rivet-calc__note">
            {pick(lang, {
              ru: 'Точную смету даёт инженер после замера: снег, ветер и грунт считаются по месту.',
              uz: 'Aniq smetani muhandis o‘lchovdan keyin beradi: qor, shamol va grunt joyida hisoblanadi.',
              en: 'An engineer gives the exact estimate after a site visit: snow, wind and soil are checked on site.',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
