import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Rotator } from './client'

/*
 * БАЗАР — чайхана и национальная кухня в духе Dishoom и Ottolenghi: тёплая бумага,
 * орнамент-ислими (розетка из лепестков, восьмиконечная звезда гирих), арки вместо рамок,
 * меню как иллюстрированный лист с номерами блюд и рисунками казана, тандыра и чайника.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Розетка: лепестки по кругу в два яруса и звезда гирих в центре. */
function Rosette({ className = '' }: { className?: string }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5)
  return (
    <svg className={`bazaar-rosette ${className}`} viewBox="-100 -100 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle r="96" />
        <circle r="90" strokeDasharray="2 5" />
        {petals.map((a) => (
          <path key={a} transform={`rotate(${a})`} d="M0 -86 C 14 -70 14 -52 0 -40 C -14 -52 -14 -70 0 -86 Z" />
        ))}
        {petals.map((a) => (
          <path key={`i${a}`} transform={`rotate(${a + 11.25})`} d="M0 -58 C 8 -50 8 -40 0 -32 C -8 -40 -8 -50 0 -58 Z" />
        ))}
        <circle r="30" />
        <path d="M0 -26 L7 -7 L26 0 L7 7 L0 26 L-7 7 L-26 0 L-7 -7 Z" />
        <path transform="rotate(45)" d="M0 -26 L7 -7 L26 0 L7 7 L0 26 L-7 7 L-26 0 L-7 -7 Z" />
        <circle r="6" fill="currentColor" />
      </g>
    </svg>
  )
}

/** Полоса бордюра — повторяющийся мотив, как кайма на сюзане. */
function Border({ className = '' }: { className?: string }) {
  return <div className={`bazaar-border ${className}`} aria-hidden="true" />
}

