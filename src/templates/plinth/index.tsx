import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Crosshair, ProjectIndex } from './client'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const pad = (n: number) => String(n).padStart(2, '0')

/* Изометрия: (x, y, z) → экран. Коробки — объёмы здания, из них собирается аксонометрия. */
const ISO = (x: number, y: number, z: number): [number, number] => [200 + (x - y) * 0.866 * 10, 250 + (x + y) * 0.5 * 10 - z * 10]
function box(x: number, y: number, z: number, w: number, d: number, h: number) {
  const P = (a: number, b: number, c: number) => ISO(a, b, c).map((v) => v.toFixed(1)).join(' ')
  const t = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]
  // видимые рёбра: верх целиком, три вертикали спереди, два нижних ребра
  return [
    `M${t[0]} L${t[1]} L${t[2]} L${t[3]} Z`,
    `M${P(x + w, y, z)} L${t[1]}`,
    `M${P(x + w, y + d, z)} L${t[2]}`,
    `M${P(x, y + d, z)} L${t[3]}`,
    `M${P(x + w, y, z)} L${P(x + w, y + d, z)} L${P(x, y + d, z)}`,
  ].join(' ')
}
const VOLUMES: [number, number, number, number, number, number][] = [
  [-6, -6, 0, 12, 10, 4],
  [-4, -4, 4, 8, 7, 9],
  [1, -2, 13, 4, 4, 5],
  [-9, 3, 0, 4, 6, 2],
]

