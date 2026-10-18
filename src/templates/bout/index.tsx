import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { RoundTimer } from './client'

/*
 * РАУНД — клуб бокса в духе Everlast, Rumble Boxing и старых афиш боёв: огромный узкий шрифт,
 * красный угол ринга, табло раунда с таймером, программы строками-контурами, тренеры
 * карточками «tale of the tape», абонементы за канатами ринга.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="bout-header">
        <a href="#top" className="bout-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <i aria-hidden="true" />
          {site.name}
        </a>
        <nav className="bout-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="bout-header__side">
          {site.nav.cta.label ? (
            <a className="bout-btn bout-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="bout-footer">
        <div className="bout-footer__poster" aria-hidden="true">
          <span>{site.name}</span>
          <span>{site.business.city || pick(site.lang, { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent' })}</span>
        </div>
        <div className="bout-footer__grid">
          <p className="bout-footer__lead">{site.tagline}</p>
          {b.street ? (
            <div>
              <small>{ui(site.lang, 'address')}</small>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            </div>
          ) : null}
          {b.hours.length ? (
            <div>
              <small>{ui(site.lang, 'hours')}</small>
              <p>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</p>
            </div>
          ) : null}
          <div>
            <small>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</small>
            <p className="bout-footer__links">
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </p>
          </div>
        </div>
        <div className="bout-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Первая тренировка — бесплатно', uz: 'Birinchi mashg‘ulot — bepul', en: 'First session free' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const words = (s.title || site.name).split(' ')
  return (
    <section id={s.anchor || undefined} className="s s-hero bout-hero">
      <div className="bout-hero__slash" aria-hidden="true" />
      <div className="bout-hero__ropes" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="bout-hero__inner">
        {s.eyebrow ? (
          <p className="bout-hero__eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="bout-hero__title">
          {words.map((w, i) => (
            <span key={i} className="bout-hero__word" style={{ ['--bout-i' as string]: i }}>
              <span>{w}</span>{' '}
            </span>
          ))}
        </h1>
        <div className="bout-hero__foot">
          <RoundTimer labels={{ round: pick(site.lang, { ru: 'Раунд', uz: 'Raund', en: 'Round' }), fight: pick(site.lang, { ru: 'Бой', uz: 'Jang', en: 'Fight' }), rest: pick(site.lang, { ru: 'Отдых', uz: 'Dam olish', en: 'Rest' }) }} />
          <div className="bout-hero__copy">
            {s.subtitle ? (
              <p className="bout-hero__sub" data-reveal="up" data-delay="0.6">
                {s.subtitle}
              </p>
            ) : null}
            <div className="bout-hero__ctas" data-reveal="up" data-delay="0.75">
              {s.cta.label ? (
                <a className="bout-btn" href={s.cta.href || '#'} data-magnetic>
                  {s.cta.label}
                </a>
              ) : null}
              {s.ctaSecondary.label ? (
                <a className="bout-btn bout-btn--ghost" href={s.ctaSecondary.href || '#'}>
                  {s.ctaSecondary.label}
                </a>
              ) : null}
            </div>
          </div>
        </div>
        {s.words.length ? (
          <ul className="bout-hero__card" data-reveal="up" data-delay="0.9">
            {s.words.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee bout-tape" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={30} sep="■" />
    </section>
  )
}

/** Программы — строки-контуры во всю ширину: при наведении буквы заливаются красным. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="bout-prog-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ol className="bout-prog">
        {s.items.map((it, i) => (
          <li key={i} className="bout-prog__row" data-reveal="up" data-delay={String(i * 0.05)}>
            <span className="bout-prog__no">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="bout-prog__name" data-text={it.title}>
              {it.title}
            </h3>
            <div className="bout-prog__meta">
              {it.tag ? <span className="bout-prog__tag">{it.tag}</span> : null}
              {it.price ? <span className="bout-prog__price">{it.price}</span> : null}
            </div>
            {it.text ? <p className="bout-prog__text">{it.text}</p> : null}
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Тренеры — «tale of the tape»: имя крупно, специализация, номер угла. */
function Team({ section: s, site }: SectionProps<'team'>) {
  return (
    <Sec id={s.anchor} type="team" className="bout-team-sec">
      <Head label={s.label} title={s.title} />
      <ul className="bout-team">
        {s.items.map((it, i) => (
          <li key={i} className="bout-coach" data-reveal="up" data-delay={String(i * 0.08)}>
            <figure className="bout-coach__media">
              <Media src={it.image} alt={`${it.name}, ${it.role}`} seed={`${site.slug}-t${i}`} colors={palette(site)} kind="stripes" className="media" />
              <span className="bout-coach__corner">{i % 2 ? pick(site.lang, { ru: 'Синий угол', uz: 'Ko‘k burchak', en: 'Blue corner' }) : pick(site.lang, { ru: 'Красный угол', uz: 'Qizil burchak', en: 'Red corner' })}</span>
            </figure>
            <h3 className="bout-coach__name">{it.name}</h3>
            <p className="bout-coach__role">{it.role}</p>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Путь новичка — раунды: номер раунда крупно, гонг между ними. */
function Process({ section: s, site }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="bout-rounds-sec">
      <Head label={s.label} title={s.title} />
      <ol className="bout-rounds">
        {s.items.map((it, i) => (
          <li key={i} className="bout-round" data-reveal="up" data-delay={String(i * 0.08)}>
            <span className="bout-round__label">{pick(site.lang, { ru: 'Раунд', uz: 'Raund', en: 'Round' })}</span>
            <span className="bout-round__no">{i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Абонементы — за канатами ринга. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="bout-ring-sec">
      <Head label={s.label} title={s.title} />
      <div className="bout-ring">
        {s.items.map((it, i) => (
          <article key={i} className={`bout-plan${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            {it.featured ? <span className="bout-plan__belt">{pick(site.lang, { ru: 'Чемпион продаж', uz: 'Eng ko‘p tanlanadi', en: 'Most popular' })}</span> : null}
            <h3 className="bout-plan__name">{it.name}</h3>
            <p className="bout-plan__price">{it.price}</p>
            {it.period ? <p className="bout-plan__period">{it.period}</p> : null}
            <ul className="bout-plan__features">
              {it.features.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, team: Team, process: Process, pricing: Pricing },
}
