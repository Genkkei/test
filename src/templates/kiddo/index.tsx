import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { KiddoMotion } from './client'

/*
 * КУБИКИ — детская мебель. Первый экран — детская в изометрии, которую собирают из кубиков: стены и пол
 * проявляются, потом с пружинкой падают кровать-домик, парта, стеллаж, три кубика друг на друга, на стене —
 * ростомер. Под заголовком — кубики с буквами: слово из hero.words перещёлкивается, каждый кубик
 * переворачивается. Цены — игрушечные полки по тегам, команда — кубики с буквой имени (без выдуманных фото),
 * отзывы — пузыри реплик. Кривая — пружина Shopify (.34,1.56,.64,1) у всего малого, (.22,1,.36,1) у текста.
 * Шрифты: Balsamiq Sans (заголовки), M PLUS Rounded 1c (текст), M PLUS Rounded 1c жирный (метки, цены).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const BLOCKS = ['#ef6a4c', '#5cc6b0', '#7aa7f0', '#ffc94d', '#b49cf0']

/* ── изометрия: x вправо-вниз, y влево-вниз, z вверх ── */
const S = 34
const OX = 300
const OY = 150
const P = (x: number, y: number, z: number) => `${(OX + (x - y) * S * 0.866).toFixed(1)},${(OY + (x + y) * S * 0.5 - z * S).toFixed(1)}`
const poly = (pts: [number, number, number][]) => pts.map((p) => P(...p)).join(' ')

