import './style.css'
import { pick } from '@/lib/i18n'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Clock, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { DawnCanvas, HorizonHeader, HorizontalTrack } from './client'

/* ГОРИЗОНТ — Aman, Six Senses, Hôtel des Horlogers: рассвет вместо баннера, тишина вместо
   кнопок. Меню прячется за «гамбургером» на любом экране, номера едут вбок, как вид из окна. */

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <HorizonHeader>
        <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        <a href="#top" className="hz-logo" aria-label={`${site.name} — ${pick(site.lang, { ru: 'наверх', uz: 'yuqoriga', en: 'back to top' })}`}>
          {site.name}
        </a>
        <div className="hz-header__side">
          <span className="hz-time">
            {b.city || pick(site.lang, { ru: 'Чимган', uz: 'Chimyon', en: 'Chimgan' })} · <Clock lang={site.lang} />
          </span>
          {site.nav.cta.label ? (
            <a className="hz-book" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
        </div>
      </HorizonHeader>
      <main id="top">{children}</main>
      <footer className="hz-footer">
        <svg className="hz-footer__sun" viewBox="0 0 400 120" aria-hidden="true">
          <circle cx="200" cy="120" r="70" />
          <path d="M0 119.5h400" />
        </svg>
        <p className="hz-footer__name">{site.name}</p>
        <div className="hz-footer__grid">
          <div>
            <h3>{pick(site.lang, { ru: 'Адрес', uz: 'Manzil', en: 'Address' })}</h3>
            <p>{[b.street, b.city, b.region].filter(Boolean).join(', ')}</p>
          </div>
          <div>
            <h3>{pick(site.lang, { ru: 'Ресепшен', uz: 'Qabulxona', en: 'Reception' })}</h3>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <h3>{pick(site.lang, { ru: 'Бронирование', uz: 'Bron qilish', en: 'Reservations' })}</h3>
            {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <h3>{pick(site.lang, { ru: 'Следите', uz: 'Kuzatib boring', en: 'Follow' })}</h3>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <p className="hz-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero hz-hero">
      <DawnCanvas colors={[t.bg, t.accent, t.fg, t.surface]} />
      <div className="hz-hero__inner">
        {s.eyebrow ? (
          <p className="hz-hero__eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="hz-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="hz-hero__sub" data-reveal="fade" data-delay="0.6">
            {s.subtitle}
          </p>
        ) : null}
      </div>
      <div className="hz-hero__foot" data-reveal="fade" data-delay="0.9">
        {s.cta.label ? (
          <a className="hz-btn hz-btn--solid" href={s.cta.href || '#'} data-magnetic>
            {s.cta.label}
          </a>
        ) : null}
        <span className="hz-scroll" aria-hidden="true">
          <i />
          {pick(site.lang, { ru: 'Листайте', uz: 'Suring', en: 'Scroll' })}
        </span>
        {s.ctaSecondary.label ? (
          <a className="hz-btn" href={s.ctaSecondary.href || '#'}>
            {s.ctaSecondary.label}
          </a>
        ) : null}
      </div>
    </section>
  )
}

function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works hz-rooms">
      <div className="s__inner">
        <Head label={s.label} title={s.title} />
      </div>
      <HorizontalTrack>
        {s.items.map((it, i) => (
          <article key={i} className="hz-room">
            <figure className="hz-room__media">
              <Media src={it.image} alt={it.title} seed={`${site.slug}-room${i}`} colors={palette(site)} kind={art} className="media" />
              <span className="hz-room__idx">{String(i + 1).padStart(2, '0')}</span>
            </figure>
            <div className="hz-room__cap">
              <h3>{it.title}</h3>
              <p className="hz-room__meta">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
              {it.text ? <p className="hz-room__text">{it.text}</p> : null}
              {it.href ? (
                <a className="hz-link" href={it.href}>
                  {pick(site.lang, { ru: 'Подробнее', uz: 'Batafsil', en: 'Details' })}
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </HorizontalTrack>
    </section>
  )
}

function About({ section: s, site, art }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="hz-about">
      <p className="s__label" data-reveal="fade">
        {s.label}
      </p>
      <h2 className="hz-about__title" data-split="lines">
        {s.title}
      </h2>
      <div className="hz-about__row">
        <figure className="hz-about__media" data-reveal="clip">
          <div data-parallax="0.15" className="hz-about__inner">
            <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind={art} className="media" />
          </div>
        </figure>
        <p className="hz-about__text" data-reveal="up">
          {s.text}
        </p>
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, works: Works, about: About },
}
