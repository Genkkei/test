import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { SalonMotion } from './client'

/*
 * ДЖЕЗВА — восточная кофейня у базара. Ведущий приём — «три подъёма»: кофе на песке поднимают трижды,
 * и окно-пештак с джезвой на первом экране наполняется так же — снизу вверх тремя волнами, рядом загораются
 * I · II · III. Вокруг — гирих, который чертится по линиям. Меню — изразцы, двор — аркада из трёх арок,
 * отзывы — открытки с марками. Порядок входа: рамка гириха → три подъёма окна → заголовок → «сегодня варим»
 * перещёлкивает добавку (hero.words) → кнопки. Кривая — (.33,1,.68,1), подъём — пружина.
 * Шрифты: El Messiri (заголовки), Lunasima (текст), PT Mono (цены, метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const ROMAN = ['I', 'II', 'III']

/** Арка-пештак в долях коробки: стрельчатый верх (килевидная арка), прямые стены. */
const ARCH = 'M0,1 V0.4 C0,0.24 0.26,0.16 0.4,0.08 C0.46,0.05 0.49,0.02 0.5,0 C0.51,0.02 0.54,0.05 0.6,0.08 C0.74,0.16 1,0.24 1,0.4 V1 Z'

/** Восьмиконечная звезда гириха — узор полосы и подвала. */
function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2 L25 15 L38 20 L25 25 L20 38 L15 25 L2 20 L15 15 Z M8 8 L32 32 M32 8 L8 32" pathLength="1" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <SalonMotion />
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <clipPath id="salon-arch" clipPathUnits="objectBoundingBox">
          <path d={ARCH} />
        </clipPath>
        <pattern id="salon-girih" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 4 L37 23 L56 30 L37 37 L30 56 L23 37 L4 30 L23 23 Z M0 0 L12 12 M60 0 L48 12 M0 60 L12 48 M60 60 L48 48" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </svg>
      <header className="salon-bar">
        <a href="#top" className="salon-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="salon-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="salon-bar__side">
          {site.nav.cta.label ? (
            <a className="salon-btn salon-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="salon-foot">
        <svg className="salon-foot__pattern" aria-hidden="true">
          <rect width="100%" height="100%" fill="url(#salon-girih)" />
        </svg>
        <div className="salon-foot__inner">
          <p className="salon-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
          <p className="salon-foot__tag">{site.tagline}</p>
          <div className="salon-foot__cols">
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
          <p className="salon-foot__legal">
            <span>
              © {new Date().getFullYear()} {b.legalName || site.name}
            </span>
            <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const words = s.words.filter(Boolean)
  return (
    <section id={s.anchor || undefined} className="s s-hero salon-hero" data-salon-hero>
      <div className="salon-hero__text">
        {s.eyebrow ? <p className="salon-label salon-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="salon-title salon-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {words.length ? (
          <p className="salon-today salon-in" style={{ ['--i' as string]: 2 }}>
            <span>{pick(site.lang, { ru: 'Сегодня варим', uz: 'Bugun damlaymiz', en: 'Brewing today' })}</span>
            <b data-salon-word>{words[0]}</b>
          </p>
        ) : null}
        {s.subtitle ? <p className="salon-hero__sub salon-in" style={{ ['--i' as string]: 3 }}>{s.subtitle}</p> : null}
        <div className="salon-hero__ctas salon-in" style={{ ['--i' as string]: 4 }}>
          {s.cta.label ? (
            <a className="salon-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="salon-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {words.length > 1 ? <script type="application/json" data-salon-words dangerouslySetInnerHTML={{ __html: JSON.stringify(words) }} /> : null}
      </div>
      <div className="salon-portal" aria-hidden="true">
        <svg className="salon-portal__frame" viewBox="0 0 100 130" preserveAspectRatio="none">
          <path d="M2 128 V52 C2 31 28 21 42 11 C46 8 49 5 50 2 C51 5 54 8 58 11 C72 21 98 31 98 52 V128" pathLength="1" />
          <path d="M8 128 V54 C8 35 31 26 44 17 C47 15 49 12 50 10 C51 12 53 15 56 17 C69 26 92 35 92 54 V128" pathLength="1" />
        </svg>
        <div className="salon-portal__window">
          <div className="salon-portal__rise">
            {s.video ? (
              <video src={s.video} poster={s.image || undefined} autoPlay muted loop playsInline preload="metadata" />
            ) : (
              <Media src={s.image} alt="" seed={`${site.slug}-hero`} colors={palette(site)} kind="arch" className="media" />
            )}
          </div>
        </div>
        <ol className="salon-rises">
          {ROMAN.map((r, i) => (
            <li key={r} style={{ ['--i' as string]: i }}>
              {r}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** Бегущая строка → полоса гириха: слова между звёздами, звёзды прорисовываются по линиям. */
function Band({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s salon-band" aria-label={s.items.join(', ')}>
      <ul>
        {s.items.map((m, i) => (
          <li key={i} data-sa="star" style={{ ['--i' as string]: i }}>
            <Star className="salon-star" />
            <span>{m}</span>
          </li>
        ))}
        <li data-sa="star" style={{ ['--i' as string]: s.items.length }}>
          <Star className="salon-star" />
        </li>
      </ul>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about salon-about">
      <div className="salon-about__photo" data-sa="arch">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </div>
      <div className="salon-about__text" data-sa="rise">
        {s.label ? <p className="salon-label">{s.label}</p> : null}
        {s.title ? <h2 className="salon-h2">{s.title}</h2> : null}
        {s.text ? <p>{s.text}</p> : null}
      </div>
    </section>
  )
}

/** Меню — изразцы: у каждой группы свой бирюзовый изразец со звездой, ниже позиции с отточием. */
function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu salon-menu">
      <div className="salon-head" data-sa="rise">
        {s.label ? <p className="salon-label">{s.label}</p> : null}
        {s.title ? <h2 className="salon-h2">{s.title}</h2> : null}
      </div>
      <div className="salon-tiles">
        {s.groups.map((g, gi) => (
          <div key={gi} className="salon-tile" data-sa="rise" style={{ ['--i' as string]: gi }}>
            <h3 className="salon-tile__head">
              <Star className="salon-star" />
              {g.name}
            </h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={i}>
                  <span className="salon-tile__row">
                    <b>{it.name}</b>
                    <i aria-hidden="true" />
                    <span>{it.price}</span>
                  </span>
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

/** Двор — аркада: снимки в трёх арках, арки поднимаются по очереди. */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery salon-arcade">
      <div className="salon-head" data-sa="rise">
        {s.label ? <p className="salon-label">{s.label}</p> : null}
        {s.title ? <h2 className="salon-h2">{s.title}</h2> : null}
      </div>
      <ul className="salon-arcade__row">
        {s.items.map((it, i) => (
          <li key={i} data-sa="arch" style={{ ['--i' as string]: i }}>
            <div className="salon-arcade__img">
              <Media src={it.image} alt={it.caption} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="arch" className="media" />
            </div>
            <p>{it.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Отзывы — открытки: марка в углу, штемпель, наклон. */
function Testimonials({ section: s, site }: SectionProps<'testimonials'>) {
  const tilt = [-2.5, 1.8, -1.2, 2.6]
  return (
    <section id={s.anchor || undefined} className="s s-testimonials salon-posts">
      <div className="salon-head" data-sa="rise">
        {s.label ? <p className="salon-label">{s.label}</p> : null}
        {s.title ? <h2 className="salon-h2">{s.title}</h2> : null}
      </div>
      <div className="salon-posts__list">
        {s.items.map((it, i) => (
          <figure key={i} className="salon-card" data-sa="post" style={{ ['--r' as string]: `${tilt[i % tilt.length]}deg`, ['--i' as string]: i }}>
            <span className="salon-card__stamp" aria-hidden="true">
              <Star className="salon-star" />
            </span>
            <span className="salon-card__mark" aria-hidden="true">
              {site.business.city || 'Toshkent'}
            </span>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              {it.author}
              {it.role ? <small>{it.role}</small> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq salon-faq">
      <div className="salon-head" data-sa="rise">
        {s.label ? <p className="salon-label">{s.label}</p> : null}
        {s.title ? <h2 className="salon-h2">{s.title}</h2> : null}
      </div>
      <div className="salon-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item salon-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <Star className="salon-star" />
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
    <section id={s.anchor || undefined} className="s s-contact salon-contact">
      <div className="salon-contact__arch" data-sa="rise">
        {s.label ? <p className="salon-label">{s.label}</p> : null}
        {s.title ? <h2 className="salon-contact__title">{s.title}</h2> : null}
        {s.text ? <p>{s.text}</p> : null}
        <div className="salon-hero__ctas">
          {s.cta.label ? (
            <a className="salon-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="salon-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Band, about: About, menu: Menu, gallery: Gallery, testimonials: Testimonials, faq: Faq, contact: Contact },
}
