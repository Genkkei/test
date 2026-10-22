import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Spotlight } from './client'

/*
 * СЦЕНА — театр в духе Barbican, National Theatre и Sadler’s Wells: бархатный занавес
 * раскрывается на входе, прожектор за курсором, рампа, афиша сезона с крупными датами,
 * схема зала, где ярус подсвечивается при наведении на билет.
 */

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="stage-header">
        <nav className="stage-nav stage-nav--l" aria-label={ui(site.lang, 'sections')}>
          {links.slice(0, Math.ceil(links.length / 2)).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="stage-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.name}
        </a>
        <div className="stage-header__side">
          <nav className="stage-nav" aria-label={ui(site.lang, 'sections')}>
            {links.slice(Math.ceil(links.length / 2)).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          {site.nav.cta.label ? (
            <a className="stage-btn stage-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="stage-footer">
        <div className="stage-footer__drape" aria-hidden="true" />
        <div className="stage-footer__inner">
          <p className="stage-footer__name">{site.name}</p>
          <p className="stage-footer__tag">{site.tagline}</p>
          <dl className="stage-footer__facts">
            {b.street ? (
              <div>
                <dt>{ui(site.lang, 'address')}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
              </div>
            ) : null}
            {b.hours.length ? (
              <div>
                <dt>{pick(site.lang, { ru: 'Касса', uz: 'Kassa', en: 'Box office' })}</dt>
                <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
              </div>
            ) : null}
            {b.phone ? (
              <div>
                <dt>{ui(site.lang, 'phone')}</dt>
                <dd>
                  <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a>
                </dd>
              </div>
            ) : null}
          </dl>
          <p className="stage-footer__social">
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </p>
          <p className="stage-footer__legal">
            © {new Date().getFullYear()} {b.legalName || site.name}
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero stage-hero">
      <div className="stage-boards" aria-hidden="true" />
      <Spotlight />
      <div className="stage-hero__inner">
        {s.eyebrow ? (
          <p className="stage-hero__eyebrow stage-in" style={{ ['--d' as string]: '1.3s' }}>
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="stage-hero__title">
          <span data-split="chars" data-delay="1.1">
            {s.title || site.name}
          </span>
        </h1>
        {s.words.length ? (
          <p className="stage-hero__bill stage-in" style={{ ['--d' as string]: '1.6s' }}>
            {s.words.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </p>
        ) : null}
        {s.subtitle ? (
          <p className="stage-hero__sub stage-in" style={{ ['--d' as string]: '1.75s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="stage-hero__ctas stage-in" style={{ ['--d' as string]: '1.9s' }}>
          {s.cta.label ? (
            <a className="stage-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="stage-btn stage-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="stage-lights" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <i key={i} style={{ ['--i' as string]: String(i) }} />
        ))}
      </div>
      <div className="stage-curtain stage-curtain--l" aria-hidden="true" />
      <div className="stage-curtain stage-curtain--r" aria-hidden="true" />
      <div className="stage-valance" aria-hidden="true" />
    </section>
  )
}

/** Афиша сезона — строки с огромной датой курсивом. */
function Works({ section: s }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="stage-season-sec">
      <Head label={s.label} title={s.title} center />
      <ol className="stage-season">
        {s.items.map((it, i) => (
          <li key={i} className="stage-play" data-reveal="up" data-delay={String(i * 0.06)}>
            <span className="stage-play__date">{it.year}</span>
            <div className="stage-play__body">
              <p className="stage-play__cat">{it.category}</p>
              <h3 className="stage-play__title">{it.title}</h3>
              {it.text ? <p className="stage-play__text">{it.text}</p> : null}
            </div>
            <a className="stage-play__go" href="#tickets" aria-label={it.title}>
              →
            </a>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Билеты и схема зала: наведение на билет подсвечивает свой ярус на схеме. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  const rows = [9, 7, 6]
  return (
    <Sec id={s.anchor} type="pricing" className="stage-seats-sec">
      <Head label={s.label} title={s.title} center />
      <div className="stage-seats">
        <div className="stage-plan" data-reveal="fade" aria-hidden="true">
          <p className="stage-plan__stage">{pick(site.lang, { ru: 'Сцена', uz: 'Sahna', en: 'Stage' })}</p>
          {s.items
            .map((it, i) => ({ it, i }))
            .reverse()
            .map(({ it, i }, k) => (
              <div key={i} className="stage-tier" data-t={i}>
                {Array.from({ length: rows[k] ?? 5 }, (_, r) => (
                  <div key={r} className="stage-tier__row" style={{ ['--n' as string]: String(14 + k * 2 + Math.min(r, 4)) }}>
                    {Array.from({ length: 14 + k * 2 + Math.min(r, 4) }, (_, c) => (
                      <i key={c} />
                    ))}
                  </div>
                ))}
                <span className="stage-tier__name">{it.name}</span>
              </div>
            ))}
        </div>
        <div className="stage-tcards">
          {s.items.map((it, i) => (
            <article key={i} className={`stage-tcard${it.featured ? ' is-featured' : ''}`} data-t={i} data-reveal="up" data-delay={String(i * 0.08)}>
              <div className="stage-tcard__top">
                <h3>{it.name}</h3>
                <span>{it.period}</span>
              </div>
              <p className="stage-tcard__price">{it.price}</p>
              <ul>
                {it.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </Sec>
  )
}

function Contact({ section: s, site }: SectionProps<'contact'>) {
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-contact stage-contact">
      <div className="s__inner">
        {s.label ? <p className="s__label">{s.label}</p> : null}
        <h2 className="stage-contact__title" data-split="words">
          {s.title}
        </h2>
        {s.text ? (
          <p className="stage-contact__text" data-reveal="up">
            {s.text}
          </p>
        ) : null}
        <div className="stage-hero__ctas" data-reveal="up">
          {s.cta.label ? (
            <a className="stage-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="stage-btn stage-btn--ghost" href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>
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
  sections: { hero: Hero, works: Works, pricing: Pricing, contact: Contact },
}
