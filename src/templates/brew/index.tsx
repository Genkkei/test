import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Ritual } from './client'

/*
 * БРУ — спешелти в духе Blue Bottle и Stumptown: много белого воздуха, один синий,
 * тонкий гротеск. Фирменный приём — ритуал заваривания: воронка V60 стоит, пока
 * листаются шаги, и наполняется водой шаг за шагом; первый экран — капли в чашку.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Знак: капля в круге — синяя «бутылка» Blue Bottle, сведённая к одной форме. */
function Mark({ className = '' }: { className?: string }) {
  return (
    <svg className={`brew-mark ${className}`} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 7 C 12 13 10 16 10 19 a6 6 0 0 0 12 0 C 22 16 20 13 16 7 Z" fill="currentColor" />
    </svg>
  )
}

/** Капельница над чашкой: капли падают по одной, на поверхности расходятся круги. */
function Drip() {
  return (
    <svg className="brew-drip" viewBox="0 0 240 320" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        {/* воронка */}
        <path d="M60 30 H180 L132 104 H108 Z" />
        <path d="M78 30 L112 92 M162 30 L128 92" opacity=".35" />
        <path d="M104 104 h32 v8 h-32 z" />
        {/* чашка */}
        <path d="M58 214 H182 V246 C182 286 156 300 120 300 C84 300 58 286 58 246 Z" />
        <path d="M182 226 C206 226 210 262 182 266" />
      </g>
      <ellipse className="brew-drip__surface" cx="120" cy="216" rx="60" ry="6" />
      <ellipse className="brew-drip__ring" cx="120" cy="216" rx="8" ry="2" />
      <ellipse className="brew-drip__ring brew-drip__ring--2" cx="120" cy="216" rx="8" ry="2" />
      <path className="brew-drip__drop" d="M120 116 c-3 5 -5 8 -5 11 a5 5 0 0 0 10 0 c0 -3 -2 -6 -5 -11z" />
      <path className="brew-drip__drop brew-drip__drop--2" d="M120 116 c-3 5 -5 8 -5 11 a5 5 0 0 0 10 0 c0 -3 -2 -6 -5 -11z" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="brew-header">
        <a href="#top" className="brew-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <Mark />
          <span>{site.name}</span>
        </a>
        <nav className="brew-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="brew-header__side">
          {site.nav.cta.label ? (
            <a className="brew-btn brew-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="brew-footer">
        <div className="brew-footer__top">
          <Mark className="brew-footer__mark" />
          <p className="brew-footer__lead" data-split="lines">
            {site.tagline}
          </p>
        </div>
        <div className="brew-footer__grid">
          {b.street ? (
            <div>
              <p className="brew-footer__k">{ui(site.lang, 'address')}</p>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            </div>
          ) : null}
          {b.hours.length ? (
            <div>
              <p className="brew-footer__k">{ui(site.lang, 'hours')}</p>
              {b.hours.map((h) => (
                <p key={h}>{humanHours(h, site.lang)}</p>
              ))}
            </div>
          ) : null}
          {b.phone ? (
            <div>
              <p className="brew-footer__k">{ui(site.lang, 'phone')}</p>
              <p>
                <a href={tel(b.phone)}>{b.phone}</a>
              </p>
            </div>
          ) : null}
          <div>
            <p className="brew-footer__k">{pick(site.lang, { ru: 'Мы в сетях', uz: 'Tarmoqlarda', en: 'Follow' })}</p>
            {b.socials.map((s) => (
              <p key={s.url}>
                <a href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              </p>
            ))}
          </div>
        </div>
        <p className="brew-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero brew-hero">
      <div className="brew-hero__inner">
        <div className="brew-hero__text">
          {s.eyebrow ? (
            <p className="brew-hero__eyebrow brew-in" style={{ ['--d' as string]: '.1s' }}>
              <span className="brew-dot" aria-hidden="true" /> {s.eyebrow}
            </p>
          ) : null}
          <h1 className="brew-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="brew-hero__sub brew-in" style={{ ['--d' as string]: '.6s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="brew-hero__ctas brew-in" style={{ ['--d' as string]: '.75s' }}>
            {s.cta.label ? (
              <a className="brew-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="brew-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
          {s.words.length ? (
            <ul className="brew-hero__words brew-in" style={{ ['--d' as string]: '.9s' }} aria-label={pick(site.lang, { ru: 'Способы заваривания', uz: 'Damlash usullari', en: 'Brew methods' })}>
              {s.words.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="brew-hero__art brew-in" style={{ ['--d' as string]: '.3s' }}>
          <div className="brew-hero__circle" aria-hidden="true" />
          <Drip />
        </div>
      </div>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="brew-about">
      <div className="brew-about__grid">
        <div>
          <Head label={s.label} title={s.title} />
          <p className="brew-about__text" data-reveal="up">
            {s.text}
          </p>
        </div>
        <figure className="brew-about__media" data-reveal="clip">
          <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="waves" className="media" />
        </figure>
      </div>
    </Sec>
  )
}

/** Ритуал: воронка закреплена слева и наполняется, пока листаются шаги справа. */
function Process({ section: s, site }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="brew-ritual-sec">
      <Head label={s.label} title={s.title} />
      <Ritual
        steps={s.items}
        stepLabel={pick(site.lang, { ru: 'Шаг', uz: 'Qadam', en: 'Step' })}
      />
    </Sec>
  )
}

/** Меню — карта рецептов: у позиции метод заваривания пилюлей и цена справа. */
function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="brew-menu-sec">
      <Head label={s.label} title={s.title} />
      <div className="brew-menu">
        {s.groups.map((g, i) => (
          <div key={i} className="brew-menu__group" data-reveal="up" data-delay={String(i * 0.08)}>
            <h3 className="brew-menu__gname">
              <span>{String(i + 1).padStart(2, '0')}</span> {g.name}
            </h3>
            <ul>
              {g.items.map((it, j) => (
                <li key={j} className="brew-menu__item">
                  <div className="brew-menu__row">
                    <span className="brew-menu__name">{it.name}</span>
                    <span className="brew-menu__price">{it.price}</span>
                  </div>
                  {it.text ? <p className="brew-menu__text">{it.text}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Sec>
  )
}

/** Цифры — карточка рецепта: как на весах бариста, моноширинные значения. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="brew-recipe-sec">
      <div className="brew-recipe" data-reveal="up">
        <Head label={s.label} title={s.title} />
        <dl className="brew-recipe__grid">
          {s.items.map((it, i) => (
            <div key={i} className="brew-recipe__cell">
              <dt>{it.label}</dt>
              <dd>
                <span data-count>{it.value}</span>
                {it.suffix ? <small>{it.suffix}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, about: About, process: Process, menu: Menu, stats: Stats },
}
