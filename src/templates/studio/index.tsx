import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media, rng } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { StudioMotion } from './client'

/*
 * СТУДИЯ — ателье премиальной мебели. Первый экран — шоурум: в темноте загорается прожектор, под ним
 * чертятся латунные ножки консоли, сверху ложится мраморная столешница, по ней проходит блик, проступают
 * прожилки; потом строки заголовка выходят из-под маски, справа — образцы материалов.
 * Отделки — книга образцов, этапы — римские цифры на латунной линии.
 * Шрифты: Bona Nova (заголовки), Jost (текст), Spectral SC (метки капителью).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
/** образцы: белый мрамор, чёрный мрамор, травертин, латунь, состаренная латунь, кожа — по кругу */
const SWATCH = ['sw-carrara', 'sw-nero', 'sw-travertine', 'sw-brass', 'sw-patina', 'sw-leather', 'sw-walnut']
const swatchFor = (name: string, i: number) => {
  const n = name.toLowerCase()
  if (/неро|nero|чёрн|qora|black/.test(n)) return 'sw-nero'
  if (/травертин|travertin/.test(n)) return 'sw-travertine'
  if (/мрамор|marmar|marble|карр/.test(n)) return 'sw-carrara'
  if (/состар|patina|eskirt|aged/.test(n)) return 'sw-patina'
  if (/латун|latun|brass/.test(n)) return 'sw-brass'
  if (/кож|teri|leather|напп|napp/.test(n)) return 'sw-leather'
  if (/орех|yong|walnut/.test(n)) return 'sw-walnut'
  return SWATCH[i % SWATCH.length]
}

