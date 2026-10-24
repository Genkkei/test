import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media, rng } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { ScoreMotion } from './client'

/*
 * ПАРТИТУРА — музыкальная школа. Первый экран — нотный стан во всю ширину: пять линеек чертятся, рисуется
 * ключ, ноты падают на свои линейки ритмом, потом бегунок проходит такт и подсвечивает каждую ноту, как в
 * плеере. Под нотами — названия инструментов (слова первого экрана). Занятия — клавиши фортепиано,
 * абонементы — ноты в папке, педагоги — руки на инструментах. Шрифты: Piazzolla, Manrope, IBM Plex Mono.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Staff({ seed, words }: { seed: string; words: string[] }) {
  const r = rng(seed)
  const W = 1200
  const top = 60
  const gap = 18
  const notes = Array.from({ length: 16 }, (_, i) => {
    const step = Math.floor(r() * 9) // позиция на стане: линейки и промежутки
    const y = top + 4 * gap - (step * gap) / 2
    return { x: 190 + i * 62, y, up: step < 4, i }
  })
  return (
    <svg className="sc-staff" viewBox={`0 0 ${W} 190`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g className="sc-staff__lines">
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d={`M20 ${top + i * gap} H${W - 20}`} pathLength="1" style={{ ['--i' as string]: i }} />
        ))}
        <path d={`M20 ${top} V${top + 4 * gap} M${W - 20} ${top} V${top + 4 * gap} M${W - 28} ${top} V${top + 4 * gap}`} className="sc-staff__bars" />
        <path d={`M${190 + 4 * 62 - 31} ${top} V${top + 4 * gap} M${190 + 8 * 62 - 31} ${top} V${top + 4 * gap} M${190 + 12 * 62 - 31} ${top} V${top + 4 * gap}`} className="sc-staff__bars" />
      </g>
      <path className="sc-staff__clef" pathLength="1" d="M92 160 C70 150 76 128 92 130 C104 132 104 150 92 152 C60 156 54 104 96 82 C120 68 118 36 104 30 C90 26 84 52 92 80 L108 176 C110 190 92 194 86 184" />
      <text className="sc-staff__time" x="128" y={top + 2 * gap - 2}>4</text>
      <text className="sc-staff__time" x="128" y={top + 4 * gap - 2}>4</text>
      <g className="sc-staff__notes">
        {notes.map((n) => (
          <g key={n.i} style={{ ['--i' as string]: n.i }}>
            <ellipse cx={n.x} cy={n.y} rx="11" ry="8" transform={`rotate(-22 ${n.x} ${n.y})`} />
            <path d={n.up ? `M${n.x + 10} ${n.y - 2} V${n.y - 56}` : `M${n.x - 10} ${n.y + 2} V${n.y + 56}`} />
          </g>
        ))}
      </g>
      <rect className="sc-staff__head" x="170" y={top - 22} width="3" height={4 * gap + 44} rx="1.5" />
      {words.map((w, i) => (
        <text key={i} className="sc-staff__word" x={190 + i * (62 * 3) + 31} y="188" style={{ ['--i' as string]: i }}>
          {w}
        </text>
      ))}
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <ScoreMotion />
      <header className="sc-bar">
        <a href="#top" className="sc-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="sc-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="sc-bar__side">
          {site.nav.cta.label ? (
            <a className="sc-btn sc-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="sc-foot">
        <p className="sc-foot__fine">Fine</p>
        <p className="sc-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="sc-foot__cols">
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
        <p className="sc-foot__legal">
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
  const words = s.words.filter(Boolean).slice(0, 5)
  return (
    <section id={s.anchor || undefined} className="s s-hero sc-hero">
      <div className="sc-hero__top">
        {s.eyebrow ? <p className="sc-label sc-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <p className="sc-tempo sc-in" style={{ ['--i' as string]: 0 }} aria-hidden="true">
          ♩ = 96
        </p>
      </div>
      <h1 className="sc-title sc-in" style={{ ['--i' as string]: 1 }}>
        {s.title || site.name}
      </h1>
      <Staff seed={`${site.slug}-melody`} words={words} />
      <div className="sc-hero__foot">
        {s.subtitle ? <p className="sc-hero__sub sc-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="sc-ctas sc-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="sc-btn" href={s.cta.href || '#'}>
              <span aria-hidden="true">▶</span> {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="sc-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Жанры — нотная строка: жанры между тактовыми чертами. */
