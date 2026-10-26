import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { LatticeMotion } from './client'

/*
 * РЕШЁТКА — мастерская кованых решёток, подача «театром»: афиши узоров, билеты в партер, программка действий.
 * Первый экран — сцена: занавес расходится, в окне фасада загорается свет, узор решётки рисуется белым эскизом
 * и становится чёрным железом с золотыми розетками, створка распахивается и закрывается (распашная — для
 * пожарной безопасности). Кнопки узоров меняют решётку в окне.
 * Шрифты: Cuprum (заголовки), Raleway (текст), Overpass Mono (метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <LatticeMotion />
      <header className="lt-bar">
        <a href="#top" className="lt-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="lt-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="lt-bar__side">
          {site.nav.cta.label ? (
            <a className="lt-btn lt-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="lt-foot">
        <p className="lt-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="lt-foot__cols">
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
        <p className="lt-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Узоры решётки в окне 180×240: клетка, восход, лоза, гирих — тот же порядок, что в «Репертуаре». */
const GRID = [40, 70, 100, 130, 160].map((x) => `M${x} 10 V250`).join(' ') + ' ' + [40, 70, 100, 130, 160, 190, 220].map((y) => `M10 ${y} H190`).join(' ')
const RAYS = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
  const a = (i / 8) * (Math.PI / 2)
  return `M10 250 L${(10 + Math.sin(a) * 300).toFixed(1)} ${(250 - Math.cos(a) * 300).toFixed(1)}`
}).join(' ') + ' M10 190 A60 60 0 0 1 70 250 M10 130 A120 120 0 0 1 130 250'
const scroll = (x: number, y: number, d: 1 | -1) =>
  `M${x} ${y} C${x - 30 * d} ${y - 10} ${x - 40 * d} ${y - 40} ${x - 20 * d} ${y - 50} C${x - 5 * d} ${y - 58} ${x} ${y - 40} ${x - 12 * d} ${y - 36}`
const VINE = ['M100 250 V10 M40 250 V10 M160 250 V10 M10 130 H190',
  ...[230, 150, 70].flatMap((y) => [scroll(100, y, 1), scroll(100, y - 40, -1), scroll(40, y - 20, -1), scroll(160, y - 20, 1)])].join(' ')
const GIRIH = [0, 1, 2].flatMap((c) => [0, 1, 2, 3].map((r) => {
  const cx = 40 + c * 60, cy = 40 + r * 60, R = 26, q = 11
  const pts = Array.from({ length: 16 }, (_, k) => {
    const ang = (k * Math.PI) / 8 - Math.PI / 2, rr = k % 2 ? q : R
    return `${(cx + Math.cos(ang) * rr).toFixed(1)} ${(cy + Math.sin(ang) * rr).toFixed(1)}`
  })
  return `M${pts.join(' L')} Z`
})).join(' ') + ' M10 70 H190 M10 130 H190 M10 190 H190 M70 10 V250 M130 10 V250'
const PATTERNS = [GRID, RAYS, VINE, GIRIH]
const ROSETTES: [number, number][][] = [[[70, 130], [130, 130]], [[10, 250]], [[100, 130], [100, 60], [100, 200]], [[70, 70], [130, 70], [70, 190], [130, 190]]]
const NAMES = {
  ru: ['Клетка', 'Восход', 'Лоза', 'Гирих'],
  uz: ['Katak', 'Quyosh', 'Tok', 'Girih'],
  en: ['Grid', 'Sunrise', 'Vine', 'Girih'],
}

