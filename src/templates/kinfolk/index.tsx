import type { Site } from '@/lib/schema'
import { Art, Media, type ArtKind } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { WindowLight } from './client'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="kin-header">
        <a href="#top" className="kin-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.name}
        </a>
        <nav className="kin-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <sup>{String(i + 1).padStart(2, '0')}</sup>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="kin-header__side">
          {site.nav.cta.label ? (
            <a className="kin-cta" href={site.nav.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {site.nav.cta.label} →
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="kin-footer">
        <div className="kin-footer__top">
          <p className="kin-footer__lead">{site.tagline || site.name}</p>
          {site.nav.cta.label ? (
            <a className="kin-cta" href={site.nav.cta.href || '#'}>
              {site.nav.cta.label} →
            </a>
          ) : null}
        </div>
        <div className="kin-footer__grid">
          <div>
            <p className="kin-footer__h">{pick(site.lang, { ru: 'Студия', uz: 'Studiya', en: 'Studio' })}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="kin-footer__h">{pick(site.lang, { ru: 'Контакты', uz: 'Kontaktlar', en: 'Contacts' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="kin-footer__h">{pick(site.lang, { ru: 'Журнал', uz: 'Jurnal', en: 'Journal' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
          <p className="kin-footer__legal">
            © {new Date().getFullYear()} {b.legalName || site.name}
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero kin-hero">
      <div className="kin-hero__text">
        {s.eyebrow ? <p className="kin-hero__eyebrow kin-fade">{s.eyebrow}</p> : null}
        <h1 className="kin-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="kin-hero__sub kin-fade" style={{ ['--d' as string]: '.7s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="kin-hero__ctas kin-fade" style={{ ['--d' as string]: '.9s' }}>
          {s.cta.label ? (
            <a className="btn btn--primary" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="kin-cta" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label} →
            </a>
          ) : null}
        </div>
      </div>
      <figure className="kin-hero__light">
        {s.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="media" src={s.image} alt={s.title || site.name} />
        ) : (
          <WindowLight colors={[t.bg, t.surface, t.accent, t.fg]} />
        )}
        {s.words.length ? <figcaption>{s.words.join(' · ')}</figcaption> : null}
      </figure>
    </section>
  )
}

/** Проекты разворотами журнала: крупный кадр и колонка с паспортом объекта. */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  const t = site.theme
  // мягкие тона вместо контрастной палитры сайта: заглушка должна читаться как кадр не в фокусе
  const soft = [t.surface, '#d9ccb8', t.accent, t.muted, t.bg]
  return (
    <Sec id={s.anchor} type="works" className="kin-works">
      <Head label={s.label} title={s.title} />
      <div className="kin-works__list">
        {s.items.map((it, i) => {
          const facts = it.text.split(/\s*·\s*/).filter(Boolean)
          const lead = facts.length > 1 ? facts.slice(1) : []
          return (
            <article key={i} className="kin-spread">
              <figure className="kin-spread__media" data-reveal="clip">
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={soft} kind={art} className="media" />
              </figure>
              <div className="kin-spread__cap" data-reveal="up">
                <p className="kin-spread__no">{pick(site.lang, { ru: '№', uz: '№', en: 'No.' })} {String(i + 1).padStart(2, '0')}</p>
                <h3 className="kin-spread__name">{it.title}</h3>
                <p className="kin-spread__meta">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
                <p className="kin-spread__text">{facts[0]}</p>
                {lead.length ? (
                  <dl className="kin-spread__facts">
                    {lead.map((f) => {
                      const [k, ...v] = f.split(':')
                      return (
                        <div key={f}>
                          <dt>{v.length ? k : '—'}</dt>
                          <dd>{v.length ? v.join(':').trim() : f}</dd>
                        </div>
                      )
                    })}
                  </dl>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </Sec>
  )
}

/** Палитра материалов: образцы-квадраты, фактура — генеративная, по номеру образца. */
const SWATCH: ArtKind[] = ['stripes', 'blobs', 'grid', 'waves', 'rings', 'arch']
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  const p = palette(site)
  const tones = [
    [p[0], '#b89a77', '#d8c4a6'],
    ['#cfc8bb', '#e7e2d8', '#a9a194'],
    ['#6f6a5f', '#8a8476', '#59554c'],
    ['#e9e2d4', '#d9cfbe', '#f4efe6'],
    ['#7c5a43', '#946c50', '#5f4433'],
    ['#9aa293', '#b6bcab', '#7f8778'],
  ]
  return (
    <Sec id={s.anchor} type="gallery" className="kin-swatches">
      <Head label={s.label} title={s.title} />
      <ul className="kin-swatches__grid">
        {s.items.map((it, i) => (
          <li key={i} className="kin-swatch" data-reveal="up" data-delay={String((i % 4) * 0.07)}>
            <figure>
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="media" src={it.image} alt={it.caption} loading="lazy" />
              ) : (
                <Art className="media" seed={`${site.slug}-m${i}`} colors={tones[i % tones.length]} kind={SWATCH[i % SWATCH.length]} label={it.caption} />
              )}
            </figure>
            <p>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {it.caption}
            </p>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, works: Works, gallery: Gallery },
}