function Genres({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s sc-genres" aria-label={s.items.join(', ')}>
      <p data-sc="rise">
        {s.items.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </p>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about sc-about">
      <div className="sc-about__text" data-sc="rise">
        {s.label ? <p className="sc-label">{s.label}</p> : null}
        {s.title ? <h2 className="sc-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
      <figure className="sc-about__photo" data-sc="rise" style={{ ['--i' as string]: 1 }}>
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="waves" className="media" />
      </figure>
    </section>
  )
}

/** Занятия — клавиши фортепиано: каждая клавиша — инструмент, нажатие опускает её. */
function Keys({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services sc-keys">
      <div className="sc-head" data-sc="rise">
        {s.label ? <p className="sc-label">{s.label}</p> : null}
        {s.title ? <h2 className="sc-h2">{s.title}</h2> : null}
        {s.intro ? <p className="sc-head__intro">{s.intro}</p> : null}
      </div>
      <ol className="sc-keys__board" data-sc="keys">
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <div className="sc-keys__key" tabIndex={0}>
              {it.tag ? <span className="sc-keys__time">{it.tag}</span> : null}
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
              {it.price ? <b>{it.price}</b> : null}
            </div>
            {i < s.items.length - 1 ? <span className="sc-keys__black" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Цифры — темповые пометки. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats sc-stats">
      {s.title ? <h2 className="sc-label" data-sc="rise">{s.title}</h2> : null}
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-sc="rise" style={{ ['--i' as string]: i }}>
            <dd>
              <span aria-hidden="true">♩ = </span>
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

/** Абонементы — нотные папки. */
function Pricing({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing sc-folders">
      <div className="sc-head" data-sc="rise">
        {s.label ? <p className="sc-label">{s.label}</p> : null}
        {s.title ? <h2 className="sc-h2">{s.title}</h2> : null}
      </div>
      <div className="sc-folders__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-sc="rise" style={{ ['--i' as string]: i }}>
            <span className="sc-folders__clef" aria-hidden="true">
              𝄞
            </span>
            <h3>{it.name}</h3>
            <p className="sc-folders__price">
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

function Team({ section: s, site }: SectionProps<'team'>) {
  return (
    <section id={s.anchor || undefined} className="s s-team sc-team">
      <div className="sc-head" data-sc="rise">
        {s.label ? <p className="sc-label">{s.label}</p> : null}
        {s.title ? <h2 className="sc-h2">{s.title}</h2> : null}
      </div>
      <ul className="sc-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-sc="rise" style={{ ['--i' as string]: i }}>
            <figure>
              <Media src={it.image} alt={`${it.name}, ${it.role}`} seed={`${site.slug}-t${i}`} colors={palette(site)} kind="waves" className="media" />
            </figure>
            <h3>{it.name}</h3>
            <p>{it.role}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials sc-voices">
      <div className="sc-head" data-sc="rise">
        {s.label ? <p className="sc-label">{s.label}</p> : null}
        {s.title ? <h2 className="sc-h2">{s.title}</h2> : null}
      </div>
      <div className="sc-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-sc="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq sc-faq">
      <div className="sc-head" data-sc="rise">
        {s.label ? <p className="sc-label">{s.label}</p> : null}
        {s.title ? <h2 className="sc-h2">{s.title}</h2> : null}
      </div>
      <div className="sc-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item sc-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact sc-contact">
      <div className="sc-contact__inner" data-sc="rise">
        {s.label ? <p className="sc-label">{s.label}</p> : null}
        {s.title ? <h2 className="sc-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="sc-contact__text">{s.text}</p> : null}
        <div className="sc-ctas">
          {s.cta.label ? (
            <a className="sc-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              <span aria-hidden="true">▶</span> {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="sc-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Genres, about: About, services: Keys, stats: Stats, pricing: Pricing, team: Team, testimonials: Testimonials, faq: Faq, contact: Contact },
}
