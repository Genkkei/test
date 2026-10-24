import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media, rng } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { TubeMotion } from './client'

/*
 * БАНКА — бренд напитков. Первый экран — оранжевый плакат: две строки заголовка, между ними банка.
 * Порядок: холод (туман) → банка поднимается → язычок отщёлкивается → пузырьки выстреливают вверх →
 * строки заголовка въезжают навстречу (единственная пружина) → наклейки на банке → текст и кнопки.
 * Вкусы — полка холодильника: стеклянная дверь открывается, когда полка входит в кадр; под банками ценники.
 * Цифры — этикетка «Пищевая ценность». Шрифты: Days One (заголовки), Onest (текст), Martian Mono (метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
/** цвета банок по вкусам: грейпфрут, лайм, ягоды, голубика, манго, тархун — дальше по кругу */
const CANS = ['#ff6f7d', '#8fd14f', '#c2185b', '#3d6bff', '#ffb11b', '#2e9e5b']

function Can({ seed, label }: { seed: string; label: string }) {
  const r = rng(seed)
  const drops = Array.from({ length: 34 }, () => ({ x: 78 + r() * 144, y: 120 + r() * 300, s: 1.2 + r() * r() * 4 }))
  const fizz = Array.from({ length: 26 }, (_, i) => {
    const a = -Math.PI / 2 + (r() - 0.5) * 1.9
    const d = 90 + r() * 170
    return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, s: 3 + r() * 9, i }
  })
  return (
    <div className="tube-can" aria-hidden="true">
      <svg viewBox="0 0 300 520" className="tube-can__svg">
        <defs>
          <linearGradient id="tube-metal" x1="0" x2="1">
            <stop offset="0" stopColor="#6d6d6a" />
            <stop offset=".18" stopColor="#d9d9d4" />
            <stop offset=".32" stopColor="#f7f7f2" />
            <stop offset=".55" stopColor="#a9a9a3" />
            <stop offset=".85" stopColor="#5b5b57" />
            <stop offset="1" stopColor="#3a3a37" />
          </linearGradient>
          <linearGradient id="tube-body" x1="0" x2="1">
            <stop offset="0" stopColor="#0c0c0b" />
            <stop offset=".25" stopColor="#3a3a36" />
            <stop offset=".34" stopColor="#5a5a55" />
            <stop offset=".5" stopColor="#222220" />
            <stop offset="1" stopColor="#050505" />
          </linearGradient>
          <linearGradient id="tube-band" x1="0" x2="1">
            <stop offset="0" stopColor="#b8300c" />
            <stop offset=".3" stopColor="#ff6a3d" />
            <stop offset=".55" stopColor="#ff4d1c" />
            <stop offset="1" stopColor="#8a2408" />
          </linearGradient>
        </defs>
        <ellipse cx="150" cy="500" rx="118" ry="14" fill="rgba(0,0,0,.28)" className="tube-can__shadow" />
        <path d="M40 92 Q40 70 64 62 L236 62 Q260 70 260 92 L260 452 Q260 478 236 486 L64 486 Q40 478 40 452 Z" fill="url(#tube-body)" />
        <rect x="40" y="250" width="220" height="120" fill="url(#tube-band)" />
        <text x="150" y="318" textAnchor="middle" className="tube-can__word" style={{ fontSize: Math.min(30, 260 / Math.max(label.length, 1)) }}>
          {label}
        </text>
        <path d="M40 92 Q40 70 64 62 L236 62 Q260 70 260 92 L260 104 L40 104 Z" fill="url(#tube-metal)" />
        <path d="M40 440 L260 440 L260 452 Q260 478 236 486 L64 486 Q40 478 40 452 Z" fill="url(#tube-metal)" opacity=".9" />
        <ellipse cx="150" cy="62" rx="104" ry="18" fill="#c9c9c3" />
        <ellipse cx="150" cy="62" rx="92" ry="14" fill="#a4a49e" />
        <ellipse cx="150" cy="60" rx="18" ry="5" fill="#2a2a28" className="tube-can__hole" />
        <g className="tube-can__tab">
          <path d="M126 64 Q126 52 150 52 Q174 52 174 64 Q174 72 150 72 Q126 72 126 64 Z" fill="#e9e9e4" stroke="#8a8a85" strokeWidth="1.5" />
          <ellipse cx="150" cy="62" rx="9" ry="4" fill="#8a8a85" />
        </g>
        <g className="tube-can__drops">
          {drops.map((d, i) => (
            <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.s.toFixed(2)} />
          ))}
        </g>
        <rect x="70" y="92" width="16" height="380" rx="8" fill="rgba(255,255,255,.16)" />
        <path className="tube-can__trickle" d="M206 140 C206 200 210 260 208 330" />
      </svg>
      <div className="tube-fizz">
        {fizz.map((b) => (
          <i key={b.i} style={{ ['--dx' as string]: `${b.dx.toFixed(0)}px`, ['--dy' as string]: `${b.dy.toFixed(0)}px`, ['--s' as string]: `${b.s.toFixed(1)}px`, ['--d' as string]: `${(b.i % 9) * 22}ms` }} />
        ))}
      </div>
    </div>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  const r = rng(`${site.slug}-ean`)
  const bars = Array.from({ length: 46 }, () => 1 + Math.floor(r() * 4))
  return (
    <>
      <TubeMotion />
      <header className="tube-bar">
        <a href="#top" className="tube-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="tube-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="tube-bar__side">
          {site.nav.cta.label ? (
            <a className="tube-btn tube-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="tube-foot">
        <p className="tube-foot__mark">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="tube-foot__grid">
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
          <svg className="tube-foot__ean" viewBox="0 0 140 54" aria-hidden="true">
            {bars.reduce<{ x: number; el: React.ReactNode[] }>(
              (acc, w, i) => {
                if (i % 2 === 0) acc.el.push(<rect key={i} x={acc.x} y="0" width={w} height={i < 4 || i > 41 || i === 22 || i === 24 ? 54 : 46} />)
                acc.x += w
                return acc
              },
              { x: 4, el: [] },
            ).el}
          </svg>
        </div>
        <p className="tube-foot__legal">
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
  const title = s.title || site.name
  // «Бодрит. Не врёт.» → две строки по предложениям; иначе — по середине слов
  const parts = title.match(/[^.!?]+[.!?]?/g)?.map((x) => x.trim()).filter(Boolean) ?? [title]
  let lines: string[]
  if (parts.length >= 2) lines = [parts[0], parts.slice(1).join(' ')]
  else {
    const w = title.split(' ')
    const h = Math.ceil(w.length / 2)
    lines = w.length > 1 ? [w.slice(0, h).join(' '), w.slice(h).join(' ')] : [title]
  }
  const low = title.toLowerCase()
  const stickers = [...new Set(s.words.filter(Boolean).filter((w) => !/«/.test(w) && !low.includes(w.toLowerCase())))].slice(0, 3)
  return (
    <section id={s.anchor || undefined} className="s s-hero tube-hero" data-tube-hero>
      <div className="tube-hero__fog" aria-hidden="true" />
      <h1 className="tube-hero__title">
        {lines.map((l, i) => (
          <span key={i} className={`tube-hero__line tube-hero__line--${i}`}>
            {l}
          </span>
        ))}
      </h1>
      <div className="tube-hero__stage">
        <Can seed={`${site.slug}-can`} label={s.eyebrow || site.name} />
        {stickers.map((w, i) => (
          <span key={i} className={`tube-sticker tube-sticker--${i}`} style={{ ['--i' as string]: i }}>
            {w}
          </span>
        ))}
      </div>
      <div className="tube-hero__foot">
        {s.subtitle ? <p className="tube-hero__sub">{s.subtitle}</p> : null}
        <div className="tube-hero__ctas">
          {s.cta.label ? (
            <a className="tube-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="tube-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label} →
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Строка состава вместо бегущей строки: как мелкий шрифт на боку банки. */
function Ingredients({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s tube-ingr" aria-label={s.items.join(', ')}>
      <p data-tb="rise">
        <b>{pick(site.lang, { ru: 'Состав', uz: 'Tarkibi', en: 'Inside' })}:</b> {s.items.join(' · ')}
      </p>
    </section>
  )
}

/** Вкусы — полка холодильника за стеклянной дверью; под каждой банкой ценник. */
function Flavors({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services tube-shelf">
      <div className="tube-head" data-tb="rise">
        {s.label ? <p className="tube-label">{s.label}</p> : null}
        {s.title ? <h2 className="tube-h2">{s.title}</h2> : null}
        {s.intro ? <p className="tube-head__intro">{s.intro}</p> : null}
      </div>
      <div className="tube-fridge" data-tb="door">
        <div className="tube-fridge__light" aria-hidden="true" />
        <ul className="tube-fridge__row">
          {s.items.map((it, i) => (
            <li key={i} className="tube-flavor" style={{ ['--c' as string]: CANS[i % CANS.length], ['--i' as string]: i }}>
              <div className="tube-flavor__can" aria-hidden="true">
                <span>{it.title}</span>
              </div>
              <div className="tube-flavor__tag">
                <h3>{it.title}</h3>
                {it.text ? <p>{it.text}</p> : null}
                <div className="tube-flavor__price">
                  {it.tag ? <em>{it.tag}</em> : null}
                  {it.price ? <b>{it.price}</b> : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="tube-fridge__door" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about tube-about">
      <figure className="tube-about__photo" data-tb="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="blobs" className="media" />
      </figure>
      <div className="tube-about__text" data-tb="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="tube-label">{s.label}</p> : null}
        {s.title ? <h2 className="tube-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Цифры — этикетка «Пищевая ценность» с жирными линейками. */
function Facts({ section: s, site }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats tube-facts">
      <div className="tube-facts__label" data-tb="rise">
        <h2>{s.title || pick(site.lang, { ru: 'Пищевая ценность', uz: 'Ozuqaviy qiymati', en: 'Nutrition facts' })}</h2>
        <p className="tube-facts__per">{s.label || pick(site.lang, { ru: 'на одну банку', uz: 'bir bankada', en: 'per can' })}</p>
        <dl>
          {s.items.map((it, i) => (
            <div key={i} style={{ ['--i' as string]: i }}>
              <dt>{it.label}</dt>
              <dd>
                {it.value}
                {it.suffix ? <small>{it.suffix}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/** Отзывы — магниты на двери холодильника: каждый под своим углом. */
function Voices({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials tube-voices">
      <div className="tube-head" data-tb="rise">
        {s.label ? <p className="tube-label">{s.label}</p> : null}
        {s.title ? <h2 className="tube-h2">{s.title}</h2> : null}
      </div>
      <div className="tube-voices__door">
        {s.items.map((it, i) => (
          <figure key={i} data-tb="stick" style={{ ['--i' as string]: i, ['--c' as string]: CANS[(i * 2 + 1) % CANS.length] }}>
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
    <section id={s.anchor || undefined} className="s s-faq tube-faq">
      <div className="tube-head" data-tb="rise">
        {s.label ? <p className="tube-label">{s.label}</p> : null}
        {s.title ? <h2 className="tube-h2">{s.title}</h2> : null}
      </div>
      <div className="tube-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item tube-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact tube-contact">
      <div className="tube-contact__inner" data-tb="rise">
        {s.label ? <p className="tube-label">{s.label}</p> : null}
        {s.title ? <h2 className="tube-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="tube-contact__text">{s.text}</p> : null}
        <div className="tube-hero__ctas">
          {s.cta.label ? (
            <a className="tube-btn tube-btn--ink" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="tube-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Ingredients, services: Flavors, about: About, stats: Facts, testimonials: Voices, faq: Faq, contact: Contact },
}
