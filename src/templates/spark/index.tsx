import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Calc, SunDial } from './client'

/*
 * ИСКРА — солнечная энергетика в духе Tesla Energy, Enphase, Octopus: инженерный белый,
 * один солнечный жёлтый, данные как приборы. Солнце на дуге идёт по времени Ташкента,
 * услуги — ячейки солнечной панели, тарифы — со встроенным калькулятором мощности.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Logo() {
  return (
    <svg className="spark-mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="6" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="16" y1="3" x2="16" y2="7" transform={`rotate(${i * 45} 16 16)`} />
      ))}
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="spark-header">
        <a href="#top" className="spark-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <Logo />
          <span>{site.name}</span>
        </a>
        <nav className="spark-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="spark-header__side">
          {site.nav.cta.label ? (
            <a className="spark-btn spark-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="spark-footer">
        <div className="spark-footer__sun" aria-hidden="true" />
        <div className="spark-footer__grid">
          <div className="spark-footer__brand">
            <p className="spark-footer__name">
              <Logo /> {site.name}
            </p>
            <p className="spark-footer__tag">{site.tagline}</p>
          </div>
          <ul className="spark-footer__facts">
            {b.phone ? (
              <li>
                <small>{ui(site.lang, 'phone')}</small>
                <a href={tel(b.phone)}>{b.phone}</a>
              </li>
            ) : null}
            {b.email ? (
              <li>
                <small>{ui(site.lang, 'email')}</small>
                <a href={`mailto:${b.email}`}>{b.email}</a>
              </li>
            ) : null}
            {b.street ? (
              <li>
                <small>{ui(site.lang, 'address')}</small>
                {[b.street, b.city].filter(Boolean).join(', ')}
              </li>
            ) : null}
            {b.hours.length ? (
              <li>
                <small>{ui(site.lang, 'hours')}</small>
                {b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}
              </li>
            ) : null}
          </ul>
        </div>
        <div className="spark-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span className="spark-footer__social">
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero spark-hero">
      <div className="spark-hero__inner">
        <div className="spark-hero__text">
          {s.eyebrow ? (
            <p className="spark-chip" data-reveal="fade">
              <i aria-hidden="true" /> {s.eyebrow}
            </p>
          ) : null}
          <h1 className="spark-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="spark-hero__sub" data-reveal="up" data-delay="0.45">
              {s.subtitle}
            </p>
          ) : null}
          <div className="spark-hero__ctas" data-reveal="up" data-delay="0.6">
            {s.cta.label ? (
              <a className="spark-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label} <span aria-hidden="true">→</span>
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="spark-btn spark-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        <div className="spark-hero__panel" data-reveal="up" data-delay="0.3">
          <SunDial lang={site.lang} />
          {s.words.length ? (
            <ul className="spark-hero__specs">
              {s.words.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee spark-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={50} sep="☀" />
    </section>
  )
}

/** Услуги — ячейки солнечной панели: синяя решётка шин, при наведении по ячейке проходит блик. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="spark-cells-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="spark-cells">
        {s.items.map((it, i) => (
          <li key={i} className="spark-cell" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <div className="spark-cell__face" aria-hidden="true">
              <span className="spark-cell__no">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="spark-cell__body">
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
              <p className="spark-cell__meta">
                {it.price ? <b>{it.price}</b> : null}
                {it.tag ? <span>{it.tag}</span> : null}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Цифры как приборы: значение и шкала, которая заполняется при появлении. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="spark-meters-sec">
      <Head label={s.label} title={s.title} />
      <dl className="spark-meters">
        {s.items.map((it, i) => (
          <div key={i} className="spark-meter" data-reveal="up" data-delay={String(i * 0.08)} style={{ ['--fill' as string]: `${[86, 62, 94, 48][i % 4]}%` }}>
            <dd className="spark-meter__value">
              <span data-count>{it.value}</span>
              {it.suffix ? <span className="spark-meter__suffix">{it.suffix}</span> : null}
            </dd>
            <span className="spark-meter__bar" aria-hidden="true" />
            <dt className="spark-meter__label">{it.label}</dt>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

/** Пакеты станций и калькулятор рядом: сначала прикинуть мощность, потом выбрать пакет. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="spark-plans-sec">
      <Head label={s.label} title={s.title} />
      <div className="spark-plans">
        <Calc lang={site.lang} />
        <div className="spark-plans__list">
          {s.items.map((it, i) => (
            <article key={i} className={`spark-plan${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
              <header>
                <h3>{it.name}</h3>
                {it.featured ? <span className="spark-plan__flag">{pick(site.lang, { ru: 'Чаще выбирают', uz: 'Ko‘proq tanlanadi', en: 'Most chosen' })}</span> : null}
              </header>
              <p className="spark-plan__price">
                {it.price}
                {it.period ? <span> {it.period}</span> : null}
              </p>
              <ul>
                {it.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </Sec>
  )
}

/** Этапы — путь солнца: каждый шаг стоит выше на дуге дня. */
function Process({ section: s }: SectionProps<'process'>) {
  const n = s.items.length
  return (
    <Sec id={s.anchor} type="process" className="spark-day-sec">
      <Head label={s.label} title={s.title} />
      <ol className="spark-day" style={{ ['--n' as string]: n }}>
        {s.items.map((it, i) => (
          <li key={i} className="spark-day__step" data-reveal="up" data-delay={String(i * 0.12)} style={{ ['--lift' as string]: `${Math.sin(((i + 0.5) / n) * Math.PI) * 56}px` }}>
            <span className="spark-day__sun" aria-hidden="true" />
            <span className="spark-day__no">{String(i + 1).padStart(2, '0')}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <Sec id={s.anchor} type="gallery" className="spark-gal-sec">
      <Head label={s.label} title={s.title} />
      <div className="spark-gal">
        {s.items.map((it, i) => (
          <figure key={i} className="spark-gal__item" data-reveal="clip" data-delay={String((i % 3) * 0.08)}>
            <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
            {it.caption ? <figcaption>{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, stats: Stats, pricing: Pricing, process: Process, gallery: Gallery },
}
