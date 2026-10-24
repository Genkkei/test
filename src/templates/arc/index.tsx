import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { ArcMotion } from './client'

/*
 * АРКА — художественная ковка. Первый экран — эскиз навершия ворот: одна тонкая карандашная линия рисует
 * арку, лозу и завитки, потом наливается толщиной прута, на гроздьях проступает патина золотом; заголовок
 * стоит внутри арки. Портфолио — контактный лист (кадры с номерами, лучший обведён), «плёнка» — лента
 * с перфорацией. Шрифты: Old Standard TT (заголовки), Jost (текст), Anonymous Pro (метки, номера кадров).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** навершие ворот: арка, внутренняя арка, лоза с завитками, гроздья */
const ARCH = 'M60 420 V250 Q60 40 400 40 Q740 40 740 250 V420'
const INNER = 'M110 420 V260 Q110 96 400 96 Q690 96 690 260 V420'
const VINE = [
  'M400 96 C360 150 300 140 280 180 C262 216 300 238 318 218 C332 202 316 186 302 196',
  'M400 96 C440 150 500 140 520 180 C538 216 500 238 482 218 C468 202 484 186 498 196',
  'M280 180 C230 170 190 200 176 250 C166 290 196 312 214 296 C230 282 214 262 200 272',
  'M520 180 C570 170 610 200 624 250 C634 290 604 312 586 296 C570 282 586 262 600 272',
  'M400 96 V40',
]
const GRAPES: [number, number][] = [
  [356, 150], [368, 166], [346, 168], [358, 184],
  [444, 150], [432, 166], [454, 168], [442, 184],
  [234, 222], [246, 238], [226, 240],
  [566, 222], [554, 238], [574, 240],
]

