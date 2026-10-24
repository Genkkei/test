import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { humanHours, pick, ui } from '@/lib/i18n'
import { rng } from '@/motion/art'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { WhiskMotion } from './client'

/*
 * ВЕНЧИК — матча-бар. Первый экран — чаша сверху, нарисованная целиком (без фото): венчик проводит «М»,
 * поверхность светлеет от тёмной зелени к пене, пузырьки проступают от центра к краю, таймер идёт до
 * 15 секунд (цифры из раздела «Цифры»: 75° и 15 сек). Названия напитков — вертикальные столбцы, как меню
 * японской чайной. Ритуал — четыре значка (сито, вода 75°, «М», чаша), набор домой — норэны.
 * Порядок: бумага → чаша → вода → «М» трижды + пена + таймер → столбцы напитков → заголовок → кнопки.
 * Шрифты: Mulish 200–300 (заголовки, цифры), Noto Sans (текст), Overpass Mono (метки, цены).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Bowl({ seed }: { seed: string }) {
  const r = rng(seed)
  const bubbles = Array.from({ length: 260 }, () => {
    const a = r() * Math.PI * 2
    const d = Math.sqrt(r()) * 142
    return { x: 200 + Math.cos(a) * d, y: 200 + Math.sin(a) * d, s: 0.8 + r() * r() * 3.4, k: d / 142 }
  })
  return (
    <svg className="whisk-bowl" viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <radialGradient id="whisk-glaze" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#f1ece0" />
          <stop offset=".7" stopColor="#d6cfbd" />
          <stop offset="1" stopColor="#a69d88" />
        </radialGradient>
        <radialGradient id="whisk-wall" cx="50%" cy="50%" r="50%">
          <stop offset=".8" stopColor="#5d6a4c" />
          <stop offset="1" stopColor="#2f3a25" />
        </radialGradient>
        <clipPath id="whisk-liquid">
          <circle cx="200" cy="200" r="150" />
        </clipPath>
      </defs>
      <ellipse cx="208" cy="214" rx="196" ry="192" fill="rgba(40,50,30,.18)" className="whisk-bowl__shade" />
      <circle cx="200" cy="200" r="190" fill="url(#whisk-glaze)" />
      <circle cx="200" cy="200" r="166" fill="url(#whisk-wall)" />
      <g clipPath="url(#whisk-liquid)">
        <circle cx="200" cy="200" r="150" className="whisk-bowl__liquid" />
        {bubbles.map((b, i) => (
          <circle key={i} cx={b.x.toFixed(1)} cy={b.y.toFixed(1)} r={b.s.toFixed(2)} className="whisk-bowl__bubble" style={{ ['--k' as string]: b.k.toFixed(3), ['--j' as string]: (i % 7) / 7 }} />
        ))}
        <path className="whisk-bowl__m" d="M90 290 L130 110 L200 240 L270 110 L310 290" pathLength="1" />
      </g>
      <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <WhiskMotion />
      <header className="whisk-bar">
        <a href="#top" className="whisk-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="whisk-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="whisk-bar__side">
          {site.nav.cta.label ? (
            <a className="whisk-btn whisk-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="whisk-foot">
        <p className="whisk-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="whisk-foot__cols">
          <p>{site.tagline}</p>
          {address ? (
            <p>
              <small>{ui(site.lang, 'address')}</small>
              {address}
            </p>
          ) : null}
          {b.hours.length ? (
            <p>
              <small>{ui(site.lang, 'hours')}</small>
              {b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}
            </p>
          ) : null}
          <p>
            <small>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</small>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </p>
        </div>
        <p className="whisk-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const stats = site.sections.find((x) => x.type === 'stats' && x.enabled)
  const nums = stats && stats.type === 'stats' ? stats.items.slice(0, 2) : []
  const words = s.words.filter(Boolean)
  return (
    <section id={s.anchor || undefined} className="s s-hero whisk-hero" data-whisk-hero>
      <div className="whisk-hero__stage">
        <Bowl seed={`${site.slug}-foam`} />
        {nums.length ? (
          <dl className="whisk-readouts">
            {nums.map((n, i) => (
              <div key={i} style={{ ['--i' as string]: i }}>
                <dt>{n.label}</dt>
                <dd data-whisk-count={i === 1 ? n.value : undefined}>
                  {n.value}
                  {n.suffix ? <small>{n.suffix.trim()}</small> : null}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      {words.length ? (
        <ul className="whisk-columns" aria-label={words.join(', ')}>
          {words.map((w, i) => (
            <li key={i} style={{ ['--i' as string]: i }}>
              {w}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="whisk-hero__text">
        {s.eyebrow ? <p className="whisk-label whisk-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="whisk-title whisk-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="whisk-hero__sub whisk-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="whisk-hero__ctas whisk-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="whisk-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="whisk-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function Notes({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s whisk-notes" aria-label={s.items.join(', ')}>
      <ul>
        {s.items.map((m, i) => (
          <li key={i} data-wk="rise" style={{ ['--i' as string]: i }}>
            {m}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu whisk-menu">
      <div className="whisk-head" data-wk="rise">
        {s.label ? <p className="whisk-label">{s.label}</p> : null}
        {s.title ? <h2 className="whisk-h2">{s.title}</h2> : null}
      </div>
      <div className="whisk-menu__cols">
        {s.groups.map((g, gi) => (
          <div key={gi} className="whisk-menu__group" data-wk="rise" style={{ ['--i' as string]: gi }}>
            <h3>{g.name}</h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={i}>
                  <b>{it.name}</b>
                  <em>{it.price}</em>
                  {it.text ? <span>{it.text}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Ритуал — четыре значка: сито, вода 75°, «М» венчика, чаша. */
