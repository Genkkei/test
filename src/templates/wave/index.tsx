import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Caustics, Header, Timetable } from './client'

/*
 * ВОЛНА — бассейн как в рекламе Speedo и Third Space: светлая вода с каустикой на первом экране,
 * программы — дорожками с поплавковыми канатами, расписание вкладками, тёмная «глубина» в подвале.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Rope() {
  return <span className="wave-rope" aria-hidden="true" />
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <Header>
        <a href="#top" className="wave-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <svg viewBox="0 0 40 16" aria-hidden="true">
            <path d="M1 10c4-6 8-6 12 0s8 6 12 0 8-6 12 0" />
          </svg>
          {site.name}
        </a>
        <nav className="wave-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="wave-header__side">
          {site.nav.cta.label ? (
            <a className="wave-btn wave-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </Header>
      <main id="top">{children}</main>
      <footer className="wave-footer">
        <svg className="wave-footer__edge" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40c120-30 240-30 360 0s240 30 360 0 240-30 360 0 240 30 360 0V80H0z" />
        </svg>
        <div className="wave-footer__inner">
          <p className="wave-footer__word" aria-hidden="true">
            {site.name}
          </p>
          <div className="wave-footer__cols">
            <div>
              <p className="wave-k">{ui(site.lang, 'address')}</p>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            </div>
            {b.hours.length ? (
              <div>
                <p className="wave-k">{ui(site.lang, 'hours')}</p>
                {b.hours.map((h) => (
                  <p key={h}>{humanHours(h, site.lang)}</p>
                ))}
              </div>
            ) : null}
            <div>
              <p className="wave-k">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
              {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
            </div>
            <div>
              <p className="wave-k">{pick(site.lang, { ru: 'Мы в сетях', uz: 'Tarmoqlarda', en: 'Follow us' })}</p>
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              ))}
            </div>
          </div>
          <p className="wave-footer__legal">
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
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero wave-hero">
      <Caustics colors={['#bfe9f6', t.accent, '#ffffff', t.fg]} />
      <div className="wave-hero__lanes" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Rope key={i} />
        ))}
      </div>
      <div className="wave-hero__inner">
        {s.eyebrow ? (
          <p className="wave-chip" data-reveal="fade">
            <i aria-hidden="true" /> {s.eyebrow}
          </p>
        ) : null}
        <h1 className="wave-hero__title" data-split="chars">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="wave-hero__sub" data-reveal="up" data-delay="0.5">
            {s.subtitle}
          </p>
        ) : null}
        <div className="wave-hero__ctas" data-reveal="up" data-delay="0.65">
          {s.cta.label ? (
            <a className="wave-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="wave-btn wave-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {s.words.length ? (
          <ul className="wave-hero__words" data-reveal="up" data-delay="0.8">
            {s.words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="wave-hero__temp" data-reveal="fade" data-delay="0.9" aria-hidden="true">
        <span>+28</span>
        <small>°C</small>
      </div>
    </section>
  )
}

/** Программы — дорожки бассейна: номер на тумбе, канат между дорожками, пловец-точка проплывает при появлении. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="wave-lanes-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ol className="wave-lanes">
        {s.items.map((it, i) => (
          <li key={i} className="wave-lane" data-reveal="left" data-delay={String(i * 0.06)}>
            <span className="wave-lane__num" aria-hidden="true">
              {i + 1}
            </span>
            <div className="wave-lane__body">
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            <div className="wave-lane__meta">
              {it.tag ? <span className="wave-chip wave-chip--sm">{it.tag}</span> : null}
              {it.price ? <span className="wave-lane__price">{it.price}</span> : null}
            </div>
            <span className="wave-lane__swimmer" aria-hidden="true" />
            <Rope />
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Menu({ section: s, site }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="wave-tt-sec">
      <Head label={s.label} title={s.title} />
      <div data-reveal="up">
        <Timetable groups={s.groups} label={s.title || pick(site.lang, { ru: 'Расписание', uz: 'Jadval', en: 'Timetable' })} />
      </div>
    </Sec>
  )
}

/** Цифры — шкала глубины: значение крупно, тонкая линия уровня воды набирается слева. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="wave-stats-sec">
      <Head label={s.label} title={s.title} />
      <div className="wave-stats">
        {s.items.map((it, i) => (
          <div key={i} className="wave-stat" data-reveal="up" data-delay={String(i * 0.08)}>
            <p className="wave-stat__v">
              <span data-count>{it.value}</span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </p>
            <span className="wave-stat__level" aria-hidden="true" />
            <p className="wave-stat__l">{it.label}</p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <Sec id={s.anchor} type="gallery" className="wave-gal-sec">
      <Head label={s.label} title={s.title} />
      <div className="wave-gal">
        {s.items.map((it, i) => (
          <figure key={i} className="wave-gal__item" data-reveal="clip" data-delay={String(i * 0.07)}>
            <div className="wave-gal__media">
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
            </div>
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
  sections: { hero: Hero, services: Services, menu: Menu, stats: Stats, gallery: Gallery },
}
