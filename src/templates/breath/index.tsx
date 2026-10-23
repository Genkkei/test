import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { BreathCanvas, BreathLabel, Schedule } from './client'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="breath-header">
        <a href="#top" className="breath-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          {site.name.toLowerCase()}
            </>
          )}
        </a>
        <nav className="breath-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="breath-header__side">
          {site.nav.cta.label ? (
            <a className="breath-link" href={site.nav.cta.href || (b.phone ? tel(b.phone) : '#')}>
              <i aria-hidden="true" />
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="breath-footer">
        <div className="breath-footer__circle" aria-hidden="true" />
        <p className="breath-footer__quote">{pick(site.lang, { ru: 'Сделайте вдох. Мы подождём.', uz: 'Nafas oling. Biz kutib turamiz.', en: 'Take a breath. We’ll wait.' })}</p>
        <div className="breath-footer__grid">
          <div>
            <p className="breath-footer__h">{pick(site.lang, { ru: 'Студия', uz: 'Studiya', en: 'Studio' })}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="breath-footer__h">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="breath-footer__h">{pick(site.lang, { ru: 'Следите', uz: 'Kuzatib boring', en: 'Follow' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <p className="breath-footer__legal">
          {site.name.toLowerCase()} · © {new Date().getFullYear()} {b.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero breath-hero">
      <BreathCanvas colors={[t.bg, t.surface, t.accent, t.fg]} />
      <BreathLabel lang={site.lang} />
      <div className="breath-hero__inner">
        {s.eyebrow ? <p className="breath-hero__eyebrow breath-fade">{s.eyebrow}</p> : null}
        <h1 className="breath-hero__title" data-split="words">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="breath-hero__sub breath-fade" style={{ ['--d' as string]: '.9s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="breath-hero__ctas breath-fade" style={{ ['--d' as string]: '1.1s' }}>
          {s.cta.label ? (
            <a className="btn btn--primary" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="btn btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee breath-marquee" aria-label={pick(site.lang, { ru: 'Практики', uz: 'Amaliyotlar', en: 'Practices' })}>
      <Marquee items={s.items} speed={70} sep="◦" />
    </section>
  )
}

function About({ section: s }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="breath-about">
      <p className="s__label" data-reveal="fade">
        {s.label}
      </p>
      <h2 className="breath-about__title" data-split="lines">
        {s.title}
      </h2>
      {s.text ? (
        <p className="breath-about__text" data-reveal="up">
          {s.text}
        </p>
      ) : null}
    </Sec>
  )
}

function Menu({ section: s, site }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="breath-menu">
      <Head label={s.label} title={s.title} center />
      <div data-reveal="up">
        <Schedule groups={s.groups} lang={site.lang} />
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, about: About, menu: Menu },
}