function Process({ section: s }: SectionProps<'process'>) {
  const icons = [
    <g key="0">
      <circle cx="24" cy="22" r="13" />
      <path d="M11 22h26M14 15h20M14 29h20M24 9v26M17 11v22M31 11v22M37 22l8 5" />
    </g>,
    <g key="1">
      <path d="M12 18h22v18a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V18Z" />
      <path d="M34 22h4a4 4 0 0 1 0 8h-4M18 12c0-3 3-3 3-6M26 12c0-3 3-3 3-6" />
    </g>,
    <path key="2" d="M8 38 L15 10 L24 30 L33 10 L40 38" />,
    <g key="3">
      <path d="M8 22h32a16 14 0 0 1-32 0Z" />
      <path d="M14 22c3 3 17 3 20 0" />
    </g>,
  ]
  return (
    <section id={s.anchor || undefined} className="s s-process whisk-ritual">
      <div className="whisk-head" data-wk="rise">
        {s.label ? <p className="whisk-label">{s.label}</p> : null}
        {s.title ? <h2 className="whisk-h2">{s.title}</h2> : null}
      </div>
      <ol className="whisk-ritual__list">
        {s.items.map((it, i) => (
          <li key={i} data-wk="draw" style={{ ['--i' as string]: i }}>
            <svg viewBox="0 0 48 48" aria-hidden="true">
              {icons[i % icons.length]}
            </svg>
            <h3>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {it.title}
            </h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Набор домой — норэны: полотна, разрезанные снизу, с тегом и ценой. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services whisk-noren">
      <div className="whisk-head" data-wk="rise">
        {s.label ? <p className="whisk-label">{s.label}</p> : null}
        {s.title ? <h2 className="whisk-h2">{s.title}</h2> : null}
      </div>
      <ul className="whisk-noren__list">
        {s.items.map((it, i) => (
          <li key={i} data-wk="hang" style={{ ['--i' as string]: i }}>
            {it.tag ? <span className="whisk-noren__tag">{it.tag}</span> : null}
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            {it.price ? <b>{it.price}</b> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats whisk-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-wk="rise" style={{ ['--i' as string]: i }}>
            <dd>
              {it.value}
              {it.suffix ? <small>{it.suffix.trim()}</small> : null}
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials whisk-voices">
      <div className="whisk-head" data-wk="rise">
        {s.label ? <p className="whisk-label">{s.label}</p> : null}
        {s.title ? <h2 className="whisk-h2">{s.title}</h2> : null}
      </div>
      <div className="whisk-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-wk="rise" style={{ ['--i' as string]: i }}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              {it.author}
              {it.role ? <span>{it.role}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq whisk-faq">
      <div className="whisk-head" data-wk="rise">
        {s.label ? <p className="whisk-label">{s.label}</p> : null}
        {s.title ? <h2 className="whisk-h2">{s.title}</h2> : null}
      </div>
      <div className="whisk-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item whisk-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i aria-hidden="true" />
            </summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function Contact({ section: s, site }: SectionProps<'contact'>) {
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-contact whisk-contact">
      <div className="whisk-contact__enso" aria-hidden="true" />
      <div className="whisk-contact__text" data-wk="rise">
        {s.label ? <p className="whisk-label">{s.label}</p> : null}
        {s.title ? <h2 className="whisk-contact__title">{s.title}</h2> : null}
        {s.text ? <p>{s.text}</p> : null}
        <div className="whisk-hero__ctas">
          {s.cta.label ? (
            <a className="whisk-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="whisk-link" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: Notes, menu: Menu, process: Process, services: Services, stats: Stats, testimonials: Testimonials, faq: Faq, contact: Contact },
}
