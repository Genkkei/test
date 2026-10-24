'use client'

import { useEffect, useRef } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const DOSE = 15
const WATER = 250
const POUR = 150 // секунд пролива — как настоящий V60 на 250 г

/**
 * Табло весов. Без скрипта стоит доза «15.0 г». Со скриптом: граммы набегают от нуля до дозы десятыми,
 * потом идёт таймер пролива, и вес медленно растёт к 250 г. Вне экрана — пауза. Если скрипт пришёл поздно
 * (табло уже давно горит), набегание пропускается — сразу таймер, без скачка 15 → 0.
 */
export function ScaleReadout() {
  const g = useRef<HTMLSpanElement>(null)
  const t = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const gram = g.current
    const time = t.current
    if (!gram || !time || reduced()) return
    let raf = 0
    let visible = true
    let pourStart = 0
    let paused = 0
    let pausedAt = 0
    const late = performance.now() > 1600
    const countFrom = performance.now() + (late ? 0 : 450)
    const countDur = late ? 0 : 1050
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      if (now < countFrom + countDur) {
        const k = Math.max(0, (now - countFrom) / countDur)
        const e = 1 - Math.pow(1 - k, 4)
        gram.textContent = (DOSE * e).toFixed(1)
        return
      }
      if (!pourStart) pourStart = now + 400
      const sec = Math.max(0, (now - pourStart - paused) / 1000) % (POUR + 20)
      const w = sec < POUR ? DOSE + (WATER * Math.min(1, sec / POUR)) : DOSE + WATER
      gram.textContent = w.toFixed(1)
      time.textContent = fmt(Math.min(sec, POUR))
    }
    raf = requestAnimationFrame(frame)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible) paused += performance.now() - pausedAt
      if (!e.isIntersecting && visible) pausedAt = performance.now()
      visible = e.isIntersecting
    })
    io.observe(gram)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])
  return (
    <>
      <span className="cezve-lcd__row">
        <span className="cezve-lcd__big" ref={g}>
          {DOSE.toFixed(1)}
        </span>
        <small>g</small>
      </span>
      <span className="cezve-lcd__row cezve-lcd__row--sm">
        <span ref={t}>0:00</span>
        <small>1:16.7</small>
      </span>
    </>
  )
}

/*
 * Остальное движение «Каппинга»: появление при прокрутке (data-cz → .is-in), колесо вкусов (наведение или
 * фокус на лот → его секторы горят, в центре — ноты), циферблат каппинга (--p от прокрутки), видео в кадре.
 */
export function CezveMotion() {
  useEffect(() => {
    const offs: (() => void)[] = []
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    document.querySelectorAll('.tpl-cezve [data-cz]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    // колесо вкусов
    const segs = [...document.querySelectorAll<SVGGElement>('[data-cezve-seg]')]
    const hub = document.querySelector<HTMLElement>('[data-cezve-hub]')
    const idle = hub?.textContent || ''
    const lots = [...document.querySelectorAll<HTMLElement>('[data-cezve-notes]')]
    const show = (el: HTMLElement | null) => {
      const on = new Set((el?.dataset.cezveNotes || '').split(',').filter(Boolean).map(Number))
      segs.forEach((s, i) => s.classList.toggle('is-on', on.has(i)))
      lots.forEach((l) => l.classList.toggle('is-cur', l === el))
      if (hub) hub.textContent = el ? el.dataset.cezveText || '' : idle
    }
    lots.forEach((el) => {
      const on = () => show(el)
      el.addEventListener('pointerenter', on)
      el.addEventListener('focus', on)
      offs.push(() => {
        el.removeEventListener('pointerenter', on)
        el.removeEventListener('focus', on)
      })
    })
    const first = lots.find((l) => l.dataset.cezveNotes)
    if (first) show(first)

    // циферблат каппинга
    const cup = document.querySelector<HTMLElement>('[data-cezve-cupping]')
    let raf = 0
    const frame = () => {
      raf = 0
      if (!cup) return
      const r = cup.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / Math.max(1, r.height - innerHeight * 0.3)))
      cup.style.setProperty('--p', p.toFixed(4))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    frame()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    offs.push(() => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', on)
      removeEventListener('resize', on)
    })

    const vid = document.querySelector<HTMLVideoElement>('[data-cezve-hero] video')
    if (vid) {
      const vo = new IntersectionObserver(([e]) => (e.isIntersecting ? vid.play().catch(() => {}) : vid.pause()), { threshold: 0.05 })
      vo.observe(vid)
      offs.push(() => vo.disconnect())
    }
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
