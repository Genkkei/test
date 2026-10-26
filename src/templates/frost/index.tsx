import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { FrostMotion } from './client'

/*
 * МОРОЗ — выездная сварка за час. Холодный синий дуги на графите. Первый экран — диспетчерская: схема города,
 * падает метка заявки, ближайший из сварщиков едет к ней по улицам, статусы трекера загораются по очереди,
 * минуты идут к нулю, на месте — вспышка дуги. Цены — строки с валиком шва, выезд — сутки на ленте,
 * этапы — переписка с диспетчером.
 * Шрифты: Fira Sans Extra Condensed (заголовки), IBM Plex Sans (текст), IBM Plex Mono (метки, время).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <FrostMotion />
      <header className="fr-bar">
        <a href="#top" className="fr-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="fr-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="fr-bar__side">
          {site.nav.cta.label ? (
            <a className="fr-btn fr-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="fr-foot">
        <p className="fr-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="fr-foot__cols">
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
        <p className="fr-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Схема города: падает метка заявки, ближайший из двенадцати сварщиков едет к ней по улицам, статусы трекера
 *  загораются по очереди, счётчик минут идёт к нулю, на месте — вспышка сварочной дуги. */
const CREW: [number, number][] = [[60, 60], [150, 40], [330, 50], [380, 160], [60, 230], [120, 150], [250, 250], [350, 260], [30, 140], [300, 180], [190, 110]]
const ROUTE = 'M200 220 H240 V140 H290 V92'

