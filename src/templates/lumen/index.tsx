import './style.css'
import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { GlowCanvas, LumenHeader, Pills , ClipReveal } from './client'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <LumenHeader>
        <div className="lumen-header__pill">
          <a href="#top" className="lumen-logo" aria-label={`${site.name} — наверх`}>
            <i aria-hidden="true" />
            {site.name}
          </a>
          <nav className="lumen-nav" aria-label="Разделы">
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          {site.nav.cta.label ? (
            <a className="lumen-header__cta" href={site.nav.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} />
        </div>
      </LumenHeader>
      <ClipReveal />
      <main id="top">{children}</main>
      <footer className="lumen-footer">
        <div className="lumen-footer__grid">
          <div className="lumen-footer__brand">
            <p className="lumen-logo">
              <i aria-hidden="true" />
              {site.name}
            </p>
            {site.tagline ? <p className="lumen-footer__tag">{site.tagline}</p> : null}
          </div>
          <div>
            <p className="lumen-footer__h">Связаться</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="lumen-footer__h">Адрес</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h)}</p>
            ))}
          </div>
          <div>
            <p className="lumen-footer__h">Мы в сетях</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <div className="lumen-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>Есть противопоказания, нужна консультация специалиста</span>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  const b = site.business
  const facts = [
    b.hours[0] ? { k: 'Часы', v: humanHours(b.hours[0]) } : null,
    b.street ? { k: 'Адрес', v: b.street } : null,
    b.phone ? { k: 'Запись', v: b.phone } : null,
  ].filter(Boolean) as { k: string; v: string }[]
  return (
    <section id={s.anchor || undefined} className="s s-hero lumen-hero">
      <GlowCanvas colors={[t.bg, t.accent, t.surface, t.fg]} />
      <div className="lumen-hero__inner">
        {s.eyebrow ? (
          <p className="lumen-hero__eyebrow" data-reveal="fade">
            <span aria-hidden="true" />
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="lumen-hero__title" data-split="words">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="lumen-hero__sub" data-reveal="up" data-delay="0.35">
            {s.subtitle}
          </p>
        ) : null}
        <div className="lumen-hero__ctas" data-reveal="up" data-delay="0.5">
          {s.cta.label ? (
            <a className="btn btn--primary" href={s.cta.href || (b.phone ? tel(b.phone) : '#')} data-magnetic>
              {s.cta.label}
              <span aria-hidden="true">→</span>
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="btn btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {s.words.length ? (
          <div data-reveal="up" data-delay="0.65">
            <Pills words={s.words} />
          </div>
        ) : null}
      </div>
      {facts.length ? (
        <dl className="lumen-hero__facts">
          {facts.map((f, i) => (
            <div key={f.k} className="lumen-glass" data-reveal="up" data-delay={String(0.7 + i * 0.1)}>
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero },
}
