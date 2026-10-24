import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { FlatMotion } from './client'

/*
 * КВАРТИРА — мебель пакетами для новостроек. Первый экран — планировка двушки: стены чертятся, подписи
 * комнат проступают, мебель по одной встаёт на место (с лёгкой посадкой), счётчик дней идёт 1 → 30.
 * Планировки — карточки с мини-планом по числу комнат, ход заказа — календарь 30 дней и кольца готовности,
 * пакеты — листы договора с галочками. Шрифты: Geologica (заголовки), Golos Text (текст), Noto Sans Mono (метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

type Piece = { d: React.ReactNode; room: number }

function Plan({ lang }: { lang: string }) {
  const rooms = [
    { x: 100, y: 124, n: pick(lang, { ru: 'Гостиная', uz: 'Mehmonxona', en: 'Living' }) },
    { x: 490, y: 234, n: pick(lang, { ru: 'Спальня', uz: 'Yotoqxona', en: 'Bedroom' }) },
    { x: 160, y: 404, n: pick(lang, { ru: 'Кухня', uz: 'Oshxona', en: 'Kitchen' }) },
    { x: 350, y: 335, n: pick(lang, { ru: 'Прихожая', uz: 'Dahliz', en: 'Hall' }) },
    { x: 515, y: 350, n: pick(lang, { ru: 'С/у', uz: 'H/x', en: 'Bath' }) },
  ]
  const pieces: Piece[] = [
    { room: 1, d: <><rect x="420" y="44" width="140" height="160" rx="6" /><rect x="430" y="52" width="56" height="30" rx="6" className="flat-soft" /><rect x="494" y="52" width="56" height="30" rx="6" className="flat-soft" /><path d="M420 104 H560" /></> },
    { room: 1, d: <><rect x="342" y="40" width="40" height="170" /><path d="M362 40 V210" /></> },
    { room: 0, d: <><rect x="40" y="186" width="200" height="50" rx="10" /><rect x="40" y="186" width="200" height="16" rx="6" className="flat-soft" /></> },
    { room: 0, d: <rect x="70" y="32" width="180" height="22" /> },
    { room: 0, d: <circle cx="230" cy="120" r="24" /> },
    { room: 2, d: <path d="M32 268 H232 V306 H72 V410 H32 Z" /> },
    { room: 2, d: <><circle cx="160" cy="345" r="26" /><circle cx="160" cy="306" r="8" className="flat-soft" /><circle cx="200" cy="345" r="8" className="flat-soft" /></> },
    { room: 3, d: <><rect x="262" y="376" width="170" height="32" /><path d="M347 376 V408" /></> },
    { room: 4, d: <><rect x="468" y="268" width="100" height="52" rx="18" /><circle cx="540" cy="390" r="14" /></> },
  ]
  return (
    <svg className="flat-plan" viewBox="0 0 600 440" role="img" aria-label={pick(lang, { ru: 'Планировка двухкомнатной квартиры с мебелью', uz: 'Mebel bilan ikki xonali kvartira rejasi', en: 'Two-room apartment plan with furniture' })}>
      <g className="flat-walls">
        <path pathLength="1" d="M20 20 H580 V420 H20 Z" />
        <path pathLength="1" d="M330 20 V120 M330 170 V250 M20 250 H60 M110 250 H250 V300 M250 350 V420 M250 250 H400 M440 250 H580 M450 250 V300 M450 350 V420" />
      </g>
      <g className="flat-rooms">
        {rooms.map((r, i) => (
          <text key={i} x={r.x} y={r.y} textAnchor="middle" style={{ ['--i' as string]: i }}>
            {r.n}
          </text>
        ))}
      </g>
      <g className="flat-pieces">
        {pieces.map((p, i) => (
          <g key={i} className="flat-f" style={{ ['--i' as string]: i }}>
            {p.d}
          </g>
        ))}
      </g>
    </svg>
  )
}

/** мини-план по числу комнат: кухня внизу слева, комнаты сверху, прихожая — остаток */
function MiniPlan({ rooms }: { rooms: number }) {
  const n = Math.max(1, Math.min(4, rooms))
  const W = 200
  const top = Array.from({ length: n }, (_, i) => ({ x: 8 + (i * (W - 16)) / n, w: (W - 16) / n }))
  return (
    <svg className="flat-mini" viewBox="0 0 200 150" aria-hidden="true">
      <rect x="8" y="8" width="184" height="134" className="flat-mini__out" />
      {top.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y="8" width={r.w} height="78" className="flat-mini__room" />
          <rect x={r.x + r.w / 2 - 18} y="28" width="36" height="38" rx="3" className="flat-mini__bed" />
        </g>
      ))}
      <rect x="8" y="86" width="84" height="56" className="flat-mini__room" />
      <path d="M14 92 H86 V102 H24 V136 H14 Z" className="flat-mini__bed" />
      <rect x="92" y="86" width="100" height="56" className="flat-mini__room" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <FlatMotion />
      <header className="flat-bar">
        <a href="#top" className="flat-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="flat-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flat-bar__side">
          {site.nav.cta.label ? (
            <a className="flat-btn flat-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="flat-foot">
        <p className="flat-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="flat-foot__cols">
          <p>{site.tagline}</p>
          {address ? (
            <p>
              <small>{pick(site.lang, { ru: 'Шоурум', uz: 'Shou-rum', en: 'Showroom' })}</small>
              {address}
            </p>
          ) : null}
          {b.hours.length ? (
            <p>
              <small>{ui(site.lang, 'hours')}</small>
              {b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}
            </p>
          ) : null}
          <p>
            <small>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</small>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </p>
        </div>
        <p className="flat-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const areas = s.words.filter(Boolean).slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero flat-hero">
      <div className="flat-hero__text">
        {s.eyebrow ? <p className="flat-label flat-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="flat-title flat-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="flat-hero__sub flat-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="flat-ctas flat-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="flat-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="flat-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {areas.length ? (
          <ul className="flat-areas flat-in" style={{ ['--i' as string]: 4 }} aria-label={pick(site.lang, { ru: 'Районы', uz: 'Tumanlar', en: 'Districts' })}>
            {areas.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <figure className="flat-hero__sheet">
        <Plan lang={site.lang} />
        <figcaption className="flat-day">
          <span>{pick(site.lang, { ru: 'день', uz: 'kun', en: 'day' })}</span>
          <b className="flat-day__n" aria-hidden="true" />
          <span className="flat-day__sr">30</span>
          <span>/ 30</span>
        </figcaption>
      </figure>
    </section>
  )
}

/** Планировки — карточки с мини-планом: комнаты по цифре из названия («2-комнатная»). */
function Layouts({ section: s }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works flat-layouts">
      <div className="flat-head" data-fl="rise">
        {s.label ? <p className="flat-label">{s.label}</p> : null}
        {s.title ? <h2 className="flat-h2">{s.title}</h2> : null}
      </div>
      <ul className="flat-layouts__list">
        {s.items.map((it, i) => (
          <li key={i} data-fl="rise" style={{ ['--i' as string]: i }}>
            <MiniPlan rooms={Number(it.title.match(/\d/)?.[0] ?? i + 1)} />
            <div className="flat-layouts__meta">
              <h3>{it.title}</h3>
              {it.category ? <span>{it.category}</span> : null}
            </div>
            {it.text ? <p>{it.text}</p> : null}
            {it.year ? <b>{it.year}</b> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Ход заказа — календарь на 30 дней (сегодня — день из заголовка) и кольца готовности этапов. */
function Progress({ section: s, site }: SectionProps<'process'>) {
  const today = Number(s.title.match(/(\d{1,2})\s*-?\s*(й|ы|th|kun)/i)?.[1] ?? 0)
  const rows = s.items.map((it) => {
    const m = it.title.match(/(\d{1,3})\s*%/)
    return { name: it.title.replace(/[\s—–-]*\d{1,3}\s*%\s*$/, '').trim(), pct: m ? Math.min(100, Number(m[1])) : null, text: it.text }
  })
  return (
    <section id={s.anchor || undefined} className="s s-process flat-progress">
      <div className="flat-head" data-fl="rise">
        {s.label ? <p className="flat-label">{s.label}</p> : null}
        {s.title ? <h2 className="flat-h2">{s.title}</h2> : null}
      </div>
      {today ? (
        <ol className="flat-cal" data-fl="days" aria-label={pick(site.lang, { ru: `День ${today} из 30`, uz: `30 kundan ${today}-kun`, en: `Day ${today} of 30` })}>
          {Array.from({ length: 30 }, (_, i) => (
            <li key={i} className={i + 1 < today ? 'is-past' : i + 1 === today ? 'is-today' : undefined} style={{ ['--i' as string]: i }}>
              {i + 1}
            </li>
          ))}
        </ol>
      ) : null}
      <ol className="flat-rings">
        {rows.map((r, i) => (
          <li key={i} data-fl="ring" style={{ ['--i' as string]: i, ['--p' as string]: r.pct ?? 0 }}>
            {r.pct !== null ? (
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="32" cy="32" r="27" className="flat-rings__track" />
                <circle cx="32" cy="32" r="27" pathLength="100" className="flat-rings__fill" />
              </svg>
            ) : null}
            <div>
              <h3>
                {r.name}
                {r.pct !== null ? <span> · {r.pct}%</span> : null}
              </h3>
              {r.text ? <p>{r.text}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats flat-stats">
      {s.title ? <h2 className="flat-stats__title" data-fl="rise">{s.title}</h2> : null}
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-fl="rise" style={{ ['--i' as string]: i }}>
            <dd>
              {it.value}
              {it.suffix ? <small>{it.suffix.trim()}</small> : null}
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Пакеты — листы договора с галочками. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing flat-pricing">
      <div className="flat-head" data-fl="rise">
        {s.label ? <p className="flat-label">{s.label}</p> : null}
        {s.title ? <h2 className="flat-h2">{s.title}</h2> : null}
      </div>
      <div className="flat-pricing__list">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-fl="rise" style={{ ['--i' as string]: i }}>
            <p className="flat-pricing__no">
              {pick(site.lang, { ru: 'Пакет', uz: 'Paket', en: 'Package' })} № {i + 1}
            </p>
            <h3>{it.name}</h3>
            <p className="flat-pricing__price">
              {it.price}
              {it.period ? <span>{it.period}</span> : null}
            </p>
            <ul>
              {it.features.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery flat-gallery">
      <div className="flat-head" data-fl="rise">
        {s.label ? <p className="flat-label">{s.label}</p> : null}
        {s.title ? <h2 className="flat-h2">{s.title}</h2> : null}
      </div>
      <ul className="flat-gallery__grid">
        {s.items.map((it, i) => (
          <li key={i} data-fl="rise" style={{ ['--i' as string]: i % 2 }}>
            <figure>
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="grid" className="media" />
              {it.caption ? <figcaption>{it.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq flat-faq">
      <div className="flat-head" data-fl="rise">
        {s.label ? <p className="flat-label">{s.label}</p> : null}
        {s.title ? <h2 className="flat-h2">{s.title}</h2> : null}
      </div>
      <div className="flat-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item flat-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i aria-hidden="true" />
            </summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function Contact({ section: s, site }: SectionProps<'contact'>) {
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-contact flat-contact">
      <div className="flat-contact__inner" data-fl="rise">
        {s.label ? <p className="flat-label">{s.label}</p> : null}
        {s.title ? <h2 className="flat-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="flat-contact__text">{s.text}</p> : null}
        <div className="flat-ctas">
          {s.cta.label ? (
            <a className="flat-btn flat-btn--light" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="flat-link" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
        </div>
      </div>
      <svg className="flat-contact__key" viewBox="0 0 120 240" aria-hidden="true">
        <circle cx="60" cy="52" r="40" />
        <circle cx="60" cy="40" r="12" />
        <path d="M60 92 V216 M60 160 H84 M60 188 H80 M60 216 H86" />
      </svg>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, works: Layouts, process: Progress, stats: Stats, pricing: Pricing, gallery: Gallery, faq: Faq, contact: Contact },
}
