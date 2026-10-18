import './style.css'
import type { Site } from '@/lib/schema'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { PourCup } from './client'

/*
 * КАПЛЯ — ретро-кофейня в духе Intelligentsia и плакатов 70-х: четыре тёплые полосы
 * (шоколад, ржавчина, апельсин, горчица) идут радугой через весь сайт, пар над чашкой,
 * меню как доска закусочной с пунктиром до цены, чашка наполняется по прокрутке.
 */

const STRIPES = ['#3a1f12', '#a8431f', '#e0662d', '#e8a33d']

/** Радуга из четырёх полос — фирменный знак шаблона. */
function Rainbow({ className = '' }: { className?: string }) {
  return (
    <svg className={`drip-rainbow ${className}`} viewBox="0 0 400 210" aria-hidden="true">
      {STRIPES.map((c, i) => {
        const r = 190 - i * 34
        return <path key={i} d={`M ${200 - r} 210 A ${r} ${r} 0 0 1 ${200 + r} 210`} fill="none" stroke={c} strokeWidth="30" pathLength={1} className="drip-rainbow__arc" style={{ ['--i' as string]: i }} />
      })}
    </svg>
  )
}

/** Кружка с паром: пар — три кривые, плывут вверх CSS-анимацией. */
function Mug({ className = '' }: { className?: string }) {
  return (
    <svg className={`drip-mug ${className}`} viewBox="0 0 160 170" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <path key={i} className="drip-steam" style={{ ['--i' as string]: i }} d={`M ${52 + i * 22} 52 c -10 -12 10 -20 0 -32 c -8 -10 6 -16 0 -24`} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      ))}
      <path d="M118 84 h10 a18 18 0 0 1 0 36 h-12" fill="none" stroke="#3a1f12" strokeWidth="9" />
      <path d="M26 68 h96 v58 a30 30 0 0 1 -30 30 h-36 a30 30 0 0 1 -30 -30 z" fill="#fff8ec" stroke="#3a1f12" strokeWidth="6" />
      {STRIPES.slice(1).map((c, i) => (
        <rect key={i} x="29" y={92 + i * 12} width="90" height="8" fill={c} />
      ))}
    </svg>
  )
}

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="drip-header">
        <a href="#top" className="drip-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="drip-logo__drop" aria-hidden="true" />
          {site.name}
        </a>
        <nav className="drip-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="drip-header__side">
          {site.nav.cta.label ? (
            <a className="drip-btn drip-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="drip-footer">
        <div className="drip-stripes" aria-hidden="true" />
        <div className="drip-footer__inner">
          <p className="drip-footer__name">{site.name}</p>
          <p className="drip-footer__tag">{site.tagline}</p>
          <div className="drip-footer__cols">
            <p>
              <b>{ui(site.lang, 'address')}</b>
              {[b.street, b.city].filter(Boolean).join(', ')}
            </p>
            <p>
              <b>{ui(site.lang, 'hours')}</b>
              {b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}
            </p>
            <p>
              <b>{ui(site.lang, 'phone')}</b>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            </p>
            <p className="drip-footer__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </p>
          </div>
          <p className="drip-footer__bottom">
            <span>
              © {new Date().getFullYear()} {b.legalName || site.name}
            </span>
            <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const open = site.business.hours[0] ? humanHours(site.business.hours[0], site.lang) : ''
  return (
    <section id={s.anchor || undefined} className="s s-hero drip-hero">
      <div className="drip-hero__sun">
        <Rainbow />
        <Mug className="drip-hero__mug" />
      </div>
      <div className="drip-hero__text">
        {s.eyebrow ? <p className="drip-hero__eyebrow">{s.eyebrow}</p> : null}
        <h1 className="drip-hero__title">
          <span data-split="words">{s.title || site.name}</span>
        </h1>
        {s.subtitle ? <p className="drip-hero__sub drip-rise">{s.subtitle}</p> : null}
        <div className="drip-hero__ctas drip-rise" style={{ ['--d' as string]: '.75s' }}>
          {s.cta.label ? (
            <a className="drip-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="drip-btn drip-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      {open ? (
        <span className="drip-badge" aria-hidden="true">
          <b>{pick(site.lang, { ru: 'Открыто', uz: 'Ochiq', en: 'Open' })}</b>
          {open}
        </span>
      ) : null}
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee drip-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={36} sep="☕" />
    </section>
  )
}

function About({ section: s, site, art }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="drip-about">
      <div className="drip-about__grid">
        <figure className="drip-about__arch" data-reveal="clip">
          <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={STRIPES} kind={art} className="drip-about__img" />
        </figure>
        <div>
          <Head label={s.label} title={s.title} />
          {s.text ? (
            <p className="drip-about__text" data-reveal="up">
              {s.text}
            </p>
          ) : null}
        </div>
      </div>
    </Sec>
  )
}

function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="drip-menu-sec">
      <Head label={s.label} title={s.title} center />
      <div className="drip-board">
        {s.groups.map((g, gi) => (
          <div key={gi} className="drip-board__group" data-reveal="up" data-delay={String(gi * 0.08)} style={{ ['--c' as string]: STRIPES[(gi + 1) % 4] }}>
            <h3 className="drip-board__name">{g.name}</h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={i} className="drip-board__item">
                  <span className="drip-board__line">
                    <span className="drip-board__dish">{it.name}</span>
                    <span className="drip-board__dots" aria-hidden="true" />
                    <span className="drip-board__price">{it.price}</span>
                  </span>
                  {it.text ? <span className="drip-board__desc">{it.text}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="drip-brew-sec">
      <div className="drip-brew">
        <PourCup>
          <svg className="drip-pour__svg" viewBox="0 0 200 260" aria-hidden="true">
            <defs>
              <clipPath id="drip-cup-clip">
                <path d="M40 110 h120 l-14 120 a20 20 0 0 1 -20 18 h-52 a20 20 0 0 1 -20 -18 z" />
              </clipPath>
            </defs>
            <path d="M70 10 h60 l-12 48 h-36 z" fill="#fff8ec" stroke="#3a1f12" strokeWidth="5" />
            <circle className="drip-pour__drop" cx="100" cy="70" r="6" fill="#3a1f12" />
            <g clipPath="url(#drip-cup-clip)">
              <rect className="drip-pour__coffee" x="30" y="100" width="140" height="160" fill="#3a1f12" />
              <rect className="drip-pour__crema" x="30" y="96" width="140" height="10" fill="#a8431f" />
            </g>
            <path d="M40 110 h120 l-14 120 a20 20 0 0 1 -20 18 h-52 a20 20 0 0 1 -20 -18 z" fill="none" stroke="#3a1f12" strokeWidth="6" />
          </svg>
        </PourCup>
        <div>
          <Head label={s.label} title={s.title} />
          <ol className="drip-steps">
            {s.items.map((it, i) => (
              <li key={i} data-reveal="left" data-delay={String(i * 0.08)}>
                <span className="drip-steps__n" style={{ background: STRIPES[i % 4] }}>
                  {i + 1}
                </span>
                <div>
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="drip-stats-sec">
      <Head label={s.label} title={s.title} />
      <dl className="drip-stats">
        {s.items.map((it, i) => (
          <div key={i} className="drip-stat" data-reveal="scale" data-delay={String(i * 0.08)} style={{ background: STRIPES[i % 4], color: i === 3 ? '#3a1f12' : '#fff8ec' }}>
            <dd>
              <span data-count>{it.value}</span>
              <small>{it.suffix}</small>
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

function Testimonials({ section: s, site }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="drip-cards-sec">
      <Head label={s.label} title={s.title} />
      <div className="drip-cards">
        {s.items.map((it, i) => (
          <figure key={i} className="drip-card" data-reveal="up" data-delay={String(i * 0.1)} style={{ ['--tilt' as string]: `${[-3, 2, -1.5][i % 3]}deg` }}>
            <span className="drip-card__stamp" aria-hidden="true">
              {pick(site.lang, { ru: 'гость', uz: 'mehmon', en: 'guest' })} №{String(i + 1).padStart(2, '0')}
            </span>
            <blockquote>«{it.quote}»</blockquote>
            <figcaption>
              {it.author}
              {it.role ? <small>{it.role}</small> : null}
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
  sections: { hero: Hero, marquee: MarqueeSec, about: About, menu: Menu, process: Process, stats: Stats, testimonials: Testimonials },
}

