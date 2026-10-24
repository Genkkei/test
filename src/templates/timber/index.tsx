import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media, rng } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { TimberMotion } from './client'

/*
 * БРУС — мебель из массива. Первый экран — доска с живым краем во всю ширину; по ней проходит рубанок:
 * за ним остаётся свежая светлая древесина, с ножа сходит стружка. Потом заголовок «выжигается» (проступает
 * тёмным с рыжим отсветом), справа — торцы пород с годовыми кольцами, кольца растут от сердцевины.
 * Цифры — клейма на торцах, путь заказа — складной метр, работы — с бирками на бечёвке.
 * Шрифты: Podkova (заголовки), Jost (текст), PT Mono (метки, размеры, цены).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
/** тона пород: светлая сосна, карагач, орех, масло — дальше по кругу */
const WOODS = [
  ['#e2bf86', '#c99a5b'],
  ['#b27a45', '#8a5a2e'],
  ['#6f4a2c', '#4c301b'],
  ['#d3a868', '#a77a3f'],
]

/** торец бревна: кольца, трещина-усушка, кора */
function EndGrain({ seed, tone, rings = 12 }: { seed: string; tone: string[]; rings?: number }) {
  const r = rng(seed)
  const cx = 50 + (r() - 0.5) * 10
  const cy = 50 + (r() - 0.5) * 10
  return (
    <svg viewBox="0 0 100 100" className="timber-end" aria-hidden="true">
      <circle cx="50" cy="50" r="49" fill="#5a3b22" />
      <circle cx="50" cy="50" r="45" fill={tone[0]} />
      {Array.from({ length: rings }, (_, i) => {
        const k = (rings - i) / rings
        const wob = Array.from({ length: 16 }, (_, j) => {
          const a = (j / 16) * Math.PI * 2
          const rr = 44 * k * (0.94 + r() * 0.08)
          return `${(cx + (50 - cx) * k + Math.cos(a) * rr).toFixed(1)},${(cy + (50 - cy) * k + Math.sin(a) * rr).toFixed(1)}`
        })
        return <polygon key={i} points={wob.join(' ')} fill="none" stroke={tone[1]} strokeWidth={0.5 + r() * 0.9} strokeLinejoin="round" style={{ ['--k' as string]: (1 - k).toFixed(3) }} />
      })}
      <path d={`M${cx} ${cy} L${(cx + 30 + r() * 10).toFixed(1)} ${(cy - 8 + r() * 16).toFixed(1)}`} stroke="#3b2414" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

/** доска с живым краем: два слоя — потемневший и свежестроганый, между ними режет рубанок */
function Board({ seed }: { seed: string }) {
  const r = rng(seed)
  const W = 1600
  const H = 240
  const edge = (y0: number, amp: number) => {
    const pts: string[] = []
    for (let x = 0; x <= W; x += 40) pts.push(`${x},${(y0 + Math.sin(x / 230 + r()) * amp + (r() - 0.5) * amp * 0.6).toFixed(1)}`)
    return pts
  }
  const top = edge(18, 10)
  const bottom = edge(H - 16, 12).reverse()
  const outline = `M${top.join(' L')} L${bottom.join(' L')} Z`
  const knots = [
    { x: 260 + r() * 260, y: 64 + r() * 40, w: 12 + r() * 8 },
    { x: 1020 + r() * 380, y: 150 + r() * 40, w: 20 + r() * 10 },
  ]
  const grain = Array.from({ length: 26 }, (_, i) => {
    const y = 30 + (i / 26) * (H - 60) + (r() - 0.5) * 6
    let d = `M-10 ${y.toFixed(1)}`
    for (let x = 0; x <= W + 40; x += 80) {
      let yy = y + Math.sin(x / (160 + i * 7) + i) * 5
      for (const k of knots) {
        const dx = x - k.x
        const dy = y - k.y
        const f = Math.exp(-(dx * dx) / (k.w * k.w * 30) - (dy * dy) / 900)
        yy += (dy >= 0 ? 1 : -1) * f * 26
      }
      d += ` L${x} ${yy.toFixed(1)}`
    }
    return { d, w: 0.6 + r() * 1.6 }
  })
  const layer = (base: string, line: string, id: string) => (
    <g>
      <path d={outline} fill={base} />
      <g clipPath={`url(#${id})`}>
        {grain.map((g, i) => (
          <path key={i} d={g.d} fill="none" stroke={line} strokeWidth={g.w} />
        ))}
        {knots.map((k, i) => (
          <g key={i}>
            <ellipse cx={k.x} cy={k.y} rx={k.w * 1.5} ry={k.w * 0.5} fill="none" stroke={line} strokeWidth="1.5" />
            <ellipse cx={k.x + 2} cy={k.y} rx={k.w * 0.8} ry={k.w * 0.32} fill={line} opacity=".85" />
          </g>
        ))}
      </g>
    </g>
  )
  return (
    <div className="timber-board" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="timber-board__svg">
        <defs>
          <clipPath id="timber-shape">
            <path d={outline} />
          </clipPath>
        </defs>
        <path d={outline} fill="rgba(60,35,15,.25)" transform="translate(0 10)" />
        {layer('#8e6136', '#6a4422', 'timber-shape')}
      </svg>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="timber-board__svg timber-board__fresh">
        {layer('#ddb67f', '#c3965c', 'timber-shape')}
      </svg>
      <div className="timber-plane">
        <svg viewBox="0 0 120 80">
          <path d="M8 62 L18 30 L104 30 L114 62 Z" fill="#6b4524" />
          <path d="M8 62 L114 62 L114 70 L8 70 Z" fill="#3e2714" />
          <path d="M70 30 Q72 6 92 8 Q100 10 98 30 Z" fill="#8a5a2e" />
          <circle cx="30" cy="24" r="10" fill="#8a5a2e" />
          <path d="M52 30 L60 30 L56 66 Z" fill="#c9ccd0" />
        </svg>
        <svg className="timber-shaving" viewBox="0 0 80 80">
          <path d="M10 70 C10 30 60 20 66 44 C70 62 44 66 40 52 C37 42 52 38 54 48" fill="none" stroke="#e7c48e" strokeWidth="7" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <TimberMotion />
      <header className="timber-bar">
        <a href="#top" className="timber-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="timber-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="timber-bar__side">
          {site.nav.cta.label ? (
            <a className="timber-btn timber-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="timber-foot">
        <div className="timber-foot__top">
          <p className="timber-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
          <p className="timber-foot__tag">{site.tagline}</p>
        </div>
        <div className="timber-foot__cols">
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
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </p>
          {b.socials.length ? (
            <p>
              <small>{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</small>
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </p>
          ) : null}
        </div>
        <p className="timber-foot__legal">
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
  const woods = s.words.filter(Boolean).slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero timber-hero">
      <div className="timber-hero__top">
        <div className="timber-hero__text">
          {s.eyebrow ? <p className="timber-label timber-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
          <h1 className="timber-title">{s.title || site.name}</h1>
        </div>
        {woods.length ? (
          <ul className="timber-species" aria-label={woods.join(', ')}>
            {woods.map((w, i) => (
              <li key={i} style={{ ['--i' as string]: i }}>
                <EndGrain seed={`${site.slug}-sp${i}`} tone={WOODS[i % WOODS.length]} rings={9 + i * 2} />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Board seed={`${site.slug}-board`} />
      <div className="timber-hero__foot">
        {s.subtitle ? <p className="timber-hero__sub timber-in" style={{ ['--i' as string]: 1 }}>{s.subtitle}</p> : null}
        <div className="timber-ctas timber-in" style={{ ['--i' as string]: 2 }}>
          {s.cta.label ? (
            <a className="timber-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="timber-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Обещания — клейма, выжженные на дереве. */
function Stamps({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s timber-stamps" aria-label={s.items.join(', ')}>
      <ul>
        {s.items.map((m, i) => (
          <li key={i} data-tm="burn" style={{ ['--i' as string]: i }}>
            {m}
          </li>
        ))}
      </ul>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about timber-about">
      <figure className="timber-about__photo" data-tm="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="rings" className="media" />
      </figure>
      <div className="timber-about__text" data-tm="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="timber-label">{s.label}</p> : null}
        {s.title ? <h2 className="timber-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Каталог — фото и бирка на бечёвке: порода и размер, цена «от». */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works timber-works">
      <div className="timber-head" data-tm="rise">
        {s.label ? <p className="timber-label">{s.label}</p> : null}
        {s.title ? <h2 className="timber-h2">{s.title}</h2> : null}
      </div>
      <ul className="timber-works__list">
        {s.items.map((it, i) => (
          <li key={i} data-tm="rise" style={{ ['--i' as string]: i % 2 }}>
            <figure>
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="rings" className="media" />
            </figure>
            <div className="timber-tag">
              <i aria-hidden="true" />
              <h3>{it.title}</h3>
              {it.category ? <p className="timber-tag__spec">{it.category}</p> : null}
              {it.text ? <p>{it.text}</p> : null}
              {it.year ? <b>{it.year}</b> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Цифры — клейма на торцах брёвен: кольца нарастают при появлении. */
function Stats({ section: s, site }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats timber-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-tm="rings" style={{ ['--i' as string]: i }}>
            <div className="timber-stats__disc">
              <EndGrain seed={`${site.slug}-st${i}`} tone={WOODS[(i + 1) % WOODS.length]} rings={14} />
              <dd>
                {it.value}
                {it.suffix ? <small>{it.suffix.trim()}</small> : null}
              </dd>
            </div>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Путь заказа — складной метр: звенья раскладываются по одному. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process timber-ruler">
      <div className="timber-head" data-tm="rise">
        {s.label ? <p className="timber-label">{s.label}</p> : null}
        {s.title ? <h2 className="timber-h2">{s.title}</h2> : null}
      </div>
      <ol className="timber-ruler__list" data-tm="unfold">
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <div className="timber-ruler__seg" aria-hidden="true">
              <span>{(i + 1) * 20}</span>
            </div>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials timber-voices">
      <div className="timber-head" data-tm="rise">
        {s.label ? <p className="timber-label">{s.label}</p> : null}
        {s.title ? <h2 className="timber-h2">{s.title}</h2> : null}
      </div>
      <div className="timber-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-tm="rise" style={{ ['--i' as string]: i }}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              <b>{it.author}</b>
              {it.role ? <span>{it.role}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery timber-gallery">
      <div className="timber-head" data-tm="rise">
        {s.label ? <p className="timber-label">{s.label}</p> : null}
        {s.title ? <h2 className="timber-h2">{s.title}</h2> : null}
      </div>
      <ol className="timber-gallery__strip">
        {s.items.map((it, i) => (
          <li key={i} data-tm="rise" style={{ ['--i' as string]: i }}>
            <figure>
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="rings" className="media" />
              {it.caption ? (
                <figcaption>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {it.caption}
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq timber-faq">
      <div className="timber-head" data-tm="rise">
        {s.label ? <p className="timber-label">{s.label}</p> : null}
        {s.title ? <h2 className="timber-h2">{s.title}</h2> : null}
      </div>
      <div className="timber-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item timber-faq__item" open={i === 0}>
            <summary>
              <span className="timber-faq__n">№ {i + 1}</span>
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
    <section id={s.anchor || undefined} className="s s-contact timber-contact">
      <div className="timber-contact__grain" aria-hidden="true" />
      <div className="timber-contact__inner" data-tm="rise">
        {s.label ? <p className="timber-label">{s.label}</p> : null}
        {s.title ? <h2 className="timber-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="timber-contact__text">{s.text}</p> : null}
        <div className="timber-ctas">
          {s.cta.label ? (
            <a className="timber-btn timber-btn--light" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="timber-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Stamps, about: About, works: Works, stats: Stats, process: Process, testimonials: Testimonials, gallery: Gallery, faq: Faq, contact: Contact },
}
