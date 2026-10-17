'use client'

import { useEffect, useState } from 'react'
import { pick } from '@/lib/i18n'

/** Слова первого экрана меняются, как карточки в окне кассы: первое есть в HTML. */
export function Rotator({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2200)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span className="blade-rot" aria-live="off">
      <span key={i} className="blade-rot__word">
        {words[i]}
      </span>
    </span>
  )
}

const DAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** «Открыто / Закрыто» неоновой вывеской: считает по часам из business.hours во времени Ташкента. */
export function OpenSign({ hours, lang }: { hours: string[]; lang: string }) {
  const [open, setOpen] = useState<boolean | null>(null)
  useEffect(() => {
    const check = () => {
      const now = new Date(Date.now() + (5 * 60 + new Date().getTimezoneOffset()) * 60000)
      const d = DAY[now.getDay()]
      const m = now.getHours() * 60 + now.getMinutes()
      const order = DAY.slice(1).concat('Su')
      let ok = false
      for (const h of hours) {
        const mm = h.match(/^(\w\w)(?:-(\w\w))?\s+(\d\d):(\d\d)-(\d\d):(\d\d)/)
        if (!mm) continue
        const a = order.indexOf(mm[1]), z = order.indexOf(mm[2] || mm[1]), di = order.indexOf(d)
        if (di < a || di > z) continue
        const from = +mm[3] * 60 + +mm[4], to = +mm[5] * 60 + +mm[6]
        if (m >= from && m < to) ok = true
      }
      setOpen(ok)
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [hours])
  if (!hours.length) return null
  return (
    <span className={`blade-open${open ? ' is-on' : ''}`} suppressHydrationWarning>
      <i aria-hidden="true" />
      {open === null ? pick(lang, { ru: 'Часы работы', uz: 'Ish vaqti', en: 'Opening hours' }) : open ? pick(lang, { ru: 'Открыто', uz: 'Ochiq', en: 'Open now' }) : pick(lang, { ru: 'Закрыто', uz: 'Yopiq', en: 'Closed' })}
    </span>
  )
}
