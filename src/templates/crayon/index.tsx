import type { Site } from '@/lib/schema'
import { Logo as BrandLogo } from '@/components/brand/Logo'
import { Media } from '@/motion/art'
import { MobileMenu, Marquee } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Stickers, Trail } from './client'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const HUES = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)']

/* Каракули-значки для карточек кружков: рисуются линией, без картинок. */
const DOODLES = [
  <path key="0" d="M20 70 L50 20 L80 70 Z M35 55 H65" />,
  <path key="1" d="M50 15 L60 40 L87 40 L65 56 L74 82 L50 66 L26 82 L35 56 L13 40 L40 40 Z" />,
  <path key="2" d="M15 60 Q30 20 50 60 T85 60 M15 75 Q30 35 50 75 T85 75" />,
  <path key="3" d="M30 80 V35 A20 20 0 0 1 70 35 V80 M30 55 H70" />,
  <path key="4" d="M50 50 m-30 0 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 M50 20 V80 M20 50 H80" />,
  <path key="5" d="M20 80 L35 30 L50 65 L65 25 L80 80" />,
]

function Logo({ name }: { name: string }) {
  return (
    <>
      {Array.from(name).map((ch, i) => (
        <span key={i} style={{ color: HUES[i % HUES.length] }}>
          {ch}
        </span>
      ))}
    </>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="cr-header">
        <a href="#top" className="cr-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <BrandLogo site={site} />
          ) : (
            <>
          <Logo name={site.name} />
            </>
          )}
        </a>
        <nav className="cr-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        {site.nav.cta.label ? (
          <a className="cr-pill" href={site.nav.cta.href || '#'}>
            {site.nav.cta.label}
          </a>
        ) : null}
        <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
      </header>
      <main id="top">{children}</main>
      <footer className="cr-footer">
        <div className="cr-wave cr-wave--top" aria-hidden="true" />
        <div className="cr-footer__inner">
          <p className="cr-footer__lead">{site.tagline}</p>
          <div className="cr-footer__grid">
            <div>
              <p className="cr-footer__h">{ui(site.lang, 'address')}</p>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
              {b.hours.map((h) => (
                <p key={h}>{humanHours(h, site.lang)}</p>
              ))}
            </div>
            <div>
              <p className="cr-footer__h">{pick(site.lang, { ru: 'Связаться', uz: 'Bog‘lanish', en: 'Get in touch' })}</p>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
              {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
            </div>
            <div>
              <p className="cr-footer__h">{pick(site.lang, { ru: 'Мы в сети', uz: 'Biz tarmoqda', en: 'Find us online' })}</p>
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
          <p className="cr-footer__name" aria-hidden="true">
            <Logo name={site.name} />
          </p>
          <p className="cr-footer__legal">
            © {new Date().getFullYear()} {b.legalName || site.name}
          </p>
        </div>
      </footer>
    </>
  )
}

