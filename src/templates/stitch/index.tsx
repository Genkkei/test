import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Seam, Tape } from './client'

/*
 * СТЕЖОК — ателье в духе Savile Row: бумага выкройки, сантиметровая лента, пунктир шва.
 * Услуги — детали выкройки («Деталь A») с линией отреза, этапы — по сантиметровой ленте,
 * цифры — бирки на нитке, отзывы — записки на квитанции.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const piece = (i: number) => 'ABCDEFGHIJKL'[i] ?? String(i + 1)

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="stitch-header">
        <a href="#top" className="stitch-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="17" />
            <path d="M9 31 31 9" />
            <circle cx="28" cy="12" r="1.6" />
          </svg>
          <span>{site.name}</span>
        </a>
        <nav className="stitch-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="stitch-header__side">
          {b.phone ? (
            <a className="stitch-header__phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="stitch-btn stitch-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="stitch-footer">
        <Tape className="stitch-tape stitch-tape--foot" />
        <div className="stitch-footer__grid">
          <div>
            <p className="stitch-footer__name">{site.name}</p>
            <p className="stitch-footer__tag">{site.tagline}</p>
          </div>
          <dl className="stitch-footer__facts">
            {b.street ? (
              <div>
                <dt>{ui(site.lang, 'address')}</dt>
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
              <dt>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</dt>
              <dd className="stitch-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div className="stitch-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero stitch-hero">
      <div className="stitch-hero__grid" aria-hidden="true" />
      <div className="stitch-hero__inner">
        <div className="stitch-hero__text">
          {s.eyebrow ? (
            <p className="stitch-hero__eyebrow" data-reveal="fade">
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="stitch-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="stitch-hero__sub" data-reveal="up" data-delay="0.5">
              {s.subtitle}
            </p>
          ) : null}
          <div className="stitch-hero__ctas" data-reveal="up" data-delay="0.65">
            {s.cta.label ? (
              <a className="stitch-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="stitch-btn stitch-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        {/* выкройка жакета: контуры прорисовываются, шов прошивается пунктиром, мерки подписаны */}
        <figure className="stitch-pattern" aria-hidden="true">
          <svg viewBox="0 0 400 480">
            <path className="stitch-pattern__cut" d="M120 40 C150 60 250 60 280 40 L350 90 L330 200 L300 190 L300 440 L100 440 L100 190 L70 200 L50 90 Z" pathLength={1} />
            <path className="stitch-pattern__seam" d="M132 58 C160 74 240 74 268 58 L334 98 L318 184 L290 176 L290 428 L110 428 L110 176 L82 184 L66 98 Z" />
            <path className="stitch-pattern__fold" d="M200 70 L200 440" />
            <path className="stitch-pattern__dart" d="M160 240 L170 330 L180 240 M220 240 L230 330 L240 240" />
            <circle className="stitch-pattern__btn" cx="200" cy="260" r="6" />
            <circle className="stitch-pattern__btn" cx="200" cy="320" r="6" />
            <circle className="stitch-pattern__btn" cx="200" cy="380" r="6" />
            <text x="206" y="150">{pick(site.lang, { ru: 'ПОЛОЧКА', uz: 'OLD BO‘LAK', en: 'FRONT' })}</text>
            <text x="112" y="470">{pick(site.lang, { ru: 'обхват груди 104', uz: 'ko‘krak aylanasi 104', en: 'chest 104' })}</text>
          </svg>
          <span className="stitch-pattern__pin stitch-pattern__pin--a" />
          <span className="stitch-pattern__pin stitch-pattern__pin--b" />
          <figcaption>{pick(site.lang, { ru: 'Выкройка № 01 · по вашим меркам', uz: 'Andoza № 01 · sizning o‘lchamlaringiz bo‘yicha', en: 'Pattern No. 01 · cut to your measurements' })}</figcaption>
        </figure>
      </div>
      <Tape />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee stitch-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={44} sep="✂" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="stitch-about">
      <div className="stitch-about__grid">
        <div>
          <p className="s__label" data-reveal="fade">
            {s.label}
          </p>
          <h2 className="s__title" data-split="lines">
            {s.title}
          </h2>
        </div>
        <div className="stitch-about__body">
          {s.text ? (
            <p className="stitch-about__text" data-reveal="up">
              {s.text}
            </p>
          ) : null}
          <figure className="stitch-swatch" data-reveal="clip">
            <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="stripes" className="media" />
          </figure>
        </div>
      </div>
      <Seam d="M0 60 C200 10 400 110 600 60 S1000 10 1200 60" />
    </Sec>
  )
}

/** Услуги — детали выкройки: буква детали, линия отреза пунктиром, ножницы на углу. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="stitch-pieces-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ol className="stitch-pieces">
        {s.items.map((it, i) => (
          <li key={i} className="stitch-piece" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <span className="stitch-piece__scissors" aria-hidden="true">
              ✂
            </span>
            <p className="stitch-piece__id">
              {pick(site.lang, { ru: 'Деталь', uz: 'Bo‘lak', en: 'Piece' })} {piece(i)}
              {it.tag ? <span> · {it.tag}</span> : null}
            </p>
            <h3 className="stitch-piece__name">{it.title}</h3>
            {it.text ? <p className="stitch-piece__text">{it.text}</p> : null}
            {it.price ? <p className="stitch-piece__price">{it.price}</p> : null}
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Этапы — отметки на сантиметровой ленте, которая тянется через весь блок. */
function Process({ section: s, site }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="stitch-steps-sec">
      <Head label={s.label} title={s.title} />
      <ol className="stitch-steps">
        {s.items.map((it, i) => (
          <li key={i} className="stitch-step" data-reveal="up" data-delay={String(i * 0.1)}>
            <span className="stitch-step__mark">
              {(i + 1) * 10} {pick(site.lang, { ru: 'см', uz: 'sm', en: 'cm' })}
            </span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Цифры — бирки на нитке, слегка покачиваются. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="stitch-tags-sec">
      <Head label={s.label} title={s.title} />
      <dl className="stitch-tags">
        {s.items.map((it, i) => (
          <div key={i} className="stitch-tag" data-reveal="up" data-delay={String(i * 0.08)} style={{ ['--sw' as string]: `${[-3, 2, -2, 3][i % 4]}deg`, ['--d' as string]: `${i * 0.4}s` }}>
            <dd className="stitch-tag__value">
              <span data-count>{it.value}</span>
              {it.suffix ? <span className="stitch-tag__suffix">{it.suffix}</span> : null}
            </dd>
            <dt className="stitch-tag__label">{it.label}</dt>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

/** Отзывы — квитанции заказа с номером и подписью. */
function Testimonials({ section: s, site }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="stitch-notes-sec">
      <Head label={s.label} title={s.title} />
      <div className="stitch-notes">
        {s.items.map((it, i) => (
          <figure key={i} className="stitch-note" data-reveal="up" data-delay={String(i * 0.1)}>
            <p className="stitch-note__no">
              {pick(site.lang, { ru: 'Квитанция', uz: 'Kvitansiya', en: 'Receipt' })} № {String(1040 + i * 37).padStart(5, '0')}
            </p>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              <b>{it.author}</b>
              {it.role ? <span>{it.role}</span> : null}
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
  sections: { hero: Hero, marquee: MarqueeSec, about: About, services: Services, process: Process, stats: Stats, testimonials: Testimonials },
}