/** Сцена: занавес расходится, в окне загорается свет, узор рисуется эскизом, становится железом, створка распахивается. */
function Stage({ site }: { site: Site }) {
  const works = site.sections.find((x) => x.type === 'works' && x.enabled)
  const titles = works && 'items' in works ? (works.items as { title: string }[]).slice(0, 4).map((w) => w.title.replace(/[«»"]/g, '')) : []
  const names = PATTERNS.map((_, i) => titles[i] || pick(site.lang, NAMES)[i])
  return (
    <div className="lt-stage">
      <div className="lt-scene" data-p="1" aria-hidden="true">
        <div className="lt-wall">
          <div className="lt-window">
            <span className="lt-window__light" />
            <div className="lt-sash">
              <svg viewBox="0 0 200 260">
                <defs>
                  <clipPath id="lt-glass">
                    <rect x="10" y="10" width="180" height="240" />
                  </clipPath>
                </defs>
                <g clipPath="url(#lt-glass)">
                  {PATTERNS.map((d, i) => (
                    <g key={i} className={`lt-pat lt-pat--${i}`}>
                      <path d={d} pathLength="1" />
                      {ROSETTES[i].map(([x, y], j) => (
                        <circle key={j} cx={x} cy={y} r={i === 1 ? 34 : 9} style={{ ['--j' as string]: j }} />
                      ))}
                    </g>
                  ))}
                </g>
                <rect className="lt-sash__frame" x="10" y="10" width="180" height="240" />
              </svg>
            </div>
          </div>
        </div>
        <i className="lt-curtain lt-curtain--l" />
        <i className="lt-curtain lt-curtain--r" />
      </div>
      <div className="lt-patterns" role="group" aria-label={pick(site.lang, { ru: 'Узор', uz: 'Naqsh', en: 'Pattern' })}>
        {names.map((n, i) => (
          <button key={i} type="button" value={i} aria-pressed={i === 1} style={{ ['--i' as string]: i }}>
            <small>{['I', 'II', 'III', 'IV'][i]}</small>
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero lt-hero">
      <div className="lt-hero__text">
        {s.eyebrow ? <p className="lt-label lt-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="lt-title lt-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="lt-hero__sub lt-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="lt-ctas lt-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="lt-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="lt-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {s.words.length ? (
          <ul className="lt-words lt-in" style={{ ['--i' as string]: 4 }}>
            {s.words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <Stage site={site} />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about lt-about">
      <figure className="lt-about__photo" data-lt="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="lt-about__text" data-lt="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="lt-label">{s.label}</p> : null}
        {s.title ? <h2 className="lt-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Узоры — афиши спектакля: акт, название, снимок решётки на фасаде. */
function Playbill({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works lt-bills">
      <div className="lt-head" data-lt="rise">
        {s.label ? <p className="lt-label">{s.label}</p> : null}
        {s.title ? <h2 className="lt-h2">{s.title}</h2> : null}
      </div>
      <ul className="lt-bills__list">
        {s.items.map((it, i) => (
          <li key={i} data-lt="bill" style={{ ['--i' as string]: i }}>
            <figure>
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="arch" className="media" />
            </figure>
            <div className="lt-bills__body">
              {it.year ? <span className="lt-bills__act">{it.year}</span> : null}
              <h3>{it.title}</h3>
              {it.category ? <p className="lt-bills__cat">{it.category}</p> : null}
              {it.text ? <p>{it.text}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Цены — билеты в партер, бельэтаж и ложу: корешок отрывается по перфорации. */
function Tickets({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing lt-tickets">
      <div className="lt-head" data-lt="rise">
        {s.label ? <p className="lt-label">{s.label}</p> : null}
        {s.title ? <h2 className="lt-h2">{s.title}</h2> : null}
      </div>
      <div className="lt-tickets__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-lt="ticket" style={{ ['--i' as string]: i }}>
            <div className="lt-tickets__main">
              <h3>{it.name}</h3>
              <ul>
                {it.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
            </div>
            <p className="lt-tickets__stub">
              {it.price}
              {it.period ? <span>{it.period}</span> : null}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery lt-gallery">
      <div className="lt-head" data-lt="rise">
        {s.label ? <p className="lt-label">{s.label}</p> : null}
        {s.title ? <h2 className="lt-h2">{s.title}</h2> : null}
      </div>
      <ul className="lt-gallery__grid">
        {s.items.map((it, i) => (
          <li key={i} data-lt="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-stats lt-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-lt="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team lt-team">
      <div className="lt-head" data-lt="rise">
        {s.label ? <p className="lt-label">{s.label}</p> : null}
        {s.title ? <h2 className="lt-h2">{s.title}</h2> : null}
      </div>
      <ul className="lt-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-lt="rise" style={{ ['--i' as string]: i }}>
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

/** Как работаем — программка: действия по порядку, римские номера, точки-отточия до названия. */
function Process({ section: s }: SectionProps<'process'>) {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
  return (
    <section id={s.anchor || undefined} className="s s-process lt-program">
      <div className="lt-head" data-lt="rise">
        {s.label ? <p className="lt-label">{s.label}</p> : null}
        {s.title ? <h2 className="lt-h2">{s.title}</h2> : null}
      </div>
      <ol className="lt-program__list">
        {s.items.map((it, i) => (
          <li key={i} data-lt="rise" style={{ ['--i' as string]: i }}>
            <span className="lt-program__n">{roman[i] || i + 1}</span>
            <h3>{it.title}</h3>
            <i aria-hidden="true" />
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials lt-voices">
      <div className="lt-head" data-lt="rise">
        {s.label ? <p className="lt-label">{s.label}</p> : null}
        {s.title ? <h2 className="lt-h2">{s.title}</h2> : null}
      </div>
      <div className="lt-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-lt="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq lt-faq">
      <div className="lt-head" data-lt="rise">
        {s.label ? <p className="lt-label">{s.label}</p> : null}
        {s.title ? <h2 className="lt-h2">{s.title}</h2> : null}
      </div>
      <div className="lt-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item lt-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="lt-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact lt-contact">
      <i className="lt-curtain lt-curtain--l lt-curtain--still" aria-hidden="true" />
      <i className="lt-curtain lt-curtain--r lt-curtain--still" aria-hidden="true" />
      <div className="lt-contact__inner" data-lt="rise">
        {s.label ? <p className="lt-label">{s.label}</p> : null}
        {s.title ? <h2 className="lt-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="lt-contact__text">{s.text}</p> : null}
        <div className="lt-ctas">
          {s.cta.label ? (
            <a className="lt-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="lt-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, works: Playbill, pricing: Tickets, gallery: Gallery, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