const SHAPES = [
  { k: 'star', d: 'M50 4 L62 36 L96 38 L69 59 L79 93 L50 73 L21 93 L31 59 L4 38 L38 36 Z' },
  { k: 'flower', d: 'M50 50 m-14 -22 a16 16 0 1 1 28 0 a16 16 0 1 1 8 26 a16 16 0 1 1 -22 18 a16 16 0 1 1 -22 -18 a16 16 0 1 1 8 -26 Z' },
  { k: 'blob', d: 'M70 12 C92 22 96 52 82 74 C68 96 32 98 16 78 C0 58 8 26 30 14 C44 6 58 6 70 12 Z' },
  { k: 'tri', d: 'M50 8 L94 88 L6 88 Z' },
  { k: 'sun', d: 'M50 30 a20 20 0 1 1 0 40 a20 20 0 1 1 0 -40 M50 2 V18 M50 82 V98 M2 50 H18 M82 50 H98 M16 16 L27 27 M73 73 L84 84 M84 16 L73 27 M27 73 L16 84' },
  { k: 'cloud', d: 'M24 74 a18 18 0 0 1 2 -36 a24 24 0 0 1 46 -6 a20 20 0 0 1 6 42 Z' },
]

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const words = (s.title || site.name).split(' ')
  return (
    <section id={s.anchor || undefined} className="s s-hero cr-hero">
      <Stickers>
        {SHAPES.map((sh, i) => (
          <svg key={sh.k} className={`cr-sticker cr-sticker--${i}`} viewBox="0 0 100 100" aria-hidden="true" style={{ ['--h' as string]: HUES[i % HUES.length] }}>
            <path d={sh.d} />
          </svg>
        ))}
      </Stickers>
      <div className="cr-hero__inner">
        {s.eyebrow ? (
          <p className="cr-hero__eyebrow" data-reveal="scale">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="cr-hero__title">
          {words.map((w, i) => (
            <span key={i} className="cr-word" style={{ ['--h' as string]: HUES[i % HUES.length], ['--i' as string]: i }}>
              {w}{' '}
            </span>
          ))}
        </h1>
        {s.subtitle ? (
          <p className="cr-hero__sub" data-reveal="up" data-delay="0.4">
            {s.subtitle}
          </p>
        ) : null}
        <div className="cr-hero__ctas" data-reveal="up" data-delay="0.55">
          {s.cta.label ? (
            <a className="cr-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="cr-btn cr-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        <p className="cr-hero__hint" data-reveal="fade" data-delay="1">
          {pick(site.lang, { ru: '↖ наклейки можно двигать', uz: '↖ stikerlarni surish mumkin', en: '↖ drag the stickers around' })}
        </p>
      </div>
      <div className="cr-wave" aria-hidden="true" />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee cr-ribbon" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={36} sep="★" />
    </section>
  )
}

/** Кружки: цветные карточки с наклоном, значок-каракуля, возраст наклейкой. */
function Clubs({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="cr-clubs">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="cr-cards">
        {s.items.map((it, i) => (
          <li key={i} className="cr-card" style={{ ['--h' as string]: HUES[i % HUES.length], ['--r' as string]: `${i % 2 ? 1.6 : -1.6}deg` }} data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <svg className="cr-card__doodle" viewBox="0 0 100 100" aria-hidden="true">
              {DOODLES[i % DOODLES.length]}
            </svg>
            {it.tag ? <span className="cr-card__age">{it.tag}</span> : null}
            <h3 className="cr-card__name">{it.title}</h3>
            {it.text ? <p className="cr-card__text">{it.text}</p> : null}
            {it.price ? <p className="cr-card__price">{it.price}</p> : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Цифры в пузырях. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="cr-stats">
      <Head label={s.label} title={s.title} />
      <dl className="cr-bubbles">
        {s.items.map((it, i) => (
          <div key={i} className="cr-bubble" style={{ ['--h' as string]: HUES[(i + 1) % HUES.length] }} data-reveal="scale" data-delay={String(i * 0.1)}>
            <dt>{it.label}</dt>
            <dd>
              <span data-count>{it.value}</span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </dd>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="cr-steps">
      <Head label={s.label} title={s.title} />
      <Trail>
        <ol className="cr-trail__list">
          {s.items.map((it, i) => (
            <li key={i} className="cr-step" style={{ ['--h' as string]: HUES[i % HUES.length] }} data-reveal="up" data-delay={String(i * 0.1)}>
              <span className="cr-step__dot">{i + 1}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </Trail>
    </Sec>
  )
}

/** Педагоги: фото в форме пятна, цвет по кругу. */
function Team({ section: s, site }: SectionProps<'team'>) {
  return (
    <Sec id={s.anchor} type="team" className="cr-team">
      <Head label={s.label} title={s.title} />
      <ul className="cr-team__grid">
        {s.items.map((it, i) => (
          <li key={i} className="cr-teacher" style={{ ['--h' as string]: HUES[i % HUES.length] }} data-reveal="up" data-delay={String((i % 4) * 0.08)}>
            <figure className="cr-teacher__media">
              <Media src={it.image} alt={`${it.name}, ${it.role}`} seed={`${site.slug}-t${i}`} colors={['#ffe08a', '#ff8fc7', '#3d7bff', '#2bb673']} kind="blobs" className="media" />
            </figure>
            <h3>{it.name}</h3>
            <p>{it.role}</p>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Clubs, stats: Stats, process: Process, team: Team },
}
