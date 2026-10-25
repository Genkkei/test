import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { LuminaMotion } from './client'

/*
 * ЛЮМИНА — салон светлой мебели и света. Первый экран — комната, в которой гаснет день: опускается шнур,
 * абажур качается и включается, конус света ложится на диван, линии дивана прорисовываются, счётчик
 * доходит до 2700 K; кнопки кельвинов меняют цвет света. Каталог — ярлыки на шнурах, подбор — выключатели.
 * Шрифты: Advent Pro (заголовки), Manrope (текст), Fira Code (метки, кельвины).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <LuminaMotion />
      <header className="lm-bar">
        <a href="#top" className="lm-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="lm-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="lm-bar__side">
          {site.nav.cta.label ? (
            <a className="lm-btn lm-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="lm-foot">
        <p className="lm-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="lm-foot__cols">
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
        <p className="lm-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

const KELVIN = [
  { k: '2700', ru: 'тёплый', uz: 'iliq', en: 'warm' },
  { k: '3000', ru: 'мягкий', uz: 'yumshoq', en: 'soft' },
  { k: '4000', ru: 'дневной', uz: 'kunduzgi', en: 'daylight' },
] as const

/** Комната в сумерках: шнур опускается, абажур качается, лампа включается и освещает диван. */
function Room({ site }: { site: Site }) {
  const lang = site.lang
  return (
    <div className="lm-stage">
      <div className="lm-room" data-k="2700" aria-hidden="true">
        <div className="lm-room__dusk" />
        <div className="lm-room__cone" />
        <div className="lm-room__pool" />
        <div className="lm-lamp">
          <i className="lm-lamp__cord" />
          <svg className="lm-lamp__shade" viewBox="0 0 120 70">
            <path d="M60 4 C26 4 8 34 6 62 H114 C112 34 94 4 60 4 Z" />
            <ellipse cx="60" cy="62" rx="54" ry="6" className="lm-lamp__rim" />
          </svg>
          <i className="lm-lamp__bulb" />
        </div>
        <svg className="lm-sofa" viewBox="0 0 400 170">
          <path pathLength="1" className="lm-sofa__line" d="M40 150 V92 C40 70 52 62 72 62 H328 C348 62 360 70 360 92 V150 M24 150 H376 M40 110 C40 98 30 92 20 96 C10 100 10 116 14 130 L24 150 M360 110 C360 98 370 92 380 96 C390 100 390 116 386 130 L376 150 M76 62 C76 40 90 30 110 30 H290 C310 30 324 40 324 62 M200 32 V104 M60 104 H340 M48 150 V164 M352 150 V164" />
        </svg>
        <svg className="lm-table" viewBox="0 0 90 120">
          <path pathLength="1" className="lm-sofa__line" d="M6 40 H84 M45 40 V112 M22 112 H68 M30 40 L36 18 H54 L60 40 M45 18 V8" />
        </svg>
        <span className="lm-room__k">
          <b />
          <small>K</small>
        </span>
      </div>
      <div className="lm-kelvin" role="group" aria-label={pick(lang, { ru: 'Цвет света', uz: 'Yorugʻlik rangi', en: 'Light colour' })}>
        {KELVIN.map((x, i) => (
          <button key={x.k} type="button" value={x.k} aria-pressed={i === 0} style={{ ['--i' as string]: i }}>
            <i />
            {x.k} K<small>{pick(lang, x)}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero lm-hero">
      <div className="lm-hero__text">
        {s.eyebrow ? <p className="lm-label lm-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="lm-title lm-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="lm-hero__sub lm-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="lm-ctas lm-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="lm-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="lm-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {s.words.length ? (
          <ul className="lm-words lm-in" style={{ ['--i' as string]: 4 }}>
            {s.words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <Room site={site} />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about lm-about">
      <figure className="lm-about__photo" data-lm="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="lm-about__text" data-lm="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="lm-label">{s.label}</p> : null}
        {s.title ? <h2 className="lm-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Каталог — ярлыки на шнурах под маленькими лампами: раскачиваются и загораются при появлении. */
function Prices({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services lm-prices">
      <div className="lm-head" data-lm="rise">
        {s.label ? <p className="lm-label">{s.label}</p> : null}
        {s.title ? <h2 className="lm-h2">{s.title}</h2> : null}
        {s.intro ? <p className="lm-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="lm-prices__list">
        {s.items.map((it, i) => (
          <li key={i} data-lm="hang" style={{ ['--i' as string]: i }}>
            <i className="lm-prices__cord" aria-hidden="true" />
            {it.tag ? <em>{it.tag}</em> : null}
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
            {it.price ? <b>{it.price}</b> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats lm-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-lm="glow" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team lm-team">
      <div className="lm-head" data-lm="rise">
        {s.label ? <p className="lm-label">{s.label}</p> : null}
        {s.title ? <h2 className="lm-h2">{s.title}</h2> : null}
      </div>
      <ul className="lm-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-lm="rise" style={{ ['--i' as string]: i }}>
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

/** Подбор света — ряд выключателей: при появлении щёлкают по очереди, над каждым загорается полоса. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process lm-steps">
      <div className="lm-head" data-lm="rise">
        {s.label ? <p className="lm-label">{s.label}</p> : null}
        {s.title ? <h2 className="lm-h2">{s.title}</h2> : null}
      </div>
      <ol className="lm-steps__list" data-lm="switch">
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="lm-steps__strip" aria-hidden="true" />
            <span className="lm-steps__switch" aria-hidden="true">
              <i />
            </span>
            <span className="lm-steps__n">{String(i + 1).padStart(2, '0')}</span>
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
    <section id={s.anchor || undefined} className="s s-testimonials lm-voices">
      <div className="lm-head" data-lm="rise">
        {s.label ? <p className="lm-label">{s.label}</p> : null}
        {s.title ? <h2 className="lm-h2">{s.title}</h2> : null}
      </div>
      <div className="lm-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-lm="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq lm-faq">
      <div className="lm-head" data-lm="rise">
        {s.label ? <p className="lm-label">{s.label}</p> : null}
        {s.title ? <h2 className="lm-h2">{s.title}</h2> : null}
      </div>
      <div className="lm-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item lm-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="lm-chain" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact lm-contact">
      <div className="lm-contact__lamp" aria-hidden="true">
        <i />
      </div>
      <div className="lm-contact__inner" data-lm="rise">
        {s.label ? <p className="lm-label">{s.label}</p> : null}
        {s.title ? <h2 className="lm-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="lm-contact__text">{s.text}</p> : null}
        <div className="lm-ctas">
          {s.cta.label ? (
            <a className="lm-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="lm-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, services: Prices, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