function Axonometry() {
  return (
    <svg className="plx-axo" viewBox="0 0 400 420" aria-hidden="true">
      <g className="plx-axo__grid">
        {Array.from({ length: 13 }, (_, i) => {
          const a = ISO(-12 + i * 2, -12, 0), b = ISO(-12 + i * 2, 12, 0), c = ISO(-12, -12 + i * 2, 0), d = ISO(12, -12 + i * 2, 0)
          return (
            <g key={i}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
              <line x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} />
            </g>
          )
        })}
      </g>
      {VOLUMES.map((v, i) => (
        <path key={i} className="plx-axo__vol" d={box(...v)} pathLength={1} style={{ ['--i' as string]: i }} />
      ))}
      <g className="plx-axo__dim">
        <line x1="352" y1={ISO(6, -6, 0)[1]} x2="352" y2={ISO(6, -6, 13)[1] - 50} />
        <text x="360" y={(ISO(6, -6, 0)[1] + ISO(6, -6, 13)[1]) / 2 - 20}>+18.000</text>
      </g>
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const coords = b.lat && b.lng ? `${Number(b.lat).toFixed(4)}° N  ${Number(b.lng).toFixed(4)}° E` : b.city
  return (
    <>
      <header className="plx-header">
        <a href="#top" className="plx-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <i aria-hidden="true" />
          {site.name}
        </a>
        <span className="plx-header__coords">{coords}</span>
        <nav className="plx-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <span>{pad(i + 1)}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="plx-header__side">
          {site.nav.cta.label ? (
            <a className="plx-btn" href={site.nav.cta.href || '#'}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="plx-footer">
        <div className="plx-footer__grid">
          <div>
            <p className="plx-footer__h">{pick(site.lang, { ru: 'Бюро', uz: 'Byuro', en: 'Studio' })}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="plx-footer__h">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="plx-footer__h">{pick(site.lang, { ru: 'Архив', uz: 'Arxiv', en: 'Archive' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name} ↗
              </a>
            ))}
          </div>
          <div className="plx-footer__stamp">
            <span>{pick(site.lang, { ru: 'Лист', uz: 'Varaq', en: 'Sheet' })} 00</span>
            <span>{pick(site.lang, { ru: 'М 1:1', uz: 'M 1:1', en: 'Scale 1:1' })}</span>
            <span>© {new Date().getFullYear()} {b.legalName || site.name}</span>
          </div>
        </div>
        <p className="plx-footer__word" aria-hidden="true">
          {site.name}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const year = site.business.founded
  return (
    <section id={s.anchor || undefined} className="s s-hero plx-hero">
      <Crosshair unit={pick(site.lang, { ru: 'мм', uz: 'mm', en: 'mm' })} />
      <div className="plx-hero__top">
        {s.eyebrow ? (
          <p className="plx-hero__eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="plx-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
      </div>
      <div className="plx-hero__draw" data-reveal="fade" data-delay="0.2">
        <Axonometry />
        {s.words.length ? (
          <ul className="plx-hero__legend">
            {s.words.map((w, i) => (
              <li key={w}>
                <span>{String.fromCharCode(65 + i)}</span>
                {w}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="plx-hero__bottom">
        {s.subtitle ? (
          <p className="plx-hero__sub" data-reveal="up" data-delay="0.4">
            {s.subtitle}
          </p>
        ) : null}
        <div className="plx-hero__ctas" data-reveal="up" data-delay="0.55">
          {s.cta.label ? (
            <a className="plx-btn plx-btn--solid" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="plx-btn" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        <dl className="plx-stamp" data-reveal="up" data-delay="0.7">
          <div>
            <dt>{pick(site.lang, { ru: 'Объект', uz: 'Obyekt', en: 'Project' })}</dt>
            <dd>{site.name}</dd>
          </div>
          <div>
            <dt>{pick(site.lang, { ru: 'Лист', uz: 'Varaq', en: 'Sheet' })}</dt>
            <dd>01</dd>
          </div>
          <div>
            <dt>{pick(site.lang, { ru: 'Масштаб', uz: 'Masshtab', en: 'Scale' })}</dt>
            <dd>1:100</dd>
          </div>
          {year ? (
            <div>
              <dt>{pick(site.lang, { ru: 'С года', uz: 'Yildan', en: 'Since' })}</dt>
              <dd>{year}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  )
}

/** Проекты — индекс с огромными номерами, кадр справа сменяется по наведению и прокрутке. */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  const p = palette(site)
  const tone = [site.theme.surface, site.theme.fg, site.theme.accent, site.theme.muted, '#e9e6e0']
  const rows = s.items.map((it, i) => {
    const facts = it.text.split(/\s*·\s*/).filter(Boolean)
    const Tag = it.href ? 'a' : 'div'
    return (
      <li key={i} className="plx-idx__row" data-reveal="up">
        <Tag className="plx-idx__link" {...(it.href ? { href: it.href } : {})}>
          <span className="plx-idx__no">{pad(i + 1)}</span>
          <span className="plx-idx__body">
            <span className="plx-idx__name">{it.title}</span>
            <span className="plx-idx__meta">{[it.category, it.year].filter(Boolean).join(' / ')}</span>
            <span className="plx-idx__mobile">
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={i % 2 ? tone : p} kind={art} className="media" />
            </span>
            <span className="plx-idx__facts">
              {facts.map((f) => {
                const [k, ...v] = f.split(':')
                return v.length ? (
                  <span key={f}>
                    <small>{k}</small>
                    {v.join(':').trim()}
                  </span>
                ) : (
                  <span key={f} className="plx-idx__lead">
                    {f}
                  </span>
                )
              })}
            </span>
          </span>
        </Tag>
      </li>
    )
  })
  const frames = s.items.map((it, i) => (
    <figure key={i} className="plx-idx__frame">
      <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={i % 2 ? tone : p} kind={art} className="media" />
      <figcaption>
        <span>{pad(i + 1)}</span>
        {it.title}
      </figcaption>
    </figure>
  ))
  return (
    <Sec id={s.anchor} type="works" className="plx-works">
      <Head label={s.label} title={s.title} />
      <ProjectIndex rows={rows} frames={frames} />
    </Sec>
  )
}

/** Услуги — разрез: каждая строка с размерной линией, над которой стоит цена. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="plx-services">
      <Head label={s.label} title={s.title}>
        {s.intro ? <p className="s__intro">{s.intro}</p> : null}
      </Head>
      <ol className="plx-svc">
        {s.items.map((it, i) => (
          <li key={i} className="plx-svc__item" data-reveal="up" data-delay={String((i % 3) * 0.06)}>
            <span className="plx-svc__no">{String.fromCharCode(65 + i)}</span>
            <div className="plx-svc__main">
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
            <div className="plx-svc__dim" data-reveal="fade" data-delay="0.2">
              <i aria-hidden="true" />
              <span>{it.price || it.tag}</span>
              {it.price && it.tag ? <small>{it.tag}</small> : null}
            </div>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Этапы — ось разреза: метки уровней ±0.000, +3.000… и шаги на них. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="plx-process">
      <Head label={s.label} title={s.title} />
      <ol className="plx-axis">
        {s.items.map((it, i) => (
          <li key={i} className="plx-axis__item" data-reveal="left" data-delay={String(i * 0.08)}>
            <span className="plx-axis__lvl">{i === 0 ? '±0.000' : `+${(i * 3).toFixed(3)}`}</span>
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
  sections: { hero: Hero, works: Works, services: Services, process: Process },
}
