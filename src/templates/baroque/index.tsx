import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { BaroqueMotion } from './client'

/*
 * БАРОККО — салон классической мебели «на поколения». Первый экран собран по оси: резной гребень изголовья
 * прорисовывается резцом (половина и её зеркало), ложится патина, проступает золото; под заголовком латунная
 * табличка — годы идут вперёд до 2075. Гарнитуры — паспорта с резными уголками, прайс — лист каталога,
 * салон — медленные кадры в овальных рамах, заказ — шаги под гирляндой.
 * Шрифты: Oranienbaum (заголовки), Vollkorn (текст), Cormorant SC (метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <BaroqueMotion />
      <header className="bq-bar">
        <a href="#top" className="bq-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="bq-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="bq-bar__side">
          {site.nav.cta.label ? (
            <a className="bq-btn bq-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="bq-foot">
        <p className="bq-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="bq-foot__cols">
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
        <p className="bq-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Резной гребень изголовья: половина рисуется, вторая — её зеркало. Резец проходит по линиям, ложится патина,
 *  проступает золото; под заголовком латунная табличка — годы идут вперёд: мебель служит следующему поколению. */
const HALF = [
  'M300 112 C252 112 222 82 182 92 C142 102 142 152 182 152 C207 152 207 127 190 124',
  'M182 92 C152 62 112 72 92 102 C72 132 42 132 22 112',
  'M92 102 C82 152 122 182 152 162 C167 152 162 137 150 138',
  'M240 100 C230 70 250 50 270 56',
  'M130 170 C110 190 70 192 46 184',
]
const SHELL = 'M300 22 C262 22 246 58 264 86 C276 104 324 104 336 86 C354 58 338 22 300 22 Z M300 26 V98 M282 30 L292 98 M318 30 L308 98 M266 44 L286 98 M334 44 L314 98'

