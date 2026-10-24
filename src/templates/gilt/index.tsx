import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media, rng } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { GiltMotion } from './client'

/*
 * ПОЗОЛОТА — ателье элитной ковки. Первый экран — кованая панель решётки: рама, завитки и розетка
 * сначала чертятся чёрным железом, потом по ним «ползёт» сусальное золото, розетка вспыхивает, с панели
 * осыпаются чешуйки листа. Коллекции — ниши шоурума с аркой, письма заказчиков — с сургучной печатью.
 * Шрифты: Cormorant SC (заголовки капителью), Jost (текст), Cormorant Garamond курсив (метки, подписи).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** завитки панели: C- и S-образные волюты, зеркально слева и справа */
const SCROLLS = [
  'M150 70 C228 70 236 168 176 176 C134 182 130 132 160 130 C178 129 180 150 166 152',
  'M150 70 C72 70 64 168 124 176 C166 182 170 132 140 130 C122 129 120 150 134 152',
  'M150 330 C228 330 236 432 176 440 C134 446 130 396 160 394 C178 393 180 414 166 416',
  'M150 330 C72 330 64 432 124 440 C166 446 170 396 140 394 C122 393 120 414 134 416',
  'M150 176 C150 220 210 228 210 270 C210 300 180 304 176 290',
  'M150 176 C150 220 90 228 90 270 C90 300 120 304 124 290',
  'M150 330 V300',
  'M150 70 V40 M150 440 V480',
]

