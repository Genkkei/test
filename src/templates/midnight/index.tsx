import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { MidnightMotion } from './client'

/*
 * ПОЛНОЧЬ — ночная кофейня до 3 утра. Первый экран — дом напротив: часы идут 18:00 → 03:00, окна гаснут одно за
 * другим, восходит луна, светится только кофейня на первом этаже — вывеска «открыто» и пар над чашкой.
 * Меню — ночное табло с фазами луны, доставка — маршрут курьера по кварталу, зал — снимки в окнах.
 * Шрифты: Prosto One (заголовки), Didact Gothic (текст), Martian Mono (метки, время).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <MidnightMotion />
      <header className="md-bar">
        <a href="#top" className="md-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="md-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="md-bar__side">
          {site.nav.cta.label ? (
            <a className="md-btn md-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="md-foot">
        <p className="md-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="md-foot__cols">
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
        <p className="md-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Дом напротив ночью: часы идут 18:00 → 03:00, окна гаснут одно за другим, светится только кофейня внизу. */
const HOURS = ['18', '19', '20', '21', '22', '23', '00', '01', '02', '03']
const COLS = 5
const ROWS = 6

function Night({ site }: { site: Site }) {
  return (
    <div className="md-night" aria-hidden="true">
      <i className="md-moon" />
      <div className="md-clock">
        <span className="md-clock__strip">
          {HOURS.map((h) => (
            <b key={h}>{h}</b>
          ))}
        </span>
        <span>:00</span>
      </div>
      <div className="md-house">
        <div className="md-house__grid">
          {Array.from({ length: COLS * ROWS }, (_, i) => (
            <i key={i} style={{ ['--d' as string]: ((i * 7) % (COLS * ROWS)) / (COLS * ROWS) }} />
          ))}
        </div>
        <div className="md-cafe">
          <span className="md-cafe__sign">{pick(site.lang, { ru: 'открыто', uz: 'ochiq', en: 'open' })}</span>
          <span className="md-cafe__cup">
            <i />
            <i />
          </span>
        </div>
      </div>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero md-hero">
      <div className="md-hero__text">
        {s.eyebrow ? <p className="md-label md-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="md-title md-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="md-hero__sub md-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="md-ctas md-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="md-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="md-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <Night site={site} />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee md-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={38} sep="◆" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about md-about">
      <figure className="md-about__photo" data-md="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="md-about__text" data-md="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="md-label">{s.label}</p> : null}
        {s.title ? <h2 className="md-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Меню — ночное табло: колонка на группу, у каждой своя фаза луны; строки зажигаются по очереди, как неон. */
function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu md-menu">
      <div className="md-head" data-md="rise">
        {s.label ? <p className="md-label">{s.label}</p> : null}
        {s.title ? <h2 className="md-h2">{s.title}</h2> : null}
      </div>
      <div className="md-menu__cols">
        {s.groups.map((g, gi) => (
          <div key={gi} className="md-menu__col" data-md="neon" style={{ ['--i' as string]: gi }}>
            <h3>
              <i className="md-phase" data-n={gi % 4} aria-hidden="true" />
              {g.name}
            </h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={i} style={{ ['--j' as string]: i }}>
                  <span className="md-menu__name">{it.name}</span>
                  <span className="md-menu__dots" aria-hidden="true" />
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

/** Зал — снимки в ночных окнах: свет в окне зажигается при появлении. */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery md-gallery">
      <div className="md-head" data-md="rise">
        {s.label ? <p className="md-label">{s.label}</p> : null}
        {s.title ? <h2 className="md-h2">{s.title}</h2> : null}
      </div>
      <ul className="md-gallery__grid">
        {s.items.map((it, i) => (
          <li key={i} data-md="lamp" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-stats md-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-md="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team md-team">
      <div className="md-head" data-md="rise">
        {s.label ? <p className="md-label">{s.label}</p> : null}
        {s.title ? <h2 className="md-h2">{s.title}</h2> : null}
      </div>
      <ul className="md-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-md="rise" style={{ ['--i' as string]: i }}>
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

/** Доставка — ночной маршрут по кварталу: точка курьера идёт пунктиром от остановки к остановке. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process md-route">
      <div className="md-head" data-md="rise">
        {s.label ? <p className="md-label">{s.label}</p> : null}
        {s.title ? <h2 className="md-h2">{s.title}</h2> : null}
      </div>
      <ol className="md-route__list" data-md="route" style={{ ['--n' as string]: s.items.length }}>
        <i className="md-route__road" aria-hidden="true" />
        <i className="md-route__dot" aria-hidden="true" />
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="md-route__stop" aria-hidden="true" />
            <span className="md-route__n">{String(i + 1).padStart(2, '0')}</span>
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
    <section id={s.anchor || undefined} className="s s-testimonials md-voices">
      <div className="md-head" data-md="rise">
        {s.label ? <p className="md-label">{s.label}</p> : null}
        {s.title ? <h2 className="md-h2">{s.title}</h2> : null}
      </div>
      <div className="md-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-md="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq md-faq">
      <div className="md-head" data-md="rise">
        {s.label ? <p className="md-label">{s.label}</p> : null}
        {s.title ? <h2 className="md-h2">{s.title}</h2> : null}
      </div>
      <div className="md-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item md-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="md-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact md-contact">
      <i className="md-contact__moon" aria-hidden="true" />
      <div className="md-contact__inner" data-md="rise">
        {s.label ? <p className="md-label">{s.label}</p> : null}
        {s.title ? <h2 className="md-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="md-contact__text">{s.text}</p> : null}
        <div className="md-ctas">
          {s.cta.label ? (
            <a className="md-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="md-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, menu: Menu, gallery: Gallery, marquee: MarqueeSec, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
