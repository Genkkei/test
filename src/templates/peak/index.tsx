import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Altimeter, Trail } from './client'

/*
 * ВЕРШИНА — горное снаряжение в духе Patagonia и Arc'teryx: бумага цвета камня, топографические
 * горизонтали, хребет из трёх планов на первом экране, у каждого маршрута свой профиль высоты,
 * программа похода — тропа, которая прорисовывается прокруткой.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Детерминированный псевдослучай: одинаков на сервере и в браузере. */
function rng(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

/** Профиль высоты: подъём к вершине и спуск, с зубцами. */
function profile(seed: string, w = 300, h = 90, peakAt = 0.55) {
  const r = rng(seed)
  const n = 24
  const pts: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const x = i / n
    const base = x < peakAt ? Math.pow(x / peakAt, 1.3) : Math.pow((1 - x) / (1 - peakAt), 0.9)
    const y = 0.12 + 0.78 * base + (r() - 0.5) * 0.12 * Math.sin(x * Math.PI)
    pts.push([x * w, h - Math.min(0.96, Math.max(0.04, y)) * h])
  }
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
}

/** Горизонтали: замкнутые волнистые кольца вокруг двух вершин. */
function Topo({ seed, className }: { seed: string; className: string }) {
  const r = rng(seed)
  const centers = [
    [260 + r() * 100, 200 + r() * 80],
    [760 + r() * 120, 420 + r() * 80],
  ]
  const rings: string[] = []
  centers.forEach(([cx, cy], k) => {
    for (let i = 1; i <= 11; i++) {
      const R = 26 * i + k * 10
      const pts: string[] = []
      const ph = r() * 6
      for (let a = 0; a <= 64; a++) {
        const t = (a / 64) * Math.PI * 2
        const rr = R * (1 + 0.12 * Math.sin(3 * t + ph + i * 0.3) + 0.06 * Math.sin(5 * t + ph))
        pts.push(`${(cx + Math.cos(t) * rr * 1.25).toFixed(1)},${(cy + Math.sin(t) * rr).toFixed(1)}`)
      }
      rings.push(pts.join(' '))
    }
  })
  return (
    <svg className={className} viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {rings.map((p, i) => (
        <polygon key={i} points={p} className={i % 5 === 4 ? 'is-index' : ''} />
      ))}
    </svg>
  )
}

