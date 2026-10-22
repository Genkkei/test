import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { LoftPiece, loftKind } from './pieces'

/*
 * ЛОФТ — мебель из металла и массива в духе Restoration Hardware и Industry West:
 * тёмный цех, стальные пластины с заклёпками, трафаретные надписи, чертёж стола,
 * который прорисовывается на первом экране, и искры сварки в точке шва.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Rivets() {
  return (
    <span className="loft-rivets" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="loft-header">
        <a href="#top" className="loft-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 21V9l6-4v4l6-4v4l6-4v16z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          <span>{site.name}</span>
        </a>
        <nav className="loft-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <sup>{String(i + 1).padStart(2, '0')}</sup>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="loft-header__side">
          {b.phone ? (
            <a className="loft-header__tel" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="loft-btn loft-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="loft-footer">
        <div className="loft-footer__plate">
          <Rivets />
          <p className="loft-footer__name" aria-hidden="true">
            {site.name}
          </p>
          <p className="loft-footer__tag">{site.tagline}</p>
        </div>
        <dl className="loft-footer__facts">
          {b.street ? (
            <div>
              <dt>{pick(site.lang, { ru: 'Шоурум и цех', uz: 'Shou-rum va sex', en: 'Showroom & workshop' })}</dt>
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
            <dt>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</dt>
            <dd className="loft-footer__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              ))}
            </dd>
          </div>
        </dl>
        <div className="loft-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Сталь · массив · сварка вручную', uz: 'Po‘lat · massiv · qo‘lda payvandlash', en: 'Steel · solid wood · hand-welded' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

/** Чертёж стола: линии прорисовываются, размеры подписываются, в точке шва летят искры. */
function Blueprint({ lang }: { lang: string }) {
  return (
    <figure className="loft-blue" aria-hidden="true">
      <svg viewBox="0 0 520 380">
        <defs>
          <pattern id="loft-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeOpacity=".09" />
          </pattern>
        </defs>
        <rect width="520" height="380" fill="url(#loft-grid)" />
        {/* столешница */}
        <path className="loft-bp loft-bp--wood" pathLength={1} d="M60 140 L380 140 L460 100 L140 100 Z" />
        <path className="loft-bp loft-bp--wood" pathLength={1} d="M60 140 V156 H380 V140 M380 156 L460 116 V100" />
        {/* стальное основание */}
        <path className="loft-bp" pathLength={1} d="M84 156 L70 320 M84 156 L132 320 M70 320 H132 M356 156 L342 320 M356 156 L404 320 M342 320 H404" />
        <path className="loft-bp" pathLength={1} d="M101 240 H373 M132 320 L180 280 M404 320 L440 280 M440 280 L436 120" />
        {/* размеры */}
        <g className="loft-dim">
          <path d="M60 352 H404 M60 346 V358 M404 346 V358" />
          <text x="232" y="372">1800</text>
          <path d="M484 100 V320 M478 100 H490 M478 320 H490" />
          <text x="496" y="214">760</text>
          <path d="M146 84 L466 84" strokeDasharray="3 4" />
          <text x="270" y="78">900</text>
        </g>
        <g className="loft-weld">
          <circle cx="101" cy="240" r="5" />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1="101" y1="240" x2={101 + Math.cos(i * 0.7 + 3.6) * 34} y2={240 + Math.sin(i * 0.7 + 3.6) * 34} style={{ ['--i' as string]: i }} />
          ))}
        </g>
      </svg>
      <figcaption>
        <span>{pick(lang, { ru: 'Лист 01 · стол обеденный', uz: '01-varaq · ovqat stoli', en: 'Sheet 01 · dining table' })}</span>
        <span>{pick(lang, { ru: 'М 1:20 · сталь 40×40 · дуб 40 мм', uz: 'M 1:20 · po‘lat 40×40 · eman 40 mm', en: 'Scale 1:20 · steel 40×40 · oak 40 mm' })}</span>
      </figcaption>
    </figure>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero loft-hero">
      <div className="loft-hero__beam" aria-hidden="true" />
      <div className="loft-hero__inner">
        <div className="loft-hero__text">
          {s.eyebrow ? (
            <p className="loft-stencil loft-in" style={{ ['--d' as string]: '.1s' }}>
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="loft-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="loft-hero__sub loft-in" style={{ ['--d' as string]: '.6s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="loft-hero__ctas loft-in" style={{ ['--d' as string]: '.75s' }}>
            {s.cta.label ? (
              <a className="loft-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="loft-btn loft-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          {s.words.length ? (
            <ul className="loft-hero__specs loft-in" style={{ ['--d' as string]: '.9s' }}>
              {s.words.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <Blueprint lang={site.lang} />
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee loft-tape" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={44} sep="✕" />
    </section>
  )
}

/** Каталог: карточка-стальная пластина с чертежом предмета, сроком и ценой. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="loft-cat">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="loft-cat__grid">
        {s.items.map((it, i) => (
          <li key={i} className="loft-card" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <Rivets />
            <span className="loft-card__code">
              LF-{String(i + 1).padStart(3, '0')}
              {it.tag ? <b>{it.tag}</b> : null}
            </span>
            <LoftPiece kind={loftKind(it.title, i)} className="loft-card__art" />
            <h3 className="loft-card__name">{it.title}</h3>
            {it.text ? <p className="loft-card__text">{it.text}</p> : null}
            <p className="loft-card__price">{it.price}</p>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Цех: шаги на сварочном шве — линия проваривается слева направо, когда блок в кадре. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="loft-proc">
      <Head label={s.label} title={s.title} />
      <ol className="loft-seam" data-reveal="fade">
        <span className="loft-seam__line" aria-hidden="true" />
        {s.items.map((it, i) => (
          <li key={i} className="loft-seam__step" style={{ ['--i' as string]: i }}>
            <span className="loft-seam__dot" aria-hidden="true" />
            <span className="loft-seam__num">{String(i + 1).padStart(2, '0')}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="loft-stats">
      <Head label={s.label} title={s.title} />
      <dl className="loft-plates">
        {s.items.map((it, i) => (
          <div key={i} className="loft-plate" data-reveal="up" data-delay={String(i * 0.08)}>
            <Rivets />
            <dd>
              <span data-count>{it.value}</span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

/** Проекты — лента интерьеров вбок, как в каталоге RH. */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="loft-works">
      <Head label={s.label} title={s.title} />
      <div className="loft-strip" tabIndex={0} aria-label={s.title || ''}>
        {s.items.map((it, i) => (
          <article key={i} className="loft-strip__item" data-reveal="up" data-delay={String(i * 0.06)}>
            <figure>
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
              <span className="loft-strip__tag">{it.category}</span>
            </figure>
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
            {it.year ? <small>{it.year}</small> : null}
          </article>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, process: Process, stats: Stats, works: Works },
}
