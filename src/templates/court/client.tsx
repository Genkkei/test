'use client'

import { useEffect, useMemo, useState } from 'react'

/*
 * Табло бронирования: семь дней вперёд, слоты по полтора часа. Занятость — демонстрационная,
 * считается из даты и времени (одинаково у всех посетителей), реальная приходит из CRM клуба.
 * Даты строятся только в браузере: в HTML — пустая сетка, чтобы не расходиться при гидратации.
 */
const SLOTS = ['07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30', '22:00']

function busy(day: string, slot: string, court: number) {
  let h = 2166136261
  for (const c of `${day}|${slot}|${court}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const peak = slot >= '17:30' && slot <= '20:30'
  return (h >>> 0) % 100 < (peak ? 72 : 38)
}

export function Booking({ lang, courts, href, labels }: { lang: string; courts: string[]; href: string; labels: { free: string; taken: string; pick: string; book: string; court: string } }) {
  const [days, setDays] = useState<{ key: string; dow: string; date: string }[]>([])
  const [day, setDay] = useState(0)
  const [court, setCourt] = useState(0)
  const [slot, setSlot] = useState<string | null>(null)

  useEffect(() => {
    const loc = lang === 'en' ? 'en-GB' : lang === 'uz' ? 'uz-Latn-UZ' : 'ru-RU'
    const out = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() + i * 864e5)
      out.push({ key: d.toISOString().slice(0, 10), dow: new Intl.DateTimeFormat(loc, { weekday: 'short', timeZone: 'Asia/Tashkent' }).format(d), date: new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', timeZone: 'Asia/Tashkent' }).format(d) })
    }
    setDays(out)
  }, [lang])

  const cur = days[day]
  const grid = useMemo(() => (cur ? SLOTS.map((s) => ({ s, taken: busy(cur.key, s, court) })) : []), [cur, court])
  const text = cur && slot ? `${labels.book}: ${courts[court] ?? ''}, ${cur.date}, ${slot}` : ''
  const link = href.startsWith('https://t.me/') && text ? `${href}?text=${encodeURIComponent(text)}` : href

  return (
    <div className="court-book">
      <div className="court-book__courts" role="tablist" aria-label={labels.court}>
        {courts.map((c, i) => (
          <button key={c} type="button" role="tab" aria-selected={court === i} className={court === i ? 'is-on' : ''} onClick={() => { setCourt(i); setSlot(null) }}>
            {c}
          </button>
        ))}
      </div>
      <div className="court-book__days">
        {(days.length ? days : Array.from({ length: 7 }, () => null)).map((d, i) => (
          <button key={i} type="button" disabled={!d} aria-pressed={day === i} className={day === i ? 'is-on' : ''} onClick={() => { setDay(i); setSlot(null) }}>
            <small>{d?.dow ?? '—'}</small>
            <span>{d?.date ?? ''}</span>
          </button>
        ))}
      </div>
      <ul className="court-book__slots">
        {(grid.length ? grid : SLOTS.map((s) => ({ s, taken: false }))).map(({ s, taken }) => (
          <li key={s}>
            <button type="button" disabled={taken || !cur} className={`${taken ? 'is-taken' : ''}${slot === s ? ' is-on' : ''}`} onClick={() => setSlot(s)} title={taken ? labels.taken : labels.free}>
              <span>{s}</span>
              <small>{taken ? labels.taken : labels.free}</small>
            </button>
          </li>
        ))}
      </ul>
      <div className="court-book__foot">
        <p aria-live="polite">{text || labels.pick}</p>
        <a className={`court-btn${slot ? '' : ' is-off'}`} href={slot ? link : '#'} target={slot && link.startsWith('http') ? '_blank' : undefined} rel="noopener" aria-disabled={!slot}>
          {labels.book} →
        </a>
      </div>
    </div>
  )
}
