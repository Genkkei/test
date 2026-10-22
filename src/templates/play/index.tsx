import type { Site } from '@/lib/schema'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Mascot, PlayHeader, Playground } from './client'

/* ИГРА — Duolingo, Brilliant, Headspace: тёплая бумага, пять чистых цветов, круглый
   гротеск, кнопки с «толщиной», которые нажимаются, маскот из геометрии, путь обучения
   уровнями-кружками. Всё пружинит, но ничего не мельтешит. */

const COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)']
const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <PlayHeader>
        <a href="#top" className="pl-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop')}`}>
          <span className="pl-logo__dot" aria-hidden="true">
            <i />
            <i />
          </span>
          {site.name}
        </a>
        <nav className="pl-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href} style={{ ['--hc' as string]: COLORS[i % COLORS.length] }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="pl-header__side">
          {site.nav.cta.label ? (
            <a className="pl-btn pl-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </PlayHeader>
      <main id="top">{children}</main>
      <footer className="pl-footer">
        <div className="pl-footer__card">
          <Mascot className="pl-mascot pl-mascot--footer" label={pick(site.lang, { ru: 'Поли — маскот школы', uz: 'Poli — maktab maskoti', en: 'Poly, the school mascot' })} />
          <div className="pl-footer__main">
            <p className="pl-footer__name">{site.name}</p>
            <p className="pl-footer__tag">{site.tagline}</p>
            <div className="pl-footer__cols">
              <div>
                <h3>{ui(site.lang, 'address')}</h3>
                <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
                {b.hours.map((h) => (
                  <p key={h}>{humanHours(h, site.lang)}</p>
                ))}
              </div>
              <div>
                <h3>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</h3>
                {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
                {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
              </div>
              <div>
                <h3>{pick(site.lang, { ru: 'Мы тут', uz: 'Biz shu yerdamiz', en: 'Find us' })}</h3>
                <ul className="pl-footer__social">
                  {b.socials.map((s, i) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener me" style={{ background: COLORS[i % COLORS.length] }}>
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p className="pl-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const words = (s.title || site.name).split(/\s+/)
  return (
    <section id={s.anchor || undefined} className="s s-hero pl-hero">
      <Playground>
        <span className="pl-shape pl-shape--circle" data-depth="0.6" aria-hidden="true" />
        <span className="pl-shape pl-shape--tri" data-depth="0.9" aria-hidden="true" />
        <span className="pl-shape pl-shape--square" data-depth="0.4" aria-hidden="true" />
        <span className="pl-shape pl-shape--star" data-depth="1.1" aria-hidden="true">
          ★
        </span>
        <span className="pl-shape pl-shape--squiggle" data-depth="0.7" aria-hidden="true">
          <svg viewBox="0 0 120 30">
            <path d="M4 15 Q19 0 34 15 T64 15 T94 15 T124 15" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </span>
        <div className="pl-hero__grid">
          <div className="pl-hero__text">
            {s.eyebrow ? <p className="pl-hero__eyebrow pl-pop" style={{ ['--d' as string]: '0s' }}>{s.eyebrow}</p> : null}
            <h1 className="pl-hero__title">
              {words.map((w, i) => (
                <span key={i} className={`pl-w${i % 3 === 1 ? ' pl-w--hl' : ''}`} style={{ ['--d' as string]: `${0.08 + i * 0.07}s`, ['--hc' as string]: COLORS[(i * 2) % COLORS.length] }}>
                  {w}
                </span>
              ))}
            </h1>
            {s.subtitle ? (
              <p className="pl-hero__sub pl-pop" style={{ ['--d' as string]: '.55s' }}>
                {s.subtitle}
              </p>
            ) : null}
            <div className="pl-hero__ctas pl-pop" style={{ ['--d' as string]: '.7s' }}>
              {s.cta.label ? (
                <a className="pl-btn" href={s.cta.href || '#'}>
                  {s.cta.label}
                </a>
              ) : null}
              {s.ctaSecondary.label ? (
                <a className="pl-btn pl-btn--white" href={s.ctaSecondary.href || '#'}>
                  {s.ctaSecondary.label}
                </a>
              ) : null}
            </div>
          </div>
          <div className="pl-hero__mascot pl-pop" style={{ ['--d' as string]: '.3s' }}>
            {s.words.length ? (
              <ul className="pl-bubbles" aria-label={pick(site.lang, { ru: 'Приветствия', uz: 'Salomlashuvlar', en: 'Greetings' })}>
                {s.words.map((w, i) => (
                  <li key={w} style={{ ['--i' as string]: i, ['--hc' as string]: COLORS[i % COLORS.length] }}>
                    {w}
                  </li>
                ))}
              </ul>
            ) : null}
            <Mascot label={pick(site.lang, { ru: 'Поли — маскот школы', uz: 'Poli — maktab maskoti', en: 'Poly, the school mascot' })} />
          </div>
        </div>
      </Playground>
    </section>
  )
}

function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="pl-courses-sec">
      <Head label={s.label} title={s.title} center>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="pl-courses">
        {s.items.map((it, i) => (
          <article key={i} className="pl-course" data-reveal="scale" data-delay={String((i % 3) * 0.08)} style={{ ['--cc' as string]: COLORS[i % COLORS.length] }}>
            <div className="pl-course__top">
              {it.tag ? <span className="pl-course__tag">{it.tag}</span> : null}
              <span className="pl-course__icon" aria-hidden="true">
                {['A', '가', 'Ä', '?', '✎', '★'][i % 6]}
              </span>
            </div>
            <h3 className="pl-course__name">{it.title}</h3>
            {it.text ? <p className="pl-course__text">{it.text}</p> : null}
            {it.price ? <p className="pl-course__price">{it.price}</p> : null}
          </article>
        ))}
      </div>
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="pl-path-sec">
      <Head label={s.label} title={s.title} center />
      <ol className="pl-path">
        {s.items.map((it, i) => (
          <li key={i} className="pl-path__step" data-reveal="scale" data-delay={String(i * 0.08)} style={{ ['--cc' as string]: COLORS[i % COLORS.length], ['--x' as string]: [0, 1, 2, 1, 0, -1][i % 6] }}>
            <span className="pl-path__node" aria-hidden="true">
              {i === s.items.length - 1 ? '★' : i + 1}
            </span>
            <div className="pl-path__card">
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee pl-stickers" aria-label={s.title || pick(site.lang, { ru: 'Языки', uz: 'Tillar', en: 'Languages' })}>
      <Marquee items={s.items} speed={36} sep="✦" />
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, process: Process, marquee: MarqueeSec },
}