const ICONS = [
  // казан
  <svg key="k" viewBox="0 0 64 48" aria-hidden="true"><path d="M6 18h52M10 18c0 14 8 24 22 24s22-10 22-24M4 18c-2-3 0-5 3-5M60 18c2-3 0-5-3-5M22 8c2-3 2-5 0-7M32 8c2-3 2-5 0-7M42 8c2-3 2-5 0-7" /></svg>,
  // тандыр
  <svg key="t" viewBox="0 0 64 48" aria-hidden="true"><path d="M12 46 C 8 30 14 10 32 6 C 50 10 56 30 52 46 Z M22 46 C 22 34 26 26 32 26 C 38 26 42 34 42 46 M18 16h28" /></svg>,
  // чайник
  <svg key="c" viewBox="0 0 64 48" aria-hidden="true"><path d="M16 22c0 14 6 22 16 22s16-8 16-22ZM14 22h36M32 22v-6M28 14h8M48 26c6 0 10-4 12-10M16 28c-6 0-9-4-9-8" /></svg>,
]

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const half = Math.ceil(links.length / 2)
  const b = site.business
  return (
    <>
      <header className="bazaar-header">
        <nav className="bazaar-nav bazaar-nav--l" aria-label={ui(site.lang, 'sections')}>
          {links.slice(0, half).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="bazaar-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <Rosette className="bazaar-logo__mark" />
          <span>{site.name}</span>
        </a>
        <nav className="bazaar-nav bazaar-nav--r" aria-label={ui(site.lang, 'sections')}>
          {links.slice(half).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          {site.nav.cta.label ? (
            <a className="bazaar-btn bazaar-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
        </nav>
        <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
      </header>
      <main id="top">{children}</main>
      <footer className="bazaar-footer">
        <Border />
        <div className="bazaar-footer__inner">
          <div className="bazaar-footer__brand">
            <Rosette className="bazaar-footer__mark" />
            <p className="bazaar-footer__name">{site.name}</p>
            <p className="bazaar-footer__tag">{site.tagline}</p>
          </div>
          <dl className="bazaar-footer__facts">
            {b.street ? (
              <div>
                <dt>{ui(site.lang, 'address')}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
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
            {b.hours.length ? (
              <div>
                <dt>{ui(site.lang, 'hours')}</dt>
                <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
              </div>
            ) : null}
            <div>
              <dt>{pick(site.lang, { ru: 'Мы в сетях', uz: 'Tarmoqlarda', en: 'Follow us' })}</dt>
              <dd className="bazaar-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <p className="bazaar-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Добро пожаловать к дастархану', uz: 'Dasturxonga xush kelibsiz', en: 'Welcome to the dastarkhan' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero bazaar-hero">
      <div className="bazaar-hero__inner">
        <div className="bazaar-hero__text">
          {s.eyebrow ? (
            <p className="bazaar-hero__eyebrow bazaar-in" style={{ ['--d' as string]: '.1s' }}>
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="bazaar-hero__title">
            <span data-split="chars">{s.title || site.name}</span>
          </h1>
          {s.words.length ? (
            <p className="bazaar-hero__today bazaar-in" style={{ ['--d' as string]: '.6s' }}>
              <span>{pick(site.lang, { ru: 'Сегодня в казане —', uz: 'Bugun qozonda —', en: 'In the kazan today —' })}</span> <Rotator words={s.words} />
            </p>
          ) : null}
          {s.subtitle ? (
            <p className="bazaar-hero__sub bazaar-in" style={{ ['--d' as string]: '.8s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="bazaar-hero__ctas bazaar-in" style={{ ['--d' as string]: '.95s' }}>
            {s.cta.label ? (
              <a className="bazaar-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="bazaar-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
        <div className="bazaar-hero__arch">
          <Rosette className="bazaar-hero__rosette" />
          <figure className="bazaar-arch bazaar-in" style={{ ['--d' as string]: '.3s' }} data-parallax="0.08">
            <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-hero`} colors={palette(site)} kind="waves" className="media" />
          </figure>
          <span className="bazaar-hero__stamp bazaar-in" style={{ ['--d' as string]: '1.1s' }}>
            {pick(site.lang, { ru: 'с', uz: '', en: 'since' })} {site.business.founded || '—'}
            {pick(site.lang, { ru: '', uz: '-yildan', en: '' })}
          </span>
        </div>
      </div>
      <Border className="bazaar-hero__border" />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee bazaar-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={42} sep="✺" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="bazaar-about">
      <div className="bazaar-about__grid">
        <figure className="bazaar-arch bazaar-arch--tall" data-reveal="clip">
          <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
        </figure>
        <div>
          <Head label={s.label} title={s.title} />
          <p className="bazaar-about__text" data-reveal="up">
            {s.text}
          </p>
        </div>
      </div>
    </Sec>
  )
}

/** Меню — иллюстрированный лист: у группы рисунок, у блюда номер в круге и точки до цены. */
function Menu({ section: s }: SectionProps<'menu'>) {
  let n = 0
  return (
    <Sec id={s.anchor} type="menu" className="bazaar-menu-sec">
      <Head label={s.label} title={s.title} center />
      <div className="bazaar-menu" data-reveal="up">
        <Rosette className="bazaar-menu__corner bazaar-menu__corner--l" />
        <Rosette className="bazaar-menu__corner bazaar-menu__corner--r" />
        {s.groups.map((g, i) => (
          <div key={i} className="bazaar-menu__group">
            <div className="bazaar-menu__icon">{ICONS[i % ICONS.length]}</div>
            <h3 className="bazaar-menu__gname">{g.name}</h3>
            <ul className="bazaar-menu__items">
              {g.items.map((it, j) => {
                n += 1
                return (
                  <li key={j} className="bazaar-menu__item">
                    <span className="bazaar-menu__no">{n}</span>
                    <div>
                      <div className="s-menu__row">
                        <span className="bazaar-menu__name">{it.name}</span>
                        <span className="s-menu__dots" aria-hidden="true" />
                        <span className="bazaar-menu__price">{it.price}</span>
                      </div>
                      {it.text ? <p className="bazaar-menu__text">{it.text}</p> : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <Sec id={s.anchor} type="gallery" className="bazaar-gallery-sec">
      <Head label={s.label} title={s.title} />
      <div className="bazaar-gallery">
        {s.items.map((it, i) => (
          <figure key={i} className="bazaar-gallery__item" data-reveal="up" data-delay={String((i % 3) * 0.1)}>
            <div className="bazaar-arch">
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={i % 2 ? 'blobs' : 'waves'} className="media" />
            </div>
            {it.caption ? <figcaption>{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Sec>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="bazaar-cards-sec">
      <Head label={s.label} title={s.title} />
      <div className="bazaar-cards">
        {s.items.map((it, i) => (
          <figure key={i} className="bazaar-card" data-reveal="scale" data-delay={String(i * 0.1)} style={{ ['--tilt' as string]: `${[-1.6, 1.2, -0.6][i % 3]}deg` }}>
            <span className="bazaar-card__q" aria-hidden="true">“</span>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              {it.author}
              {it.role ? <span> · {it.role}</span> : null}
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
  sections: { hero: Hero, marquee: MarqueeSec, about: About, menu: Menu, gallery: Gallery, testimonials: Testimonials },
}