function Sketch() {
  return (
    <svg className="arc-sketch" viewBox="0 0 800 430" aria-hidden="true">
      <defs>
        <radialGradient id="arc-gold">
          <stop offset="0" stopColor="#f6dc8a" />
          <stop offset=".6" stopColor="#c9a24a" />
          <stop offset="1" stopColor="#6e5320" />
        </radialGradient>
      </defs>
      <g className="arc-sketch__guides">
        <path d="M400 20 V420 M40 250 H760" />
        <circle cx="400" cy="250" r="340" />
      </g>
      <g className="arc-sketch__iron">
        <path d={ARCH} pathLength="1" style={{ ['--i' as string]: 0 }} />
        <path d={INNER} pathLength="1" style={{ ['--i' as string]: 1 }} />
        {VINE.map((d, i) => (
          <path key={i} d={d} pathLength="1" className="arc-sketch__vine" style={{ ['--i' as string]: 2 + i }} />
        ))}
      </g>
      <g className="arc-sketch__grapes">
        {GRAPES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="9" fill="url(#arc-gold)" style={{ ['--i' as string]: i }} />
        ))}
      </g>
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <ArcMotion />
      <header className="arc-bar">
        <a href="#top" className="arc-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="arc-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="arc-bar__side">
          {site.nav.cta.label ? (
            <a className="arc-btn arc-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="arc-foot">
        <svg className="arc-foot__arch" viewBox="0 0 800 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 120 V80 Q0 0 400 0 Q800 0 800 80 V120" />
        </svg>
        <p className="arc-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="arc-foot__cols">
          {address ? (
            <p>
              <small>{pick(site.lang, { ru: 'Мастерская', uz: 'Ustaxona', en: 'Workshop' })}</small>
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
        <p className="arc-foot__legal">
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
  const kinds = s.words.filter(Boolean).slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero arc-hero">
      <div className="arc-hero__stage">
        <Sketch />
        <div className="arc-hero__inside">
          {s.eyebrow ? <p className="arc-label arc-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
          <h1 className="arc-title arc-in" style={{ ['--i' as string]: 1 }}>
            {s.title || site.name}
          </h1>
        </div>
      </div>
      <div className="arc-hero__foot">
        {kinds.length ? (
          <ul className="arc-kinds arc-in" style={{ ['--i' as string]: 2 }}>
            {kinds.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        ) : null}
        {s.subtitle ? <p className="arc-hero__sub arc-in" style={{ ['--i' as string]: 3 }}>{s.subtitle}</p> : null}
        <div className="arc-ctas arc-in" style={{ ['--i' as string]: 4 }}>
          {s.cta.label ? (
            <a className="arc-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="arc-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Портфолио — контактный лист: кадры с номерами, первый обведён «восковым карандашом». */
function ContactSheet({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works arc-sheet">
      <div className="arc-head" data-ar="rise">
        {s.label ? <p className="arc-label">{s.label}</p> : null}
        {s.title ? <h2 className="arc-h2">{s.title}</h2> : null}
      </div>
      <ol className="arc-sheet__grid">
        {s.items.map((it, i) => (
          <li key={i} data-ar="rise" style={{ ['--i' as string]: i }} className={i === 0 ? 'is-pick' : undefined}>
            <figure>
              <span className="arc-sheet__no">
                {String(i * 4 + 12).padStart(2, '0')}A
              </span>
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="arch" className="media" />
              {i === 0 ? (
                <svg className="arc-sheet__circle" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M50 4 C82 4 97 22 96 50 C95 80 74 96 48 96 C20 96 4 78 5 50 C6 22 24 6 56 5" pathLength="1" />
                </svg>
              ) : null}
            </figure>
            <h3>{it.title}</h3>
            <p className="arc-sheet__meta">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
            {it.text ? <p>{it.text}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Плёнка — лента с перфорацией, листается пальцем. */
function Film({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery arc-film">
      <div className="arc-head" data-ar="rise">
        {s.label ? <p className="arc-label">{s.label}</p> : null}
        {s.title ? <h2 className="arc-h2">{s.title}</h2> : null}
      </div>
      <ul className="arc-film__strip" data-ar="roll">
        {s.items.map((it, i) => (
          <li key={i}>
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

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about arc-about">
      <figure className="arc-about__photo" data-ar="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="arc-about__text" data-ar="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="arc-label">{s.label}</p> : null}
        {s.title ? <h2 className="arc-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
        <p className="arc-about__scale">1 : 10</p>
      </div>
    </section>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process arc-steps">
      <div className="arc-head" data-ar="rise">
        {s.label ? <p className="arc-label">{s.label}</p> : null}
        {s.title ? <h2 className="arc-h2">{s.title}</h2> : null}
      </div>
      <ol className="arc-steps__list">
        {s.items.map((it, i) => (
          <li key={i} data-ar="rise" style={{ ['--i' as string]: i }}>
            <span className="arc-steps__n">{i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Цены — три арочных окна. */
function Pricing({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing arc-prices">
      <div className="arc-head" data-ar="rise">
        {s.label ? <p className="arc-label">{s.label}</p> : null}
        {s.title ? <h2 className="arc-h2">{s.title}</h2> : null}
      </div>
      <div className="arc-prices__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-ar="rise" style={{ ['--i' as string]: i }}>
            <h3>{it.name}</h3>
            <p className="arc-prices__price">
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

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials arc-voices">
      <div className="arc-head" data-ar="rise">
        {s.label ? <p className="arc-label">{s.label}</p> : null}
        {s.title ? <h2 className="arc-h2">{s.title}</h2> : null}
      </div>
      <div className="arc-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-ar="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq arc-faq">
      <div className="arc-head" data-ar="rise">
        {s.label ? <p className="arc-label">{s.label}</p> : null}
        {s.title ? <h2 className="arc-h2">{s.title}</h2> : null}
      </div>
      <div className="arc-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item arc-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact arc-contact">
      <div className="arc-contact__inner" data-ar="rise">
        {s.label ? <p className="arc-label">{s.label}</p> : null}
        {s.title ? <h2 className="arc-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="arc-contact__text">{s.text}</p> : null}
        <div className="arc-ctas">
          {s.cta.label ? (
            <a className="arc-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="arc-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, works: ContactSheet, gallery: Film, about: About, process: Process, pricing: Pricing, testimonials: Testimonials, faq: Faq, contact: Contact },
}
