import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Grain, Slab, speciesOf } from './wood'

/*
 * СТОЛЯРКА — мастерская мебели из массива в духе Benchmark и George Nakashima:
 * тёплая древесная бумага, антиква, спил с годовыми кольцами на первом экране,
 * изделия строками рабочей тетради, породы образцами с волокнами, шаги — по рулетке.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="joinery-header">
        <a href="#top" className="joinery-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="14" />
            <circle cx="15" cy="16.5" r="9.5" />
            <circle cx="14.5" cy="17" r="5" />
          </svg>
          <span>{site.name}</span>
        </a>
        <nav className="joinery-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="joinery-header__side">
          {site.nav.cta.label ? (
            <a className="joinery-btn joinery-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="joinery-footer">
        <div className="joinery-footer__head">
          <p className="joinery-footer__name">{site.name}</p>
          <p className="joinery-footer__tag">{site.tagline}</p>
        </div>
        <dl className="joinery-footer__facts">
          {b.street ? (
            <div>
              <dt>{pick(site.lang, { ru: 'Мастерская', uz: 'Ustaxona', en: 'Workshop' })}</dt>
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
            <dd className="joinery-footer__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </dd>
          </div>
        </dl>
        <p className="joinery-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Сделано руками в Ташкенте', uz: 'Toshkentda qo‘lda yasalgan', en: 'Made by hand in Tashkent' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero joinery-hero">
      <div className="joinery-hero__inner">
        <div className="joinery-hero__text">
          {s.eyebrow ? (
            <p className="joinery-eyebrow joinery-in" style={{ ['--d' as string]: '.1s' }}>
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="joinery-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="joinery-hero__sub joinery-in" style={{ ['--d' as string]: '.6s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="joinery-hero__ctas joinery-in" style={{ ['--d' as string]: '.75s' }}>
            {s.cta.label ? (
              <a className="joinery-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="joinery-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
        <figure className="joinery-hero__slab">
          <div data-parallax="0.12">
            <Slab />
          </div>
          {s.words.length ? (
            <figcaption className="joinery-hero__notes">
              {s.words.map((w, i) => (
                <span key={w} className="joinery-in" style={{ ['--d' as string]: `${1 + i * 0.15}s` }}>
                  {w}
                </span>
              ))}
            </figcaption>
          ) : null}
        </figure>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee joinery-words" aria-label={s.title || undefined}>
      <ul>
        {s.items.map((w, i) => (
          <li key={i} data-reveal="up" data-delay={String(i * 0.05)}>
            {w}
          </li>
        ))}
      </ul>
    </section>
  )
}

function About({ section: s }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="joinery-about">
      <Head label={s.label} title={s.title} />
      <p className="joinery-about__text" data-reveal="up">
        {s.text}
      </p>
    </Sec>
  )
}

/** Изделия — строки рабочей тетради: номер, название, порода образцом, цена «от» и срок. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="joinery-ledger">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ol className="joinery-ledger__list">
        {s.items.map((it, i) => (
          <li key={i} className="joinery-row" data-reveal="up" data-delay={String(i * 0.05)}>
            <span className="joinery-row__num">№{String(i + 1).padStart(2, '0')}</span>
            <Grain species={speciesOf(`${it.tag} ${it.title}`, i)} className="joinery-row__grain" />
            <div className="joinery-row__main">
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            <div className="joinery-row__meta">
              {it.tag ? <span>{it.tag}</span> : null}
              {it.price ? <b>{it.price}</b> : null}
            </div>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Породы — образцы древесины: волокна, цена, свойства. */
function Pricing({ section: s }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="joinery-woods">
      <Head label={s.label} title={s.title} />
      <div className="joinery-woods__grid">
        {s.items.map((it, i) => (
          <article key={i} className={`joinery-wood${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            <Grain species={speciesOf(it.name, i)} className="joinery-wood__grain" />
            <div className="joinery-wood__body">
              <h3>{it.name}</h3>
              <p className="joinery-wood__price">
                {it.price}
                {it.period ? <small> {it.period}</small> : null}
              </p>
              <ul>
                {it.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </Sec>
  )
}

/** Шаги по рулетке: слева лента с делениями, она «вытягивается», пока листаешь блок. */
function Process({ section: s, site }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="joinery-steps">
      <Head label={s.label} title={s.title} />
      <ol className="joinery-tape" data-reveal="fade">
        <span className="joinery-tape__band" aria-hidden="true" />
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="joinery-tape__mark">
              {(i + 1) * 20} {pick(site.lang, { ru: 'см', uz: 'sm', en: 'cm' })}
            </span>
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
    <Sec id={s.anchor} type="stats" className="joinery-stats">
      <Head label={s.label} title={s.title} />
      <dl className="joinery-stats__grid">
        {s.items.map((it, i) => (
          <div key={i} data-reveal="up" data-delay={String(i * 0.08)}>
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

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, about: About, services: Services, pricing: Pricing, process: Process, stats: Stats },
}
