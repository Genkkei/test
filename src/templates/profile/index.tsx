import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { ProfileMotion } from './client'

/*
 * ПРОФИЛЬ — мастерская металлической мебели в минимализме. Первый экран — изометрия стола из профиля 20×20:
 * рёбра вытягиваются по одному, как в CAD; на углу вспыхивает сварной шов и стачивается до невидимого; ложится
 * дубовая столешница, выносной размер 1500; кнопки RAL перекрашивают раму. Цены — лист раскроя, проекты —
 * карточки с метками совмещения, этапы — инструкция по сборке.
 * Шрифты: Sofia Sans Condensed (заголовки), Commissioner (текст), Source Code Pro (метки, размеры).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <ProfileMotion />
      <header className="pf-bar">
        <a href="#top" className="pf-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="pf-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="pf-bar__side">
          {site.nav.cta.label ? (
            <a className="pf-btn pf-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="pf-foot">
        <p className="pf-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="pf-foot__cols">
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
        <p className="pf-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Изометрия стола из профиля 20×20: рёбра вытягиваются по одному, как в CAD, на углу появляется сварной шов и
 *  стачивается до невидимого, ложится столешница, выносные размеры подписывают габариты. Кнопки RAL перекрашивают раму. */
const ISO = (x: number, y: number, z: number): [number, number] => [200 + (x - y) * 0.866, 190 + (x + y) * 0.5 - z]
const L = 150, W = 80, H = 76
const EDGES: [number, number, number, number, number, number][] = [
  [0, 0, 0, 0, 0, H], [L, 0, 0, L, 0, H], [L, W, 0, L, W, H], [0, W, 0, 0, W, H],
  [0, 0, H, L, 0, H], [L, 0, H, L, W, H], [L, W, H, 0, W, H], [0, W, H, 0, 0, H],
  [0, 0, 12, L, 0, 12], [0, W, 12, 0, 0, 12],
]
const line = ([a, b, c, d, e, f]: (typeof EDGES)[number]) => {
  const [x1, y1] = ISO(a, b, c)
  const [x2, y2] = ISO(d, e, f)
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`
}
const TOP = [ISO(-6, -6, H + 2), ISO(L + 6, -6, H + 2), ISO(L + 6, W + 6, H + 2), ISO(-6, W + 6, H + 2)].map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' ')
const pts = (a: [number, number][]) => a.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' ')
const SIDE_A = pts([ISO(-6, W + 6, H + 2), ISO(L + 6, W + 6, H + 2), ISO(L + 6, W + 6, H - 4), ISO(-6, W + 6, H - 4)])
const SIDE_B = pts([ISO(L + 6, -6, H + 2), ISO(L + 6, W + 6, H + 2), ISO(L + 6, W + 6, H - 4), ISO(L + 6, -6, H - 4)])
const RAL = [
  { code: '9005', color: '#16171a' },
  { code: '7016', color: '#3b4249' },
  { code: '9010', color: '#e9e6dc' },
  { code: '2004', color: '#ff5a2e' },
]

function Frame({ site }: { site: Site }) {
  const [wx, wy] = ISO(L, 0, H)
  const [d1x, d1y] = ISO(0, W + 24, 0)
  const [d2x, d2y] = ISO(L, W + 24, 0)
  return (
    <div className="pf-frame">
      <div className="pf-draw" data-ral="9005" aria-hidden="true">
        <svg viewBox="90 60 290 280">
          {EDGES.map((e, i) => (
            <path key={i} className="pf-edge" d={line(e)} pathLength="1" style={{ ['--i' as string]: i }} />
          ))}
          <polygon className="pf-top" points={TOP} />
          <polygon className="pf-top pf-top--side" points={SIDE_A} />
          <polygon className="pf-top pf-top--end" points={SIDE_B} />
          <circle className="pf-weld" cx={wx} cy={wy} r="7" />
          <g className="pf-sparks">
            {Array.from({ length: 7 }, (_, k) => (
              <path key={k} d={`M${wx.toFixed(1)} ${wy.toFixed(1)} l${(Math.cos(k * 0.9 - 2) * 26).toFixed(1)} ${(Math.sin(k * 0.9 - 2) * 26).toFixed(1)}`} />
            ))}
          </g>
          <g className="pf-dim">
            <path d={`M${d1x.toFixed(1)} ${d1y.toFixed(1)} L${d2x.toFixed(1)} ${d2y.toFixed(1)}`} pathLength="1" />
            <text x={((d1x + d2x) / 2).toFixed(1)} y={((d1y + d2y) / 2 + 16).toFixed(1)} transform={`rotate(30 ${((d1x + d2x) / 2).toFixed(1)} ${((d1y + d2y) / 2 + 16).toFixed(1)})`}>
              1500
            </text>
          </g>
          <text className="pf-callout" x="318" y="96">
            20×20
          </text>
          <path className="pf-callout-line" d={`M330 102 L${(wx + 5).toFixed(1)} ${(wy - 5).toFixed(1)}`} />
        </svg>
      </div>
      <div className="pf-ral" role="group" aria-label={pick(site.lang, { ru: 'Цвет рамы по RAL', uz: 'RAL bo‘yicha rama rangi', en: 'Frame colour, RAL' })}>
        {RAL.map((r, i) => (
          <button key={r.code} type="button" value={r.code} aria-pressed={i === 0} style={{ ['--c' as string]: r.color, ['--i' as string]: i }}>
            <i />
            RAL {r.code}
          </button>
        ))}
      </div>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero pf-hero">
      <div className="pf-hero__text">
        {s.eyebrow ? <p className="pf-label pf-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="pf-title pf-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="pf-hero__sub pf-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="pf-ctas pf-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="pf-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="pf-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {s.words.length ? (
          <ol className="pf-words pf-in" style={{ ['--i' as string]: 4 }}>
            {s.words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ol>
        ) : null}
      </div>
      <Frame site={site} />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee pf-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={38} sep="◆" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about pf-about">
      <figure className="pf-about__photo" data-pf="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="pf-about__text" data-pf="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="pf-label">{s.label}</p> : null}
        {s.title ? <h2 className="pf-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Цены — спецификация-«раскрой»: позиция, изделие, срок и цена строкой таблицы, как в листе раскроя металла. */
function CutList({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services pf-cut">
      <div className="pf-head" data-pf="rise">
        {s.label ? <p className="pf-label">{s.label}</p> : null}
        {s.title ? <h2 className="pf-h2">{s.title}</h2> : null}
        {s.intro ? <p className="pf-head__intro">{s.intro}</p> : null}
      </div>
      <ol className="pf-cut__list">
        {s.items.map((it, i) => (
          <li key={i} data-pf="row" style={{ ['--i' as string]: i }}>
            <span className="pf-cut__pos">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            <span className="pf-cut__tag">{it.tag}</span>
            <b>{it.price}</b>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Проекты — карточки с метками совмещения по углам, как на листе чертежа; метки сходятся при появлении. */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works pf-works">
      <div className="pf-head" data-pf="rise">
        {s.label ? <p className="pf-label">{s.label}</p> : null}
        {s.title ? <h2 className="pf-h2">{s.title}</h2> : null}
      </div>
      <ul className="pf-works__list">
        {s.items.map((it, i) => (
          <li key={i} data-pf="marks" style={{ ['--i' as string]: i }}>
            <i className="pf-mark pf-mark--a" aria-hidden="true" />
            <i className="pf-mark pf-mark--b" aria-hidden="true" />
            <figure>
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="arch" className="media" />
            </figure>
            <p className="pf-works__meta">
              {it.category}
              {it.year ? <span>{it.year}</span> : null}
            </p>
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Пакеты — пластины из нержавейки: шлифовка по одной стороне, рекомендуемый — зеркальный. */
function Plates({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing pf-plates">
      <div className="pf-head" data-pf="rise">
        {s.label ? <p className="pf-label">{s.label}</p> : null}
        {s.title ? <h2 className="pf-h2">{s.title}</h2> : null}
      </div>
      <div className="pf-plates__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-pf="rise" style={{ ['--i' as string]: i }}>
            <h3>{it.name}</h3>
            <p className="pf-plates__price">
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

/** Работы — лента снимков: холодные серые, при появлении «нагреваются» до цвета. */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery pf-gallery">
      <div className="pf-head" data-pf="rise">
        {s.label ? <p className="pf-label">{s.label}</p> : null}
        {s.title ? <h2 className="pf-h2">{s.title}</h2> : null}
      </div>
      <ul className="pf-gallery__strip">
        {s.items.map((it, i) => (
          <li key={i} data-pf="heat" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-stats pf-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-pf="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team pf-team">
      <div className="pf-head" data-pf="rise">
        {s.label ? <p className="pf-label">{s.label}</p> : null}
        {s.title ? <h2 className="pf-h2">{s.title}</h2> : null}
      </div>
      <ul className="pf-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-pf="rise" style={{ ['--i' as string]: i }}>
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

/** Как работаем — инструкция по сборке: номер шага в круге, стрелка к следующему. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process pf-steps">
      <div className="pf-head" data-pf="rise">
        {s.label ? <p className="pf-label">{s.label}</p> : null}
        {s.title ? <h2 className="pf-h2">{s.title}</h2> : null}
      </div>
      <ol className="pf-steps__list">
        {s.items.map((it, i) => (
          <li key={i} data-pf="rise" style={{ ['--i' as string]: i }}>
            <span className="pf-steps__n">{i + 1}</span>
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
    <section id={s.anchor || undefined} className="s s-testimonials pf-voices">
      <div className="pf-head" data-pf="rise">
        {s.label ? <p className="pf-label">{s.label}</p> : null}
        {s.title ? <h2 className="pf-h2">{s.title}</h2> : null}
      </div>
      <div className="pf-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-pf="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq pf-faq">
      <div className="pf-head" data-pf="rise">
        {s.label ? <p className="pf-label">{s.label}</p> : null}
        {s.title ? <h2 className="pf-h2">{s.title}</h2> : null}
      </div>
      <div className="pf-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item pf-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="pf-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact pf-contact">
      <i className="pf-contact__grid" aria-hidden="true" />
      <div className="pf-contact__inner" data-pf="rise">
        {s.label ? <p className="pf-label">{s.label}</p> : null}
        {s.title ? <h2 className="pf-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="pf-contact__text">{s.text}</p> : null}
        <div className="pf-ctas">
          {s.cta.label ? (
            <a className="pf-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="pf-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, services: CutList, works: Works, pricing: Plates, gallery: Gallery, marquee: MarqueeSec, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
