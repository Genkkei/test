import { pick } from '@/lib/i18n'
import { Logo } from '@/components/brand/Logo'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Clock, Cursor, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Carousel, PrismCanvas, PrismHeader, Rail } from './client'

/** Крестики по углам рамки — фирменная метка сетки. */
function Crosses() {
  return (
    <>
      <i className="prism-x prism-x--tl" aria-hidden="true" />
      <i className="prism-x prism-x--tr" aria-hidden="true" />
      <i className="prism-x prism-x--bl" aria-hidden="true" />
      <i className="prism-x prism-x--br" aria-hidden="true" />
    </>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  return (
    <>
      <Cursor className="cursor prism-cursor" />
      <PrismHeader>
        <a href="#top" className="prism-logo" aria-label={`${site.name} — ${pick(site.lang, { ru: 'наверх', uz: 'yuqoriga', en: 'back to top' })}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <span className="prism-logo__mark" aria-hidden="true" />
          {site.name}
            </>
          )}
        </a>
        <span className="prism-header__meta">
          [ {site.business.city || 'Tashkent'} · <Clock lang={site.lang} /> ]
        </span>
        <div className="prism-header__side">
          {site.nav.cta.label ? (
            <a className="prism-pill" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label}
              <i aria-hidden="true">→</i>
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </PrismHeader>
      <Rail links={links} label={pick(site.lang, { ru: 'Разделы страницы', uz: 'Sahifa bo‘limlari', en: 'Page sections' })} />
      <main id="top">{children}</main>
      <footer className="prism-footer">
        <div className="prism-footer__grid">
          <Crosses />
          <p className="prism-footer__big" data-split="lines">
            {site.tagline || site.name}
          </p>
          <div className="prism-footer__cols">
            <div>
              <p className="prism-mono">{pick(site.lang, { ru: 'Контакты', uz: 'Kontaktlar', en: 'Contact' })}</p>
              {site.business.email ? <a href={`mailto:${site.business.email}`}>{site.business.email}</a> : null}
              {site.business.phone ? <a href={`tel:${site.business.phone.replace(/[^\d+]/g, '')}`}>{site.business.phone}</a> : null}
            </div>
            <div>
              <p className="prism-mono">{pick(site.lang, { ru: 'Офис', uz: 'Ofis', en: 'Office' })}</p>
              <span>{[site.business.street, site.business.city].filter(Boolean).join(', ')}</span>
            </div>
            <div>
              <p className="prism-mono">{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</p>
              {site.business.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="prism-footer__bar prism-mono">
          <span>
            © {new Date().getFullYear()} {site.business.legalName || site.name}
          </span>
          <span>{site.niche}</span>
          <a href="#top">↑ {pick(site.lang, { ru: 'Наверх', uz: 'Yuqoriga', en: 'Back to top' })}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  const words = s.words.length ? s.words : site.seo.keywords.slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero prism-hero">
      <div className="prism-wall" aria-hidden="true">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className={`prism-wall__row prism-wall__row--${row % 2 ? 'rev' : 'fwd'}`}>
            {[0, 1].map((copy) => (
              <span key={copy}>
                {words.map((w, i) => (
                  <b key={i} className={(i + row) % 3 === 0 ? 'is-solid' : ''}>
                    {w}
                  </b>
                ))}
              </span>
            ))}
          </div>
        ))}
      </div>
      <PrismCanvas colors={[t.bg, t.accent, t.fg, t.surface]} />
      <div className="prism-hero__frame">
        <Crosses />
        <div className="prism-hero__top">
          {s.eyebrow ? (
            <p className="prism-mono" data-reveal="fade">
              {s.eyebrow}
            </p>
          ) : null}
          <p className="prism-mono prism-hero__scroll" data-reveal="fade" data-delay="0.4">
            scroll to explore ↓
          </p>
        </div>
        <div className="prism-hero__bottom">
          <h1 className="prism-hero__title" data-split="lines">
            {s.title || site.name}
          </h1>
          <div className="prism-hero__aside">
            {s.subtitle ? (
              <p className="prism-hero__sub prism-rise" style={{ ['--d' as string]: '.6s' }}>
                {s.subtitle}
              </p>
            ) : null}
            <div className="prism-hero__ctas prism-rise" style={{ ['--d' as string]: '.75s' }}>
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
      </div>
    </section>
  )
}

/** «Светлая зона»: светлый лист с выпуклым краем, как переход к разделам у alche. */
function About({ section: s, site, art }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about prism-light">
      <div className="s__inner">
        <div className="prism-light__head">
          <p className="prism-mono" data-reveal="fade">
            {s.label}
          </p>
          <h2 className="prism-light__title" data-split="words">
            {s.title}
          </h2>
        </div>
        <div className="prism-light__body">
          <figure className="prism-light__media" data-reveal="scale">
            <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind={art} className="media" />
          </figure>
          <p className="prism-light__text" data-reveal="up">
            {s.text}
          </p>
        </div>
      </div>
    </section>
  )
}

function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works prism-works">
      <div className="s__inner">
        <Head label={s.label} title={s.title} />
      </div>
      <Carousel count={s.items.length}>
        {s.items.map((it, i) => {
          const body = (
            <>
              <div className="prism-panel__media">
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
                <Crosses />
              </div>
              <div className="prism-panel__cap">
                <p className="prism-mono">
                  {[it.year, it.category].filter(Boolean).join(' / ')}
                </p>
                <h3>{it.title}</h3>
                {it.text ? <p className="prism-panel__text">{it.text}</p> : null}
              </div>
            </>
          )
          return it.href ? (
            <a key={i} className="prism-panel" href={it.href} data-cursor={pick(site.lang, { ru: 'Открыть', uz: 'Ochish', en: 'Open' })}>
              {body}
            </a>
          ) : (
            <article key={i} className="prism-panel">
              {body}
            </article>
          )
        })}
      </Carousel>
    </section>
  )
}

function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="prism-services">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="prism-services__grid">
        {s.items.map((it, i) => (
          <article key={i} className="prism-card" data-reveal="up" data-delay={String(i * 0.07)}>
            <Crosses />
            <p className="prism-mono">
              [{String(i + 1).padStart(2, '0')}] {it.tag}
            </p>
            <h3 className="prism-card__title">{it.title}</h3>
            {it.text ? <p className="prism-card__text">{it.text}</p> : null}
            {it.price ? <p className="prism-card__price">{it.price}</p> : null}
          </article>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, about: About, works: Works, services: Services },
}
