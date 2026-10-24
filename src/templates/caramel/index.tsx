import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media, rng } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { CaramelMotion } from './client'

/*
 * КАРАМЕЛЬ — кофейня-кондитерская. Первый экран — карамель стекает сверху: густая волна с подтёками разной
 * длины, по ней проходит блик; под ней заголовок и названия десертов «написаны» кремом из кондитерского
 * мешка (штрих). Витрина — стеклянная полка с ценниками-флажками, торты — рисунок по ярусам, отзывы —
 * записки на кружевной салфетке. Шрифты: Comfortaa (заголовки), Manrope (текст), Ubuntu Mono (ценники).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Drip({ seed }: { seed: string }) {
  const r = rng(seed)
  // волна карамели: верх прямой, низ — подтёки разной длины
  const W = 1440
  let d = `M0 0 H${W} V60`
  const drips: { x: number; len: number; w: number }[] = []
  for (let x = W; x > 0; ) {
    const w = 50 + r() * 70
    const len = r() < 0.45 ? 40 + r() * 150 : 6 + r() * 18
    const x2 = Math.max(0, x - w)
    const mid = (x + x2) / 2
    d += ` C${(x - w * 0.15).toFixed(0)} 60 ${(mid + w * 0.28).toFixed(0)} ${(60 + len).toFixed(0)} ${mid.toFixed(0)} ${(60 + len).toFixed(0)}`
    d += ` C${(mid - w * 0.28).toFixed(0)} ${(60 + len).toFixed(0)} ${(x2 + w * 0.15).toFixed(0)} 60 ${x2.toFixed(0)} 60`
    if (len > 40) drips.push({ x: mid, len, w })
    x = x2
  }
  d += ' Z'
  return (
    <svg className="car-drip" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="car-sauce" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a3510" />
          <stop offset=".45" stopColor="#b8621f" />
          <stop offset="1" stopColor="#d98a3a" />
        </linearGradient>
        <linearGradient id="car-shine" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff3dc" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="car-clip">
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill="url(#car-sauce)" className="car-drip__body" />
      <g clipPath="url(#car-clip)">
        <rect className="car-drip__shine" x="-300" y="0" width="260" height="260" fill="url(#car-shine)" />
        <path d="M0 22 H1440" stroke="#f0b26a" strokeOpacity=".5" strokeWidth="3" />
      </g>
      {drips.slice(0, 5).map((p, i) => (
        <ellipse key={i} className="car-drip__bead" cx={p.x} cy={60 + p.len + 12} rx="7" ry="9" fill="#c06a25" style={{ ['--i' as string]: i }} />
      ))}
    </svg>
  )
}

/** торт по ярусам: число ярусов — номер карточки, сверху ягоды */
function Cake({ tiers }: { tiers: number }) {
  const t = Math.max(1, Math.min(3, tiers))
  const ws = [150, 110, 74].slice(0, t)
  let y = 150
  return (
    <svg className="car-cake" viewBox="0 0 200 170" aria-hidden="true">
      <ellipse cx="100" cy="158" rx="92" ry="9" className="car-cake__plate" />
      {ws.map((w, i) => {
        const h = 40 - i * 4
        y -= h
        return (
          <g key={i} style={{ ['--i' as string]: i }} className="car-cake__tier">
            <rect x={100 - w / 2} y={y} width={w} height={h} rx="6" />
            <path d={`M${100 - w / 2} ${y + 8} q8 10 16 0 q8 10 16 0 q8 10 16 0 q8 10 16 0 q8 10 16 0 q8 10 16 0 q8 10 16 0 q8 10 16 0 q8 10 16 0`} className="car-cake__drip" style={{ clipPath: `inset(0 ${200 - w}px 0 0)` }} />
          </g>
        )
      })}
      <circle cx="92" cy={y - 5} r="6" className="car-cake__berry" />
      <circle cx="106" cy={y - 6} r="5" className="car-cake__berry" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <CaramelMotion />
      <header className="car-bar">
        <a href="#top" className="car-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="car-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="car-bar__side">
          {site.nav.cta.label ? (
            <a className="car-btn car-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="car-foot">
        <p className="car-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="car-foot__cols">
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
        <p className="car-foot__legal">
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
  const sweets = s.words.filter(Boolean).slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero car-hero">
      <Drip seed={`${site.slug}-drip`} />
      <div className="car-hero__text">
        {s.eyebrow ? <p className="car-label car-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="car-title car-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {sweets.length ? (
          <ul className="car-sweets" aria-label={sweets.join(', ')}>
            {sweets.map((w, i) => (
              <li key={i} style={{ ['--i' as string]: i }}>
                {w}
              </li>
            ))}
          </ul>
        ) : null}
        {s.subtitle ? <p className="car-hero__sub car-in" style={{ ['--i' as string]: 3 }}>{s.subtitle}</p> : null}
        <div className="car-ctas car-in" style={{ ['--i' as string]: 4 }}>
          {s.cta.label ? (
            <a className="car-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="car-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Обещания — лента из сахарной глазури. */
function Ribbon({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s car-ribbon" aria-label={s.items.join(', ')}>
      <ul>
        {s.items.map((m, i) => (
          <li key={i} data-cr="rise" style={{ ['--i' as string]: i }}>
            {m}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Витрина — стеклянные полки, у каждого десерта ценник-флажок. */
function Showcase({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu car-case">
      <div className="car-head" data-cr="rise">
        {s.label ? <p className="car-label">{s.label}</p> : null}
        {s.title ? <h2 className="car-h2">{s.title}</h2> : null}
      </div>
      <div className="car-case__glass" data-cr="rise">
        {s.groups.map((g, gi) => (
          <div key={gi} className="car-case__shelf">
            <h3>{g.name}</h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={i} style={{ ['--i' as string]: i }}>
                  <span className="car-case__flag">{it.price}</span>
                  <b>{it.name}</b>
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

/** Торты на заказ — рисунок по ярусам: первый — один ярус, третий — три. */
function Cakes({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing car-cakes">
      <div className="car-head" data-cr="rise">
        {s.label ? <p className="car-label">{s.label}</p> : null}
        {s.title ? <h2 className="car-h2">{s.title}</h2> : null}
      </div>
      <div className="car-cakes__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-cr="stack" style={{ ['--i' as string]: i }}>
            <Cake tiers={i + 1} />
            <h3>{it.name}</h3>
            <p className="car-cakes__price">
              {it.price}
              {it.period ? <span> {it.period}</span> : null}
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

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process car-steps">
      <div className="car-head" data-cr="rise">
        {s.label ? <p className="car-label">{s.label}</p> : null}
        {s.title ? <h2 className="car-h2">{s.title}</h2> : null}
      </div>
      <ol className="car-steps__list">
        {s.items.map((it, i) => (
          <li key={i} data-cr="rise" style={{ ['--i' as string]: i }}>
            <span className="car-steps__n">{i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery car-gallery">
      <div className="car-head" data-cr="rise">
        {s.label ? <p className="car-label">{s.label}</p> : null}
        {s.title ? <h2 className="car-h2">{s.title}</h2> : null}
      </div>
      <ul className="car-gallery__row">
        {s.items.map((it, i) => (
          <li key={i} data-cr="rise" style={{ ['--i' as string]: i }}>
            <figure>
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="waves" className="media" />
              {it.caption ? <figcaption>{it.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Записки от гостей — на кружевной салфетке. */
function Notes({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials car-notes">
      <div className="car-head" data-cr="rise">
        {s.label ? <p className="car-label">{s.label}</p> : null}
        {s.title ? <h2 className="car-h2">{s.title}</h2> : null}
      </div>
      <div className="car-notes__list">
        {s.items.map((it, i) => (
          <figure key={i} data-cr="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq car-faq">
      <div className="car-head" data-cr="rise">
        {s.label ? <p className="car-label">{s.label}</p> : null}
        {s.title ? <h2 className="car-h2">{s.title}</h2> : null}
      </div>
      <div className="car-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item car-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact car-contact">
      <svg className="car-contact__wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 H1440 V30 C1300 70 1180 20 1040 46 C900 72 780 24 640 44 C500 64 380 22 240 48 C140 66 60 40 0 52 Z" />
      </svg>
      <div className="car-contact__inner" data-cr="rise">
        {s.label ? <p className="car-label">{s.label}</p> : null}
        {s.title ? <h2 className="car-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="car-contact__text">{s.text}</p> : null}
        <div className="car-ctas">
          {s.cta.label ? (
            <a className="car-btn car-btn--light" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="car-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Ribbon, menu: Showcase, pricing: Cakes, process: Process, gallery: Gallery, testimonials: Notes, faq: Faq, contact: Contact },
}
