import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Rotator } from './client'

/*
 * ЛИСТ — чайный дом в духе Rare Tea Co и Mariage Frères: тихая антиква, пиала с паром на
 * первом экране, чай — жестяные банки на полке с этикетками, заварка — ритуал по шагам,
 * у каждого кольцо-таймер, которое наполняется, когда шаг входит в кадр.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const TIN = ['#2f4a2e', '#7a2f2a', '#c49a3a', '#24384f', '#5b3a5a', '#3f6b5c']

/** Пиала с паром: три струйки пара поднимаются и тают по очереди. */
function Cup() {
  return (
    <svg className="leaf-cup" viewBox="0 0 240 240" aria-hidden="true">
      <g className="leaf-cup__steam" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M96 96 C84 78 108 66 96 46 C88 32 100 22 98 12" />
        <path d="M120 100 C108 80 132 70 120 50 C112 36 124 24 122 10" />
        <path d="M144 96 C132 78 156 66 144 46 C136 32 148 22 146 12" />
      </g>
      <ellipse cx="120" cy="196" rx="70" ry="10" fill="currentColor" opacity=".12" />
      <path d="M48 120 h144 c0 44 -30 74 -72 74 s-72 -30 -72 -74 z" fill="var(--accent)" />
      <path d="M48 120 h144 c0 44 -30 74 -72 74 s-72 -30 -72 -74 z" fill="url(#leafGlaze)" />
      <ellipse cx="120" cy="120" rx="72" ry="12" fill="var(--fg)" />
      <ellipse cx="120" cy="121" rx="64" ry="8" fill="#b9873a" />
      <path d="M70 140 q50 22 100 0" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" />
      <defs>
        <linearGradient id="leafGlaze" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".25" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function Leaf({ className = '' }: { className?: string }) {
  return (
    <svg className={`leaf-leaf ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M12 88 C14 40 46 10 90 10 C88 56 58 86 12 88 Z" fill="currentColor" />
      <path d="M14 86 C40 62 60 40 82 18" stroke="var(--bg)" strokeWidth="2.5" fill="none" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="leaf-header">
        <nav className="leaf-nav" aria-label={ui(site.lang, 'sections')}>
          {links.slice(0, 3).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="leaf-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <Leaf />
          <span>{site.name}</span>
            </>
          )}
        </a>
        <div className="leaf-header__side">
          <nav className="leaf-nav" aria-label={ui(site.lang, 'sections')}>
            {links.slice(3).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          {site.nav.cta.label ? (
            <a className="leaf-cta" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="leaf-footer">
        <div className="leaf-footer__inner">
          <div className="leaf-footer__brand">
            <Leaf />
            <p className="leaf-footer__name">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
            <p className="leaf-footer__tag">{site.tagline}</p>
          </div>
          <dl className="leaf-footer__facts">
            {b.street ? (
              <div>
                <dt>{pick(site.lang, { ru: 'Чайная', uz: 'Choyxona', en: 'Tea room' })}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
              </div>
            ) : null}
            {b.hours.length ? (
              <div>
                <dt>{ui(site.lang, 'hours')}</dt>
                <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
              </div>
            ) : null}
            {b.phone ? (
              <div>
                <dt>{ui(site.lang, 'phone')}</dt>
                <dd>
                  <a href={tel(b.phone)}>{b.phone}</a>
                </dd>
              </div>
            ) : null}
            <div>
              <dt>{pick(site.lang, { ru: 'Пишите нам', uz: 'Bizga yozing', en: 'Write to us' })}</dt>
              <dd className="leaf-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div className="leaf-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero leaf-hero">
      <Leaf className="leaf-hero__float leaf-hero__float--a" />
      <Leaf className="leaf-hero__float leaf-hero__float--b" />
      <Leaf className="leaf-hero__float leaf-hero__float--c" />
      <div className="leaf-hero__inner">
        {s.eyebrow ? (
          <p className="leaf-hero__eyebrow leaf-in" style={{ ['--d' as string]: '.1s' }}>
            {s.eyebrow}
          </p>
        ) : null}
        <div className="leaf-hero__cup leaf-in" style={{ ['--d' as string]: '.2s' }}>
          <Cup />
        </div>
        <h1 className="leaf-hero__title">
          <span data-split="lines">{s.title || site.name}</span>
        </h1>
        {s.words.length ? (
          <p className="leaf-hero__rot leaf-in" style={{ ['--d' as string]: '.7s' }}>
            <span>{pick(site.lang, { ru: 'Сегодня заваривают', uz: 'Bugun damlanmoqda', en: 'Brewing today' })}</span>
            <Rotator words={s.words} />
          </p>
        ) : null}
        {s.subtitle ? (
          <p className="leaf-hero__sub leaf-in" style={{ ['--d' as string]: '.85s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="leaf-hero__ctas leaf-in" style={{ ['--d' as string]: '1s' }}>
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

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee leaf-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={60} sep="❧" />
    </section>
  )
}

/** О доме: вертикальная подпись, текст с буквицей и фото в овале. */
function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="leaf-about-sec">
      <div className="leaf-about">
        <p className="leaf-about__side" aria-hidden="true">
          {s.label}
        </p>
        <div className="leaf-about__copy">
          {s.label ? (
            <p className="s__label" data-reveal="fade">
              {s.label}
            </p>
          ) : null}
          <h2 className="s__title" data-split="lines">
            {s.title}
          </h2>
          {s.text ? (
            <p className="leaf-about__text" data-reveal="up">
              {s.text}
            </p>
          ) : null}
        </div>
        <figure className="leaf-about__media" data-reveal="clip">
          <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="waves" className="media" />
        </figure>
      </div>
    </Sec>
  )
}

/** Чайная полка: каждая группа — полка, каждый чай — банка с этикеткой. */
function Menu({ section: s, site }: SectionProps<'menu'>) {
  let n = 0
  return (
    <Sec id={s.anchor} type="menu" className="leaf-shelf-sec">
      <Head label={s.label} title={s.title} center />
      <div className="leaf-shelves">
        {s.groups.map((g, gi) => (
          <div key={gi} className="leaf-shelf">
            <h3 className="leaf-shelf__name" data-reveal="fade">
              {g.name}
            </h3>
            <ul className="leaf-shelf__row">
              {g.items.map((it, i) => {
                const c = TIN[n++ % TIN.length]
                return (
                  <li key={i} className="leaf-tin" data-reveal="up" data-delay={String(i * 0.07)} style={{ ['--tin' as string]: c }}>
                    <div className="leaf-tin__can" aria-hidden="true">
                      <span className="leaf-tin__lid" />
                      <span className="leaf-tin__label">
                        <Leaf />
                        <b>{it.name}</b>
                        <small>{site.name}</small>
                      </span>
                    </div>
                    <div className="leaf-tin__info">
                      <h4>{it.name}</h4>
                      {it.text ? <p>{it.text}</p> : null}
                      {it.price ? <span className="leaf-tin__price">{it.price}</span> : null}
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="leaf-shelf__plank" aria-hidden="true" />
          </div>
        ))}
      </div>
    </Sec>
  )
}

/** Ритуал заварки: у каждого шага кольцо, которое наполняется как таймер. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="leaf-ritual-sec">
      <Head label={s.label} title={s.title} center />
      <ol className="leaf-ritual">
        {s.items.map((it, i) => (
          <li key={i} className="leaf-step" data-reveal="up" data-delay={String(i * 0.12)}>
            <svg className="leaf-step__ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="52" pathLength={1} className="leaf-step__track" />
              <circle cx="60" cy="60" r="52" pathLength={1} className="leaf-step__fill" style={{ ['--k' as string]: (i + 1) / s.items.length }} />
            </svg>
            <span className="leaf-step__no">{String(i + 1).padStart(2, '0')}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, about: About, menu: Menu, process: Process },
}