function Dispatch({ steps, site }: { steps: string[]; site: Site }) {
  return (
    <div className="fr-dispatch">
      <div className="fr-map" aria-hidden="true">
        <svg viewBox="0 0 400 300">
          <path className="fr-river" d="M-10 200 C80 170 120 230 210 190 C290 155 330 210 410 170" />
          <path className="fr-streets" d="M0 40 H400 M0 92 H400 M0 140 H400 M0 220 H400 M0 270 H400 M40 0 V300 M120 0 V300 M200 0 V300 M240 0 V300 M290 0 V300 M360 0 V300 M0 300 L180 0 M220 300 L400 60" />
          <path className="fr-route" d={ROUTE} pathLength="1" />
          {CREW.map(([x, y], i) => (
            <circle key={i} className="fr-crew" cx={x} cy={y} r="5" style={{ ['--i' as string]: i }} />
          ))}
          <g className="fr-pin">
            <circle cx="290" cy="92" r="16" className="fr-pin__ring" />
            <path d="M290 92 l-9 -16 a10 10 0 1 1 18 0 Z" className="fr-pin__drop" />
          </g>
          <circle className="fr-van" r="7" />
          <g className="fr-arc">
            <circle cx="290" cy="92" r="26" />
            {Array.from({ length: 10 }, (_, k) => (
              <path key={k} d={`M290 92 l${(Math.cos(k * 0.63) * 30).toFixed(1)} ${(Math.sin(k * 0.63) * 30).toFixed(1)}`} />
            ))}
          </g>
        </svg>
        <p className="fr-eta">
          <b />
          <small>{pick(site.lang, { ru: 'мин до приезда', uz: 'daqiqa qoldi', en: 'min to arrival' })}</small>
        </p>
      </div>
      {steps.length ? (
        <ol className="fr-track">
          {steps.map((w, i) => (
            <li key={w} style={{ ['--i' as string]: i }}>
              <i aria-hidden="true" />
              {w}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero fr-hero">
      <div className="fr-hero__text">
        {s.eyebrow ? <p className="fr-label fr-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="fr-title fr-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="fr-hero__sub fr-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="fr-ctas fr-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="fr-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="fr-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <Dispatch steps={s.words} site={site} />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee fr-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={38} sep="◆" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about fr-about">
      <figure className="fr-about__photo" data-fr="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="fr-about__text" data-fr="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="fr-label">{s.label}</p> : null}
        {s.title ? <h2 className="fr-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Цены — строки прайса, подчёркнутые валиком сварного шва: шов «проваривается» слева направо при появлении. */
function Seams({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services fr-seams">
      <div className="fr-head" data-fr="rise">
        {s.label ? <p className="fr-label">{s.label}</p> : null}
        {s.title ? <h2 className="fr-h2">{s.title}</h2> : null}
        {s.intro ? <p className="fr-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="fr-seams__list">
        {s.items.map((it, i) => (
          <li key={i} data-fr="weld" style={{ ['--i' as string]: i }}>
            {it.tag ? <em>{it.tag}</em> : null}
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
            {it.price ? <b>{it.price}</b> : null}
            <i className="fr-bead" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Выезд — сутки на ленте 0–24: у каждого тарифа подсвечены свои часы. */
function Shifts({ section: s }: SectionProps<'pricing'>) {
  const spans: [number, number][] = [[7, 19], [19, 23], [23, 31]]
  return (
    <section id={s.anchor || undefined} className="s s-pricing fr-shifts">
      <div className="fr-head" data-fr="rise">
        {s.label ? <p className="fr-label">{s.label}</p> : null}
        {s.title ? <h2 className="fr-h2">{s.title}</h2> : null}
      </div>
      <div className="fr-shifts__row">
        {s.items.map((it, i) => {
          const [a, b] = spans[i] || [0, 24]
          return (
            <article key={i} className={it.featured ? 'is-featured' : undefined} data-fr="rise" style={{ ['--i' as string]: i }}>
              <div className="fr-shifts__day" aria-hidden="true" style={{ ['--a' as string]: a / 24, ['--b' as string]: Math.min(b, 24) / 24, ['--c' as string]: Math.max(0, b - 24) / 24 }}>
                <i />
                <i />
              </div>
              <h3>{it.name}</h3>
              <p className="fr-shifts__price">
                {it.price}
                {it.period ? <span>{it.period}</span> : null}
              </p>
              <ul>
                {it.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}

/** Работы — лента снимков: холодные серые, при появлении «нагреваются» до цвета. */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery fr-gallery">
      <div className="fr-head" data-fr="rise">
        {s.label ? <p className="fr-label">{s.label}</p> : null}
        {s.title ? <h2 className="fr-h2">{s.title}</h2> : null}
      </div>
      <ul className="fr-gallery__strip">
        {s.items.map((it, i) => (
          <li key={i} data-fr="heat" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-stats fr-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-fr="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team fr-team">
      <div className="fr-head" data-fr="rise">
        {s.label ? <p className="fr-label">{s.label}</p> : null}
        {s.title ? <h2 className="fr-h2">{s.title}</h2> : null}
      </div>
      <ul className="fr-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-fr="rise" style={{ ['--i' as string]: i }}>
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

/** Как это работает — переписка с диспетчером: шаги приходят сообщениями, ответы с галочками. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process fr-chat">
      <div className="fr-head" data-fr="rise">
        {s.label ? <p className="fr-label">{s.label}</p> : null}
        {s.title ? <h2 className="fr-h2">{s.title}</h2> : null}
      </div>
      <ol className="fr-chat__list" data-fr="chat">
        {s.items.map((it, i) => (
          <li key={i} className={i % 2 ? 'is-them' : 'is-you'} style={{ ['--i' as string]: i }}>
            <b>{it.title}</b>
            <p>{it.text}</p>
            <small aria-hidden="true">{`${String(19 + Math.floor((i * 14) / 60)).padStart(2, '0')}:${String((12 + i * 14) % 60).padStart(2, '0')}`} ✓✓</small>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials fr-voices">
      <div className="fr-head" data-fr="rise">
        {s.label ? <p className="fr-label">{s.label}</p> : null}
        {s.title ? <h2 className="fr-h2">{s.title}</h2> : null}
      </div>
      <div className="fr-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-fr="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq fr-faq">
      <div className="fr-head" data-fr="rise">
        {s.label ? <p className="fr-label">{s.label}</p> : null}
        {s.title ? <h2 className="fr-h2">{s.title}</h2> : null}
      </div>
      <div className="fr-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item fr-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="fr-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact fr-contact">
      <i className="fr-contact__arc" aria-hidden="true" />
      <div className="fr-contact__inner" data-fr="rise">
        {s.label ? <p className="fr-label">{s.label}</p> : null}
        {s.title ? <h2 className="fr-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="fr-contact__text">{s.text}</p> : null}
        <div className="fr-ctas">
          {s.cta.label ? (
            <a className="fr-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="fr-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, services: Seams, pricing: Shifts, gallery: Gallery, marquee: MarqueeSec, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
