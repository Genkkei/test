import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media, rng } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { WorkshopMotion } from './client'

/*
 * МАСТЕРСКАЯ — кузня с мастер-классами. Первый экран — афиша: на силуэте наковальни лежит раскалённое
 * слово-заготовка. Три удара: слово сплющивается и отскакивает, из-под молота летят искры, металл остывает
 * по шкале каления (жёлтый → оранжевый → вишнёвый → тёмный), термометр горна падает 1200° → 700°.
 * Программы — полоски каления (чем сложнее, тем горячее), раунды — счёт ударов, сертификаты — кованые жетоны.
 * Шрифты: Kelly Slab (заголовки), Rubik (текст), Ubuntu Mono (метки, температура).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
/** шкала каления — от холодного к белому */
const HEAT = ['#5a1d10', '#8f2a12', '#c2401a', '#e2541a', '#f08a2a', '#f7c04a']

function Sparks({ seed, n, wave }: { seed: string; n: number; wave: number }) {
  const r = rng(seed)
  return (
    <span className={`ws-sparks ws-sparks--${wave}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const a = -Math.PI * (0.08 + r() * 0.84)
        const d = 60 + r() * 160
        return <i key={i} style={{ ['--dx' as string]: `${(Math.cos(a) * d).toFixed(0)}px`, ['--dy' as string]: `${(Math.sin(a) * d).toFixed(0)}px`, ['--l' as string]: `${(6 + r() * 14).toFixed(0)}px`, ['--rot' as string]: `${((a * 180) / Math.PI).toFixed(0)}deg` }} />
      })}
    </span>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <WorkshopMotion />
      <header className="ws-bar">
        <a href="#top" className="ws-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="ws-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ws-bar__side">
          {site.nav.cta.label ? (
            <a className="ws-btn ws-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="ws-foot">
        <p className="ws-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="ws-foot__heat" aria-hidden="true">
          {HEAT.map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </div>
        <div className="ws-foot__cols">
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
        <p className="ws-foot__legal">
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
  const notes = s.words.filter(Boolean).slice(0, 3)
  return (
    <section id={s.anchor || undefined} className="s s-hero ws-hero">
      <div className="ws-hero__top">
        {s.eyebrow ? <p className="ws-label ws-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <p className="ws-temp" aria-hidden="true">
          <span className="ws-temp__n" />°C
        </p>
      </div>
      <div className="ws-stage">
        <h1 className="ws-title">
          <span className="ws-title__metal">{s.title || site.name}</span>
        </h1>
        <Sparks seed={`${site.slug}-s1`} n={16} wave={1} />
        <Sparks seed={`${site.slug}-s2`} n={12} wave={2} />
        <Sparks seed={`${site.slug}-s3`} n={20} wave={3} />
        <svg className="ws-anvil" viewBox="0 0 800 170" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
          <path d="M40 20 H640 Q720 20 770 0 Q760 50 690 60 H560 Q520 60 520 100 V120 H600 V160 H200 V120 H280 V100 Q280 60 240 60 H120 Q60 60 40 20 Z" />
        </svg>
      </div>
      <div className="ws-hero__foot">
        {s.subtitle ? <p className="ws-hero__sub ws-in" style={{ ['--i' as string]: 1 }}>{s.subtitle}</p> : null}
        <div className="ws-ctas ws-in" style={{ ['--i' as string]: 2 }}>
          {s.cta.label ? (
            <a className="ws-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="ws-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label} →
            </a>
          ) : null}
        </div>
        {notes.length ? (
          <ul className="ws-notes ws-in" style={{ ['--i' as string]: 3 }}>
            {notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

/** Что можно выковать — строка изделий через удары «×». */
function Pieces({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s ws-pieces" aria-label={s.items.join(', ')}>
      <p data-ws="rise">
        {s.items.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </p>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about ws-about">
      <figure className="ws-about__photo" data-ws="heat">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="blobs" className="media" />
      </figure>
      <div className="ws-about__text" data-ws="rise">
        {s.label ? <p className="ws-label">{s.label}</p> : null}
        {s.title ? <h2 className="ws-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Программы — полоски каления: чем сложнее программа, тем горячее цвет. */
function Programs({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services ws-programs">
      <div className="ws-head" data-ws="rise">
        {s.label ? <p className="ws-label">{s.label}</p> : null}
        {s.title ? <h2 className="ws-h2">{s.title}</h2> : null}
      </div>
      <ol className="ws-programs__list">
        {s.items.map((it, i) => (
          <li key={i} data-ws="heat" style={{ ['--c' as string]: HEAT[Math.min(HEAT.length - 1, 2 + i)], ['--i' as string]: i }}>
            <span className="ws-programs__bar" aria-hidden="true" />
            <div>
              {it.tag ? <em>{it.tag}</em> : null}
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            {it.price ? <b>{it.price}</b> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats ws-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-ws="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team ws-team">
      <div className="ws-head" data-ws="rise">
        {s.label ? <p className="ws-label">{s.label}</p> : null}
        {s.title ? <h2 className="ws-h2">{s.title}</h2> : null}
      </div>
      <ul className="ws-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-ws="rise" style={{ ['--i' as string]: i }}>
            <figure>
              <Media src={it.image} alt={`${it.name}, ${it.role}`} seed={`${site.slug}-t${i}`} colors={palette(site)} kind="blobs" className="media" />
            </figure>
            <h3>{it.name}</h3>
            <p>{it.role}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Как проходит — раунды: у каждого свой счёт ударов. */
function Rounds({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process ws-rounds">
      <div className="ws-head" data-ws="rise">
        {s.label ? <p className="ws-label">{s.label}</p> : null}
        {s.title ? <h2 className="ws-h2">{s.title}</h2> : null}
      </div>
      <ol className="ws-rounds__list">
        {s.items.map((it, i) => (
          <li key={i} data-ws="strike" style={{ ['--i' as string]: i }}>
            <span className="ws-rounds__marks" aria-hidden="true">
              {Array.from({ length: i + 1 }, (_, k) => (
                <i key={k} style={{ ['--k' as string]: k }} />
              ))}
            </span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Сертификаты — кованые жетоны: круг с выбитой ценой. */
function Tokens({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing ws-tokens">
      <div className="ws-head" data-ws="rise">
        {s.label ? <p className="ws-label">{s.label}</p> : null}
        {s.title ? <h2 className="ws-h2">{s.title}</h2> : null}
      </div>
      <div className="ws-tokens__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-ws="rise" style={{ ['--i' as string]: i }}>
            <div className="ws-tokens__coin">
              <span>{it.name}</span>
              <b>{it.price}</b>
            </div>
            {it.period ? <p className="ws-tokens__period">{it.period}</p> : null}
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
    <section id={s.anchor || undefined} className="s s-testimonials ws-voices">
      <div className="ws-head" data-ws="rise">
        {s.label ? <p className="ws-label">{s.label}</p> : null}
        {s.title ? <h2 className="ws-h2">{s.title}</h2> : null}
      </div>
      <div className="ws-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-ws="rise" style={{ ['--i' as string]: i }}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              <b>{it.author}</b>
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
    <section id={s.anchor || undefined} className="s s-faq ws-faq">
      <div className="ws-head" data-ws="rise">
        {s.label ? <p className="ws-label">{s.label}</p> : null}
        {s.title ? <h2 className="ws-h2">{s.title}</h2> : null}
      </div>
      <div className="ws-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item ws-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact ws-contact">
      <div className="ws-contact__inner" data-ws="rise">
        {s.label ? <p className="ws-label">{s.label}</p> : null}
        {s.title ? <h2 className="ws-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="ws-contact__text">{s.text}</p> : null}
        <div className="ws-ctas">
          {s.cta.label ? (
            <a className="ws-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="ws-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Pieces, about: About, services: Programs, stats: Stats, team: Team, process: Rounds, pricing: Tokens, testimonials: Testimonials, faq: Faq, contact: Contact },
}
