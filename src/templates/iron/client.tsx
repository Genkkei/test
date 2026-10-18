'use client'

import { useEffect, useRef, useState } from 'react'
import { pick } from '@/lib/i18n'

/** Откатная створка ворот: открывается по мере прокрутки первого экрана (CSS-переменная --iron-open 0..1). */
export function GateScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion')) {
      el.style.setProperty('--iron-open', '0.55')
      return
    }
    let raf = 0
    const on = () => {
      raf = 0
      // через секунду после загрузки створка чуть отъезжает — видно, что она откатная; дальше ведёт прокрутка
      const base = el.dataset.ready ? 0.12 : 0
      // ворота на первом экране — открытие считаем от прокрутки страницы: половина экрана — створка в стороне
      const k = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.55)))
      el.style.setProperty('--iron-open', String(Math.min(0.95, base + k)))
    }
    const ask = () => {
      if (!raf) raf = requestAnimationFrame(on)
    }
    const t = setTimeout(() => {
      el.dataset.ready = '1'
      ask()
    }, 900)
    on()
    window.addEventListener('scroll', ask, { passive: true })
    window.addEventListener('resize', ask)
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', ask)
      window.removeEventListener('resize', ask)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div ref={ref} className="iron-gate">
      {children}
    </div>
  )
}

const digits = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0
const fmt = (n: number, lang: string) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : ' ')

/** Расчёт «на глаз»: модель × длина в погонных метрах. Точную сумму называет замерщик. */
export function Calc({ items, lang, cta }: { items: { title: string; price: string }[]; lang: string; cta: { label: string; href: string } }) {
  const models = items.filter((i) => digits(i.price) > 0)
  const [m, setM] = useState(0)
  const [len, setLen] = useState(12)
  const [auto, setAuto] = useState(false)
  if (!models.length) return null
  const per = digits(models[Math.min(m, models.length - 1)].price)
  const AUTO = 4_800_000
  const total = per * len + (auto ? AUTO : 0)
  const cur = pick(lang, { ru: 'сум', uz: 'so‘m', en: 'UZS' })
  return (
    <div className="iron-calc" data-reveal="up">
      <div className="iron-calc__head">
        <span className="iron-calc__no">CALC-01</span>
        <h3>{pick(lang, { ru: 'Прикиньте стоимость', uz: 'Narxni taxminan hisoblang', en: 'Estimate the price' })}</h3>
      </div>
      <div className="iron-calc__grid">
        <fieldset className="iron-calc__models">
          <legend>{pick(lang, { ru: 'Модель', uz: 'Model', en: 'Model' })}</legend>
          {models.map((it, i) => (
            <button key={i} type="button" className={i === m ? 'is-on' : ''} aria-pressed={i === m} onClick={() => setM(i)}>
              <span>{it.title}</span>
              <small>{it.price}</small>
            </button>
          ))}
        </fieldset>
        <div className="iron-calc__right">
          <label className="iron-calc__len">
            <span>
              {pick(lang, { ru: 'Длина забора или ворот', uz: 'Devor yoki darvoza uzunligi', en: 'Fence or gate length' })}: <b>{len} {pick(lang, { ru: 'м', uz: 'm', en: 'm' })}</b>
            </span>
            <input type="range" min={2} max={80} step={1} value={len} onChange={(e) => setLen(Number(e.target.value))} />
            <span className="iron-calc__scale" aria-hidden="true">
              <i>2</i>
              <i>20</i>
              <i>40</i>
              <i>60</i>
              <i>80</i>
            </span>
          </label>
          <label className="iron-calc__auto">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
            <span>
              {pick(lang, { ru: 'Автоматика для откатных ворот', uz: 'Surma darvoza uchun avtomatika', en: 'Sliding gate automation' })} <small>+ {fmt(AUTO, lang)} {cur}</small>
            </span>
          </label>
          <p className="iron-calc__total" aria-live="polite">
            <small>{pick(lang, { ru: 'Ориентировочно', uz: 'Taxminan', en: 'Approximately' })}</small>
            <b>
              ≈ {fmt(total, lang)} <span>{cur}</span>
            </b>
          </p>
          <p className="iron-calc__note">{pick(lang, { ru: 'Точную смету мастер составит после бесплатного замера: она зависит от высоты, рельефа и столбов.', uz: 'Aniq smetani usta bepul o‘lchovdan keyin tuzadi: u balandlik, relyef va ustunlarga bog‘liq.', en: 'The exact quote comes after a free measuring visit: it depends on height, terrain and posts.' })}</p>
          {cta.label ? (
            <a className="iron-btn" href={cta.href || '#order'}>
              {cta.label}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
