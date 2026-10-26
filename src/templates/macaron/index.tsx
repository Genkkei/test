import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { MacaronMotion } from './client'

/*
 * МАКАРОН — тихая утренняя кофейня с завтраками. Первый экран — пуровер сбоку: чайник наклоняется, тонкая
 * струя в воронку, кофе капает в колбу, уровень медленно поднимается, таймер 3:00 → 0:00, пар над кружкой.
 * Завтраки — меню-раскладушка, сезон — листки отрывного календаря, зал — снимки под аркой окна.
 * Шрифты: Alice (заголовки), Literata (текст), PT Mono (метки, таймер).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <MacaronMotion />
      <header className="mc-bar">
        <a href="#top" className="mc-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="mc-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mc-bar__side">
          {site.nav.cta.label ? (
            <a className="mc-btn mc-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="mc-foot">
        <p className="mc-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="mc-foot__cols">
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
        <p className="mc-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Пуровер сбоку: чайник наклоняется, тонкая струя льётся в воронку, кофе капает в колбу, уровень медленно
 *  поднимается, таймер заваривания идёт с 3:00 до нуля, над кружкой пар — «утро, которое не торопит». */
function PourOver({ site }: { site: Site }) {
  return (
    <div className="mc-brew" aria-hidden="true">
      <svg viewBox="0 0 360 380">
        <g className="mc-kettle">
          <path className="mc-kettle__body" d="M210 40 H300 C312 40 318 48 318 60 V112 C318 124 310 130 298 130 H212 C200 130 194 124 194 112 V60 C194 48 200 40 210 40 Z" />
          <path className="mc-kettle__spout" d="M196 104 C170 100 160 80 150 62 C146 56 140 54 134 56" />
          <path className="mc-kettle__lid" d="M226 40 C228 28 284 28 286 40 M252 26 V18" />
          <path className="mc-kettle__handle" d="M318 58 C344 58 344 112 318 112" />
        </g>
        <path className="mc-stream" d="M118 94 C122 108 126 120 128 132" pathLength="1" />
        <g className="mc-dripper">
          <path d="M84 132 H172 L146 196 H110 Z" />
          <path d="M80 132 H176" className="mc-dripper__rim" />
          <path d="M112 200 H144" />
        </g>
        {[0, 1, 2].map((k) => (
          <circle key={k} className="mc-drop" cx="128" cy="204" r="3" style={{ ['--k' as string]: k }} />
        ))}
        <defs>
          <clipPath id="mc-flask">
            <path d="M96 214 H160 V226 C200 250 206 336 168 352 H88 C50 336 56 250 96 226 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#mc-flask)">
          <rect className="mc-coffee" x="40" y="214" width="180" height="140" />
        </g>
        <path className="mc-flask" d="M96 214 H160 V226 C200 250 206 336 168 352 H88 C50 336 56 250 96 226 Z" />
        <path className="mc-board" d="M30 356 H340" />
        <g className="mc-cup">
          <path d="M238 300 H312 V330 C312 346 300 354 284 354 H266 C250 354 238 346 238 330 Z" />
          <path d="M312 310 C330 310 330 334 312 334" />
        </g>
        <path className="mc-steam" d="M262 290 C254 276 270 268 262 252 M286 290 C278 276 294 268 286 252" />
      </svg>
      <p className="mc-timer">
        <b>
          <i className="mc-timer__m" />:<i className="mc-timer__s" />
        </b>
        <small>
          <span>{pick(site.lang, { ru: 'заваривается', uz: 'damlanmoqda', en: 'brewing' })}</span>
          <span>{pick(site.lang, { ru: 'готово', uz: 'tayyor', en: 'ready' })}</span>
        </small>
      </p>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero mc-hero">
      <div className="mc-hero__text">
        {s.eyebrow ? <p className="mc-label mc-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="mc-title mc-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="mc-hero__sub mc-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="mc-ctas mc-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="mc-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="mc-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <PourOver site={site} />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee mc-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={38} sep="◆" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about mc-about">
      <figure className="mc-about__photo" data-mc="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="mc-about__text" data-mc="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="mc-label">{s.label}</p> : null}
        {s.title ? <h2 className="mc-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Завтраки — меню-раскладушка: левая створка раскрывается при появлении, по сгибу — тень. */
function MenuCard({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu mc-menu">
      <div className="mc-head" data-mc="rise">
        {s.label ? <p className="mc-label">{s.label}</p> : null}
        {s.title ? <h2 className="mc-h2">{s.title}</h2> : null}
      </div>
      <div className="mc-menu__card" data-mc="fold">
        {s.groups.map((g, gi) => (
          <div key={gi} className="mc-menu__leaf">
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

/** Сезон — листки отрывного календаря: месяц сверху, блюдо на листке; листок перелистывается при появлении. */
function Season({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works mc-season">
      <div className="mc-head" data-mc="rise">
        {s.label ? <p className="mc-label">{s.label}</p> : null}
        {s.title ? <h2 className="mc-h2">{s.title}</h2> : null}
      </div>
      <ul className="mc-season__list">
        {s.items.map((it, i) => (
          <li key={i} data-mc="leaf" style={{ ['--i' as string]: i }}>
            <span className="mc-season__month">{it.year}</span>
            <figure>
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="arch" className="media" />
            </figure>
            {it.category ? <p className="mc-season__cat">{it.category}</p> : null}
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Зал — снимки под аркой окна, проявляются, как утренний свет.  */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery mc-gallery">
      <div className="mc-head" data-mc="rise">
        {s.label ? <p className="mc-label">{s.label}</p> : null}
        {s.title ? <h2 className="mc-h2">{s.title}</h2> : null}
      </div>
      <ul className="mc-gallery__grid">
        {s.items.map((it, i) => (
          <li key={i} data-mc="dawn" style={{ ['--i' as string]: i }}>
            <figure>
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="arch" className="media" />
              {it.caption ? <figcaption>{it.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats mc-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-mc="rise" style={{ ['--i' as string]: i }}>
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

function Team({ section: s, site }: SectionProps<'team'>) {
  return (
    <section id={s.anchor || undefined} className="s s-team mc-team">
      <div className="mc-head" data-mc="rise">
        {s.label ? <p className="mc-label">{s.label}</p> : null}
        {s.title ? <h2 className="mc-h2">{s.title}</h2> : null}
      </div>
      <ul className="mc-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-mc="rise" style={{ ['--i' as string]: i }}>
            <figure>
              <Media src={it.image} alt={`${it.name}, ${it.role}`} seed={`${site.slug}-t${i}`} colors={palette(site)} kind="arch" className="media" />
            </figure>
            <h3>{it.name}</h3>
            <p>{it.role}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Как заказать — шаги под гирляндой: между шагами провисают резные фестоны. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process mc-swag">
      <div className="mc-head mc-head--center" data-mc="rise">
        {s.label ? <p className="mc-label">{s.label}</p> : null}
        {s.title ? <h2 className="mc-h2">{s.title}</h2> : null}
      </div>
      <ol className="mc-swag__list" data-mc="swag" style={{ ['--n' as string]: s.items.length }}>
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <svg className="mc-swag__garland" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 4 C30 34 70 34 100 4" />
            </svg>
            <span className="mc-swag__n">{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i] || i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials mc-voices">
      <div className="mc-head" data-mc="rise">
        {s.label ? <p className="mc-label">{s.label}</p> : null}
        {s.title ? <h2 className="mc-h2">{s.title}</h2> : null}
      </div>
      <div className="mc-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-mc="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq mc-faq">
      <div className="mc-head" data-mc="rise">
        {s.label ? <p className="mc-label">{s.label}</p> : null}
        {s.title ? <h2 className="mc-h2">{s.title}</h2> : null}
      </div>
      <div className="mc-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item mc-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="mc-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact mc-contact">
      
      <div className="mc-contact__inner" data-mc="rise">
        {s.label ? <p className="mc-label">{s.label}</p> : null}
        {s.title ? <h2 className="mc-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="mc-contact__text">{s.text}</p> : null}
        <div className="mc-ctas">
          {s.cta.label ? (
            <a className="mc-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="mc-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, menu: MenuCard, works: Season, gallery: Gallery, marquee: MarqueeSec, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
