import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Car, carKindOf } from './car'
import { FleetRail, RouteProgress } from './client'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const PRICE = /цена|narx|price/i
const BODY_COLORS = ['#f4f4f2', '#0b0c0e', '#ff6a00', '#3d5a73', '#8b9097', '#7a1f24', '#c9c3b6']

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="drv-header">
        <a href="#top" className="drv-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <i aria-hidden="true" />
          {site.name}
        </a>
        <nav className="drv-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="drv-header__side">
          {b.phone ? (
            <a className="drv-header__tel" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="drv-btn drv-btn--sm" href={site.nav.cta.href || '#'}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="drv-footer">
        <div className="drv-footer__band">
          <p className="drv-footer__lead">{site.tagline || site.name}</p>
          {site.nav.cta.label ? (
            <a className="drv-btn drv-btn--dark" href={site.nav.cta.href || '#'}>
              {site.nav.cta.label}
            </a>
          ) : null}
        </div>
        <div className="drv-footer__grid">
          <div>
            <p className="drv-footer__h">{pick(site.lang, { ru: 'Офис выдачи', uz: 'Berish ofisi', en: 'Pick-up office' })}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="drv-footer__h">{pick(site.lang, { ru: 'Диспетчер', uz: 'Dispetcher', en: 'Dispatch' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="drv-footer__h">{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name} ↗
              </a>
            ))}
          </div>
          <p className="drv-footer__legal">
            © {new Date().getFullYear()} {b.legalName || site.name}
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero drv-hero">
      <div className="drv-hero__text">
        {s.eyebrow ? (
          <p className="drv-hero__eyebrow" data-reveal="fade">
            <i aria-hidden="true" />
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="drv-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="drv-hero__sub" data-reveal="up" data-delay="0.4">
            {s.subtitle}
          </p>
        ) : null}
        <div className="drv-hero__ctas" data-reveal="up" data-delay="0.55">
          {s.cta.label ? (
            <a className="drv-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="drv-btn drv-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="drv-hero__stage" aria-hidden="true">
        <span className="drv-hero__speed">
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} style={{ ['--i' as string]: i }} />
          ))}
        </span>
        <div className="drv-hero__car">
          <Car kind="suv" color={site.theme.accent} className="drv-car" />
        </div>
        <span className="drv-hero__road" />
      </div>
      {s.words.length ? (
        <ul className="drv-hero__specs" data-reveal="up" data-delay="0.7">
          {s.words.map((w, i) => (
            <li key={w}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {w}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

/** Парк: карточка машины как страница конфигуратора — силуэт, класс, спецификации, цена в сутки. */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="drv-works">
      <Head label={s.label} title={s.title} />
      <FleetRail count={s.items.length} prev={pick(site.lang, { ru: 'Назад', uz: 'Orqaga', en: 'Previous' })} next={pick(site.lang, { ru: 'Дальше', uz: 'Keyingi', en: 'Next' })}>
        {s.items.map((it, i) => {
          const facts = it.text.split(/\s*·\s*/).filter(Boolean).map((f) => {
            const [k, ...v] = f.split(':')
            return v.length ? { k: k.trim(), v: v.join(':').trim() } : { k: '', v: f }
          })
          const price = facts.find((f) => PRICE.test(f.k))
          const specs = facts.filter((f) => f !== price && f.k)
          const lead = facts.find((f) => !f.k)
          const Tag = it.href ? 'a' : 'article'
          return (
            <Tag key={i} className="drv-fleet__item" {...(it.href ? { href: it.href } : {})}>
              <p className="drv-fleet__class">
                <span>{it.category}</span>
                {it.year ? <span>{it.year}</span> : null}
              </p>
              <h3 className="drv-fleet__name">{it.title}</h3>
              <div className="drv-fleet__car">
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt={it.title} loading="lazy" />
                ) : (
                  <Car kind={carKindOf(`${it.category} ${it.title}`)} color={BODY_COLORS[i % BODY_COLORS.length]} label={it.title} className="drv-car" />
                )}
              </div>
              {lead ? <p className="drv-fleet__lead">{lead.v}</p> : null}
              {specs.length ? (
                <dl className="drv-fleet__specs">
                  {specs.map((f) => (
                    <div key={f.k}>
                      <dt>{f.k}</dt>
                      <dd>{f.v}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {price ? (
                <p className="drv-fleet__price">
                  <small>{price.k}</small>
                  {price.v}
                </p>
              ) : null}
            </Tag>
          )
        })}
      </FleetRail>
    </Sec>
  )
}

/** Этапы — дорога: машинка едет по линии вместе с прокруткой, пройденные остановки горят. */
function Process({ section: s, site }: SectionProps<'process'>) {
  const n = Math.max(1, s.items.length - 1)
  return (
    <Sec id={s.anchor} type="process" className="drv-process">
      <Head label={s.label} title={s.title} />
      <RouteProgress className="drv-route">
        <div className="drv-route__line" aria-hidden="true">
          <span className="drv-route__fill" />
          <span className="drv-route__car">
            <Car kind="sedan" color={site.theme.accent} className="drv-car" />
          </span>
        </div>
        <ol className="drv-route__stops">
          {s.items.map((it, i) => (
            <li key={i} className="drv-route__stop" data-stop={(i / n).toFixed(3)} style={{ ['--x' as string]: i / n }}>
              <span className="drv-route__pin">{String(i + 1).padStart(2, '0')}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </RouteProgress>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, works: Works, process: Process },
}
