import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { CanopyMotion } from './client'

/*
 * НАВЕС — сварка и навесы с солнечными панелями. Первый экран — навес сбоку: стойки 80×80 поднимаются, балка
 * ложится, швы вспыхивают искрами, шесть панелей встают по одной, солнце идёт по дуге — тень под навесом
 * сдвигается, счётчик выработки растёт: «тень для машины, свет для дома». Цены — калькулятор мощности.
 * Шрифты: Science Gothic (заголовки), Manrope (текст), Noto Sans Mono (метки, цифры).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <CanopyMotion />
      <header className="cn-bar">
        <a href="#top" className="cn-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="cn-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="cn-bar__side">
          {site.nav.cta.label ? (
            <a className="cn-btn cn-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="cn-foot">
        <p className="cn-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="cn-foot__cols">
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
        <p className="cn-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Навес сбоку: стойки 80×80 поднимаются, балка ложится, швы вспыхивают искрами, панели встают по одной,
 *  солнце идёт по дуге — тень под навесом сдвигается, счётчик выработки растёт. */
function Carport({ site }: { site: Site }) {
  return (
    <div className="cn-scene" aria-hidden="true">
      <div className="cn-sky">
        <i className="cn-sun" />
      </div>
      <svg className="cn-svg" viewBox="70 50 400 270">
        <path className="cn-ground" d="M0 300 H520" />
        <path className="cn-shadow" d="M120 300 H420 L404 312 H104 Z" />
        <g className="cn-car">
          <path d="M170 296 V270 C170 262 176 258 186 256 L214 236 C220 232 226 230 236 230 H300 C312 230 318 234 326 242 L342 256 C356 258 368 262 370 272 V296 Z" />
          <circle cx="206" cy="296" r="15" />
          <circle cx="334" cy="296" r="15" />
          <path className="cn-car__glass" d="M222 252 L238 238 H272 V252 Z M280 238 H306 C312 238 316 242 322 252 H280 Z" />
        </g>
        <rect className="cn-post" x="112" y="140" width="12" height="160" />
        <rect className="cn-post cn-post--b" x="400" y="120" width="12" height="180" />
        <g className="cn-roof">
          <path className="cn-beam" d="M96 146 L428 114" />
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i} className="cn-panel" style={{ ['--i' as string]: i }}>
              <path d={`M${104 + i * 54} ${140 - i * 5.2} l50 -4.8 l0 -14 l-50 4.8 Z`} />
            </g>
          ))}
        </g>
        {[[118, 142], [406, 118]].map(([x, y], i) => (
          <g key={i} className="cn-sparks" style={{ ['--i' as string]: i }}>
            {Array.from({ length: 8 }, (_, k) => (
              <path key={k} d={`M${x} ${y} l${(Math.cos(k * 0.8) * 22).toFixed(1)} ${(Math.sin(k * 0.8) * 22 - 6).toFixed(1)}`} />
            ))}
          </g>
        ))}
      </svg>
      <p className="cn-meter">
        <b />
        <small>{pick(site.lang, { ru: 'Вт сейчас', uz: 'Vt hozir', en: 'W now' })}</small>
      </p>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero cn-hero">
      <div className="cn-hero__text">
        {s.eyebrow ? <p className="cn-label cn-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="cn-title cn-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="cn-hero__sub cn-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="cn-ctas cn-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="cn-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="cn-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {s.words.length ? (
          <ul className="cn-words cn-in" style={{ ['--i' as string]: 4 }}>
            {s.words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <Carport site={site} />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee cn-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={38} sep="◆" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about cn-about">
      <figure className="cn-about__photo" data-cn="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="cn-about__text" data-cn="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="cn-label">{s.label}</p> : null}
        {s.title ? <h2 className="cn-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Услуги — разрезы навесов: у каждой карточки свой силуэт крыши сверху, срок — на ленте. */
function Sections({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services cn-cuts">
      <div className="cn-head" data-cn="rise">
        {s.label ? <p className="cn-label">{s.label}</p> : null}
        {s.title ? <h2 className="cn-h2">{s.title}</h2> : null}
        {s.intro ? <p className="cn-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="cn-cuts__list">
        {s.items.map((it, i) => (
          <li key={i} data-cn="roof" style={{ ['--i' as string]: i }}>
            <svg className="cn-cuts__roof" viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true">
              <path d={['M10 46 V18 L190 8 V46', 'M10 46 V10 L190 22 V46', 'M10 46 V20 L190 6 V46 M30 15 L60 13 M70 12 L100 10 M110 9 L140 8 M150 7 L180 6', 'M20 46 L60 14 L100 46 M100 46 L140 14 L180 46'][i % 4]} pathLength="1" />
            </svg>
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

/** Солнечные навесы — калькулятор: сколько машин под крышей → панели, мощность, выработка в месяц; ниже пакеты. */
function Solar({ section: s, site }: SectionProps<'pricing'>) {
  const t = (ru: string, uz: string, en: string) => pick(site.lang, { ru, uz, en })
  return (
    <section id={s.anchor || undefined} className="s s-pricing cn-solar">
      <div className="cn-head" data-cn="rise">
        {s.label ? <p className="cn-label">{s.label}</p> : null}
        {s.title ? <h2 className="cn-h2">{s.title}</h2> : null}
      </div>
      <div className="cn-calc" data-cn="rise">
        <label className="cn-calc__in">
          <span>{t('Машин под навесом', 'Soyabon ostidagi mashinalar', 'Cars under the canopy')}</span>
          <output className="cn-calc__cars">2</output>
          <input type="range" min="1" max="6" step="1" defaultValue="2" />
        </label>
        <dl className="cn-calc__out">
          <div>
            <dt>{t('панелей по 550 Вт', '550 Vt panel', 'panels, 550 W')}</dt>
            <dd data-k="panels">10</dd>
          </div>
          <div>
            <dt>{t('кВт мощности', 'kVt quvvat', 'kW peak')}</dt>
            <dd data-k="kw">5,5</dd>
          </div>
          <div>
            <dt>{t('кВт·ч в месяц, примерно', 'oyiga kVt·soat, taxminan', 'kWh a month, approx.')}</dt>
            <dd data-k="kwh">740</dd>
          </div>
        </dl>
        <p className="cn-calc__note">{t('Ориентир для Ташкента: ~4,5 солнечных часа в день. Точную цифру считаем на замере.', 'Toshkent uchun taxmin: kuniga ~4,5 quyoshli soat. Aniq raqamni o‘lchovda hisoblaymiz.', 'A Tashkent estimate: ~4.5 sun hours a day. We calculate the exact figure on site.')}</p>
      </div>
      <div className="cn-plans">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-cn="rise" style={{ ['--i' as string]: i }}>
            <h3>{it.name}</h3>
            <p className="cn-plans__price">
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
    <section id={s.anchor || undefined} className="s s-gallery cn-gallery">
      <div className="cn-head" data-cn="rise">
        {s.label ? <p className="cn-label">{s.label}</p> : null}
        {s.title ? <h2 className="cn-h2">{s.title}</h2> : null}
      </div>
      <ul className="cn-gallery__strip">
        {s.items.map((it, i) => (
          <li key={i} data-cn="heat" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-stats cn-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-cn="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team cn-team">
      <div className="cn-head" data-cn="rise">
        {s.label ? <p className="cn-label">{s.label}</p> : null}
        {s.title ? <h2 className="cn-h2">{s.title}</h2> : null}
      </div>
      <ul className="cn-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-cn="rise" style={{ ['--i' as string]: i }}>
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

/** Этапы — от замера до первого киловатта: шаги на дуге дня, солнце поднимается от шага к шагу. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process cn-day">
      <div className="cn-head" data-cn="rise">
        {s.label ? <p className="cn-label">{s.label}</p> : null}
        {s.title ? <h2 className="cn-h2">{s.title}</h2> : null}
      </div>
      <ol className="cn-day__list" data-cn="day" style={{ ['--n' as string]: s.items.length }}>
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i, ['--h' as string]: Math.sin(((i + 0.5) / s.items.length) * Math.PI).toFixed(3) }}>
            <span className="cn-day__sun" aria-hidden="true" />
            <span className="cn-day__n">{String(i + 1).padStart(2, '0')}</span>
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
    <section id={s.anchor || undefined} className="s s-testimonials cn-voices">
      <div className="cn-head" data-cn="rise">
        {s.label ? <p className="cn-label">{s.label}</p> : null}
        {s.title ? <h2 className="cn-h2">{s.title}</h2> : null}
      </div>
      <div className="cn-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-cn="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq cn-faq">
      <div className="cn-head" data-cn="rise">
        {s.label ? <p className="cn-label">{s.label}</p> : null}
        {s.title ? <h2 className="cn-h2">{s.title}</h2> : null}
      </div>
      <div className="cn-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item cn-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="cn-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact cn-contact">
      <i className="cn-contact__sun" aria-hidden="true" />
      <div className="cn-contact__inner" data-cn="rise">
        {s.label ? <p className="cn-label">{s.label}</p> : null}
        {s.title ? <h2 className="cn-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="cn-contact__text">{s.text}</p> : null}
        <div className="cn-ctas">
          {s.cta.label ? (
            <a className="cn-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="cn-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, services: Sections, pricing: Solar, gallery: Gallery, marquee: MarqueeSec, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
