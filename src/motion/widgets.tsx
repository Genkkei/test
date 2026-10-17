'use client'

import { useEffect, useRef, useState } from 'react'

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
export function Clock({ tz = 'Asia/Tashkent', className }: { tz?: string; className?: string }) {
  const [t, setT] = useState('')
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date()))
    f()
    const i = setInterval(f, 15000)
    return () => clearInterval(i)
  }, [tz])
  return <span className={className} suppressHydrationWarning>{t || '—:—'}</span>
}

/** Мобильное меню: кнопка + полноэкранная панель. */
export function MobileMenu({ links, cta, className = 'mmenu' }: { links: { href: string; label: string }[]; cta?: { href: string; label: string }; className?: string }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
  }, [open])
  return (
    <>
      <button type="button" className={`${className}__btn`} aria-expanded={open} aria-label={open ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setOpen(!open)}>
        <span />
        <span />
      </button>
      <div className={`${className}__panel`} data-open={open || undefined} hidden={!open}>
        <nav>
          {links.map((l, i) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ ['--i' as string]: i }}>
              {l.label}
            </a>
          ))}
          {cta?.label ? (
            <a className={`${className}__cta`} href={cta.href} onClick={() => setOpen(false)}>
              {cta.label}
            </a>
          ) : null}
        </nav>
      </div>
    </>
  )
}