function Panel({ seed }: { seed: string }) {
  const r = rng(seed)
  const flakes = Array.from({ length: 28 }, (_, i) => ({ x: 20 + r() * 260, y: 60 + r() * 380, s: 3 + r() * 7, rot: r() * 90, dx: (r() - 0.5) * 60, i }))
  return (
    <div className="gilt-panel" aria-hidden="true">
      <svg viewBox="0 0 300 520" className="gilt-panel__svg">
        <defs>
          <linearGradient id="gilt-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8a6a1c" />
            <stop offset=".3" stopColor="#f7e08a" />
            <stop offset=".5" stopColor="#d4af37" />
            <stop offset=".75" stopColor="#fff1b8" />
            <stop offset="1" stopColor="#9c7a22" />
          </linearGradient>
          <radialGradient id="gilt-rose">
            <stop offset="0" stopColor="#fff3c4" />
            <stop offset=".5" stopColor="#d4af37" />
            <stop offset="1" stopColor="#7a5a14" />
          </radialGradient>
        </defs>
        <rect x="14" y="14" width="272" height="492" rx="2" className="gilt-panel__frame" pathLength="1" />
        <g className="gilt-panel__iron">
          {SCROLLS.map((d, i) => (
            <path key={i} d={d} pathLength="1" style={{ ['--i' as string]: i }} />
          ))}
        </g>
        <g className="gilt-panel__gold">
          {SCROLLS.map((d, i) => (
            <path key={i} d={d} pathLength="1" style={{ ['--i' as string]: i }} />
          ))}
        </g>
        <g className="gilt-panel__rose">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="150" cy="238" rx="9" ry="24" transform={`rotate(${i * 45} 150 253)`} fill="url(#gilt-rose)" />
          ))}
          <circle cx="150" cy="253" r="12" fill="url(#gilt-gold)" />
        </g>
      </svg>
      <div className="gilt-flakes">
        {flakes.map((f) => (
          <i key={f.i} style={{ left: `${(f.x / 300) * 100}%`, top: `${(f.y / 520) * 100}%`, width: f.s, height: f.s, ['--r' as string]: `${f.rot.toFixed(0)}deg`, ['--dx' as string]: `${f.dx.toFixed(0)}px`, ['--d' as string]: `${(f.i % 10) * 70}ms` }} />
        ))}
      </div>
    </div>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <GiltMotion />
      <header className="gilt-bar">
        <a href="#top" className="gilt-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="gilt-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="gilt-bar__side">
          {site.nav.cta.label ? (
            <a className="gilt-btn gilt-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="gilt-foot">
        <div className="gilt-foot__orn" aria-hidden="true" />
        <p className="gilt-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <p className="gilt-foot__tag">{site.tagline}</p>
        <div className="gilt-foot__cols">
          {address ? (
            <p>
              <small>{pick(site.lang, { ru: 'Шоурум', uz: 'Shou-rum', en: 'Showroom' })}</small>
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
            <small>{pick(site.lang, { ru: 'Запись', uz: 'Yozilish', en: 'Appointments' })}</small>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </p>
        </div>
        <p className="gilt-foot__legal">
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
  const crafts = s.words.filter(Boolean).slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero gilt-hero">
      <div className="gilt-hero__glow" aria-hidden="true" />
      <Panel seed={`${site.slug}-leaf`} />
      <div className="gilt-hero__text">
        {s.eyebrow ? <p className="gilt-label gilt-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="gilt-title gilt-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="gilt-hero__sub gilt-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="gilt-ctas gilt-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="gilt-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="gilt-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {crafts.length ? (
          <ul className="gilt-crafts gilt-in" style={{ ['--i' as string]: 4 }}>
            {crafts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

/** Изделия — строка через кованые ромбы. */
function Pieces({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s gilt-pieces" aria-label={s.items.join(', ')}>
      <p data-gl="rise">
        {s.items.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </p>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about gilt-about">
      <div className="gilt-about__text" data-gl="rise">
        {s.label ? <p className="gilt-label">{s.label}</p> : null}
        {s.title ? <h2 className="gilt-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
      <figure className="gilt-about__photo" data-gl="gild">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
    </section>
  )
}

/** Коллекции — ниши шоурума с аркой и латунной табличкой. */
function Collections({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works gilt-niches">
      <div className="gilt-head" data-gl="rise">
        {s.label ? <p className="gilt-label">{s.label}</p> : null}
        {s.title ? <h2 className="gilt-h2">{s.title}</h2> : null}
      </div>
      <ul className="gilt-niches__row">
        {s.items.map((it, i) => (
          <li key={i} data-gl="rise" style={{ ['--i' as string]: i }}>
            <figure>
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="arch" className="media" />
            </figure>
            <div className="gilt-plaque">
              {it.category ? <span>{it.category}</span> : null}
              <h3>{it.title}</h3>
              {it.year ? <b>{it.year}</b> : null}
            </div>
            {it.text ? <p>{it.text}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Services({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services gilt-services">
      <div className="gilt-head" data-gl="rise">
        {s.label ? <p className="gilt-label">{s.label}</p> : null}
        {s.title ? <h2 className="gilt-h2">{s.title}</h2> : null}
      </div>
      <ul className="gilt-services__list">
        {s.items.map((it, i) => (
          <li key={i} data-gl="rise" style={{ ['--i' as string]: i }}>
            <h3>{it.title}</h3>
            <span className="gilt-services__dots" aria-hidden="true" />
            {it.price ? <b>{it.price}</b> : null}
            {it.text ? <p>{it.text}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Цифры — числа золотой фольгой, блик проходит при появлении. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats gilt-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-gl="foil" style={{ ['--i' as string]: i }}>
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

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery gilt-details">
      <div className="gilt-head" data-gl="rise">
        {s.label ? <p className="gilt-label">{s.label}</p> : null}
        {s.title ? <h2 className="gilt-h2">{s.title}</h2> : null}
      </div>
      <ul className="gilt-details__grid">
        {s.items.map((it, i) => (
          <li key={i} data-gl="gild" style={{ ['--i' as string]: i }}>
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

/** Путь изделия — кованый прут с золотыми узлами. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process gilt-path">
      <div className="gilt-head" data-gl="rise">
        {s.label ? <p className="gilt-label">{s.label}</p> : null}
        {s.title ? <h2 className="gilt-h2">{s.title}</h2> : null}
      </div>
      <ol className="gilt-path__list" data-gl="bar">
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Письма заказчиков — лист с сургучной печатью. */
function Letters({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials gilt-letters">
      <div className="gilt-head" data-gl="rise">
        {s.label ? <p className="gilt-label">{s.label}</p> : null}
        {s.title ? <h2 className="gilt-h2">{s.title}</h2> : null}
      </div>
      <div className="gilt-letters__list">
        {s.items.map((it, i) => (
          <figure key={i} data-gl="rise" style={{ ['--i' as string]: i }}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              {it.author}
              {it.role ? <span>{it.role}</span> : null}
            </figcaption>
            <i className="gilt-seal" aria-hidden="true" />
          </figure>
        ))}
      </div>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq gilt-faq">
      <div className="gilt-head" data-gl="rise">
        {s.label ? <p className="gilt-label">{s.label}</p> : null}
        {s.title ? <h2 className="gilt-h2">{s.title}</h2> : null}
      </div>
      <div className="gilt-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item gilt-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact gilt-contact">
      <div className="gilt-contact__inner" data-gl="rise">
        {s.label ? <p className="gilt-label">{s.label}</p> : null}
        {s.title ? <h2 className="gilt-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="gilt-contact__text">{s.text}</p> : null}
        <div className="gilt-ctas">
          {s.cta.label ? (
            <a className="gilt-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="gilt-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Pieces, about: About, works: Collections, services: Services, stats: Stats, gallery: Gallery, process: Process, testimonials: Letters, faq: Faq, contact: Contact },
}
