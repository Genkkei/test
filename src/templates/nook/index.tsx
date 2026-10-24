import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { NookMotion } from './client'

/*
 * УГОЛОК — светлая кофейня-коворкинг. Первый экран — панорамное окно: сквозь переплёт падают солнечные
 * пятна и ползут по стене (утро → день), цифры часов сменяются, в конце вилка входит в розетку у стола —
 * «кофе со светом и розеткой». Карточки цен отбрасывают длинные косые тени под углом того же солнца.
 * Шрифты: Ysabeau (заголовки), Onest (текст), Cousine (метки, время).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Socket() {
  return (
    <svg className="nk-socket" viewBox="0 0 120 80" aria-hidden="true">
      <rect x="62" y="10" width="54" height="60" rx="12" className="nk-socket__plate" />
      <circle cx="80" cy="40" r="4" className="nk-socket__hole" />
      <circle cx="98" cy="40" r="4" className="nk-socket__hole" />
      <g className="nk-socket__plug">
        <path d="M0 40 H30" className="nk-socket__cord" />
        <rect x="26" y="26" width="30" height="28" rx="8" className="nk-socket__body" />
        <path d="M56 34 H72 M56 46 H72" className="nk-socket__pins" />
      </g>
      <circle cx="110" cy="18" r="3" className="nk-socket__led" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <NookMotion />
      <header className="nk-bar">
        <a href="#top" className="nk-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="nk-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nk-bar__side">
          {site.nav.cta.label ? (
            <a className="nk-btn nk-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="nk-foot">
        <p className="nk-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="nk-foot__cols">
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
        <p className="nk-foot__legal">
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
  return (
    <section id={s.anchor || undefined} className="s s-hero nk-hero">
      <div className="nk-sun" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <div className="nk-hero__text">
        {s.eyebrow ? <p className="nk-label nk-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="nk-title nk-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="nk-hero__sub nk-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="nk-ctas nk-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="nk-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="nk-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="nk-window" aria-hidden="true">
        <div className="nk-window__sky">
          <span className="nk-window__clock">
            <b className="nk-window__h" />
            :00
          </span>
        </div>
        <div className="nk-window__frame">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <Socket />
      </div>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about nk-about">
      <figure className="nk-about__photo" data-nk="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="nk-about__text" data-nk="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="nk-label">{s.label}</p> : null}
        {s.title ? <h2 className="nk-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Цены — карточки с длинной косой тенью от солнца. */
function Prices({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services nk-prices">
      <div className="nk-head" data-nk="rise">
        {s.label ? <p className="nk-label">{s.label}</p> : null}
        {s.title ? <h2 className="nk-h2">{s.title}</h2> : null}
      </div>
      <ul className="nk-prices__list">
        {s.items.map((it, i) => (
          <li key={i} data-nk="shadow" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-stats nk-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-nk="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team nk-team">
      <div className="nk-head" data-nk="rise">
        {s.label ? <p className="nk-label">{s.label}</p> : null}
        {s.title ? <h2 className="nk-h2">{s.title}</h2> : null}
      </div>
      <ul className="nk-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-nk="rise" style={{ ['--i' as string]: i }}>
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

/** Как прийти — три положения солнца: утро, день, вечер. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process nk-steps">
      <div className="nk-head" data-nk="rise">
        {s.label ? <p className="nk-label">{s.label}</p> : null}
        {s.title ? <h2 className="nk-h2">{s.title}</h2> : null}
      </div>
      <ol className="nk-steps__list" data-nk="arc">
        <svg className="nk-steps__arc" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M20 110 Q500 -60 980 110" pathLength="1" />
        </svg>
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="nk-steps__sun" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-testimonials nk-voices">
      <div className="nk-head" data-nk="rise">
        {s.label ? <p className="nk-label">{s.label}</p> : null}
        {s.title ? <h2 className="nk-h2">{s.title}</h2> : null}
      </div>
      <div className="nk-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-nk="shadow" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq nk-faq">
      <div className="nk-head" data-nk="rise">
        {s.label ? <p className="nk-label">{s.label}</p> : null}
        {s.title ? <h2 className="nk-h2">{s.title}</h2> : null}
      </div>
      <div className="nk-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item nk-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact nk-contact">
      <div className="nk-sun nk-sun--late" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <i key={i} style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <div className="nk-contact__inner" data-nk="rise">
        {s.label ? <p className="nk-label">{s.label}</p> : null}
        {s.title ? <h2 className="nk-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="nk-contact__text">{s.text}</p> : null}
        <div className="nk-ctas">
          {s.cta.label ? (
            <a className="nk-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="nk-link" href={tel(b.phone)}>
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
