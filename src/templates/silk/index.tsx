import { pick } from '@/lib/i18n'
import { Logo } from '@/components/brand/Logo'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Badge, Clock, Cursor, Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Rotator, SilkCanvas, StickyHeader, WorksHover } from './client'

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const t = site.theme
  return (
    <>
      <Cursor />
      <StickyHeader>
        <a href="#top" className="silk-logo" aria-label={`${site.name} — ${pick(site.lang, { ru: 'наверх', uz: 'yuqoriga', en: 'back to top' })}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          {site.name}
            </>
          )}
        </a>
        <nav className="silk-nav" aria-label={pick(site.lang, { ru: 'Разделы', uz: 'Bo‘limlar', en: 'Sections' })}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="silk-header__side">
          <span className="silk-clock">
            {site.business.city || pick(site.lang, { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent' })} <Clock lang={site.lang} />
          </span>
          {site.nav.cta.label ? (
            <a className="silk-header__cta" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </StickyHeader>
      <main id="top">{children}</main>
      <footer className="silk-footer">
        <div className="silk-footer__top">
          <p className="silk-footer__lead" data-split="lines">
            {site.tagline || site.name}
          </p>
          <ul className="silk-footer__links">
            {site.business.socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="silk-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="silk-footer__bottom">
          <span>
            © {new Date().getFullYear()} {site.business.legalName || site.name}
          </span>
          <span>{[site.business.street, site.business.city].filter(Boolean).join(', ')}</span>
          <a href="#top">{pick(site.lang, { ru: 'Наверх', uz: 'Yuqoriga', en: 'Back to top' })} ↑</a>
        </div>
      </footer>
      <div className="silk-grain" aria-hidden="true" style={{ ['--grain-c' as string]: t.fg }} />
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero silk-hero">
      <SilkCanvas colors={[t.bg, t.surface, t.accent, t.fg]} />
      <div className="silk-hero__inner">
        {s.eyebrow ? (
          <p className="silk-hero__eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="silk-hero__title">
          <span data-split="chars">{s.title || site.name}</span>
          {s.words.length ? (
            <>
              {' '}
              <Rotator words={s.words} />
            </>
          ) : null}
        </h1>
        <div className="silk-hero__foot">
          {s.subtitle ? (
            <p className="silk-hero__sub" data-reveal="up" data-delay="0.6">
              {s.subtitle}
            </p>
          ) : null}
          <div className="silk-hero__ctas" data-reveal="up" data-delay="0.75">
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
          <Badge text={pick(site.lang, { ru: 'Листайте вниз', uz: 'Pastga suring', en: 'Scroll down' })} className="badge silk-badge" />
        </div>
      </div>
    </section>
  )
}

function About({ section: s }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="silk-about">
      <p className="s__label" data-reveal="fade">
        {s.label}
      </p>
      <h2 className="silk-about__title" data-split="words">
        {s.title}
      </h2>
      {s.text ? (
        <p className="silk-about__text" data-reveal="up">
          {s.text}
        </p>
      ) : null}
    </Sec>
  )
}

function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="silk-works-sec">
      <Head label={s.label} title={s.title} />
      <WorksHover
        viewLabel={pick(site.lang, { ru: 'Смотреть', uz: 'Ko‘rish', en: 'View' })}
        items={s.items.map((it, i) => ({
          title: it.title,
          meta: [it.category, it.year].filter(Boolean).join(' — '),
          text: it.text,
          href: it.href,
          art: <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />,
        }))}
      />
    </Sec>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee silk-marquee" aria-label={s.title || pick(site.lang, { ru: 'Что мы делаем', uz: 'Nima qilamiz', en: 'What we do' })}>
      <Marquee items={s.items} speed={48} sep="✳" />
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, about: About, works: Works, marquee: MarqueeSec },
}