function Crest() {
  const half = HALF.map((d, i) => <path key={i} d={d} pathLength="1" style={{ ['--i' as string]: i }} />)
  return (
    <svg className="bq-crest" viewBox="0 0 600 210" aria-hidden="true">
      <g className="bq-crest__cut">
        <path d={SHELL} pathLength="1" style={{ ['--i' as string]: 0 }} />
        {half}
        <g transform="translate(600 0) scale(-1 1)">{half}</g>
        <path d="M40 202 H560 M64 192 H536" pathLength="1" style={{ ['--i' as string]: 5 }} />
      </g>
      <g className="bq-crest__gold">
        <path d={SHELL} />
        {HALF.slice(0, 3).map((d, i) => (
          <path key={i} d={d} />
        ))}
        <g transform="translate(600 0) scale(-1 1)">
          {HALF.slice(0, 3).map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
    </svg>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero bq-hero">
      <Crest />
      {s.eyebrow ? <p className="bq-label bq-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
      <h1 className="bq-title bq-in" style={{ ['--i' as string]: 1 }}>
        {s.title || site.name}
      </h1>
      {s.subtitle ? <p className="bq-hero__sub bq-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
      <div className="bq-ctas bq-in" style={{ ['--i' as string]: 3 }}>
        {s.cta.label ? (
          <a className="bq-btn" href={s.cta.href || '#'}>
            {s.cta.label}
          </a>
        ) : null}
        {s.ctaSecondary.label ? (
          <a className="bq-link" href={s.ctaSecondary.href || '#'}>
            {s.ctaSecondary.label}
          </a>
        ) : null}
      </div>
      <p className="bq-plaque" aria-hidden="true">
        <span>{pick(site.lang, { ru: 'служит и в', uz: 'xizmat qiladi', en: 'still in use in' })}</span>
        <b />
      </p>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee bq-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={38} sep="◆" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about bq-about">
      <figure className="bq-about__photo" data-bq="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="bq-about__text" data-bq="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="bq-label">{s.label}</p> : null}
        {s.title ? <h2 className="bq-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Гарнитуры — паспорта: резные уголки рамки прорисовываются, порода и число предметов — строкой паспорта. */
function Passports({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services bq-sets">
      <div className="bq-head" data-bq="rise">
        {s.label ? <p className="bq-label">{s.label}</p> : null}
        {s.title ? <h2 className="bq-h2">{s.title}</h2> : null}
        {s.intro ? <p className="bq-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="bq-sets__list">
        {s.items.map((it, i) => (
          <li key={i} data-bq="frame" style={{ ['--i' as string]: i }}>
            <i className="bq-corner bq-corner--tl" aria-hidden="true" />
            <i className="bq-corner bq-corner--br" aria-hidden="true" />
            <span className="bq-sets__no">№ {String(i + 1).padStart(3, '0')}</span>
            <h3>{it.title}</h3>
            {it.tag ? <p className="bq-sets__tag">{it.tag}</p> : null}
            {it.text ? <p>{it.text}</p> : null}
            {it.price ? <b>{it.price}</b> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Прайс — лист каталога: колонки по комнатам, между строками — резной разделитель. */
function Prices({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu bq-prices">
      <div className="bq-head bq-head--center" data-bq="rise">
        {s.label ? <p className="bq-label">{s.label}</p> : null}
        {s.title ? <h2 className="bq-h2">{s.title}</h2> : null}
      </div>
      <div className="bq-prices__cols">
        {s.groups.map((g, gi) => (
          <div key={gi} className="bq-prices__col" data-bq="rise" style={{ ['--i' as string]: gi }}>
            <h3>{g.name}</h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={i}>
                  <span>{it.name}</span>
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

/** Салон вживую — медленные кадры в овальных золочёных рамах. */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery bq-gallery">
      <div className="bq-head" data-bq="rise">
        {s.label ? <p className="bq-label">{s.label}</p> : null}
        {s.title ? <h2 className="bq-h2">{s.title}</h2> : null}
      </div>
      <ul className="bq-gallery__grid">
        {s.items.map((it, i) => (
          <li key={i} data-bq="oval" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-stats bq-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-bq="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team bq-team">
      <div className="bq-head" data-bq="rise">
        {s.label ? <p className="bq-label">{s.label}</p> : null}
        {s.title ? <h2 className="bq-h2">{s.title}</h2> : null}
      </div>
      <ul className="bq-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-bq="rise" style={{ ['--i' as string]: i }}>
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

/** Как заказать — шаги под гирляндой: между шагами провисают резные фестоны. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process bq-swag">
      <div className="bq-head bq-head--center" data-bq="rise">
        {s.label ? <p className="bq-label">{s.label}</p> : null}
        {s.title ? <h2 className="bq-h2">{s.title}</h2> : null}
      </div>
      <ol className="bq-swag__list" data-bq="swag" style={{ ['--n' as string]: s.items.length }}>
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <svg className="bq-swag__garland" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 4 C30 34 70 34 100 4" />
            </svg>
            <span className="bq-swag__n">{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i] || i + 1}</span>
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
    <section id={s.anchor || undefined} className="s s-testimonials bq-voices">
      <div className="bq-head" data-bq="rise">
        {s.label ? <p className="bq-label">{s.label}</p> : null}
        {s.title ? <h2 className="bq-h2">{s.title}</h2> : null}
      </div>
      <div className="bq-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-bq="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq bq-faq">
      <div className="bq-head" data-bq="rise">
        {s.label ? <p className="bq-label">{s.label}</p> : null}
        {s.title ? <h2 className="bq-h2">{s.title}</h2> : null}
      </div>
      <div className="bq-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item bq-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="bq-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact bq-contact">
      
      <div className="bq-contact__inner" data-bq="rise">
        {s.label ? <p className="bq-label">{s.label}</p> : null}
        {s.title ? <h2 className="bq-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="bq-contact__text">{s.text}</p> : null}
        <div className="bq-ctas">
          {s.cta.label ? (
            <a className="bq-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="bq-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, services: Passports, menu: Prices, gallery: Gallery, marquee: MarqueeSec, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
