'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ui } from '@/lib/i18n'
import { getLenis } from './runtime'

/** Курсор-кружок, раздувается над ссылками и элементами с data-cursor="текст". */
export function Cursor({ className = 'cursor' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = ref.current!
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      const t = (e.target as HTMLElement).closest<HTMLElement>('a,button,[data-cursor]')
      el.classList.toggle('is-hover', !!t)
      setLabel(t?.dataset.cursor || '')
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const loop = () => {
      cx += (x - cx) * 0.2
      cy += (y - cy) * 0.2
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0
    }
    el.classList.add('is-on')
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div ref={ref} className={className} aria-hidden="true">
      <span>{label}</span>
    </div>
  )
}

/** Бегущая строка на CSS: две копии едут на ширину одной; вторая скрыта от скринридера. */
export function Marquee({ items, className = 'marquee', speed = 40, sep = '✦' }: { items: string[]; className?: string; speed?: number; sep?: string }) {
  const row = (hidden: boolean) => (
    <div className="marquee__row" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span key={i} className="marquee__item">
          {t}
          <i className="marquee__sep">{sep}</i>
        </span>
      ))}
    </div>
  )
  return (
    <div className={className} style={{ ['--marquee-d' as string]: `${speed}s` }}>
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}

/** Вращающийся круглый бейдж с текстом по окружности (как «scroll down» у monopo). */
export function Badge({ text, className = 'badge' }: { text: string; className?: string }) {
  const id = `b${text.length}${text.charCodeAt(0)}`
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <path id={id} d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        </defs>
        <text>
          <textPath href={`#${id}`}>{`${text} • `.repeat(Math.max(1, Math.floor(42 / (text.length + 3))))}</textPath>
        </text>
      </svg>
      <span className="badge__arrow">↓</span>
    </div>
  )
}

/** Часы в часовом поясе бизнеса — живая деталь шапки агентств. */
export function Clock({ tz = 'Asia/Tashkent', className, lang = 'ru' }: { tz?: string; className?: string; lang?: string }) {
  const [t, setT] = useState('')
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date()))
    f()
    const i = setInterval(f, 15000)
    return () => clearInterval(i)
  }, [tz, lang])
  return <span className={className} suppressHydrationWarning>{t || '—:—'}</span>
}

/**
 * Мобильное меню: кнопка + полноэкранная панель.
 * Панель живёт в корне сайта (.site), а не в шапке: у прилипающей шапки есть transform (прячется при
 * прокрутке), а у многих шаблонов ещё и backdrop-filter — для position: fixed это становится рамкой, и
 * панель «во весь экран» получалась высотой с шапку: пункты уезжали за верх экрана, страница под меню
 * оставалась видна. В корне сайта стили шаблона (.tpl-<id> .mmenu__panel) и цвета темы сохраняются.
 * Кнопка закрытия — и в самой панели, на месте кнопки шапки: шапка с её кнопкой оказывается под панелью.
 */
export function MobileMenu({ links, cta, className = 'mmenu', lang = 'ru' }: { links: { href: string; label: string }[]; cta?: { href: string; label: string }; className?: string; lang?: string }) {
  const [open, setOpen] = useState(false)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [spot, setSpot] = useState<{ top: number; left: number } | null>(null)
  const btn = useRef<HTMLButtonElement>(null)
  useEffect(() => setHost(btn.current?.closest<HTMLElement>('.site') ?? document.body), [])
  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.toggle('menu-open', open)
    if (open) getLenis()?.stop()
    else getLenis()?.start()
    if (!open) return
    // крестик — на месте кнопки шапки; шапка в этот миг за экраном — в правый верхний угол (CSS)
    const r = btn.current?.getBoundingClientRect()
    setSpot(r && r.top >= 0 && r.bottom <= innerHeight && r.width > 0 ? { top: r.top, left: r.left } : null)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [open])
  useEffect(() => () => {
    document.documentElement.classList.remove('menu-open')
    getLenis()?.start()
  }, [])
  // Пункт меню: сначала вернуть прокрутку, потом переход к разделу (его делает среда движения).
  const go = () => {
    document.documentElement.classList.remove('menu-open')
    getLenis()?.start()
    setOpen(false)
  }
  const panel = (
    <div className={`${className}__panel`} data-open={open || undefined} hidden={!open}>
      {host ? (
        <button
          type="button"
          className={`${className}__btn ${className}__close`}
          aria-expanded="true"
          aria-label={ui(lang, 'menuClose')}
          onClick={() => setOpen(false)}
          style={spot ? { top: spot.top, left: spot.left } : undefined}
        >
          <span />
          <span />
        </button>
      ) : null}
      <nav>
        {links.map((l, i) => (
          <a key={l.href} href={l.href} onClick={go} style={{ ['--i' as string]: i }}>
            {l.label}
          </a>
        ))}
        {cta?.label ? (
          <a className={`${className}__cta`} href={cta.href} onClick={go}>
            {cta.label}
          </a>
        ) : null}
      </nav>
    </div>
  )
  return (
    <>
      <button ref={btn} type="button" className={`${className}__btn`} aria-expanded={open} aria-label={ui(lang, open ? 'menuClose' : 'menuOpen')} onClick={() => setOpen(!open)}>
        <span />
        <span />
      </button>
      {host ? createPortal(panel, host) : panel}
    </>
  )
}
