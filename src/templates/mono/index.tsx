import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media, rng } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { MonoMotion } from './client'

/*
 * МОНО — минималистичная мебель. Первый экран — вычитание: комната набита контурами вещей (коробки, стулья,
 * лампы, полки), они исчезают по одному, и в пустоте остаются четыре чёрных силуэта — стол, стеллаж, кровать,
 * шкаф. Только потом — заголовок, тихо, с воздухом. Предметы — строки с огромным именем, материалы —
 * квадраты-образцы, наборы — чёрный и белый лист. Шрифты: Sofia Sans Extra Condensed (заголовки),
 * Golos Text (текст), Cousine (метки, цены).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
/** образцы материалов по названию */
const swatch = (name: string) => {
  const n = name.toLowerCase()
  if (/бетон|beton|concrete/.test(n)) return 'mono-sw--concrete'
  if (/металл|metall|metal|чёрн|qora|black/.test(n)) return 'mono-sw--steel'
  if (/бел|oq|white/.test(n)) return 'mono-sw--white'
  if (/дуб|eman|oak/.test(n)) return 'mono-sw--oak'
  if (/букле|bukle|boucl/.test(n)) return 'mono-sw--boucle'
  return 'mono-sw--blank'
}

function Clutter({ seed }: { seed: string }) {
  const r = rng(seed)
  const shapes = ['M0 0 H40 V30 H0 Z', 'M0 30 V0 H24 V30 M0 14 H24', 'M12 0 V40 M0 40 H24 M4 0 H20 L16 -10 H8 Z', 'M0 0 H50 M0 12 H50 M0 24 H50 M2 0 V30 M48 0 V30', 'M0 20 Q20 -10 40 20 Z', 'M0 0 H30 V40 H0 Z M0 10 H30']
  const junk = Array.from({ length: 30 }, (_, i) => ({ d: shapes[i % shapes.length], x: 30 + r() * 560, y: 40 + r() * 230, s: 0.7 + r() * 0.9, rot: (r() - 0.5) * 30, i }))
  return (
    <svg className="mono-room" viewBox="0 0 640 340" aria-hidden="true">
      <path d="M0 300 H640" className="mono-room__floor" />
      <g className="mono-junk">
        {junk.map((j) => (
          <path key={j.i} d={j.d} transform={`translate(${j.x.toFixed(0)} ${j.y.toFixed(0)}) rotate(${j.rot.toFixed(0)}) scale(${j.s.toFixed(2)})`} style={{ ['--i' as string]: j.i }} />
        ))}
      </g>
      <g className="mono-keep">
        <g style={{ ['--i' as string]: 0 }}>
          <rect x="60" y="226" width="150" height="10" />
          <rect x="70" y="236" width="6" height="64" />
          <rect x="194" y="236" width="6" height="64" />
        </g>
        <g style={{ ['--i' as string]: 1 }}>
          <path d="M260 120 V300 M340 120 V300" className="mono-keep__line" />
          <rect x="260" y="150" width="80" height="6" />
          <rect x="260" y="200" width="80" height="6" />
          <rect x="260" y="250" width="80" height="6" />
        </g>
        <g style={{ ['--i' as string]: 2 }}>
          <rect x="380" y="268" width="170" height="22" />
          <rect x="380" y="236" width="16" height="54" />
          <rect x="384" y="290" width="8" height="10" />
          <rect x="538" y="290" width="8" height="10" />
        </g>
        <g style={{ ['--i' as string]: 3 }}>
          <rect x="574" y="60" width="50" height="240" className="mono-keep__white" />
        </g>
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
      <MonoMotion />
      <header className="mono-bar">
        <a href="#top" className="mono-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="mono-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
      </header>
      <main id="top">{children}</main>
      <footer className="mono-foot">
        <p className="mono-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="mono-foot__cols">
          {address ? <p>{address}</p> : null}
          {b.hours.length ? <p>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</p> : null}
          <p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </p>
          <p>
            © {new Date().getFullYear()} {b.legalName || site.name}
            <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const mats = s.words.filter(Boolean).slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero mono-hero">
      <Clutter seed={`${site.slug}-junk`} />
      <div className="mono-hero__text">
        <h1 className="mono-title">{s.title || site.name}</h1>
        <div className="mono-hero__side">
          {s.eyebrow ? <p className="mono-label">{s.eyebrow}</p> : null}
          {s.subtitle ? <p className="mono-hero__sub">{s.subtitle}</p> : null}
          <div className="mono-ctas">
            {s.cta.label ? (
              <a className="mono-btn" href={s.cta.href || '#'}>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="mono-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          {mats.length ? (
            <ul className="mono-mats">
              {mats.map((m, i) => (
                <li key={i}>
                  <i className={swatch(m)} aria-hidden="true" />
                  {m}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Предметы — строка на всю ширину: огромное имя, фото, текст; чёрные и белые строки чередуются. */
function Items({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works mono-items">
      <div className="mono-head" data-mn="rise">
        {s.label ? <p className="mono-label">{s.label}</p> : null}
        {s.title ? <h2 className="mono-h2">{s.title}</h2> : null}
      </div>
      <ol className="mono-items__list">
        {s.items.map((it, i) => (
          <li key={i} data-mn="wipe" style={{ ['--i' as string]: i }}>
            <h3 className="mono-items__name">{it.title}</h3>
            <figure>
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="stripes" className="media" />
            </figure>
            <div className="mono-items__text">
              <span>{String(i + 1).padStart(2, '0')}</span>
              {it.text ? <p>{it.text}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Материалы — квадраты-образцы, подпись под каждым. */
function Materials({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s mono-swatches" aria-label={s.title || s.items.join(', ')}>
      {s.title ? <p className="mono-label" data-mn="rise">{s.title}</p> : null}
      <ul>
        {s.items.map((m, i) => (
          <li key={i} data-mn="rise" style={{ ['--i' as string]: i }}>
            <i className={swatch(m)} aria-hidden="true" />
            {m}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Наборы — листы: обычный белый, выбранный — чёрный. */
function Sets({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing mono-sets">
      <div className="mono-head" data-mn="rise">
        {s.label ? <p className="mono-label">{s.label}</p> : null}
        {s.title ? <h2 className="mono-h2">{s.title}</h2> : null}
      </div>
      <div className="mono-sets__list">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-mn="rise" style={{ ['--i' as string]: i }}>
            <h3>{it.name}</h3>
            <p className="mono-sets__price">
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
    <section id={s.anchor || undefined} className="s s-testimonials mono-voices">
      {s.label ? <p className="mono-label" data-mn="rise">{s.label}</p> : null}
      {s.items.map((it, i) => (
        <figure key={i} data-mn="rise">
          <blockquote>{it.quote}</blockquote>
          <figcaption>
            — {it.author}
            {it.role ? `, ${it.role}` : ''}
          </figcaption>
        </figure>
      ))}
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq mono-faq">
      <div className="mono-head" data-mn="rise">
        {s.label ? <p className="mono-label">{s.label}</p> : null}
        {s.title ? <h2 className="mono-h2">{s.title}</h2> : null}
      </div>
      <div className="mono-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item mono-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact mono-contact">
      <div className="mono-contact__inner" data-mn="rise">
        {s.label ? <p className="mono-label">{s.label}</p> : null}
        {s.title ? <h2 className="mono-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="mono-contact__text">{s.text}</p> : null}
        <div className="mono-ctas">
          {s.cta.label ? (
            <a className="mono-btn mono-btn--inv" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="mono-link" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
        </div>
      </div>
      <p className="mono-contact__word" aria-hidden="true">
        {pick(site.lang, { ru: 'меньше', uz: 'kamroq', en: 'less' })}
      </p>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, works: Items, marquee: Materials, pricing: Sets, testimonials: Testimonials, faq: Faq, contact: Contact },
}
