import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { SpinPizza, Tracker } from './client'

/*
 * КОРОЧКА — пиццерия в духе Pizza Pilgrims и Joe & the Juice: сочная заливка, толстые
 * чёрные контуры и тени-плашки, стикеры, клетчатая скатерть. Пицца на первом экране
 * крутится вместе с прокруткой, доставка — трек, по которому едет курьер.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Пицца векторами: корж, соус, сыр пятнами и начинка по сиду — у каждой позиции своя. */
export function Pizza({ seed = 0, className = '' }: { seed?: number; className?: string }) {
  const rnd = (n: number) => {
    const x = Math.sin(seed * 97.3 + n * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  const tops = ['#b8231a', '#2f6b2b', '#5a3a2a', '#f4b400', '#e8e2d0']
  const kind = seed % tops.length
  const pieces = Array.from({ length: 11 }, (_, i) => {
    const a = rnd(i) * Math.PI * 2
    const r = 18 + rnd(i + 40) * 52
    return { x: 100 + Math.cos(a) * r, y: 100 + Math.sin(a) * r, s: 7 + rnd(i + 80) * 6 }
  })
  return (
    <svg className={`crust-pizza ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="96" fill="#e8a24a" stroke="#1d1a16" strokeWidth="4" />
      <circle cx="100" cy="100" r="80" fill="#d33a1f" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={100 + Math.cos(i * 0.9 + seed) * (20 + (i % 3) * 18)} cy={100 + Math.sin(i * 0.9 + seed) * (20 + (i % 3) * 18)} r={16 + (i % 2) * 6} fill="#fff6dc" />
      ))}
      {pieces.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={tops[(kind + (i % 2)) % tops.length]} stroke="#1d1a16" strokeWidth="1.5" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="100" y1="100" x2={100 + Math.cos((i * Math.PI) / 4) * 96} y2={100 + Math.sin((i * Math.PI) / 4) * 96} stroke="#1d1a16" strokeOpacity=".25" strokeWidth="2" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`b${i}`} x1="100" y1="100" x2={100 - Math.cos((i * Math.PI) / 4) * 96} y2={100 - Math.sin((i * Math.PI) / 4) * 96} stroke="#1d1a16" strokeOpacity=".25" strokeWidth="2" />
      ))}
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="crust-header">
        <a href="#top" className="crust-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <Pizza seed={3} className="crust-logo__pie" />
          {site.name}
            </>
          )}
        </a>
        <nav className="crust-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="crust-header__side">
          {b.phone ? (
            <a className="crust-phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="crust-btn crust-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="crust-footer">
        <div className="crust-cloth" aria-hidden="true" />
        <div className="crust-footer__inner">
          <p className="crust-footer__name">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
          <div className="crust-footer__cols">
            <p>{site.tagline}</p>
            <p>
              <b>{ui(site.lang, 'address')}</b>
              {[b.street, b.city].filter(Boolean).join(', ')}
            </p>
            <p>
              <b>{ui(site.lang, 'hours')}</b>
              {b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}
            </p>
            <p className="crust-footer__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </p>
          </div>
          <p className="crust-footer__bottom">
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
  const stats = site.sections.find((x) => x.type === 'stats')
  const stickers = stats && stats.type === 'stats' ? stats.items.slice(0, 3) : []
  return (
    <section id={s.anchor || undefined} className="s s-hero crust-hero">
      <div className="crust-hero__text">
        {s.eyebrow ? <p className="crust-hero__eyebrow crust-pop">{s.eyebrow}</p> : null}
        <h1 className="crust-hero__title">
          <span data-split="words">{s.title || site.name}</span>
        </h1>
        {s.subtitle ? (
          <p className="crust-hero__sub crust-pop" style={{ ['--d' as string]: '.5s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="crust-hero__ctas crust-pop" style={{ ['--d' as string]: '.65s' }}>
          {s.cta.label ? (
            <a className="crust-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="crust-btn crust-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="crust-hero__plate">
        <div className="crust-hero__board" aria-hidden="true" />
        <SpinPizza>
          <Pizza seed={1} className="crust-hero__pizza" />
        </SpinPizza>
        {stickers.map((it, i) => (
          <span key={i} className={`crust-sticker crust-sticker--${i}`} style={{ ['--d' as string]: `${0.8 + i * 0.15}s` }}>
            <b>
              {it.value}
              {it.suffix}
            </b>
            <small>{it.label}</small>
          </span>
        ))}
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee crust-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <div className="crust-cloth crust-cloth--thin" aria-hidden="true" />
      <Marquee items={s.items} speed={34} sep="●" />
      <div className="crust-cloth crust-cloth--thin" aria-hidden="true" />
    </section>
  )
}

function Menu({ section: s, site }: SectionProps<'menu'>) {
  let n = 0
  return (
    <Sec id={s.anchor} type="menu" className="crust-menu-sec">
      <Head label={s.label} title={s.title} />
      {s.groups.map((g, gi) => (
        <div key={gi} className="crust-menu__group">
          <h3 className="crust-menu__gname">{g.name}</h3>
          <ul className="crust-menu__grid">
            {g.items.map((it, i) => {
              n += 1
              return (
                <li key={i} className="crust-card" data-reveal="up" data-delay={String((i % 4) * 0.07)}>
                  {gi < 2 ? <Pizza seed={n + 4} className="crust-card__pie" /> : <span className="crust-card__dot" aria-hidden="true">{n}</span>}
                  <h4 className="crust-card__name">{it.name}</h4>
                  {it.text ? <p className="crust-card__text">{it.text}</p> : null}
                  <p className="crust-card__foot">
                    <span className="crust-card__price">{it.price}</span>
                    <a className="crust-card__add" href={site.nav.cta.href || '#contact'} aria-label={`${pick(site.lang, { ru: 'Заказать', uz: 'Buyurtma', en: 'Order' })}: ${it.name}`}>
                      +
                    </a>
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="crust-track-sec">
      <Head label={s.label} title={s.title} />
      <Tracker steps={s.items} />
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="crust-stats-sec">
      <Head label={s.label} title={s.title} />
      <dl className="crust-stats">
        {s.items.map((it, i) => (
          <div key={i} className="crust-stat" data-reveal="scale" data-delay={String(i * 0.08)} style={{ ['--tilt' as string]: `${[-6, 4, -3, 7][i % 4]}deg` }}>
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

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="crust-chat-sec">
      <Head label={s.label} title={s.title} />
      <div className="crust-chat">
        {s.items.map((it, i) => (
          <figure key={i} className={`crust-bubble${i % 2 ? ' crust-bubble--r' : ''}`} data-reveal={i % 2 ? 'right' : 'left'} data-delay={String(i * 0.12)}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              {it.author}
              {it.role ? ` · ${it.role}` : ''}
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
  sections: { hero: Hero, marquee: MarqueeSec, menu: Menu, process: Process, stats: Stats, testimonials: Testimonials },
}
