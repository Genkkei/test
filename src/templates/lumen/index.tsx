import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { humanHours, pick, ui } from '@/lib/i18n'
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
          <a href="#top" className="lumen-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop')}`}>
            <i aria-hidden="true" />
            {site.name}
          </a>
          <nav className="lumen-nav" aria-label={ui(site.lang, 'sections')}>
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
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
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
            <p className="lumen-footer__h">{pick(site.lang, { ru: 'Связаться', uz: 'Bog‘lanish', en: 'Get in touch' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="lumen-footer__h">{ui(site.lang, 'address')}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="lumen-footer__h">{pick(site.lang, { ru: 'Мы в сетях', uz: 'Ijtimoiy tarmoqlarda', en: 'Follow us' })}</p>
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
          <span>{pick(site.lang, { ru: 'Есть противопоказания, нужна консультация специалиста', uz: 'Qarshi ko‘rsatmalar bor, mutaxassis maslahati kerak', en: 'Contraindications apply; consult a specialist' })}</span>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  const b = site.business
  const facts = [
    b.hours[0] ? { k: ui(site.lang, 'hours'), v: humanHours(b.hours[0], site.lang) } : null,
    b.street ? { k: ui(site.lang, 'address'), v: b.street } : null,
    b.phone ? { k: pick(site.lang, { ru: 'Запись', uz: 'Yozilish', en: 'Booking' }), v: b.phone } : null,
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
            <Pills words={s.words} label={pick(site.lang, { ru: 'Направления', uz: 'Yo‘nalishlar', en: 'Specialties' })} />
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
