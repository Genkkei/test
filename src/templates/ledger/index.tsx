import './style.css'
import type { Site } from '@/lib/schema'
import { Clock, MobileMenu } from '@/motion/widgets'
import { humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { PaperCanvas, Ruler, Voice , ClipReveal } from './client'

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <Ruler />
      <header className="ledger-header">
        <div className="ledger-header__top">
          <span>
            {b.city || 'Ташкент'}, <Clock />
          </span>
          {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
        </div>
        <div className="ledger-header__main">
          <a href="#top" className="ledger-logo" aria-label={`${site.name} — наверх`}>
            {site.name}
          </a>
          <nav className="ledger-nav" aria-label="Разделы">
            {links.map((l, i) => (
              <a key={l.href} href={l.href}>
                <sup>{String(i + 1).padStart(2, '0')}</sup>
                {l.label}
              </a>
            ))}
          </nav>
          {site.nav.cta.label ? (
            <a className="ledger-header__cta" href={site.nav.cta.href}>
              {site.nav.cta.label} <span aria-hidden="true">→</span>
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} />
        </div>
      </header>
      <ClipReveal />
      <main id="top" className="ledger-main">
        {children}
      </main>
      <footer className="ledger-footer">
        <div className="ledger-footer__grid">
          <p className="ledger-footer__brand">{site.name}</p>
          <div>
            <small>Офис</small>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h)}</p>
            ))}
          </div>
          <div>
            <small>Связь</small>
            {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <small>Профили</small>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <div className="ledger-footer__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>Материалы сайта носят информационный характер и не являются юридической консультацией.</span>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero ledger-hero">
      <PaperCanvas colors={[t.bg, t.line, t.accent, t.fg]} />
      <div className="ledger-hero__inner">
        <div className="ledger-hero__index" data-reveal="fade">
          <span>§ 00</span>
          <span>{s.eyebrow}</span>
        </div>
        <h1 className="ledger-hero__title">
          <span data-split="lines">{s.title || site.name}</span> <Voice words={s.words} />
        </h1>
        <div className="ledger-hero__foot">
          {s.subtitle ? (
            <p className="ledger-hero__sub" data-reveal="up" data-delay="0.3">
              {s.subtitle}
            </p>
          ) : null}
          <div className="ledger-hero__ctas" data-reveal="up" data-delay="0.45">
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
      </div>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero },
}
