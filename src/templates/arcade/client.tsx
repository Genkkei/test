'use client'

import { useEffect, useRef, useState } from 'react'

/** Режим игры в HUD: слова первого экрана переключаются с глитчем. Первое есть в HTML. */
export function ModeTicker({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 1700)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span key={i} className="arcade-mode" data-text={words[i]}>
      {words[i]}
    </span>
  )
}

/**
 * «Онлайн сейчас»: свободные места по часу суток (днём занято меньше, ночью — больше),
 * плавно гуляет на ±2. Пока не смонтирован — прочерк, чтобы сервер и браузер совпали.
 */
export function Online({ total, labels }: { total: number; labels: { free: string; busy: string } }) {
  const [busy, setBusy] = useState<number | null>(null)
  useEffect(() => {
    const base = () => {
      const h = new Date(Date.now() + (5 * 60 + new Date().getTimezoneOffset()) * 60000).getHours()
      const load = h >= 18 || h < 2 ? 0.82 : h >= 12 ? 0.55 : 0.3
      return Math.round(total * load)
    }
    setBusy(base())
    const id = setInterval(() => setBusy(Math.max(0, Math.min(total, base() + Math.round(Math.random() * 4 - 2)))), 4000)
    return () => clearInterval(id)
  }, [total])
  const pct = busy === null ? 0 : busy / total
  return (
    <div className="arcade-online">
      <div className="arcade-online__row">
        <span>
          <i aria-hidden="true" /> {labels.busy}
        </span>
        <b suppressHydrationWarning>{busy === null ? '—' : busy}</b>
      </div>
      <div className="arcade-online__bar" aria-hidden="true">
        {Array.from({ length: 20 }, (_, k) => (
          <span key={k} className={k / 20 < pct ? 'is-on' : ''} />
        ))}
      </div>
      <div className="arcade-online__row arcade-online__row--free">
        <span>{labels.free}</span>
        <b suppressHydrationWarning>{busy === null ? '—' : total - busy}</b>
      </div>
    </div>
  )
}

/** Прицел за курсором внутри первого экрана. */
export function Crosshair() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current!
    const host = el.parentElement!
    if (!window.matchMedia('(hover: hover)').matches) return
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0
    const move = (e: PointerEvent) => {
      const b = host.getBoundingClientRect()
      x = e.clientX - b.left
      y = e.clientY - b.top
      el.style.opacity = '1'
    }
    const leave = () => (el.style.opacity = '0')
    const loop = () => {
      cx += (x - cx) * 0.25
      cy += (y - cy) * 0.25
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
    }
  }, [])
  return <span ref={ref} className="arcade-cross" aria-hidden="true" />
}
