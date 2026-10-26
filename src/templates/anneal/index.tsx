import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { AnnealMotion } from './client'

/*
 * ОТПУСК — кузница мангалов и печей. Первый экран — плита стали 6 мм над углями: по металлу снизу вверх идут
 * цвета побежалости, термометр доходит до 800 °C, тонкий лист 2 мм рядом ведёт волной, а плита держит форму —
 * «огонь любит толстый металл». Каталог — шильды на заклёпках, этапы — шкала побежалости, работы нагреваются.
 * Шрифты: Seymour One (заголовки), Golos Text (текст), Source Code Pro (метки, градусы).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <AnnealMotion />
      <header className="an-bar">
        <a href="#top" className="an-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="an-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="an-bar__side">
          {site.nav.cta.label ? (
            <a className="an-btn an-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="an-foot">
        <p className="an-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="an-foot__cols">
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
        <p className="an-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Плита стали 6 мм: снизу разгораются угли, по металлу поднимаются цвета побежалости (соломенный → бронза →
 *  фиолетовый → синий), термометр доходит до 800 °C; тонкий лист 2 мм рядом ведёт волной, плиту — нет. */
function Plate({ title, mm }: { title: string; mm: string }) {
  return (
    <div className="an-forge" aria-hidden="true">
      <div className="an-plate">
        <span className="an-plate__temper" />
        <span className="an-plate__grain" />
        <span className="an-plate__edge" />
        <span className="an-plate__stamp">{title}</span>
        <span className="an-plate__gauge">
          <b />
          <small>{mm}</small>
        </span>
      </div>
      <svg className="an-sheet" viewBox="0 0 400 40" preserveAspectRatio="none">
        <path className="an-sheet__line" d="M0 20 C50 20 100 20 150 20 C200 20 250 20 300 20 C350 20 375 20 400 20" />
      </svg>
      <span className="an-sheet__label">2 {mm}</span>
      <div className="an-coals">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <span className="an-temp">
        <b />
        <small>°C</small>
      </span>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero an-hero">
      <div className="an-hero__text">
        {s.eyebrow ? <p className="an-label an-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="an-title an-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="an-hero__sub an-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="an-ctas an-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="an-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="an-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <Plate title={pick(site.lang, { ru: 'сталь', uz: 'poʻlat', en: 'steel' })} mm={pick(site.lang, { ru: 'мм', uz: 'mm', en: 'mm' })} />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee an-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={38} sep="◆" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about an-about">
      <figure className="an-about__photo" data-an="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="an-about__text" data-an="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="an-label">{s.label}</p> : null}
        {s.title ? <h2 className="an-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Каталог — стальные шильды на заклёпках: текст выбит, при наведении металл нагревается. */
function Plates({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services an-plates">
      <div className="an-head" data-an="rise">
        {s.label ? <p className="an-label">{s.label}</p> : null}
        {s.title ? <h2 className="an-h2">{s.title}</h2> : null}
        {s.intro ? <p className="an-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="an-plates__list">
        {s.items.map((it, i) => (
          <li key={i} data-an="rise" style={{ ['--i' as string]: i }}>
            <i className="an-rivet" aria-hidden="true" />
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

/** Работы — лента снимков: холодные серые, при появлении «нагреваются» до цвета. */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery an-gallery">
      <div className="an-head" data-an="rise">
        {s.label ? <p className="an-label">{s.label}</p> : null}
        {s.title ? <h2 className="an-h2">{s.title}</h2> : null}
      </div>
      <ul className="an-gallery__strip">
        {s.items.map((it, i) => (
          <li key={i} data-an="heat" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-stats an-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-an="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team an-team">
      <div className="an-head" data-an="rise">
        {s.label ? <p className="an-label">{s.label}</p> : null}
        {s.title ? <h2 className="an-h2">{s.title}</h2> : null}
      </div>
      <ul className="an-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-an="rise" style={{ ['--i' as string]: i }}>
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

/** Этапы — шкала побежалости: каждый шаг — следующий цвет нагретой стали, от соломенного до синего. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process an-scale">
      <div className="an-head" data-an="rise">
        {s.label ? <p className="an-label">{s.label}</p> : null}
        {s.title ? <h2 className="an-h2">{s.title}</h2> : null}
      </div>
      <ol className="an-scale__list" data-an="temper" style={{ ['--n' as string]: s.items.length }}>
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="an-scale__chip" aria-hidden="true" />
            <span className="an-scale__deg">{220 + Math.round((i * 100) / Math.max(1, s.items.length - 1))} °C</span>
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
    <section id={s.anchor || undefined} className="s s-testimonials an-voices">
      <div className="an-head" data-an="rise">
        {s.label ? <p className="an-label">{s.label}</p> : null}
        {s.title ? <h2 className="an-h2">{s.title}</h2> : null}
      </div>
      <div className="an-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-an="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq an-faq">
      <div className="an-head" data-an="rise">
        {s.label ? <p className="an-label">{s.label}</p> : null}
        {s.title ? <h2 className="an-h2">{s.title}</h2> : null}
      </div>
      <div className="an-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item an-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="an-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact an-contact">
      <div className="an-contact__coals" aria-hidden="true" />
      <div className="an-contact__inner" data-an="rise">
        {s.label ? <p className="an-label">{s.label}</p> : null}
        {s.title ? <h2 className="an-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="an-contact__text">{s.text}</p> : null}
        <div className="an-ctas">
          {s.cta.label ? (
            <a className="an-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="an-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, services: Plates, gallery: Gallery, marquee: MarqueeSec, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
