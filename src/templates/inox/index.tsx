import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { InoxMotion } from './client'

/*
 * НЕРЖАВЕЙКА — перила и ограждения из нержавеющей стали и стекла. Первый экран — лестница в разрезе: стеклянные
 * панели встают в точечные держатели, полировальный круг проходит по поручню — матовый металл становится
 * зеркальным, в нём отражается дом; блик следует за курсором. Каталог — профили в разрезе, работы в зеркальной
 * рамке с бликом, пакеты — пластины шлифовки, этапы — ступени.
 * Шрифты: Play (заголовки), Geologica (текст), Overpass Mono (метки, характеристики).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <InoxMotion />
      <header className="ix-bar">
        <a href="#top" className="ix-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="ix-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ix-bar__side">
          {site.nav.cta.label ? (
            <a className="ix-btn ix-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="ix-foot">
        <p className="ix-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="ix-foot__cols">
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
        <p className="ix-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Лестница в разрезе: стеклянные панели встают в точечные держатели по одной, затем полировальный круг проходит
 *  по поручню — матовая нержавейка становится зеркальной, в ней отражается дом; блик следует за курсором. */
const PANELS = 4

function Stair() {
  return (
    <div className="ix-stair" aria-hidden="true">
      <div className="ix-steps">
        {Array.from({ length: 7 }, (_, i) => (
          <i key={i} style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <div className="ix-run">
        <div className="ix-rail">
          <i className="ix-rail__mirror" />
          <i className="ix-rail__pad" />
        </div>
        <div className="ix-glass">
          {Array.from({ length: PANELS }, (_, i) => (
            <span key={i} style={{ ['--i' as string]: i }}>
              <b />
              <b />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const specs = s.words.map((w) => w.split('|'))
  return (
    <section id={s.anchor || undefined} className="s s-hero ix-hero">
      <div className="ix-hero__text">
        {s.eyebrow ? <p className="ix-label ix-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="ix-title ix-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="ix-hero__sub ix-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="ix-ctas ix-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="ix-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="ix-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <Stair />
      {specs.length ? (
        <dl className="ix-specs">
          {specs.map(([v, l], i) => (
            <div key={i} style={{ ['--i' as string]: i }}>
              <dt>{l || ''}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee ix-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={38} sep="◆" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about ix-about">
      <figure className="ix-about__photo" data-ix="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="ix-about__text" data-ix="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="ix-label">{s.label}</p> : null}
        {s.title ? <h2 className="ix-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Каталог — профили в разрезе: у каждой позиции свой срез трубы/держателя, цена за метр — на металлической бирке. */
function Profiles({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services ix-cat">
      <div className="ix-head" data-ix="rise">
        {s.label ? <p className="ix-label">{s.label}</p> : null}
        {s.title ? <h2 className="ix-h2">{s.title}</h2> : null}
        {s.intro ? <p className="ix-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="ix-cat__list">
        {s.items.map((it, i) => (
          <li key={i} data-ix="shine" style={{ ['--i' as string]: i }}>
            <span className={`ix-cut ix-cut--${i % 5}`} aria-hidden="true" />
            <div>
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            <p className="ix-cat__tag">
              {it.price ? <b>{it.price}</b> : null}
              {it.tag ? <span>{it.tag}</span> : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Работы — объекты в зеркальной рамке: при появлении по рамке пробегает блик полировки. */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works ix-works">
      <div className="ix-head" data-ix="rise">
        {s.label ? <p className="ix-label">{s.label}</p> : null}
        {s.title ? <h2 className="ix-h2">{s.title}</h2> : null}
      </div>
      <ul className="ix-works__list">
        {s.items.map((it, i) => (
          <li key={i} data-ix="shine" style={{ ['--i' as string]: i }}>
            <figure>
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="arch" className="media" />
            </figure>
            <p className="ix-works__meta">
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
    <section id={s.anchor || undefined} className="s s-pricing ix-plates">
      <div className="ix-head" data-ix="rise">
        {s.label ? <p className="ix-label">{s.label}</p> : null}
        {s.title ? <h2 className="ix-h2">{s.title}</h2> : null}
      </div>
      <div className="ix-plates__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-ix="rise" style={{ ['--i' as string]: i }}>
            <h3>{it.name}</h3>
            <p className="ix-plates__price">
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
    <section id={s.anchor || undefined} className="s s-gallery ix-gallery">
      <div className="ix-head" data-ix="rise">
        {s.label ? <p className="ix-label">{s.label}</p> : null}
        {s.title ? <h2 className="ix-h2">{s.title}</h2> : null}
      </div>
      <ul className="ix-gallery__strip">
        {s.items.map((it, i) => (
          <li key={i} data-ix="heat" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-stats ix-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-ix="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team ix-team">
      <div className="ix-head" data-ix="rise">
        {s.label ? <p className="ix-label">{s.label}</p> : null}
        {s.title ? <h2 className="ix-h2">{s.title}</h2> : null}
      </div>
      <ul className="ix-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-ix="rise" style={{ ['--i' as string]: i }}>
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

/** Этапы — ступени лестницы: каждый шаг на ступень выше предыдущего, поручень идёт над ними. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process ix-flight">
      <div className="ix-head" data-ix="rise">
        {s.label ? <p className="ix-label">{s.label}</p> : null}
        {s.title ? <h2 className="ix-h2">{s.title}</h2> : null}
      </div>
      <ol className="ix-flight__list" data-ix="climb" style={{ ['--n' as string]: s.items.length }}>
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="ix-flight__n">{String(i + 1).padStart(2, '0')}</span>
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
    <section id={s.anchor || undefined} className="s s-testimonials ix-voices">
      <div className="ix-head" data-ix="rise">
        {s.label ? <p className="ix-label">{s.label}</p> : null}
        {s.title ? <h2 className="ix-h2">{s.title}</h2> : null}
      </div>
      <div className="ix-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-ix="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq ix-faq">
      <div className="ix-head" data-ix="rise">
        {s.label ? <p className="ix-label">{s.label}</p> : null}
        {s.title ? <h2 className="ix-h2">{s.title}</h2> : null}
      </div>
      <div className="ix-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item ix-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="ix-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact ix-contact">
      <i className="ix-contact__rail" aria-hidden="true" />
      <div className="ix-contact__inner" data-ix="rise">
        {s.label ? <p className="ix-label">{s.label}</p> : null}
        {s.title ? <h2 className="ix-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="ix-contact__text">{s.text}</p> : null}
        <div className="ix-ctas">
          {s.cta.label ? (
            <a className="ix-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="ix-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, services: Profiles, works: Works, pricing: Plates, gallery: Gallery, marquee: MarqueeSec, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