function Box({ x, y, z, w, d, h, c }: { x: number; y: number; z: number; w: number; d: number; h: number; c: [string, string, string] }) {
  return (
    <>
      <polygon points={poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={c[1]} />
      <polygon points={poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill={c[2]} />
      <polygon points={poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={c[0]} />
    </>
  )
}
const tone = (hex: string): [string, string, string] => [hex, `color-mix(in srgb, ${hex} 82%, #2b2d5c)`, `color-mix(in srgb, ${hex} 66%, #2b2d5c)`]
const WOOD: [string, string, string] = ['#f3d7ad', '#e2bf8c', '#cfa674']

function Room() {
  const frame = (x: number, y: number) => P(x, y, 0)
  let k = 0
  const piece = (node: React.ReactNode) => (
    <g className="kiddo-piece" style={{ ['--i' as string]: k++ }}>
      {node}
    </g>
  )
  return (
    <svg className="kiddo-room" viewBox="0 0 600 520" role="img" aria-label="">
      <g className="kiddo-room__shell">
        <polygon points={poly([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]])} fill="#f7dcbd" />
        <polygon points={poly([[0, 0, 0], [0, 10, 0], [0, 10, 6], [0, 0, 6]])} fill="#ffe4d1" />
        <polygon points={poly([[0, 0, 0], [10, 0, 0], [10, 0, 6], [0, 0, 6]])} fill="#fff0e2" />
        <polygon points={poly([[1.6, 0, 2.4], [4.4, 0, 2.4], [4.4, 0, 4.8], [1.6, 0, 4.8]])} fill="#cfe6ff" />
        <polyline points={poly([[3, 0, 2.4], [3, 0, 4.8]])} stroke="#fff" strokeWidth="3" fill="none" />
        <polyline points={poly([[1.6, 0, 3.6], [4.4, 0, 3.6]])} stroke="#fff" strokeWidth="3" fill="none" />
      </g>
      {/* ростомер на стене */}
      {piece(
        <>
          <polygon points={poly([[6, 0, 0.3], [6.5, 0, 0.3], [6.5, 0, 5.2], [6, 0, 5.2]])} fill="#ffc94d" />
          {Array.from({ length: 10 }, (_, i) => (
            <polyline key={i} points={poly([[6, 0, 0.8 + i * 0.45], [i % 2 ? 6.2 : 6.32, 0, 0.8 + i * 0.45]])} stroke="#2b2d5c" strokeWidth="1.4" fill="none" />
          ))}
        </>,
      )}
      {/* стеллаж у левой стены */}
      {piece(
        <>
          <Box x={0} y={1.4} z={0} w={0.8} d={2.8} h={2.6} c={WOOD} />
          <polygon points={poly([[0.8, 1.6, 0.9], [0.8, 4, 0.9], [0.8, 4, 1.05], [0.8, 1.6, 1.05]])} fill="#b8925f" />
          <polygon points={poly([[0.8, 1.6, 1.8], [0.8, 4, 1.8], [0.8, 4, 1.95], [0.8, 1.6, 1.95]])} fill="#b8925f" />
        </>,
      )}
      {/* кровать-домик */}
      {piece(<Box x={0.4} y={5.6} z={0} w={2} d={3.6} h={0.7} c={tone('#7aa7f0')} />)}
      {piece(
        <g className="kiddo-room__house" fill="none" stroke="#2b2d5c" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
          <polyline points={[frame(0.4, 5.6), P(0.4, 5.6, 3), P(1.4, 5.6, 4.1), P(2.4, 5.6, 3), frame(2.4, 5.6)].join(' ')} />
          <polyline points={[frame(0.4, 9.2), P(0.4, 9.2, 3), P(1.4, 9.2, 4.1), P(2.4, 9.2, 3), frame(2.4, 9.2)].join(' ')} />
          <polyline points={[P(1.4, 5.6, 4.1), P(1.4, 9.2, 4.1)].join(' ')} />
        </g>,
      )}
      {piece(<Box x={0.6} y={8.2} z={0.7} w={1.6} d={0.8} h={0.35} c={tone('#ffffff')} />)}
      {/* парта и стул */}
      {piece(
        <>
          <Box x={6.2} y={0.5} z={0} w={0.15} d={0.15} h={1.5} c={WOOD} />
          <Box x={8.4} y={0.5} z={0} w={0.15} d={0.15} h={1.5} c={WOOD} />
          <Box x={6.2} y={1.7} z={0} w={0.15} d={0.15} h={1.5} c={WOOD} />
          <Box x={8.4} y={1.7} z={0} w={0.15} d={0.15} h={1.5} c={WOOD} />
          <Box x={6} y={0.3} z={1.5} w={2.8} d={1.7} h={0.18} c={tone('#5cc6b0')} />
        </>,
      )}
      {piece(<Box x={6.9} y={2.6} z={0} w={1} d={1} h={0.9} c={tone('#ffc94d')} />)}
      {/* кубики */}
      {piece(<Box x={5.6} y={6.4} z={0} w={1.1} d={1.1} h={1.1} c={tone('#ef6a4c')} />)}
      {piece(<Box x={6.9} y={6.6} z={0} w={1.1} d={1.1} h={1.1} c={tone('#b49cf0')} />)}
      {piece(<Box x={5.65} y={6.45} z={1.1} w={1} d={1} h={1} c={tone('#5cc6b0')} />)}
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <KiddoMotion />
      <header className="kiddo-bar">
        <a href="#top" className="kiddo-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="kiddo-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href} style={{ ['--c' as string]: BLOCKS[i % BLOCKS.length] }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="kiddo-bar__side">
          {site.nav.cta.label ? (
            <a className="kiddo-btn kiddo-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="kiddo-foot">
        <div className="kiddo-foot__blocks" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ background: BLOCKS[i % BLOCKS.length], ['--h' as string]: `${[38, 54, 30, 46, 60, 34, 50][i % 7]}px` }} />
          ))}
        </div>
        <div className="kiddo-foot__inner">
          <p className="kiddo-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
          <p className="kiddo-foot__tag">{site.tagline}</p>
          <div className="kiddo-foot__cols">
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
          <p className="kiddo-foot__legal">
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
  const words = s.words.filter(Boolean).map((w) => w.toLocaleUpperCase(site.lang === 'en' ? 'en' : 'ru'))
  const n = Math.max(0, ...words.map((w) => [...w].length))
  const first = [...(words[0] || '')]
  return (
    <section id={s.anchor || undefined} className="s s-hero kiddo-hero" data-kiddo-hero>
      <div className="kiddo-hero__text">
        {s.eyebrow ? <p className="kiddo-label kiddo-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="kiddo-title kiddo-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {n ? (
          <p className="kiddo-cubes" aria-label={words.join(', ')} data-kiddo-cubes>
            {Array.from({ length: n }, (_, i) => (
              <span key={i} className="kiddo-cube" style={{ ['--i' as string]: i, ['--c' as string]: BLOCKS[i % BLOCKS.length] }} data-empty={!first[i] || undefined} aria-hidden="true">
                <b>{first[i] || ' '}</b>
              </span>
            ))}
          </p>
        ) : null}
        {words.length > 1 ? <script type="application/json" data-kiddo-words dangerouslySetInnerHTML={{ __html: JSON.stringify(words) }} /> : null}
        {s.subtitle ? <p className="kiddo-hero__sub kiddo-in" style={{ ['--i' as string]: 3 }}>{s.subtitle}</p> : null}
        <div className="kiddo-hero__ctas kiddo-in" style={{ ['--i' as string]: 4 }}>
          {s.cta.label ? (
            <a className="kiddo-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="kiddo-btn kiddo-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="kiddo-hero__room" aria-hidden="true">
        <Room />
      </div>
    </section>
  )
}

function Chips({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s kiddo-chips" aria-label={s.items.join(', ')}>
      <ul>
        {s.items.map((m, i) => (
          <li key={i} data-kd="pop" style={{ ['--i' as string]: i, ['--c' as string]: BLOCKS[i % BLOCKS.length] }}>
            {m}
          </li>
        ))}
      </ul>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about kiddo-about">
      <div className="kiddo-about__photo" data-kd="pop">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="grid" className="media" />
      </div>
      <div className="kiddo-about__text" data-kd="rise">
        {s.label ? <p className="kiddo-label">{s.label}</p> : null}
        {s.title ? <h2 className="kiddo-h2">{s.title}</h2> : null}
        {s.text ? <p>{s.text}</p> : null}
      </div>
    </section>
  )
}

/** Цены — игрушечные полки: по полке на тег, на полке — кубики-позиции. */
function Services({ section: s }: SectionProps<'services'>) {
  const tags = [...new Set(s.items.map((it) => it.tag || ''))]
  return (
    <section id={s.anchor || undefined} className="s s-services kiddo-shelves">
      <div className="kiddo-head" data-kd="rise">
        {s.label ? <p className="kiddo-label">{s.label}</p> : null}
        {s.title ? <h2 className="kiddo-h2">{s.title}</h2> : null}
        {s.intro ? <p className="kiddo-head__intro">{s.intro}</p> : null}
      </div>
      {tags.map((tag, ti) => (
        <div key={ti} className="kiddo-shelf">
          {tag ? <h3 className="kiddo-shelf__tag">{tag}</h3> : null}
          <ul>
            {s.items
              .filter((it) => (it.tag || '') === tag)
              .map((it, i) => (
                <li key={i} data-kd="drop" style={{ ['--i' as string]: i, ['--c' as string]: BLOCKS[(ti * 2 + i) % BLOCKS.length] }}>
                  <b>{it.title}</b>
                  {it.text ? <span>{it.text}</span> : null}
                  {it.price ? <em>{it.price}</em> : null}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery kiddo-rooms">
      <div className="kiddo-head" data-kd="rise">
        {s.label ? <p className="kiddo-label">{s.label}</p> : null}
        {s.title ? <h2 className="kiddo-h2">{s.title}</h2> : null}
      </div>
      <ul className="kiddo-rooms__list">
        {s.items.map((it, i) => (
          <li key={i} data-kd="pop" style={{ ['--i' as string]: i, ['--c' as string]: BLOCKS[(i + 1) % BLOCKS.length] }}>
            <div className="kiddo-rooms__img">
              <Media src={it.image} alt={it.caption} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="grid" className="media" />
            </div>
            <p>{it.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Команда — кубик с первой буквой имени вместо фотографии. */
function Team({ section: s }: SectionProps<'team'>) {
  return (
    <section id={s.anchor || undefined} className="s s-team kiddo-team">
      <div className="kiddo-head" data-kd="rise">
        {s.label ? <p className="kiddo-label">{s.label}</p> : null}
        {s.title ? <h2 className="kiddo-h2">{s.title}</h2> : null}
      </div>
      <ul className="kiddo-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-kd="drop" style={{ ['--i' as string]: i, ['--c' as string]: BLOCKS[(i + 2) % BLOCKS.length] }}>
            <span className="kiddo-team__cube" aria-hidden="true">
              {[...it.name][0]}
            </span>
            <b>{it.name}</b>
            <span>{it.role}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials kiddo-bubbles">
      <div className="kiddo-head" data-kd="rise">
        {s.label ? <p className="kiddo-label">{s.label}</p> : null}
        {s.title ? <h2 className="kiddo-h2">{s.title}</h2> : null}
      </div>
      <div className="kiddo-bubbles__list">
        {s.items.map((it, i) => (
          <figure key={i} data-kd="pop" style={{ ['--i' as string]: i, ['--c' as string]: BLOCKS[(i + 3) % BLOCKS.length] }}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              <b>{it.author}</b>
              {it.role ? ` · ${it.role}` : ''}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq kiddo-faq">
      <div className="kiddo-head" data-kd="rise">
        {s.label ? <p className="kiddo-label">{s.label}</p> : null}
        {s.title ? <h2 className="kiddo-h2">{s.title}</h2> : null}
      </div>
      <div className="kiddo-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item kiddo-faq__item" open={i === 0} style={{ ['--c' as string]: BLOCKS[i % BLOCKS.length] }}>
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
    <section id={s.anchor || undefined} className="s s-contact kiddo-contact">
      <div className="kiddo-contact__card" data-kd="pop">
        {s.label ? <p className="kiddo-label">{s.label}</p> : null}
        {s.title ? <h2 className="kiddo-contact__title">{s.title}</h2> : null}
        {s.text ? <p>{s.text}</p> : null}
        <div className="kiddo-hero__ctas">
          {s.cta.label ? (
            <a className="kiddo-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="kiddo-btn kiddo-btn--ghost" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Chips, about: About, services: Services, gallery: Gallery, team: Team, testimonials: Testimonials, faq: Faq, contact: Contact },
}
