import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { pick, ui } from '@/lib/i18n'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Showroom } from './client'

/* БАРХАТ — Minotti, Poltrona Frau, Baxter: тёмный салон, антиква курсивом, латунь,
   диван под софитом, коллекции — римскими номерами, прайс — как карта вин. */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const half = Math.ceil(links.length / 2)
  const b = site.business
  return (
    <>
      <header className="velvet-header">
        <nav className="velvet-nav" aria-label={ui(site.lang, 'sections')}>
          {links.slice(0, half).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="velvet-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.name}
        </a>
        <div className="velvet-header__side">
          <nav className="velvet-nav" aria-label={ui(site.lang, 'sections')}>
            {links.slice(half).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          {site.nav.cta.label ? (
            <a className="velvet-cta" href={site.nav.cta.href || '#'}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="velvet-footer">
        <p className="velvet-footer__lead" data-split="lines">
          {site.tagline || site.name}
        </p>
        <div className="velvet-footer__grid">
          <div>
            <p className="velvet-footer__h">{pick(site.lang, { ru: 'Салон', uz: 'Salon', en: 'Showroom' })}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="velvet-footer__h">{pick(site.lang, { ru: 'Консультация', uz: 'Maslahat', en: 'Consultation' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="velvet-footer__h">{pick(site.lang, { ru: 'Следите за нами', uz: 'Bizni kuzating', en: 'Follow us' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <p className="velvet-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <p className="velvet-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const fabrics = [
    { name: pick(site.lang, { ru: 'Изумруд', uz: 'Zumrad', en: 'Emerald' }), color: '#1f5a48' },
    { name: pick(site.lang, { ru: 'Терракота', uz: 'Terrakota', en: 'Terracotta' }), color: '#a4532f' },
    { name: pick(site.lang, { ru: 'Песок', uz: 'Qum', en: 'Sand' }), color: '#b79b78' },
    { name: pick(site.lang, { ru: 'Ночь', uz: 'Tun', en: 'Midnight' }), color: '#22304f' },
    { name: pick(site.lang, { ru: 'Бордо', uz: 'Bordo', en: 'Bordeaux' }), color: '#6b1f2c' },
  ]
  return (
    <section id={s.anchor || undefined} className="s s-hero velvet-hero">
      <div className="velvet-hero__head">
        {s.eyebrow ? <p className="velvet-eyebrow velvet-in">{s.eyebrow}</p> : null}
        <h1 className="velvet-hero__title" data-split="words">
          {s.title || site.name}
        </h1>
      </div>
      {s.image ? (
        <figure className="velvet-hero__img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="media" src={s.image} alt={s.title || site.name} />
        </figure>
      ) : (
        <Showroom fabrics={fabrics} label={pick(site.lang, { ru: 'Ткань', uz: 'Mato', en: 'Fabric' })} />
      )}
      <div className="velvet-hero__foot">
        {s.subtitle ? (
          <p className="velvet-hero__sub velvet-in" style={{ ['--velvet-d' as string]: '.8s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="velvet-hero__ctas velvet-in" style={{ ['--velvet-d' as string]: '1s' }}>
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

function About({ section: s, site, art }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="velvet-about">
      <div className="velvet-about__grid">
        <figure className="velvet-about__media" data-reveal="clip">
          <Media src={s.image} alt={s.title} seed={`${site.slug}-about`} colors={['#2a211b', site.theme.accent, '#4a3a2e', '#6b1f2c', '#1f5a48']} kind={art} className="media" />
        </figure>
        <div className="velvet-about__text">
          {s.label ? (
            <p className="s__label" data-reveal="fade">
              {s.label}
            </p>
          ) : null}
          <h2 className="s__title" data-split="lines">
            {s.title}
          </h2>
          <p className="velvet-about__body" data-reveal="up">
            {s.text}
          </p>
        </div>
      </div>
    </Sec>
  )
}

/** Коллекции: строки с римским номером; кадр раскрывается шторкой при появлении. */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="velvet-coll">
      <Head label={s.label} title={s.title} />
      <ol className="velvet-coll__list">
        {s.items.map((it, i) => (
          <li key={i} className="velvet-coll__item">
            <span className="velvet-coll__no" data-reveal="fade">
              {ROMAN[i] ?? i + 1}
            </span>
            <div className="velvet-coll__cap" data-reveal="up">
              <h3>{it.title}</h3>
              <p className="velvet-coll__meta">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
              {it.text ? <p className="velvet-coll__text">{it.text}</p> : null}
            </div>
            <figure className="velvet-coll__media" data-reveal="clip">
              <Media src={it.image} alt={it.title} seed={`${site.slug}-c${i}`} colors={['#1b1512', site.theme.accent, ['#1f5a48', '#a4532f', '#22304f', '#6b1f2c'][i % 4], '#3a2e25', '#b79b78']} kind={art} className="media" />
            </figure>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Модели и цены — как карта вин: название курсивом, размеры, точки до цены. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="velvet-list">
      <Head label={s.label} title={s.title}>
        {s.intro ? <p className="s__intro">{s.intro}</p> : null}
      </Head>
      <ul className="velvet-list__items">
        {s.items.map((it, i) => (
          <li key={i} data-reveal="up" data-delay={String((i % 3) * 0.06)}>
            <div className="velvet-list__row">
              <h3>{it.title}</h3>
              <span className="velvet-list__dots" aria-hidden="true" />
              <span className="velvet-list__price">{it.price}</span>
            </div>
            <p className="velvet-list__text">
              {it.tag ? <span className="velvet-list__tag">{it.tag}</span> : null}
              {it.text}
            </p>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Путь заказа: латунная нить слева, шаги с римскими номерами. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="velvet-path">
      <Head label={s.label} title={s.title} />
      <ol className="velvet-path__list">
        {s.items.map((it, i) => (
          <li key={i} data-reveal="left" data-delay={String(i * 0.08)}>
            <span className="velvet-path__no">{ROMAN[i] ?? i + 1}</span>
            <div>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, about: About, works: Works, services: Services, process: Process },
}
