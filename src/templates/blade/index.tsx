import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { OpenSign, Rotator } from './client'

/*
 * ОПАСНАЯ БРИТВА — барбершоп в духе Schorem: высокая печать (буквы вдавлены в бумагу,
 * краска легла неровно), ленты-баннеры, крутящийся барбер-столб, прайс как доска с
 * буквами, мастера карточками-«розыском», отзывы газетными вырезками.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const roman = (n: number) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][n] ?? String(n + 1)

function Pole({ className = '' }: { className?: string }) {
  return (
    <span className={`blade-pole ${className}`} aria-hidden="true">
      <i />
      <b />
    </span>
  )
}

/** Лента-баннер: середина с текстом и два хвоста с вырезом. */
function Ribbon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`blade-ribbon ${className}`}>
      <span className="blade-ribbon__tail" aria-hidden="true" />
      <span className="blade-ribbon__body">{children}</span>
      <span className="blade-ribbon__tail blade-ribbon__tail--r" aria-hidden="true" />
    </span>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const est = b.founded ? `${pick(site.lang, { ru: 'С', uz: '', en: 'Est.' })} ${b.founded}${pick(site.lang, { ru: ' г.', uz: '-yildan', en: '' })}`.trim() : ''
  return (
    <>
      <header className="blade-header">
        <a href="#top" className="blade-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <Pole className="blade-pole--mini" />
          <span>{site.name}</span>
        </a>
        <nav className="blade-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="blade-header__side">
          <OpenSign hours={b.hours} lang={site.lang} />
          {site.nav.cta.label ? (
            <a className="blade-btn blade-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="blade-footer">
        <div className="blade-stripes" aria-hidden="true" />
        <div className="blade-footer__inner">
          <div className="blade-footer__brand">
            <Ribbon>{est || site.name}</Ribbon>
            <p className="blade-footer__name blade-press" aria-hidden="true">
              {site.name}
            </p>
            <p className="blade-footer__tag">{site.tagline}</p>
          </div>
          <dl className="blade-footer__facts">
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
              <dt>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</dt>
              <dd className="blade-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div className="blade-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>✂ {pick(site.lang, { ru: 'Только по записи и живой очереди', uz: 'Yozilish va jonli navbat bo‘yicha', en: 'Appointments and walk-ins' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-hero blade-hero">
      <div className="blade-hero__paper" aria-hidden="true" />
      <div className="blade-hero__frame">
        <span className="blade-corner blade-corner--tl" aria-hidden="true" />
        <span className="blade-corner blade-corner--tr" aria-hidden="true" />
        <span className="blade-corner blade-corner--bl" aria-hidden="true" />
        <span className="blade-corner blade-corner--br" aria-hidden="true" />
        <div className="blade-hero__top">
          {s.eyebrow ? (
            <p className="blade-hero__eyebrow blade-in" style={{ ['--d' as string]: '.1s' }}>
              ★ {s.eyebrow} ★
            </p>
          ) : null}
        </div>
        <div className="blade-hero__center">
          <Pole className="blade-pole--hero blade-pole--l" />
          <div className="blade-hero__type">
            <Ribbon className="blade-in blade-ribbon--hero">{b.city || pick(site.lang, { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent' })}</Ribbon>
            <h1 className="blade-hero__title blade-press">
              <span data-split="chars">{s.title || site.name}</span>
            </h1>
            {s.words.length ? (
              <p className="blade-hero__rot blade-in" style={{ ['--d' as string]: '.7s' }}>
                <span>{pick(site.lang, { ru: 'Здесь', uz: 'Bu yerda', en: 'Here:' })}</span> <Rotator words={s.words} />
              </p>
            ) : null}
          </div>
          <Pole className="blade-pole--hero blade-pole--r" />
        </div>
        <div className="blade-hero__foot">
          {s.subtitle ? (
            <p className="blade-hero__sub blade-in" style={{ ['--d' as string]: '.9s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="blade-hero__ctas blade-in" style={{ ['--d' as string]: '1.05s' }}>
            {s.cta.label ? (
              <a className="blade-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="blade-btn blade-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          <div className="blade-stamp blade-in" style={{ ['--d' as string]: '1.2s' }} aria-hidden="true">
            <span>{b.founded || '★'}</span>
            <small>{pick(site.lang, { ru: 'мужская стрижка', uz: 'erkaklar soch turmagi', en: 'gentlemen’s cuts' })}</small>
          </div>
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee blade-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <div className="blade-stripes blade-stripes--thin" aria-hidden="true" />
      <Marquee items={s.items} speed={36} sep="✂" />
      <div className="blade-stripes blade-stripes--thin blade-stripes--rev" aria-hidden="true" />
    </section>
  )
}

/** Прайс — доска с буквами: строка «услуга ….. цена», рядом пометка-штамп. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="blade-board-sec">
      <Head label={s.label} title={s.title} center>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="blade-board" data-reveal="up">
        <div className="blade-board__head" aria-hidden="true">
          <span>{pick(site.lang, { ru: 'Прейскурант', uz: 'Narxnoma', en: 'Price list' })}</span>
          <span>№ {site.business.founded || '1'}</span>
        </div>
        <ol className="blade-board__list">
          {s.items.map((it, i) => (
            <li key={i} className="blade-board__row">
              <div className="blade-board__line">
                <span className="blade-board__num">{roman(i)}.</span>
                <h3 className="blade-board__name">{it.title}</h3>
                <span className="blade-board__dots" aria-hidden="true" />
                <span className="blade-board__price">{it.price}</span>
              </div>
              <div className="blade-board__sub">
                {it.text ? <p>{it.text}</p> : null}
                {it.tag ? <span className="blade-board__tag">{it.tag}</span> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  )
}

/** Мастера — карточки в духе старых плакатов «разыскивается». */
function Team({ section: s, site }: SectionProps<'team'>) {
  return (
    <Sec id={s.anchor} type="team" className="blade-team-sec">
      <Head label={s.label} title={s.title} />
      <ul className="blade-team">
        {s.items.map((it, i) => (
          <li key={i} className="blade-card" data-reveal="up" data-delay={String(i * 0.08)} style={{ ['--tilt' as string]: `${[-2.2, 1.6, -1, 2.4][i % 4]}deg` }}>
            <p className="blade-card__top">{pick(site.lang, { ru: 'Мастер', uz: 'Usta', en: 'Barber' })} № {i + 1}</p>
            <figure className="blade-card__media">
              <Media src={it.image} alt={`${it.name}, ${it.role}`} seed={`${site.slug}-t${i}`} colors={palette(site)} kind="arch" className="media" />
            </figure>
            <h3 className="blade-card__name">{it.name}</h3>
            <p className="blade-card__role">{it.role}</p>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Отзывы — газетные вырезки, приколотые под углом. */
function Testimonials({ section: s, site }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="blade-news-sec">
      <Head label={s.label} title={s.title} />
      <div className="blade-news">
        {s.items.map((it, i) => (
          <figure key={i} className="blade-clip" data-reveal="scale" data-delay={String(i * 0.1)} style={{ ['--tilt' as string]: `${[1.4, -1.8, 0.8, -1.2][i % 4]}deg` }}>
            <p className="blade-clip__mast">
              {pick(site.lang, { ru: 'Вести района', uz: 'Mahalla xabarlari', en: 'Neighbourhood News' })} · {roman(i)}
            </p>
            <blockquote>«{it.quote}»</blockquote>
            <figcaption>
              — {it.author}
              {it.role ? <span>, {it.role}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="blade-ritual-sec">
      <Head label={s.label} title={s.title} center />
      <ol className="blade-ritual">
        {s.items.map((it, i) => (
          <li key={i} className="blade-ticket" data-reveal="up" data-delay={String(i * 0.08)}>
            <span className="blade-ticket__no">{roman(i)}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, team: Team, testimonials: Testimonials, process: Process },
}
