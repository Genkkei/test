import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { RoastCurve } from './client'

/*
 * РЕЗЕРВ — кофейня-обжарочная в духе Starbucks Reserve Roastery и бутиков Nespresso: тёмная
 * медь, торжественная антиква, медная печать с медленным вращением, падающие зёрна,
 * меню — дегустационные сеты, процесс — кривая обжарки, которая рисуется по прокрутке.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Медная печать: кольцо текста по кругу и звезда. Текст — название и город. */
function Seal({ text, className = '' }: { text: string; className?: string }) {
  const label = `${text} · ${text} · `
  return (
    <svg className={`reserve-seal ${className}`} viewBox="0 0 300 300" aria-hidden="true">
      <defs>
        <path id="reserve-ring" d="M150 150 m -118 0 a 118 118 0 1 1 236 0 a 118 118 0 1 1 -236 0" />
        <linearGradient id="reserve-copper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0c08a" />
          <stop offset=".45" stopColor="#b87333" />
          <stop offset=".7" stopColor="#7a4420" />
          <stop offset="1" stopColor="#e2a46a" />
        </linearGradient>
      </defs>
      <circle cx="150" cy="150" r="146" fill="none" stroke="url(#reserve-copper)" strokeWidth="2" />
      <circle cx="150" cy="150" r="98" fill="none" stroke="url(#reserve-copper)" strokeWidth="1" />
      <g className="reserve-seal__ring">
        <text fontSize="17" letterSpacing="6" fill="url(#reserve-copper)">
          <textPath href="#reserve-ring">{label.toUpperCase()}</textPath>
        </text>
      </g>
      <path d="M150 78 L164 136 L222 150 L164 164 L150 222 L136 164 L78 150 L136 136 Z" fill="url(#reserve-copper)" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="reserve-header">
        <nav className="reserve-nav" aria-label={ui(site.lang, 'sections')}>
          {links.slice(0, Math.ceil(links.length / 2)).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="reserve-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          {site.name}
            </>
          )}
        </a>
        <div className="reserve-header__side">
          <nav className="reserve-nav" aria-label={ui(site.lang, 'sections')}>
            {links.slice(Math.ceil(links.length / 2)).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          {site.nav.cta.label ? (
            <a className="reserve-btn reserve-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="reserve-footer">
        <Seal text={site.name} className="reserve-footer__seal" />
        <p className="reserve-footer__tag">{site.tagline}</p>
        <div className="reserve-footer__cols">
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
          <p>
            <b>{pick(site.lang, { ru: 'Мы в сети', uz: 'Ijtimoiy tarmoqlar', en: 'Follow us' })}</b>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </p>
        </div>
        <p className="reserve-footer__bottom">
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
    <section id={s.anchor || undefined} className="s s-hero reserve-hero">
      <div className="reserve-beans" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} style={{ left: `${(i * 37) % 100}%`, ['--d' as string]: `${(i * 1.7) % 12}s`, ['--s' as string]: `${0.6 + ((i * 7) % 5) / 6}`, ['--t' as string]: `${12 + (i % 5) * 3}s` }} />
        ))}
      </div>
      <Seal text={site.name} className="reserve-hero__seal" />
      <div className="reserve-hero__text">
        {s.eyebrow ? <p className="reserve-hero__eyebrow">{s.eyebrow}</p> : null}
        <h1 className="reserve-hero__title">
          <span data-split="lines">{s.title || site.name}</span>
        </h1>
        {s.subtitle ? <p className="reserve-hero__sub reserve-fade">{s.subtitle}</p> : null}
        <div className="reserve-hero__ctas reserve-fade" style={{ ['--d' as string]: '1.1s' }}>
          {s.cta.label ? (
            <a className="reserve-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="reserve-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label} →
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
    <section className="s s-marquee reserve-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={60} sep="✦" />
    </section>
  )
}

function About({ section: s, site, art }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="reserve-about">
      <div className="reserve-about__grid">
        <div>
          <Head label={s.label} title={s.title} />
          {s.text ? (
            <p className="reserve-about__text" data-reveal="up">
              {s.text}
            </p>
          ) : null}
        </div>
        <figure className="reserve-about__frame" data-reveal="clip">
          <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind={art} className="reserve-about__img" />
        </figure>
      </div>
    </Sec>
  )
}

function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="reserve-menu-sec">
      <Head label={s.label} title={s.title} center />
      <div className="reserve-flights">
        {s.groups.map((g, gi) => (
          <div key={gi} className="reserve-flight" data-reveal="up" data-delay={String(gi * 0.1)}>
            <h3 className="reserve-flight__name">
              <span>{['I', 'II', 'III', 'IV', 'V'][gi] ?? gi + 1}</span>
              {g.name}
            </h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={i}>
                  <p className="reserve-flight__line">
                    <span className="reserve-flight__dish">{it.name}</span>
                    <span className="reserve-flight__price">{it.price}</span>
                  </p>
                  {it.text ? <p className="reserve-flight__notes">{it.text}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="reserve-exp-sec">
      <Head label={s.label} title={s.title} />
      <div className="reserve-exp">
        {s.items.map((it, i) => (
          <article key={i} className={`reserve-exp__card${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.1)}>
            {it.featured ? <span className="reserve-exp__flag">{pick(site.lang, { ru: 'Рекомендуем', uz: 'Tavsiya etamiz', en: 'Recommended' })}</span> : null}
            <h3>{it.name}</h3>
            <p className="reserve-exp__price">
              {it.price}
              {it.period ? <small> / {it.period}</small> : null}
            </p>
            <ul>
              {it.features.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
            <a className="reserve-btn reserve-btn--line" href={site.nav.cta.href || '#contact'}>
              {pick(site.lang, { ru: 'Забронировать', uz: 'Band qilish', en: 'Reserve' })}
            </a>
          </article>
        ))}
      </div>
    </Sec>
  )
}

function Process({ section: s, site }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="reserve-curve-sec">
      <Head label={s.label} title={s.title} />
      <RoastCurve steps={s.items} axis={[pick(site.lang, { ru: 'загрузка', uz: 'yuklash', en: 'charge' }), pick(site.lang, { ru: 'выгрузка · 12 мин', uz: 'tushirish · 12 daq', en: 'drop · 12 min' })]} />
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="reserve-stats-sec">
      <dl className="reserve-stats">
        {s.items.map((it, i) => (
          <div key={i} className="reserve-stat" data-reveal="fade" data-delay={String(i * 0.1)}>
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
    <Sec id={s.anchor} type="testimonials" className="reserve-quotes-sec">
      <Head label={s.label} title={s.title} center />
      <div className="reserve-quotes">
        {s.items.map((it, i) => (
          <figure key={i} className="reserve-quote" data-reveal="up" data-delay={String(i * 0.12)}>
            <blockquote>{it.quote}</blockquote>
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
  sections: { hero: Hero, marquee: MarqueeSec, about: About, menu: Menu, pricing: Pricing, process: Process, stats: Stats, testimonials: Testimonials },
}
