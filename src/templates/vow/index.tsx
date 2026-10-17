import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { DayLine, Petals } from './client'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const half = Math.ceil(links.length / 2)
  const b = site.business
  return (
    <>
      <header className="vw-header">
        <nav className="vw-nav" aria-label={ui(site.lang, 'sections')}>
          {links.slice(0, half).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="vw-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.name}
        </a>
        <nav className="vw-nav vw-nav--r" aria-label={ui(site.lang, 'sections')}>
          {links.slice(half).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
      </header>
      <main id="top">{children}</main>
      <footer className="vw-footer">
        <svg className="vw-rings vw-rings--sm" viewBox="0 0 120 70" aria-hidden="true">
          <circle cx="44" cy="35" r="26" />
          <circle cx="76" cy="35" r="26" />
        </svg>
        <p className="vw-footer__lead">{site.tagline}</p>
        {site.nav.cta.label ? (
          <a className="btn btn--primary" href={site.nav.cta.href || '#'}>
            {site.nav.cta.label}
          </a>
        ) : null}
        <div className="vw-footer__row">
          <span>{[b.street, b.city].filter(Boolean).join(', ')}</span>
          {b.hours.map((h) => (
            <span key={h}>{humanHours(h, site.lang)}</span>
          ))}
          {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
          {b.socials.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener me">
              {s.name}
            </a>
          ))}
        </div>
        <p className="vw-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

/** Обложка журнала: огромное курсивное имя, кольца прорисовываются, по краям — анонсы номера. */
function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero vw-hero">
      <Petals colors={[t.accent, t.surface, '#e9c9c2', t.line]} />
      <div className="vw-hero__top" data-reveal="fade">
        <span>{s.eyebrow}</span>
        <span>{pick(site.lang, { ru: 'Сезон', uz: 'Mavsum', en: 'Season' })} {new Date().getFullYear()}</span>
      </div>
      <svg className="vw-rings" viewBox="0 0 120 70" aria-hidden="true">
        <circle cx="44" cy="35" r="26" pathLength={1} />
        <circle cx="76" cy="35" r="26" pathLength={1} />
      </svg>
      <h1 className="vw-hero__title" data-split="chars">
        {s.title || site.name}
      </h1>
      {s.words.length ? (
        <ul className="vw-hero__lines">
          {s.words.map((w, i) => (
            <li key={w} data-reveal="up" data-delay={String(0.5 + i * 0.1)}>
              <i>{String(i + 1).padStart(2, '0')}</i> {w}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="vw-hero__foot">
        {s.subtitle ? (
          <p className="vw-hero__sub" data-reveal="up" data-delay="0.6">
            {s.subtitle}
          </p>
        ) : null}
        <div className="vw-hero__ctas" data-reveal="up" data-delay="0.75">
          {s.cta.label ? (
            <a className="btn btn--primary" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="vw-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Разворот: первое предложение — врезкой, остальное колонкой. */
function About({ section: s, site, art }: SectionProps<'about'>) {
  const [lead, ...rest] = s.text.split(/(?<=[.!?])\s+/)
  return (
    <Sec id={s.anchor} type="about" className="vw-about">
      <figure className="vw-about__media" data-reveal="clip">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind={art} className="media" />
      </figure>
      <div className="vw-about__body">
        <p className="s__label" data-reveal="fade">
          {s.label}
        </p>
        <h2 className="vw-about__title" data-split="lines">
          {s.title}
        </h2>
        <blockquote className="vw-about__lead" data-reveal="up">
          {lead}
        </blockquote>
        {rest.length ? (
          <p className="vw-about__text" data-reveal="up">
            {rest.join(' ')}
          </p>
        ) : null}
      </div>
    </Sec>
  )
}

/** Сценарий дня: «16:00 — Встреча гостей» раскладывается на время и событие. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="vw-process">
      <Head label={s.label} title={s.title} center />
      <DayLine>
        {s.items.map((it, i) => {
          const m = it.title.match(/^(\d{1,2}[:.]\d{2})\s*[—–-]\s*(.+)$/)
          return (
            <li key={i} className="vw-day__item">
              <span className="vw-day__time">{m ? m[1] : String(i + 1).padStart(2, '0')}</span>
              <div className="vw-day__card" data-reveal="up">
                <h3>{m ? m[2] : it.title}</h3>
                <p>{it.text}</p>
              </div>
            </li>
          )
        })}
      </DayLine>
    </Sec>
  )
}

/** Альбом: колонки разной высоты, подписи курсивом. */
function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <Sec id={s.anchor} type="gallery" className="vw-album">
      <Head label={s.label} title={s.title} center />
      <div className="vw-album__cols">
        {s.items.map((it, i) => (
          <figure key={i} className="vw-album__item" data-reveal="up" data-delay={String((i % 3) * 0.1)}>
            <div className={`vw-album__img vw-album__img--${i % 4}`}>
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
            </div>
            {it.caption ? <figcaption>{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Sec>
  )
}

/** Пакеты как меню банкета: по центру, разделители-орнаменты. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="vw-pricing">
      <Head label={s.label} title={s.title} center />
      <div className="vw-cards">
        {s.items.map((it, i) => (
          <article key={i} className={`vw-card${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.1)}>
            {it.featured ? <p className="vw-card__flag">{pick(site.lang, { ru: 'Выбирают чаще', uz: 'Ko‘proq tanlashadi', en: 'Most chosen' })}</p> : null}
            <h3 className="vw-card__name">{it.name}</h3>
            <p className="vw-card__price">{it.price}</p>
            <p className="vw-card__period">{it.period}</p>
            <span className="vw-card__orn" aria-hidden="true">❦</span>
            <ul>
              {it.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, about: About, process: Process, gallery: Gallery, pricing: Pricing },
}