/** Хребет: зубчатая линия по семени, три плана — дальний светлее. */
function ridge(seed: string, base: number, amp: number) {
  const r = rng(seed)
  let d = `M0 600 L0 ${base}`
  let y = base
  for (let x = 0; x <= 1440; x += 40 + r() * 50) {
    y = Math.max(base - amp, Math.min(base + amp * 0.4, y + (r() - 0.55) * amp * 0.7))
    d += ` L${x.toFixed(0)} ${y.toFixed(0)}`
  }
  return d + ' L1440 600 Z'
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="peak-header">
        <a href="#top" className="peak-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <svg viewBox="0 0 32 22" aria-hidden="true">
            <path d="M1 21L11 5l5 7 4-5 11 14z" />
          </svg>
          <span>{site.name}</span>
        </a>
        <nav className="peak-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="peak-header__side">
          {b.lat && b.lng ? (
            <span className="peak-coord">
              {Number(b.lat).toFixed(2)}°N {Number(b.lng).toFixed(2)}°E
            </span>
          ) : null}
          {site.nav.cta.label ? (
            <a className="peak-btn peak-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="peak-footer">
        <Topo seed={`${site.slug}-foot`} className="peak-topo peak-topo--foot" />
        <div className="peak-footer__inner">
          <p className="peak-footer__word" aria-hidden="true">
            {site.name}
          </p>
          <div className="peak-footer__grid">
            <div>
              <p className="peak-k">{ui(site.lang, 'address')}</p>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            </div>
            {b.hours.length ? (
              <div>
                <p className="peak-k">{ui(site.lang, 'hours')}</p>
                {b.hours.map((h) => (
                  <p key={h}>{humanHours(h, site.lang)}</p>
                ))}
              </div>
            ) : null}
            <div>
              <p className="peak-k">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
              {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
            </div>
            <div>
              <p className="peak-k">{pick(site.lang, { ru: 'Следите за походами', uz: 'Sayrlarni kuzating', en: 'Follow the trips' })}</p>
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              ))}
            </div>
          </div>
          <p className="peak-footer__legal">
            <span>
              © {new Date().getFullYear()} {b.legalName || site.name}
            </span>
            <a href="#top">▲ {ui(site.lang, 'toTop')}</a>
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero peak-hero">
      <Topo seed={`${site.slug}-hero`} className="peak-topo" />
      <span className="peak-sun" aria-hidden="true" />
      <div className="peak-hero__inner">
        {s.eyebrow ? (
          <p className="peak-eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="peak-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        <div className="peak-hero__row">
          {s.subtitle ? (
            <p className="peak-hero__sub" data-reveal="up" data-delay="0.4">
              {s.subtitle}
            </p>
          ) : null}
          <div className="peak-hero__ctas" data-reveal="up" data-delay="0.55">
            {s.cta.label ? (
              <a className="peak-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="peak-btn peak-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <Altimeter base={1240} label={pick(site.lang, { ru: 'Высота', uz: 'Balandlik', en: 'Altitude' })} />
      <div className="peak-ridges" aria-hidden="true">
        {[0, 1, 2].map((k) => (
          <svg key={k} className={`peak-ridge peak-ridge--${k}`} viewBox="0 0 1440 600" preserveAspectRatio="none" data-parallax={String(0.18 - k * 0.07)}>
            <path d={ridge(`${site.slug}-r${k}`, 300 + k * 90, 220 - k * 50)} />
          </svg>
        ))}
      </div>
      {s.words.length ? (
        <ul className="peak-hero__peaks" data-reveal="up" data-delay="0.8">
          {s.words.map((w, i) => (
            <li key={w} style={{ ['--i' as string]: i }}>
              <i aria-hidden="true" />
              {w}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

/** Маршруты: карточка — профиль высоты, сложность, высшая точка; линия рисуется при появлении. */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  const m = pick(site.lang, { ru: 'м', uz: 'm', en: 'm' })
  return (
    <Sec id={s.anchor} type="works" className="peak-routes-sec">
      <Head label={s.label} title={s.title} />
      <ol className="peak-routes">
        {s.items.map((it, i) => {
          const top = Number(String(it.year).replace(/\D/g, '')) || 0
          const level = /сложн|qiyin|hard/i.test(it.category) ? 3 : /средн|o‘rta|moderate/i.test(it.category) ? 2 : 1
          return (
            <li key={i} className="peak-route" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
              <figure className="peak-route__media">
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
                <span className="peak-route__num">{String(i + 1).padStart(2, '0')}</span>
              </figure>
              <div className="peak-route__body">
                <p className="peak-route__cat">
                  <span className="peak-level" aria-label={pick(site.lang, { ru: `сложность ${level} из 3`, uz: `qiyinlik 3 dan ${level}`, en: `difficulty ${level} of 3` })}>
                    {[1, 2, 3].map((k) => (
                      <i key={k} className={k <= level ? 'is-on' : ''} />
                    ))}
                  </span>
                  {it.category}
                </p>
                <h3 className="peak-route__title">{it.title}</h3>
                {it.text ? <p className="peak-route__text">{it.text}</p> : null}
                <div className="peak-route__profile">
                  <svg viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden="true">
                    <path className="peak-route__fill" d={`${profile(`${site.slug}-p${i}`)} L300 90 L0 90 Z`} />
                    <path className="peak-route__line" d={profile(`${site.slug}-p${i}`)} pathLength={1} />
                  </svg>
                  {top ? (
                    <span className="peak-route__top">
                      ▲ {top.toLocaleString('ru-RU')} {m}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </Sec>
  )
}

/** Программа похода — тропа с путевыми точками, которая прорисовывается прокруткой. */
function Process({ section: s }: SectionProps<'process'>) {
  const n = s.items.length
  const pts = s.items.map((_, i) => {
    const x = n > 1 ? 30 + (i / (n - 1)) * 940 : 500
    const y = 200 - Math.round(Math.sin((i / Math.max(1, n - 1)) * Math.PI * 0.85) * 150)
    return [x, y] as const
  })
  const d = pts.map(([x, y], i) => (i ? `S${x - 70} ${y - 26} ${x} ${y}` : `M${x} ${y}`)).join(' ')
  return (
    <Sec id={s.anchor} type="process" className="peak-trail-sec">
      <Head label={s.label} title={s.title} />
      <Trail points={n}>
        <div className="peak-trail__map" aria-hidden="true">
          <svg className="peak-trail__svg" viewBox="0 0 1000 230" preserveAspectRatio="none">
            <path className="peak-trail__ghost" d={d} />
            <path className="peak-trail__path" d={d} pathLength={1} />
          </svg>
          {pts.map(([x, y], i) => (
            <span key={i} className="peak-trail__pin" data-wp style={{ left: `${x / 10}%`, top: `${(y / 230) * 100}%` }}>
              {i + 1}
            </span>
          ))}
        </div>
        <ol className="peak-trail__list" style={{ ['--n' as string]: n }}>
          {s.items.map((it, i) => (
            <li key={i} data-reveal="up" data-delay={String(i * 0.07)}>
              <span className="peak-trail__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </Trail>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="peak-stats-sec">
      <Head label={s.label} title={s.title} />
      <dl className="peak-stats">
        {s.items.map((it, i) => (
          <div key={i} className="peak-stat" data-reveal="up" data-delay={String(i * 0.08)}>
            <dd>
              <span data-count>{it.value}</span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, works: Works, process: Process, stats: Stats },
}
