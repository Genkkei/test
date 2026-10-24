import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { AxisMotion } from './client'

/*
 * ОСЬ — премиальный кофейный бар. Первый экран — стойка на двенадцать мест: медная линия стойки чертится
 * от центра к краям, над ней загораются двенадцать табуретов, над стойкой — фраза «Кофе, который…», а её
 * окончание крутит барабан (слова первого экрана по кругу, по оси X). Напитки — бокалы в разрезе со слоями,
 * вход — чёрная дверь без вывески с лампой. Шрифты: Poiret One (заголовки), Jost (текст), Victor Mono
 * курсив (метки, рецептуры).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
/** слои напитков в бокале: низ → верх */
const LAYERS = [
  ['#1a0e08', '#3a2014', '#e8f0e6'],
  ['#4a2a18', '#d9b38a', '#f3e2c8'],
  ['#5a1a1e', '#9c2a3a', '#3a2014'],
  ['#2a160c', '#6a3a1c', '#c98a4a'],
  ['#1a0e08', '#d0603a', '#f6d3a0'],
]

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <AxisMotion />
      <header className="ax-bar">
        <a href="#top" className="ax-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="ax-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ax-bar__side">
          {site.nav.cta.label ? (
            <a className="ax-btn ax-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="ax-foot">
        <p className="ax-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <span className="ax-foot__line" aria-hidden="true" />
        <div className="ax-foot__cols">
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
        <p className="ax-foot__legal">
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
  const endings = s.words.filter(Boolean).slice(0, 4)
  const n = Math.max(1, endings.length)
  return (
    <section id={s.anchor || undefined} className="s s-hero ax-hero">
      <div className="ax-hero__glow" aria-hidden="true" />
      {s.eyebrow ? <p className="ax-label ax-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
      <h1 className="ax-title">
        <span className="ax-title__fixed ax-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </span>
        {endings.length ? (
          <span className="ax-drum" data-n={n}>
            <span className="ax-drum__sr">{endings[endings.length - 1]}</span>
            <span className="ax-drum__reel" aria-hidden="true">
              {[...endings, endings[0]].map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </span>
          </span>
        ) : null}
      </h1>
      <div className="ax-counter" aria-hidden="true">
        <span className="ax-counter__line" />
        <span className="ax-counter__stools">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ ['--d' as string]: `${(Math.abs(i - 5.5) * 70).toFixed(0)}ms` }} />
          ))}
        </span>
      </div>
      <div className="ax-hero__foot">
        {s.subtitle ? <p className="ax-hero__sub ax-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="ax-ctas ax-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="ax-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="ax-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function Doing({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s ax-doing" aria-label={s.title || s.items.join(', ')}>
      <ul>
        {s.items.map((m, i) => (
          <li key={i} data-ax="rise" style={{ ['--i' as string]: i }}>
            {m}
          </li>
        ))}
      </ul>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about ax-about">
      <figure className="ax-about__photo" data-ax="light">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="orbit" className="media" />
      </figure>
      <div className="ax-about__text" data-ax="rise">
        {s.label ? <p className="ax-label">{s.label}</p> : null}
        {s.title ? <h2 className="ax-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Авторская карта — бокалы в разрезе: слои напитка наливаются при появлении. */
function Drinks({ section: s }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works ax-drinks">
      <div className="ax-head" data-ax="rise">
        {s.label ? <p className="ax-label">{s.label}</p> : null}
        {s.title ? <h2 className="ax-h2">{s.title}</h2> : null}
      </div>
      <ul className="ax-drinks__list">
        {s.items.map((it, i) => {
          const L = LAYERS[i % LAYERS.length]
          return (
            <li key={i} data-ax="pour" style={{ ['--i' as string]: i }}>
              <svg className="ax-glass" viewBox="0 0 80 120" aria-hidden="true">
                <defs>
                  <clipPath id={`ax-g${i}`}>
                    <path d="M14 8 H66 L60 108 Q40 114 20 108 Z" />
                  </clipPath>
                </defs>
                <g clipPath={`url(#ax-g${i})`} className="ax-glass__fill">
                  <rect x="0" y="70" width="80" height="50" fill={L[0]} />
                  <rect x="0" y="44" width="80" height="27" fill={L[1]} />
                  <rect x="0" y="30" width="80" height="15" fill={L[2]} />
                </g>
                <path d="M14 8 H66 L60 108 Q40 114 20 108 Z" className="ax-glass__edge" />
              </svg>
              <div className="ax-drinks__body">
                <h3>{it.title}</h3>
                {it.category ? <p className="ax-drinks__recipe">{it.category}</p> : null}
                {it.text ? <p>{it.text}</p> : null}
              </div>
              {it.year ? <b>{it.year}</b> : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu ax-menu">
      <div className="ax-head" data-ax="rise">
        {s.label ? <p className="ax-label">{s.label}</p> : null}
        {s.title ? <h2 className="ax-h2">{s.title}</h2> : null}
      </div>
      <div className="ax-menu__cols">
        {s.groups.map((g, gi) => (
          <div key={gi} data-ax="rise" style={{ ['--i' as string]: gi }}>
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

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats ax-stats">
      {s.label ? <p className="ax-label" data-ax="rise">{s.label}</p> : null}
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-ax="rise" style={{ ['--i' as string]: i }}>
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

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials ax-voices">
      <div className="ax-head" data-ax="rise">
        {s.label ? <p className="ax-label">{s.label}</p> : null}
        {s.title ? <h2 className="ax-h2">{s.title}</h2> : null}
      </div>
      <div className="ax-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-ax="rise" style={{ ['--i' as string]: i }}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              {it.author}
              {it.role ? <span>{it.role}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq ax-faq">
      <div className="ax-head" data-ax="rise">
        {s.label ? <p className="ax-label">{s.label}</p> : null}
        {s.title ? <h2 className="ax-h2">{s.title}</h2> : null}
      </div>
      <div className="ax-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item ax-faq__item" open={i === 0}>
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

/** Вход — чёрная дверь без вывески, над ней лампа. */
function Contact({ section: s, site }: SectionProps<'contact'>) {
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-contact ax-contact">
      <div className="ax-door" aria-hidden="true" data-ax="lamp">
        <span className="ax-door__lamp" />
        <span className="ax-door__leaf">
          <i />
        </span>
      </div>
      <div className="ax-contact__inner" data-ax="rise">
        {s.label ? <p className="ax-label">{s.label}</p> : null}
        {s.title ? <h2 className="ax-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="ax-contact__text">{s.text}</p> : null}
        <div className="ax-ctas">
          {s.cta.label ? (
            <a className="ax-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="ax-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Doing, about: About, works: Drinks, menu: Menu, stats: Stats, testimonials: Testimonials, faq: Faq, contact: Contact },
}