function Console({ seed }: { seed: string }) {
  const r = rng(seed)
  // прожилки — длинные пологие кривые поперёк слэба, тонкие, как у каррары
  const veins = Array.from({ length: 6 }, (_, i) => {
    const y0 = 6 + r() * 48
    let x = -20 + r() * 120
    let y = y0
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`
    while (x < 520) {
      const nx = x + 70 + r() * 90
      const ny = Math.max(2, Math.min(58, y + (r() - 0.5) * 22))
      d += ` C${(x + 30).toFixed(1)} ${y.toFixed(1)} ${(nx - 30).toFixed(1)} ${ny.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`
      x = nx
      y = ny
    }
    return { d, w: i < 2 ? 1.1 + r() * 0.5 : 0.35 + r() * 0.5 }
  })
  return (
    <svg className="studio-console" viewBox="0 0 500 330" aria-hidden="true">
      <defs>
        <linearGradient id="studio-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#7a5a2c" />
          <stop offset=".45" stopColor="#f3d79b" />
          <stop offset=".6" stopColor="#c6a26a" />
          <stop offset="1" stopColor="#6d4f25" />
        </linearGradient>
        <linearGradient id="studio-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f3ee" />
          <stop offset="1" stopColor="#d9d4cb" />
        </linearGradient>
        <linearGradient id="studio-gloss" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="studio-slab">
          <rect x="20" y="0" width="460" height="60" rx="2" />
        </clipPath>
      </defs>
      <ellipse cx="250" cy="318" rx="210" ry="10" fill="rgba(0,0,0,.55)" className="studio-console__shadow" />
      <g className="studio-console__legs" fill="none" stroke="url(#studio-brass)" strokeWidth="7" strokeLinecap="round">
        <path d="M80 62 L120 312 M420 62 L380 312" />
        <path d="M100 190 H400" strokeWidth="4" />
      </g>
      <g className="studio-console__slab">
        <rect x="20" y="0" width="460" height="60" rx="2" fill="url(#studio-stone)" />
        <g clipPath="url(#studio-slab)" className="studio-console__veins">
          {veins.map((v, i) => (
            <path key={i} d={v.d} fill="none" stroke="#8f887c" strokeOpacity=".7" strokeWidth={v.w} pathLength="1" style={{ ['--i' as string]: i }} />
          ))}
          <rect className="studio-console__gloss" x="-160" y="0" width="140" height="60" fill="url(#studio-gloss)" />
        </g>
        <rect x="20" y="56" width="460" height="4" fill="rgba(0,0,0,.18)" />
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
      <StudioMotion />
      <header className="studio-bar">
        <nav className="studio-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.slice(0, Math.ceil(links.length / 2)).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="studio-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="studio-bar__nav studio-bar__nav--r" aria-label={ui(site.lang, 'sections')}>
          {links.slice(Math.ceil(links.length / 2)).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
      </header>
      <main id="top">{children}</main>
      <footer className="studio-foot">
        <p className="studio-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <p className="studio-foot__tag">{site.tagline}</p>
        <div className="studio-foot__cols">
          {address ? (
            <p>
              <small>{pick(site.lang, { ru: 'Ателье', uz: 'Atelye', en: 'Atelier' })}</small>
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
        <p className="studio-foot__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const title = s.title || site.name
  const words = title.split(' ')
  let half = Math.ceil(words.length / 2)
  // короткое слово («в», «и», «на») не оставляем в конце первой строки
  while (half > 1 && words[half - 1].length <= 2) half--
  const lines = words.length > 2 ? [words.slice(0, half).join(' '), words.slice(half).join(' ')] : [title]
  const mats = s.words.filter(Boolean).slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero studio-hero">
      <div className="studio-hero__light" aria-hidden="true" />
      {s.eyebrow ? <p className="studio-label studio-hero__eyebrow">{s.eyebrow}</p> : null}
      <h1 className="studio-title">
        {lines.map((l, i) => (
          <span key={i} className="studio-title__line" style={{ ['--i' as string]: i }}>
            <span>{l}</span>
          </span>
        ))}
      </h1>
      <div className="studio-hero__stage">
        <Console seed={`${site.slug}-slab`} />
      </div>
      <div className="studio-hero__foot">
        {mats.length ? (
          <ul className="studio-mats">
            {mats.map((m, i) => (
              <li key={i} style={{ ['--i' as string]: i }}>
                <i className={swatchFor(m, i)} aria-hidden="true" />
                {m}
              </li>
            ))}
          </ul>
        ) : null}
        {s.subtitle ? <p className="studio-hero__sub">{s.subtitle}</p> : null}
        <div className="studio-ctas">
          {s.cta.label ? (
            <a className="studio-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="studio-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Материалы — гравированная строка через ромбы, без движения. */
function Materials({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s studio-materials" aria-label={s.title || s.items.join(', ')}>
      <p data-st="rise">
        {s.items.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </p>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about studio-about">
      <figure className="studio-about__photo" data-st="light">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="studio-about__text" data-st="rise">
        {s.label ? <p className="studio-label">{s.label}</p> : null}
        {s.title ? <h2 className="studio-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Услуги — строки заказа: название антиквой, срок на латунной табличке, цена. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services studio-services">
      <div className="studio-head" data-st="rise">
        {s.label ? <p className="studio-label">{s.label}</p> : null}
        {s.title ? <h2 className="studio-h2">{s.title}</h2> : null}
        {s.intro ? <p className="studio-head__intro">{s.intro}</p> : null}
      </div>
      <ol className="studio-services__list">
        {s.items.map((it, i) => (
          <li key={i} data-st="rise" style={{ ['--i' as string]: i }}>
            <span className="studio-services__n">{ROMAN[i] ?? i + 1}</span>
            <div>
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            <div className="studio-services__meta">
              {it.tag ? <em>{it.tag}</em> : null}
              {it.price ? <b>{it.price}</b> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Отделки — книга образцов: квадрат материала, название, доплата. */
function Finishes({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu studio-book">
      <div className="studio-head" data-st="rise">
        {s.label ? <p className="studio-label">{s.label}</p> : null}
        {s.title ? <h2 className="studio-h2">{s.title}</h2> : null}
      </div>
      {s.groups.map((g, gi) => (
        <div key={gi} className="studio-book__group">
          <h3 className="studio-book__gname" data-st="rise">
            {g.name}
          </h3>
          <ul>
            {g.items.map((it, i) => (
              <li key={i} data-st="rise" style={{ ['--i' as string]: i }}>
                <i className={`studio-swatch ${swatchFor(it.name, gi * 3 + i)}`} aria-hidden="true" />
                <b>{it.name}</b>
                {it.text ? <span>{it.text}</span> : null}
                <em>{it.price}</em>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats studio-stats">
      {s.title ? <h2 className="studio-label studio-stats__title" data-st="rise">{s.title}</h2> : null}
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-st="rise" style={{ ['--i' as string]: i }}>
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

/** Этапы — римские цифры на латунной линии, линия прочерчивается при появлении. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process studio-steps">
      <div className="studio-head" data-st="rise">
        {s.label ? <p className="studio-label">{s.label}</p> : null}
        {s.title ? <h2 className="studio-h2">{s.title}</h2> : null}
      </div>
      <ol className="studio-steps__list" data-st="line">
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="studio-steps__n">{ROMAN[i] ?? i + 1}</span>
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
    <section id={s.anchor || undefined} className="s s-testimonials studio-voices">
      {s.label ? <p className="studio-label" data-st="rise">{s.label}</p> : null}
      {s.items.map((it, i) => (
        <figure key={i} data-st="rise">
          <blockquote>{it.quote}</blockquote>
          <figcaption>
            {it.author}
            {it.role ? <span> · {it.role}</span> : null}
          </figcaption>
        </figure>
      ))}
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq studio-faq">
      <div className="studio-head" data-st="rise">
        {s.label ? <p className="studio-label">{s.label}</p> : null}
        {s.title ? <h2 className="studio-h2">{s.title}</h2> : null}
      </div>
      <div className="studio-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item studio-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact studio-contact">
      <div className="studio-hero__light studio-contact__light" aria-hidden="true" />
      <div className="studio-contact__inner" data-st="rise">
        {s.label ? <p className="studio-label">{s.label}</p> : null}
        {s.title ? <h2 className="studio-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="studio-contact__text">{s.text}</p> : null}
        <div className="studio-ctas">
          {s.cta.label ? (
            <a className="studio-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="studio-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Materials, about: About, services: Services, menu: Finishes, stats: Stats, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
