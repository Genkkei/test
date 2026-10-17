import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { FacadeCanvas, Floor , ClipReveal } from './client'

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <div className="mono-grid" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <header className="mono-header">
        <a href="#top" className="mono-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop')}`}>
          <b aria-hidden="true">▲</b>
          {site.name}
        </a>
        <nav className="mono-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <small>{String(i + 1).padStart(2, '0')}</small>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mono-header__side">
          <Floor label={pick(site.lang, { ru: 'ЭТАЖ', uz: 'QAVAT', en: 'FLOOR' })} />
          {site.nav.cta.label ? (
            <a className="mono-header__cta" href={site.nav.cta.href}>
              {site.nav.cta.label} ↘
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <ClipReveal />
      <main id="top">{children}</main>
      <footer className="mono-footer">
        <p className="mono-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="mono-footer__cols">
          <div>
            <small>{pick(site.lang, { ru: 'Офис продаж', uz: 'Savdo ofisi', en: 'Sales office' })}</small>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <small>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</small>
            {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <small>{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</small>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name} ↗
              </a>
            ))}
          </div>
          <div>
            <small>{pick(site.lang, { ru: 'Компания', uz: 'Kompaniya', en: 'Company' })}</small>
            <p>© {new Date().getFullYear()} {b.legalName || site.name}</p>
            <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
          </div>
        </div>
        <p className="mono-footer__note">{pick(site.lang, { ru: 'Информация на сайте не является публичной офертой. Проектные декларации — в офисе продаж.', uz: 'Saytdagi ma’lumotlar ommaviy oferta hisoblanmaydi. Loyiha deklaratsiyalari — savdo ofisida.', en: 'Information on this site is not a public offer. Project declarations are available at the sales office.' })}</p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-hero mono-hero">
      <div className="mono-hero__top">
        <div className="mono-hero__meta" data-reveal="fade">
          <span>{s.eyebrow}</span>
          {b.lat && b.lng ? (
            <span>
              {Number(b.lat).toFixed(2)}°N {Number(b.lng).toFixed(2)}°E
            </span>
          ) : null}
        </div>
        <h1 className="mono-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
      </div>
      <div className="mono-hero__band" data-reveal="clip">
        <div className="mono-hero__img">
          <FacadeCanvas colors={[t.bg, t.surface, t.accent, t.fg]} />
        </div>
        <div className="mono-hero__overlay">
          {s.words.slice(0, 4).map((w, i) => (
            <span key={w} style={{ ['--i' as string]: i }}>
              {w}
            </span>
          ))}
        </div>
      </div>
      <div className="mono-hero__bottom">
        {s.subtitle ? (
          <p className="mono-hero__sub" data-reveal="up">
            {s.subtitle}
          </p>
        ) : null}
        <div className="mono-hero__ctas" data-reveal="up" data-delay="0.15">
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

function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="mono-works">
      <Head label={s.label} title={s.title} />
      <div className="mono-works__list">
        {s.items.map((it, i) => {
          const Tag = it.href ? 'a' : 'article'
          return (
            <Tag key={i} className="mono-work" {...(it.href ? { href: it.href, 'data-cursor': ui(site.lang, 'open') } : {})}>
              <figure className="mono-work__media" data-reveal="clip">
                <div className="mono-work__parallax" data-parallax="0.18">
                  <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
                </div>
                <figcaption>{String(i + 1).padStart(2, '0')}</figcaption>
              </figure>
              <div className="mono-work__info">
                <h3 className="mono-work__name" data-split="lines">
                  {it.title}
                </h3>
                <dl className="mono-work__specs" data-reveal="up">
                  {it.category ? (
                    <div>
                      <dt>{pick(site.lang, { ru: 'Объект', uz: 'Obyekt', en: 'Property' })}</dt>
                      <dd>{it.category}</dd>
                    </div>
                  ) : null}
                  {it.year ? (
                    <div>
                      <dt>{pick(site.lang, { ru: 'Сдача', uz: 'Topshirish', en: 'Completion' })}</dt>
                      <dd>{it.year}</dd>
                    </div>
                  ) : null}
                </dl>
                {it.text ? (
                  <p className="mono-work__text" data-reveal="up">
                    {it.text}
                  </p>
                ) : null}
              </div>
            </Tag>
          )
        })}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, works: Works },
}
