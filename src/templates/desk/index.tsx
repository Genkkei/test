import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media, rng } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { DeskMotion } from './client'
import { meta } from './meta'

/*
 * СТОЛ — кофейня-коворкинг. Первый экран — схема зала сверху: столы у окон, тихая зона, переговорные, стойка.
 * Часы идут 8:00 → 14:00, места занимаются одно за другим (серые), одно остаётся свободным — зелёная точка
 * пульсирует, и всплывает карточка «Место 14 · свободно». Зоны — плитки с точками мест, тарифы — бейджи
 * на шнурке, меню — экран заказов у стойки. Шрифты: Wix Madefor Display, Onest, Roboto Mono.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

type Seat = { x: number; y: number; i: number }

function Floor({ seed, lang }: { seed: string; lang: string }) {
  const r = rng(seed)
  const seats: Seat[] = []
  // два длинных стола у окон
  for (let row = 0; row < 2; row++) for (let k = 0; k < 8; k++) seats.push({ x: 70 + k * 46, y: 70 + row * 64, i: 0 })
  // тихая зона — кресла
  for (let k = 0; k < 6; k++) seats.push({ x: 470 + (k % 3) * 46, y: 70 + Math.floor(k / 3) * 56, i: 0 })
  // столики у стойки
  for (let k = 0; k < 6; k++) seats.push({ x: 70 + k * 56, y: 286, i: 0 })
  const order = seats.map((_, i) => i).sort(() => r() - 0.5)
  order.forEach((s, k) => (seats[s].i = k))
  const free = 13
  return (
    <svg className="desk-floor" viewBox="0 0 640 380" role="img" aria-label={pick(lang, { ru: 'Схема зала: свободное место 14', uz: 'Zal sxemasi: 14-joy bo‘sh', en: 'Floor plan: seat 14 is free' })}>
      <rect x="20" y="20" width="600" height="340" rx="14" className="desk-floor__room" />
      <path d="M40 20 H420" className="desk-floor__window" />
      <rect x="50" y="88" width="370" height="12" rx="6" className="desk-floor__table" />
      <rect x="50" y="152" width="370" height="12" rx="6" className="desk-floor__table" />
      <rect x="450" y="40" width="150" height="140" rx="10" className="desk-floor__zone" />
      <text x="525" y="200" textAnchor="middle" className="desk-floor__t">{pick(lang, { ru: 'тихая зона', uz: 'sokin zona', en: 'quiet zone' })}</text>
      <rect x="440" y="230" width="80" height="110" rx="8" className="desk-floor__meet" />
      <rect x="530" y="230" width="80" height="110" rx="8" className="desk-floor__meet" />
      <text x="525" y="292" textAnchor="middle" className="desk-floor__t">{pick(lang, { ru: 'переговорные', uz: 'muzokara xonalari', en: 'meeting rooms' })}</text>
      <path d="M40 240 H400" className="desk-floor__bar" />
      <text x="220" y="232" textAnchor="middle" className="desk-floor__t">{pick(lang, { ru: 'стойка бариста', uz: 'barista peshtaxtasi', en: 'barista counter' })}</text>
      <g className="desk-floor__seats">
        {seats.map((s, k) => (
          <circle key={k} cx={s.x} cy={s.y} r="11" className={k === free ? 'is-free' : undefined} style={{ ['--i' as string]: s.i }} />
        ))}
      </g>
      <g className="desk-floor__pin" style={{ ['--x' as string]: `${seats[free].x}px`, ['--y' as string]: `${seats[free].y}px` }}>
        <circle cx={seats[free].x} cy={seats[free].y} r="11" className="desk-floor__ring" />
      </g>
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <DeskMotion />
      <header className="desk-bar">
        <a href="#top" className="desk-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="desk-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="desk-bar__side">
          <span className="desk-bar__open" aria-hidden="true">
            <i /> {pick(site.lang, { ru: 'открыто', uz: 'ochiq', en: 'open' })}
          </span>
          {site.nav.cta.label ? (
            <a className="desk-btn desk-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="desk-foot">
        <p className="desk-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="desk-foot__cols">
          <p>{site.tagline}</p>
          {address ? (
            <p>
              <small>{ui(site.lang, 'address')}</small>
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
        <p className="desk-foot__legal">
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
  const tags = s.words.filter(Boolean).slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero desk-hero">
      <div className="desk-hero__text">
        {s.eyebrow ? <p className="desk-label desk-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="desk-title desk-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="desk-hero__sub desk-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="desk-ctas desk-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="desk-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="desk-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label} →
            </a>
          ) : null}
        </div>
        {tags.length ? (
          <ul className="desk-tags desk-in" style={{ ['--i' as string]: 4 }}>
            {tags.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <figure className="desk-hero__map">
        <div className="desk-clock" aria-hidden="true">
          <span className="desk-clock__h" />
          <span>:</span>
          <span>00</span>
        </div>
        <Floor seed={`${site.slug}-seats`} lang={site.lang} />
        <figcaption className="desk-ticket">
          <b>{pick(site.lang, { ru: 'Место 14', uz: '14-joy', en: 'Seat 14' })}</b>
          <span>{pick(site.lang, { ru: 'свободно · у окна · розетка', uz: 'bo‘sh · deraza yonida · rozetka', en: 'free · by the window · socket' })}</span>
        </figcaption>
      </figure>
    </section>
  )
}

/** Зоны — плитки с точками мест: число точек — из метки («40 мест»). */
function Zones({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services desk-zones">
      <div className="desk-head" data-dk="rise">
        {s.label ? <p className="desk-label">{s.label}</p> : null}
        {s.title ? <h2 className="desk-h2">{s.title}</h2> : null}
      </div>
      <ul className="desk-zones__grid">
        {s.items.map((it, i) => {
          const n = Math.min(40, Number(it.tag.match(/\d+/)?.[0] ?? 0))
          return (
            <li key={i} data-dk="seats" style={{ ['--i' as string]: i }}>
              {n ? (
                <div className="desk-zones__dots" aria-hidden="true">
                  {Array.from({ length: n }, (_, k) => (
                    <i key={k} style={{ ['--k' as string]: k }} />
                  ))}
                </div>
              ) : null}
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
              <div className="desk-zones__meta">
                {it.tag ? <span>{it.tag}</span> : null}
                {it.price ? <b>{it.price}</b> : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats desk-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-dk="rise" style={{ ['--i' as string]: i }}>
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

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about desk-about">
      <figure className="desk-about__photo" data-dk="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="grid" className="media" />
      </figure>
      <div className="desk-about__text" data-dk="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="desk-label">{s.label}</p> : null}
        {s.title ? <h2 className="desk-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Меню — экран заказов у стойки: группы колонками, цены моноширинным. */
function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu desk-menu">
      <div className="desk-head" data-dk="rise">
        {s.label ? <p className="desk-label">{s.label}</p> : null}
        {s.title ? <h2 className="desk-h2">{s.title}</h2> : null}
      </div>
      <div className="desk-menu__screen" data-dk="rise">
        {s.groups.map((g, gi) => (
          <div key={gi} className="desk-menu__col">
            <h3>{g.name}</h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={i}>
                  <span>{it.name}</span>
                  <b>{it.price}</b>
                  {it.text ? <small>{it.text}</small> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Тарифы — бейджи на шнурке. */
function Badges({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing desk-badges">
      <div className="desk-head" data-dk="rise">
        {s.label ? <p className="desk-label">{s.label}</p> : null}
        {s.title ? <h2 className="desk-h2">{s.title}</h2> : null}
      </div>
      <div className="desk-badges__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-dk="swing" style={{ ['--i' as string]: i }}>
            <span className="desk-badges__cord" aria-hidden="true" />
            <div className="desk-badges__card">
              <i className="desk-badges__slot" aria-hidden="true" />
              <p className="desk-badges__kind">{pick(site.lang, { ru: 'пропуск', uz: 'ruxsatnoma', en: 'pass' })}</p>
              <h3>{it.name}</h3>
              <p className="desk-badges__price">
                {it.price}
                {it.period ? <span>{it.period}</span> : null}
              </p>
              <ul>
                {it.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery desk-gallery">
      <div className="desk-head" data-dk="rise">
        {s.label ? <p className="desk-label">{s.label}</p> : null}
        {s.title ? <h2 className="desk-h2">{s.title}</h2> : null}
      </div>
      <ul className="desk-gallery__bento">
        {s.items.map((it, i) => (
          <li key={i} data-dk="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq desk-faq">
      <div className="desk-head" data-dk="rise">
        {s.label ? <p className="desk-label">{s.label}</p> : null}
        {s.title ? <h2 className="desk-h2">{s.title}</h2> : null}
      </div>
      <div className="desk-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item desk-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact desk-contact">
      <div className="desk-contact__inner" data-dk="rise">
        {s.label ? <p className="desk-label">{s.label}</p> : null}
        {s.title ? <h2 className="desk-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="desk-contact__text">{s.text}</p> : null}
        <div className="desk-ctas">
          {s.cta.label ? (
            <a className="desk-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="desk-link" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Zones, stats: Stats, about: About, menu: Menu, pricing: Badges, gallery: Gallery, faq: Faq, contact: Contact },
}
