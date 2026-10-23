import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Flash } from './flash'
import { InkTrail } from './client'

/*
 * ТУШЬ — тату-студия в духе Bang Bang NYC и Sang Bleu: чёрная тушь, кислотный акцент,
 * флэш-лист, рисунки которого прорисовываются одной линией, портфолио «флэшами».
 */

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="ink-header">
        <a href="#top" className="ink-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <Flash i={2} className="ink-logo__eye" />
          {site.name}
            </>
          )}
        </a>
        <nav className="ink-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <sup>{String(i + 1).padStart(2, '0')}</sup>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ink-header__side">
          {site.nav.cta.label ? (
            <a className="ink-btn ink-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="ink-footer">
        <div className="ink-footer__sheet" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Flash key={i} i={i} />
          ))}
        </div>
        <p className="ink-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="ink-footer__row">
          <span>{[b.street, b.city].filter(Boolean).join(', ')}</span>
          <span>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</span>
          <span className="ink-footer__social">
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name} ↗
              </a>
            ))}
          </span>
        </div>
        <div className="ink-footer__row ink-footer__row--legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          {site.business.type === 'TattooParlor' ? <span>{pick(site.lang, { ru: 'Татуируем с 18 лет', uz: '18 yoshdan tatu qilamiz', en: 'Tattooing clients 18+' })}</span> : null}
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero ink-hero">
      <InkTrail color={site.theme.accent} />
      <div className="ink-hero__inner">
        <div className="ink-hero__copy">
          {s.eyebrow ? (
            <p className="ink-hero__eyebrow ink-in" style={{ ['--d' as string]: '.1s' }}>
              ✕ {s.eyebrow}
            </p>
          ) : null}
          <h1 className="ink-hero__title">
            <span data-split="chars">{s.title || site.name}</span>
          </h1>
          {s.words.length ? (
            <ul className="ink-hero__styles ink-in" style={{ ['--d' as string]: '.6s' }}>
              {s.words.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
          {s.subtitle ? (
            <p className="ink-hero__sub ink-in" style={{ ['--d' as string]: '.75s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="ink-hero__ctas ink-in" style={{ ['--d' as string]: '.9s' }}>
            {s.cta.label ? (
              <a className="ink-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="ink-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
        <div className="ink-sheet" aria-hidden="true">
          <p className="ink-sheet__head">
            <span>Flash № 01</span>
            <span>{site.name}</span>
          </p>
          <div className="ink-sheet__grid">
            {[0, 1, 2, 3, 4, 5, 6, 7, 0].map((n, i) => (
              <span key={i} className="ink-sheet__cell" style={{ ['--i' as string]: String(i) }}>
                <Flash i={i === 8 ? 7 : n} className="ink-draw" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee ink-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={46} sep="✕" />
    </section>
  )
}

/** Портфолио: каждая работа — флэш на листе, при наведении рисунок заливается акцентом. */
function Works({ section: s }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="ink-works-sec">
      <Head label={s.label} title={s.title} />
      <ul className="ink-works">
        {s.items.map((it, i) => (
          <li key={i} className="ink-card" data-reveal="up" data-delay={String((i % 4) * 0.07)}>
            <span className="ink-card__no">№ {String(i + 1).padStart(2, '0')}</span>
            <Flash i={i} className="ink-draw" />
            <div className="ink-card__cap">
              <h3>{it.title}</h3>
              <p>{[it.category, it.year].filter(Boolean).join(' · ')}</p>
              {it.text ? <p className="ink-card__text">{it.text}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Мастера — строки с огромным именем; при наведении рядом проступает его флэш. */
function Team({ section: s }: SectionProps<'team'>) {
  return (
    <Sec id={s.anchor} type="team" className="ink-team-sec">
      <Head label={s.label} title={s.title} />
      <ul className="ink-team">
        {s.items.map((it, i) => (
          <li key={i} className="ink-artist" data-reveal="up" data-delay={String(i * 0.08)}>
            <span className="ink-artist__no">0{i + 1}</span>
            <h3 className="ink-artist__name">{it.name}</h3>
            <p className="ink-artist__role">{it.role}</p>
            <Flash i={i * 3 + 1} className="ink-artist__flash" />
          </li>
        ))}
      </ul>
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="ink-steps-sec">
      <Head label={s.label} title={s.title} />
      <ol className="ink-steps">
        {s.items.map((it, i) => (
          <li key={i} data-reveal="left" data-delay={String(i * 0.08)}>
            <span className="ink-steps__no" aria-hidden="true">
              {i + 1}
            </span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Contact({ section: s, site }: SectionProps<'contact'>) {
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-contact ink-contact">
      <div className="s__inner">
        {s.label ? <p className="s__label">{s.label}</p> : null}
        <h2 className="ink-contact__title" data-split="words">
          {s.title}
        </h2>
        <div className="ink-contact__row" data-reveal="up">
          {s.text ? <p>{s.text}</p> : null}
          <div className="ink-contact__acts">
            {s.cta.label ? (
              <a className="ink-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label} ↗
              </a>
            ) : null}
            {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, works: Works, team: Team, process: Process, contact: Contact },
}
