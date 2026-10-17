import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Spotlight, Velvet, Vitrine } from './client'
import { Jewel } from './jewel'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

/** Кольцо с камнем: плоский SVG, который медленно вращается в 3D (CSS), — блик бежит по ободу. */
function Ring() {
  return (
    <div className="crt-ring" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <linearGradient id="crtGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7a5a2a" />
            <stop offset=".35" stopColor="#f3dc9e" />
            <stop offset=".55" stopColor="#b88a3e" />
            <stop offset=".8" stopColor="#ffeebe" />
            <stop offset="1" stopColor="#6b4c22" />
          </linearGradient>
          <linearGradient id="crtStone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".5" stopColor="#cfe3ef" />
            <stop offset="1" stopColor="#8fa8b8" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="112" r="64" fill="none" stroke="url(#crtGold)" strokeWidth="9" />
        <circle cx="100" cy="112" r="58" fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="1" />
        <path d="M86 52 L100 34 L114 52 Z" fill="url(#crtGold)" />
        <path d="M80 34 L100 8 L120 34 L100 50 Z" fill="url(#crtStone)" />
        <path d="M80 34 L100 26 L120 34 M100 8 V50 M90 21 L100 34 L110 21" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".7" />
      </svg>
    </div>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const half = Math.ceil(links.length / 2)
  const b = site.business
  return (
    <>
      <header className="crt-header">
        <nav className="crt-nav crt-nav--l" aria-label={ui(site.lang, 'sections')}>
          {links.slice(0, half).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="crt-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="crt-mono" aria-hidden="true">
            <b>{initials(site.name)}</b>
          </span>
          <span>{site.name}</span>
        </a>
        <div className="crt-nav crt-nav--r">
          {links.slice(half).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          {site.nav.cta.label ? (
            <a className="crt-link" href={site.nav.cta.href || '#'}>
              {site.nav.cta.label}
            </a>
          ) : null}
        </div>
        <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
      </header>
      <main id="top">{children}</main>
      <footer className="crt-footer">
        <span className="crt-mono crt-mono--xl" aria-hidden="true">
          <b>{initials(site.name)}</b>
        </span>
        <p className="crt-footer__lead">{site.tagline || site.name}</p>
        <div className="crt-footer__cols">
          <div>
            <p className="crt-footer__h">{pick(site.lang, { ru: 'Бутик', uz: 'Butik', en: 'Boutique' })}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="crt-footer__h">{pick(site.lang, { ru: 'Консультант', uz: 'Maslahatchi', en: 'Concierge' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="crt-footer__h">{pick(site.lang, { ru: 'Мы в сети', uz: 'Ijtimoiy tarmoqlar', en: 'Follow' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <p className="crt-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero crt-hero">
      <Velvet colors={[t.bg, t.surface, t.accent, t.fg]} />
      <div className="crt-hero__inner">
        <Ring />
        {s.eyebrow ? (
          <p className="crt-hero__eyebrow" data-reveal="fade" data-delay="0.3">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="crt-hero__title" data-split="words" data-delay="0.2">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="crt-hero__sub" data-reveal="up" data-delay="0.7">
            {s.subtitle}
          </p>
        ) : null}
        <div className="crt-hero__ctas" data-reveal="up" data-delay="0.85">
          {s.cta.label ? (
            <a className="crt-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="crt-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      {s.words.length ? (
        <ul className="crt-hero__words" data-reveal="fade" data-delay="1">
          {s.words.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="crt-about">
      <div className="crt-about__grid">
        <div className="crt-about__mark" data-reveal="blur">
          <span className="crt-mono crt-mono--xl">
            <b>{initials(site.name)}</b>
          </span>
          {site.business.founded ? (
            <small>
              {pick(site.lang, { ru: 'Основан в', uz: 'Asos solingan:', en: 'Founded' })} {site.business.founded}
            </small>
          ) : null}
        </div>
        <div>
          {s.label ? (
            <p className="s__label" data-reveal="fade">
              {s.label}
            </p>
          ) : null}
          <h2 className="crt-about__title" data-split="lines">
            {s.title}
          </h2>
          {s.text ? (
            <p className="crt-about__text" data-reveal="up">
              {s.text}
            </p>
          ) : null}
        </div>
      </div>
    </Sec>
  )
}

/** Коллекции — витрина: карточки в ленте, свет фонаря идёт за курсором. */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  const t = site.theme
  const gold = [t.surface, t.accent, '#f3dc9e', '#6b4c22', t.bg]
  return (
    <Sec id={s.anchor} type="works" className="crt-works">
      <Head label={s.label} title={s.title} center />
      <Spotlight>
        <Vitrine prev={pick(site.lang, { ru: 'Назад', uz: 'Orqaga', en: 'Previous' })} next={pick(site.lang, { ru: 'Дальше', uz: 'Keyingi', en: 'Next' })}>
          {s.items.map((it, i) => {
            const Tag = it.href ? 'a' : 'article'
            return (
              <Tag key={i} className="crt-vit__item" data-spot {...(it.href ? { href: it.href } : {})} data-reveal="up" data-delay={String(Math.min(i, 4) * 0.08)}>
                <figure className="crt-vit__media">
                  {it.image ? <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={gold} kind={art} className="media" /> : <Jewel index={i} label={it.title} className="media" />}
                </figure>
                <p className="crt-vit__cat">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
                <h3 className="crt-vit__name">{it.title}</h3>
                {it.text ? <p className="crt-vit__text">{it.text}</p> : null}
              </Tag>
            )
          })}
        </Vitrine>
      </Spotlight>
    </Sec>
  )
}

/** Галерея — кадры в арочных рамах, как ниши в бутике. */
function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  const t = site.theme
  const gold = [t.surface, t.accent, '#e9cf8f', t.muted, t.bg]
  return (
    <Sec id={s.anchor} type="gallery" className="crt-gal">
      <Head label={s.label} title={s.title} center />
      <ul className="crt-gal__grid">
        {s.items.map((it, i) => (
          <li key={i} className="crt-gal__item" data-reveal="up" data-delay={String((i % 3) * 0.1)}>
            <figure>
              {it.image ? <Media src={it.image} alt={it.caption || `${site.name} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={gold} kind={art} className="media" /> : <Jewel uid="g" index={i + 3} label={it.caption || `${site.name} ${i + 1}`} className="media" />}
            </figure>
            {it.caption ? <p>{it.caption}</p> : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, about: About, works: Works, gallery: Gallery },
}
