import './style.css'
import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Picker } from './client'
import { Icon } from './icons'

/*
 * ЩИТ — страхование в духе Lemonade, Oscar, Hippo: дружелюбно, крупно, розовый на тёплом белом.
 * Первый экран — щит, который прорисовывается и наполняется, вокруг плавают виды страховок;
 * услуги — выбор «что защитить» с карточкой полиса; этапы — переписка, как в их чат-боте.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="shield-header">
        <a href="#top" className="shield-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.5 20 5.5v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10v-6l8-3Z" />
          </svg>
          {site.name}
        </a>
        <nav className="shield-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="shield-header__side">
          {site.nav.cta.label ? (
            <a className="shield-btn shield-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="shield-footer">
        <div className="shield-footer__card">
          <p className="shield-footer__name">{site.name}</p>
          <p className="shield-footer__tag">{site.tagline}</p>
          <ul className="shield-footer__facts">
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
          <div className="shield-footer__bottom">
            <span>
              © {new Date().getFullYear()} {b.legalName || site.name}
            </span>
            <span className="shield-footer__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const chips = s.words.slice(0, 6)
  return (
    <section id={s.anchor || undefined} className="s s-hero shield-hero">
      <div className="shield-hero__inner">
        <div className="shield-hero__text">
          {s.eyebrow ? (
            <p className="shield-hero__eyebrow" data-reveal="fade">
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="shield-hero__title">
            <span data-split="words">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="shield-hero__sub" data-reveal="up" data-delay="0.45">
              {s.subtitle}
            </p>
          ) : null}
          <div className="shield-hero__ctas" data-reveal="up" data-delay="0.6">
            {s.cta.label ? (
              <a className="shield-btn shield-btn--xl" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="shield-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
        <div className="shield-hero__art" aria-hidden="true">
          <svg className="shield-big" viewBox="0 0 200 230">
            <defs>
              <clipPath id="shield-fill">
                <path d="M100 12 182 42v64c0 54-34 92-82 112-48-20-82-58-82-112V42Z" />
              </clipPath>
            </defs>
            <path className="shield-big__fill" d="M100 12 182 42v64c0 54-34 92-82 112-48-20-82-58-82-112V42Z" />
            <rect className="shield-big__water" x="0" y="0" width="200" height="240" clipPath="url(#shield-fill)" />
            <path className="shield-big__line" d="M100 12 182 42v64c0 54-34 92-82 112-48-20-82-58-82-112V42Z" pathLength={1} />
            <path className="shield-big__check" d="M64 118 90 144 140 90" pathLength={1} />
          </svg>
          {chips.map((w, i) => (
            <span key={i} className={`shield-chip shield-chip--${i}`} style={{ ['--d' as string]: `${0.9 + i * 0.15}s` }}>
              <Icon i={i} />
              {w}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="shield-pick-sec">
      <Head label={s.label} title={s.title} center>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div data-reveal="up">
        <Picker items={s.items} cta={site.nav.cta.label || pick(site.lang, { ru: 'Оформить', uz: 'Rasmiylashtirish', en: 'Get covered' })} ctaHref={site.nav.cta.href || '#contact'} fromLabel={pick(site.lang, { ru: 'Стоимость полиса', uz: 'Polis narxi', en: 'Policy price' })} />
      </div>
    </Sec>
  )
}

/** Этапы — переписка: сообщение «печатается», потом появляется пузырь. */
function Process({ section: s, site }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="shield-chat-sec">
      <Head label={s.label} title={s.title} />
      <div className="shield-chat">
        <div className="shield-chat__top">
          <span className="shield-chat__avatar" aria-hidden="true">
            {site.name.slice(0, 1)}
          </span>
          <div>
            <b>{site.name}</b>
            <small>{pick(site.lang, { ru: 'в сети', uz: 'onlayn', en: 'online' })}</small>
          </div>
        </div>
        <ol className="shield-chat__list">
          {s.items.map((it, i) => (
            <li key={i} className={`shield-msg${i % 2 ? ' shield-msg--me' : ''}`} data-reveal="up" data-delay={String(i * 0.35)}>
              <span className="shield-msg__typing" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <div className="shield-msg__bubble">
                <b>{it.title}</b>
                <span>{it.text}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="shield-stats-sec">
      <Head label={s.label} title={s.title} />
      <dl className="shield-stats">
        {s.items.map((it, i) => (
          <div key={i} className="shield-stat" data-reveal="scale" data-delay={String(i * 0.08)}>
            <dd>
              <span data-count>{it.value}</span>
              {it.suffix ? <span className="shield-stat__suffix">{it.suffix}</span> : null}
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
    <Sec id={s.anchor} type="testimonials" className="shield-reviews-sec">
      <Head label={s.label} title={s.title} />
      <div className="shield-reviews">
        {s.items.map((it, i) => (
          <figure key={i} className="shield-review" data-reveal="up" data-delay={String(i * 0.1)} style={{ ['--tilt' as string]: `${[-1.5, 1, -0.6][i % 3]}deg` }}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              <span className="shield-review__ava" aria-hidden="true">
                {it.author.slice(0, 1)}
              </span>
              <span>
                <b>{it.author}</b>
                {it.role ? <small>{it.role}</small> : null}
              </span>
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
  sections: { hero: Hero, services: Services, process: Process, stats: Stats, testimonials: Testimonials },
}
