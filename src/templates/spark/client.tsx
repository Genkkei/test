'use client'

import { useEffect, useMemo, useState } from 'react'
import { pick } from '@/lib/i18n'

/*
 * Солнце над Ташкентом: положение на дуге и кривая выработки считаются по местному времени.
 * Восход и закат — грубая сезонная модель (±1,4 ч от равноденствия), этого хватает для картинки;
 * цифра подписана как пример станции, не как обещание.
 */
function dayModel(d: Date) {
  const doy = Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5)
  const half = 6.1 + 1.4 * Math.sin(((doy - 80) / 365) * 2 * Math.PI) // половина светового дня, ч
  const noon = 12.6
  return { rise: noon - half, set: noon + half }
}
function tashkentHours() {
  const now = new Date()
  const t = new Date(now.getTime() + (5 * 60 + now.getTimezoneOffset()) * 60000)
  return { h: t.getHours() + t.getMinutes() / 60, t }
}

export function SunDial({ lang, kw = 10 }: { lang: string; kw?: number }) {
  const [h, setH] = useState<number | null>(null)
  const [date, setDate] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => {
      const { h, t } = tashkentHours()
      setH(h)
      setDate(t)
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])
  const m = useMemo(() => dayModel(date ?? new Date(Date.UTC(2026, 5, 21))), [date])
  const hour = h ?? 13
  const p = Math.min(1, Math.max(0, (hour - m.rise) / (m.set - m.rise)))
  const up = hour > m.rise && hour < m.set
  // дуга: от (40,200) до (360,200), вершина (200,40)
  const ang = Math.PI * (1 - p)
  const sx = 200 + 160 * Math.cos(ang)
  const sy = 200 - 160 * Math.sin(ang)
  const power = up ? kw * 0.82 * Math.sin(p * Math.PI) ** 1.4 : 0
  // кривая выработки за день: колокол, закрашен до текущего часа
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = i / 40
    return [40 + x * 320, 300 - 70 * Math.sin(x * Math.PI) ** 1.4] as const
  })
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L360 300 L40 300 Z`
  const fmt = (x: number) => `${Math.floor(x)}:${String(Math.round((x % 1) * 60)).padStart(2, '0')}`
  return (
    <figure className="spark-dial" aria-label={pick(lang, { ru: 'Положение солнца и пример выработки', uz: 'Quyosh holati va ishlab chiqarish namunasi', en: 'Sun position and a sample output' })}>
      <svg viewBox="0 0 400 320">
        <defs>
          <clipPath id="spark-done">
            <rect x="40" y="200" width={320 * p} height="110" />
          </clipPath>
          <radialGradient id="spark-glow">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".55" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path className="spark-dial__arc" d="M40 200 A160 160 0 0 1 360 200" />
        <line className="spark-dial__horizon" x1="20" y1="200" x2="380" y2="200" />
        {up ? <circle cx={sx} cy={sy} r="46" fill="url(#spark-glow)" className="spark-dial__glow" /> : null}
        <g className="spark-dial__sun" style={{ transform: `translate(${sx}px, ${sy}px)` }}>
          <circle r="13" className={up ? '' : 'is-down'} />
          {up
            ? Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1="0" y1="-20" x2="0" y2="-26" transform={`rotate(${i * 45})`} />
              ))
            : null}
        </g>
        <path className="spark-dial__curve" d={line} />
        <path className="spark-dial__area" d={area} clipPath="url(#spark-done)" />
        <text x="40" y="222">{fmt(m.rise)}</text>
        <text x="360" y="222" textAnchor="end">{fmt(m.set)}</text>
      </svg>
      <figcaption className="spark-dial__cap" suppressHydrationWarning>
        <span className="spark-dial__now">
          <b suppressHydrationWarning>{h === null ? '—' : power.toFixed(1)}</b> {pick(lang, { ru: 'кВт', uz: 'kVt', en: 'kW' })}
        </span>
        <span className="spark-dial__note">
          {up
            ? pick(lang, { ru: `сейчас дала бы станция на ${kw} кВт в Ташкенте`, uz: `hozir Toshkentda ${kw} kVt stansiya beradigan quvvat`, en: `a ${kw} kW system in Tashkent would be giving now` })
            : pick(lang, { ru: 'солнце село — днём станция снова начнёт работать', uz: 'quyosh botdi — kunduzi stansiya yana ishlaydi', en: 'the sun has set — the system resumes in the morning' })}
        </span>
      </figcaption>
    </figure>
  )
}

/** Калькулятор: потребление в месяц → мощность станции и число панелей. Ориентир, не смета. */
export function Calc({ lang }: { lang: string }) {
  const [kwh, setKwh] = useState(600)
  const kw = Math.max(3, Math.round((kwh / (30 * 4.6 * 0.8)) * 2) / 2)
  const panels = Math.ceil((kw * 1000) / 550)
  const area = Math.round(panels * 2.6)
  return (
    <div className="spark-calc">
      <label className="spark-calc__label" htmlFor="spark-kwh">
        {pick(lang, { ru: 'Сколько электричества вы тратите в месяц', uz: 'Oyiga qancha elektr sarflaysiz', en: 'Your monthly electricity use' })}
      </label>
      <div className="spark-calc__value">
        <b>{kwh}</b> {pick(lang, { ru: 'кВт·ч', uz: 'kVt·soat', en: 'kWh' })}
      </div>
      <input id="spark-kwh" type="range" min={150} max={3000} step={50} value={kwh} onChange={(e) => setKwh(+e.target.value)} style={{ ['--p' as string]: `${((kwh - 150) / 2850) * 100}%` }} />
      <dl className="spark-calc__out">
        <div>
          <dt>{pick(lang, { ru: 'Мощность станции', uz: 'Stansiya quvvati', en: 'System size' })}</dt>
          <dd>
            {kw} {pick(lang, { ru: 'кВт', uz: 'kVt', en: 'kW' })}
          </dd>
        </div>
        <div>
          <dt>{pick(lang, { ru: 'Панелей по 550 Вт', uz: '550 Vt panellar', en: '550 W panels' })}</dt>
          <dd>{panels}</dd>
        </div>
        <div>
          <dt>{pick(lang, { ru: 'Площадь крыши', uz: 'Tom maydoni', en: 'Roof area' })}</dt>
          <dd>≈ {area} {pick(lang, { ru: 'м²', uz: 'm²', en: 'm²' })}</dd>
        </div>
      </dl>
      <p className="spark-calc__hint">{pick(lang, { ru: 'Ориентир по среднему солнцу Ташкента. Точный расчёт — после бесплатного выезда инженера.', uz: 'Toshkentning o‘rtacha quyoshi bo‘yicha taxmin. Aniq hisob — muhandisning bepul tashrifidan keyin.', en: 'An estimate based on Tashkent’s average sun. An exact quote follows a free engineer visit.' })}</p>
    </div>
  )
}
