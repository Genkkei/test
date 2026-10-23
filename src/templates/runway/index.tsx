import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Shell as Sec, humanHours } from '@/components/sections'
import { pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Lookbook, ShowroomTime, Stretch } from './client'

const n3 = (i: number) => String(i + 1).padStart(3, '0')

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="rw-header">
        <a href="#top" className="rw-cell rw-logo" aria-label={`${site.name} — ${pick(site.lang, { ru: 'наверх', uz: 'yuqoriga', en: 'back to top' })}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          {site.name}
            </>
          )}
        </a>
        <nav className="rw-cell rw-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <p className="rw-cell rw-time">
          {b.city || pick(site.lang, { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent' })} <ShowroomTime />
        </p>
        <div className="rw-cell rw-header__side">
          {site.nav.cta.label ? (
            <a href={site.nav.cta.href} className="rw-header__cta">
              {site.nav.cta.label} <span>(→)</span>
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="rw-footer">
        <div className="rw-footer__cols">
          <div>
            <p className="rw-k">{pick(site.lang, { ru: 'Шоурум', uz: 'Shourum', en: 'Showroom' })}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            <p>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</p>
          </div>
          <div>
            <p className="rw-k">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="rw-k">{pick(site.lang, { ru: 'Следите', uz: 'Kuzatib boring', en: 'Follow' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
          <div>
            <p className="rw-k">{ui(site.lang, 'sections')}</p>
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <p className="rw-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="rw-footer__legal">
          <span>© {new Date().getFullYear()} {b.legalName || site.name}</span>
          <span>{site.tagline}</span>
          <a href="#top">{ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site, art }: SectionProps<'hero'>) {
  const works = site.sections.find((x) => x.type === 'works' && x.enabled)
  const looks = works && works.type === 'works' ? works.items.slice(0, 3) : []
  return (
    <section id={s.anchor || undefined} className="s s-hero rw-hero">
      <Stretch>
        <p className="rw-hero__word" aria-hidden="true">
          {site.name}
        </p>
      </Stretch>
      <div className="rw-hero__grid">
        <div className="rw-hero__text">
          {s.eyebrow ? <p className="rw-hero__eyebrow rw-in">{s.eyebrow}</p> : null}
          <h1 className="rw-hero__title" data-split="lines">
            {s.title || site.name}
          </h1>
          {s.subtitle ? (
            <p className="rw-hero__sub rw-in" style={{ animationDelay: '.5s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="rw-hero__ctas rw-in" style={{ animationDelay: '.65s' }}>
            {s.cta.label ? (
              <a className="rw-btn" href={s.cta.href || '#'}>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="rw-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        {looks.map((it, i) => (
          <figure key={i} className="rw-hero__look rw-in" style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
            <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
            <figcaption>
              <span>{n3(i)}</span>
              {it.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="rw-works">
      <div className="rw-head">
        <p className="s__label">{s.label}</p>
        <h2 className="s__title" data-split="lines">
          {s.title}
        </h2>
        <p className="rw-head__count">({String(s.items.length).padStart(2, '0')})</p>
      </div>
      <div className="rw-grid">
        {s.items.map((it, i) => {
          const body = (
            <>
              <figure className="rw-item__media">
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media rw-item__a" />
                <Media src="" alt="" seed={`${site.slug}-w${i}-b`} colors={palette(site)} kind="grid" className="media rw-item__b" />
                <span className="rw-item__num">{n3(i)}</span>
              </figure>
              <div className="rw-item__cap">
                <h3>{it.title}</h3>
                <p>{it.category}</p>
                {it.year ? <p className="rw-item__price">{it.year}</p> : null}
              </div>
              {it.text ? <p className="rw-item__text">{it.text}</p> : null}
            </>
          )
          return it.href ? (
            <a key={i} href={it.href} className="rw-item" data-reveal="fade" data-delay={String((i % 4) * 0.06)}>
              {body}
            </a>
          ) : (
            <article key={i} className="rw-item" data-reveal="fade" data-delay={String((i % 4) * 0.06)}>
              {body}
            </article>
          )
        })}
      </div>
    </Sec>
  )
}

function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery rw-gallery">
      <div className="s__inner rw-head">
        <p className="s__label">{s.label}</p>
        <h2 className="s__title" data-split="lines">
          {s.title}
        </h2>
        <p className="rw-head__count">(→)</p>
      </div>
      <Lookbook count={s.items.length}>
        {s.items.map((it, i) => (
          <figure key={i} className="rw-frame">
            <Media src={it.image} alt={it.caption || `${site.name} — ${pick(site.lang, { ru: 'образ', uz: 'obraz', en: 'look' })} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
            <figcaption>
              <span>{pick(site.lang, { ru: 'Образ', uz: 'Obraz', en: 'Look' })} {n3(i)}</span>
              {it.caption}
            </figcaption>
          </figure>
        ))}
      </Lookbook>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee rw-marquee" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={30} sep="/" />
      <Marquee items={[...s.items].reverse()} speed={38} sep="/" className="marquee rw-marquee__rev" />
    </section>
  )
}

function About({ section: s, site, art }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="rw-about">
      <p className="s__label">{s.label}</p>
      <div className="rw-about__grid">
        <h2 className="rw-about__title" data-split="lines">
          {s.title}
        </h2>
        <figure className="rw-about__media" data-reveal="clip">
          <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind={art} className="media" />
        </figure>
        <p className="rw-about__text" data-reveal="up">
          {s.text}
        </p>
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, works: Works, gallery: Gallery, marquee: MarqueeSec, about: About },
}
