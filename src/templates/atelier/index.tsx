import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { PaperHeader, Ribbon } from './client'

/* АТЕЛЬЕ — Aesop, Le Labo, Pierre Hermé: бумага, антиква, вёрстка журнала.
   Логотип по центру, меню разведено по краям, картинки в арках, примечания на полях. */

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const half = Math.ceil(links.length / 2)
  const b = site.business
  return (
    <>
      <PaperHeader>
        <nav className="at-nav at-nav--l" aria-label="Разделы">
          {links.slice(0, half).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="at-logo" aria-label={`${site.name} — наверх`}>
          {site.name}
        </a>
        <nav className="at-nav at-nav--r" aria-label="Ещё разделы">
          {links.slice(half).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          {site.nav.cta.label ? (
            <a className="at-nav__cta" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
        </nav>
        <MobileMenu links={links} cta={site.nav.cta} />
      </PaperHeader>
      <main id="top">{children}</main>
      <footer className="at-footer">
        <p className="at-footer__mark" aria-hidden="true">
          {site.name}
        </p>
        <div className="at-footer__cols">
          <div>
            <h3>Адрес</h3>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
          </div>
          <div>
            <h3>Часы</h3>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h)}</p>
            ))}
          </div>
          <div>
            <h3>Связь</h3>
            {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <h3>Мы в сети</h3>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <p className="at-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name} · {site.tagline}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site, art }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero at-hero">
      <div className="at-hero__grid">
        <div className="at-hero__text">
          {s.eyebrow ? (
            <p className="at-eyebrow" data-reveal="fade">
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="at-hero__title" data-split="lines">
            {s.title || site.name}
          </h1>
          {s.subtitle ? (
            <p className="at-hero__sub" data-reveal="up" data-delay="0.35">
              {s.subtitle}
            </p>
          ) : null}
          <div className="at-hero__ctas" data-reveal="fade" data-delay="0.5">
            {s.cta.label ? (
              <a className="btn btn--primary" href={s.cta.href || '#'}>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="at-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        <figure className="at-hero__arch" data-reveal="clip" data-delay="0.15">
          <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-hero`} colors={palette(site)} kind={art} className="media" />
        </figure>
        {s.words.length ? (
          <aside className="at-hero__note" data-reveal="fade" data-delay="0.7">
            <span>Сегодня в витрине</span>
            {s.words.map((w) => (
              <i key={w}>{w}</i>
            ))}
          </aside>
        ) : null}
      </div>
    </section>
  )
}

function About({ section: s, site, art }: SectionProps<'about'>) {
  const [first, ...rest] = s.text.split(/\n+/)
  return (
    <Sec id={s.anchor} type="about" className="at-about">
      <div className="at-about__grid">
        <aside className="at-margin" data-reveal="fade">
          <span className="s__label">{s.label}</span>
          <span>№ 01</span>
        </aside>
        <div>
          <h2 className="at-about__title" data-split="lines">
            {s.title}
          </h2>
          <div className="at-about__cols" data-reveal="up">
            <p className="at-dropcap">{first}</p>
            {rest.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <figure className="at-about__arch" data-reveal="clip">
          <div data-parallax="0.12" className="at-about__inner">
            <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind={art} className="media" />
          </div>
        </figure>
      </div>
    </Sec>
  )
}

function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="at-menu">
      <Head label={s.label} title={s.title} center />
      <div className="at-menu__groups">
        {s.groups.map((g, i) => (
          <div key={i} className="at-menu__group" data-reveal="up" data-delay={String((i % 2) * 0.1)}>
            <h3 className="at-menu__gname">
              <span>{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][i] ?? i + 1}</span>
              {g.name}
            </h3>
            <ul>
              {g.items.map((it, j) => (
                <li key={j} className="at-menu__item">
                  <div className="s-menu__row">
                    <span className="s-menu__name">{it.name}</span>
                    <span className="s-menu__dots" aria-hidden="true" />
                    <span className="s-menu__price">{it.price}</span>
                  </div>
                  {it.text ? <p className="s-menu__text">{it.text}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery at-gallery">
      <div className="s__inner">
        <Head label={s.label} title={s.title} />
      </div>
      <Ribbon>
        {s.items.map((it, i) => (
          <figure key={i} className="at-ribbon__item">
            <div className="at-ribbon__arch">
              <Media src={it.image} alt={it.caption || `${site.name} — ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
            </div>
            {it.caption ? (
              <figcaption>
                <span>{String(i + 1).padStart(2, '0')}</span> {it.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </Ribbon>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="at-testi">
      <Head label={s.label} title={s.title} center />
      <div className="at-testi__list">
        {s.items.map((it, i) => (
          <figure key={i} className="at-testi__item" data-reveal="up" data-delay={String(i * 0.1)}>
            <blockquote>«{it.quote}»</blockquote>
            <figcaption>
              — {it.author}
              {it.role ? <span>, {it.role}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, about: About, menu: Menu, gallery: Gallery, testimonials: Testimonials },
}
