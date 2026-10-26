import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { TuftedMotion } from './client'

/*
 * ОБИВКА — мастерская перетяжки. Первый экран — кресло анфас: старая выцветшая обивка с дырами снимается
 * сверху вниз, под ней каркас из бука с пружинами; новая ткань натягивается снизу вверх, складки утяжки
 * прорисовываются, пуговицы встают по одной. Услуги — образцы ткани, этапы — строчка шва, цены — прошитые бирки.
 * Шрифты: Gabriela (заголовки), Nunito (текст), Anonymous Pro (метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <TuftedMotion />
      <header className="tf-bar">
        <a href="#top" className="tf-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="tf-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="tf-bar__side">
          {site.nav.cta.label ? (
            <a className="tf-btn tf-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="tf-foot">
        <p className="tf-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="tf-foot__cols">
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
        <p className="tf-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Кресло анфас: каркас из бука, новая ткань с каретной стяжкой и старая обивка поверх — три слоя одного рисунка. */
const BACK = 'M66 44 Q66 12 150 12 Q234 12 234 44 V196 H66 Z'
const BUTTONS: [number, number][] = [[108, 56], [150, 56], [192, 56], [87, 98], [129, 98], [171, 98], [213, 98], [108, 140], [150, 140], [192, 140]]

function ChairShape({ cls }: { cls: string }) {
  return (
    <g className={cls}>
      <path d={BACK} />
      <rect x="22" y="118" width="54" height="132" rx="24" />
      <rect x="224" y="118" width="54" height="132" rx="24" />
      <rect x="58" y="188" width="184" height="62" rx="16" />
      <rect x="42" y="244" width="216" height="24" rx="7" />
    </g>
  )
}

function Chair() {
  return (
    <div className="tf-chair" aria-hidden="true">
      <svg className="tf-chair__frame" viewBox="0 0 300 320">
        <ChairShape cls="tf-wood" />
        <path className="tf-spring" d="M80 176 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12" />
        <path className="tf-spring" d="M80 222 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12" />
        <path className="tf-web" d="M110 20 V190 M150 14 V190 M190 20 V190 M70 70 H230 M70 120 H230" />
        <path className="tf-leg" d="M64 268 V304 M236 268 V304" />
      </svg>
      <svg className="tf-chair__new" viewBox="0 0 300 320">
        <defs>
          <linearGradient id="tf-velvet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--velvet-hi)" />
            <stop offset=".55" stopColor="var(--velvet)" />
            <stop offset="1" stopColor="var(--velvet-lo)" />
          </linearGradient>
        </defs>
        <ChairShape cls="tf-fabric" />
        <path className="tf-pleat" pathLength="1" d="M87 98 L108 56 L129 98 L150 56 L171 98 L192 56 L213 98 M87 98 L108 140 L129 98 L150 140 L171 98 L192 140 L213 98 M108 56 L96 30 M150 56 L150 22 M192 56 L204 30 M108 140 L100 180 M150 140 L150 186 M192 140 L200 180" />
        <path className="tf-seam" d="M66 196 H234 M58 219 H242" />
        {BUTTONS.map(([x, y], i) => (
          <circle key={i} className="tf-button" cx={x} cy={y} r="5.5" style={{ ['--i' as string]: i }} />
        ))}
        <path className="tf-leg tf-leg--new" d="M64 268 V304 M236 268 V304" />
      </svg>
      <svg className="tf-chair__old" viewBox="0 0 300 320">
        <defs>
          <pattern id="tf-roses" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="3.2" />
            <circle cx="19" cy="19" r="2.2" />
          </pattern>
        </defs>
        <ChairShape cls="tf-oldcloth" />
        <ChairShape cls="tf-oldprint" />
        <path className="tf-tear" d="M168 214 l14 -8 l-4 14 l16 -4 l-10 12 l-18 -2 Z" />
        <path className="tf-tear" d="M44 160 l10 6 l-2 12 l-8 -4 Z" />
        <path className="tf-leg tf-leg--old" d="M64 268 V304 M236 268 V304" />
      </svg>
      <i className="tf-chair__curl" />
    </div>
  )
}

function Title({ text }: { text: string }) {
  const [a, b] = text.split(' — ')
  if (!b) return <>{text}</>
  return (
    <>
      <s className="tf-title__old">{a}</s> <span className="tf-title__new">{b}</span>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero tf-hero">
      <div className="tf-hero__text">
        {s.eyebrow ? <p className="tf-label tf-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="tf-title tf-in" style={{ ['--i' as string]: 1 }}>
          <Title text={s.title || site.name} />
        </h1>
        {s.subtitle ? <p className="tf-hero__sub tf-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="tf-ctas tf-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="tf-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="tf-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="tf-stage">
        <Chair />
        {s.words.length ? (
          <ul className="tf-words">
            {s.words.map((w, i) => (
              <li key={w} style={{ ['--i' as string]: i }}>
                {w}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about tf-about">
      <figure className="tf-about__photo" data-tf="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="tf-about__text" data-tf="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="tf-label">{s.label}</p> : null}
        {s.title ? <h2 className="tf-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Услуги — образцы ткани с краем «зигзаг», у каждого своя фактура. */
function Swatches({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services tf-swatches">
      <div className="tf-head" data-tf="rise">
        {s.label ? <p className="tf-label">{s.label}</p> : null}
        {s.title ? <h2 className="tf-h2">{s.title}</h2> : null}
        {s.intro ? <p className="tf-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="tf-swatches__list">
        {s.items.map((it, i) => (
          <li key={i} data-tf="fan" style={{ ['--i' as string]: i }}>
            <span className="tf-swatches__cloth" data-n={i % 5} aria-hidden="true" />
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

/** Цены — бирки, прошитые по краю. */
function Pricing({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing tf-tags">
      <div className="tf-head" data-tf="rise">
        {s.label ? <p className="tf-label">{s.label}</p> : null}
        {s.title ? <h2 className="tf-h2">{s.title}</h2> : null}
      </div>
      <div className="tf-tags__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-tf="stitch" style={{ ['--i' as string]: i }}>
            <i className="tf-tags__hole" aria-hidden="true" />
            <h3>{it.name}</h3>
            <p className="tf-tags__price">
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

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats tf-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-tf="button" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team tf-team">
      <div className="tf-head" data-tf="rise">
        {s.label ? <p className="tf-label">{s.label}</p> : null}
        {s.title ? <h2 className="tf-h2">{s.title}</h2> : null}
      </div>
      <ul className="tf-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-tf="rise" style={{ ['--i' as string]: i }}>
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

/** Как это работает — строчка шва идёт через этапы, игла останавливается у каждого. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process tf-seamline">
      <div className="tf-head" data-tf="rise">
        {s.label ? <p className="tf-label">{s.label}</p> : null}
        {s.title ? <h2 className="tf-h2">{s.title}</h2> : null}
      </div>
      <ol className="tf-seamline__list" data-tf="sew" style={{ ['--n' as string]: s.items.length }}>
        <i className="tf-seamline__thread" aria-hidden="true" />
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="tf-seamline__knot" aria-hidden="true" />
            <span className="tf-seamline__n">{String(i + 1).padStart(2, '0')}</span>
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
    <section id={s.anchor || undefined} className="s s-testimonials tf-voices">
      <div className="tf-head" data-tf="rise">
        {s.label ? <p className="tf-label">{s.label}</p> : null}
        {s.title ? <h2 className="tf-h2">{s.title}</h2> : null}
      </div>
      <div className="tf-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-tf="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq tf-faq">
      <div className="tf-head" data-tf="rise">
        {s.label ? <p className="tf-label">{s.label}</p> : null}
        {s.title ? <h2 className="tf-h2">{s.title}</h2> : null}
      </div>
      <div className="tf-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item tf-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="tf-spool" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact tf-contact">
      <div className="tf-contact__inner" data-tf="rise">
        {s.label ? <p className="tf-label">{s.label}</p> : null}
        {s.title ? <h2 className="tf-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="tf-contact__text">{s.text}</p> : null}
        <div className="tf-ctas">
          {s.cta.label ? (
            <a className="tf-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="tf-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, services: Swatches, pricing: Pricing, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
