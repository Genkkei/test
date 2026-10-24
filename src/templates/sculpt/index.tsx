import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { SculptMotion } from './client'

/*
 * СКУЛЬПТУРА — студия металлических арт-объектов. Первый экран — сама скульптура: пять листов кортена
 * по кругу (CSS 3D, без библиотек), кольцо медленно вращается, прокрутка и палец его докручивают, каждый
 * лист светлеет, когда поворачивается к солнцу. Вход: линия горизонта → тень на земле → листы вырастают из
 * земли по одному → заголовок → табличка объекта (из hero.eyebrow). Проекты — паспорта объектов,
 * материалы — таблички с гравировкой, подвал — надпись на постаменте.
 * Шрифты: Forum (заголовки — надпись на памятнике), Golos Text (текст), Lilex (метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Контур листа в процентах коробки: заострённый сверху, с чуть смещённым брюшком — как у «Ржавого сада». */
function leafPolygon(k: number) {
  const pts: string[] = []
  const N = 18
  const side = (sgn: 1 | -1) => {
    for (let i = 0; i <= N; i++) {
      const t = sgn === 1 ? i / N : 1 - i / N
      const y = 100 - t * 100
      const w = Math.sin(Math.PI * Math.pow(t, 0.8)) * (46 - 6 * t) * (sgn === 1 ? 1 : 0.86 + k * 0.08)
      const bend = Math.sin(Math.PI * t) * 6 * (k - 0.5)
      pts.push(`${(50 + bend + sgn * w).toFixed(1)}% ${y.toFixed(1)}%`)
    }
  }
  side(1)
  side(-1)
  return `polygon(${pts.join(', ')})`
}

const LEAVES = [
  { h: 1, k: 0.2 },
  { h: 0.74, k: 0.8 },
  { h: 0.88, k: 0.4 },
  { h: 0.62, k: 0.65 },
  { h: 0.8, k: 0.1 },
]

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <SculptMotion />
      <header className="sculpt-bar">
        <a href="#top" className="sculpt-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="sculpt-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="sculpt-bar__side">
          {site.nav.cta.label ? (
            <a className="sculpt-btn sculpt-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="sculpt-foot">
        <div className="sculpt-foot__plinth">
          <p className="sculpt-foot__name">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
          <p className="sculpt-foot__tag">{site.tagline}</p>
        </div>
        <div className="sculpt-foot__cols">
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
        <p className="sculpt-foot__legal">
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
  // короткое слово («в», «и», «на») не остаётся в конце строки — неразрывный пробел после него
  const [lead, ...rest] = (s.title || site.name).replace(/(^|\s)(\S{1,2})\s/g, '$1$2\u00a0').split(/:\s+/)
  const plate = s.eyebrow.split(/\s+·\s+/).filter(Boolean)
  const tex = s.image ? { ['--tex' as string]: `url(${s.image})` } : undefined
  return (
    <section id={s.anchor || undefined} className="s s-hero sculpt-hero" data-sculpt-hero>
      <div className="sculpt-hero__text">
        <h1 className="sculpt-title">
          <span className="sculpt-title__lead">{lead}</span>
          {rest.length ? <span className="sculpt-title__rest">{rest.join(': ')}</span> : null}
        </h1>
        {s.subtitle ? <p className="sculpt-hero__sub">{s.subtitle}</p> : null}
        <div className="sculpt-hero__ctas">
          {s.cta.label ? (
            <a className="sculpt-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="sculpt-btn sculpt-btn--line" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="sculpt-stage" data-sculpt-stage aria-hidden="true">
        <span className="sculpt-stage__horizon" />
        <span className="sculpt-stage__shadow" />
        <div className="sculpt-ring" data-sculpt-ring style={tex}>
          {LEAVES.map((l, i) => (
            <span key={i} className="sculpt-leaf" data-sculpt-leaf={i * 72} style={{ ['--a' as string]: `${i * 72}deg`, ['--h' as string]: l.h, ['--i' as string]: i, clipPath: leafPolygon(l.k) }} />
          ))}
        </div>
      </div>
      {plate.length ? (
        <p className="sculpt-plate">
          <b>{plate[0]}</b>
          {plate.slice(1).map((p, i) => (
            <span key={i}>{p}</span>
          ))}
        </p>
      ) : null}
    </section>
  )
}

/** Материалы и умения — гравированные таблички, а не бегущая строка. */
function Plates({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  const kind = (m: string) => (/кортен|korten|corten/i.test(m) ? 'corten' : /нерж|zanglamas|stainless/i.test(m) ? 'steel' : /латун|latun|jez|brass/i.test(m) ? 'brass' : 'plain')
  return (
    <section className="s sculpt-plates" aria-label={pick(site.lang, { ru: 'Материалы и работы', uz: 'Materiallar va ishlar', en: 'Materials and work' })}>
      <ul>
        {s.items.map((m, i) => (
          <li key={i} className={`sculpt-plates__item sculpt-plates__item--${kind(m)}`} data-sc="rise" style={{ ['--i' as string]: i }}>
            {m}
          </li>
        ))}
      </ul>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about sculpt-about">
      <div className="sculpt-about__photo" data-sc="patina">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </div>
      <div className="sculpt-about__text" data-sc="rise">
        {s.label ? <p className="sculpt-label">{s.label}</p> : null}
        {s.title ? <h2 className="sculpt-h2">{s.title}</h2> : null}
        {s.text ? <p className="sculpt-about__body">{s.text}</p> : null}
      </div>
    </section>
  )
}

/** Проекты — паспорта объектов: фото, название, поля «тип / материал / год». */
function Works({ section: s, site }: SectionProps<'works'>) {
  const F = {
    kind: pick(site.lang, { ru: 'Тип', uz: 'Turi', en: 'Type' }),
    mat: pick(site.lang, { ru: 'Материал', uz: 'Material', en: 'Material' }),
    year: pick(site.lang, { ru: 'Год', uz: 'Yil', en: 'Year' }),
  }
  return (
    <section id={s.anchor || undefined} className="s s-works sculpt-works">
      <div className="sculpt-head" data-sc="rise">
        {s.label ? <p className="sculpt-label">{s.label}</p> : null}
        {s.title ? <h2 className="sculpt-h2">{s.title}</h2> : null}
      </div>
      <ol className="sculpt-works__list">
        {s.items.map((it, i) => {
          const [kind, mat] = it.category.split(/\s+·\s+/)
          return (
            <li key={i} className="sculpt-passport">
              <div className="sculpt-passport__img" data-sc="patina">
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="arch" className="media" />
              </div>
              <div className="sculpt-passport__card" data-sc="rise">
                <span className="sculpt-passport__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{it.title}</h3>
                <dl>
                  {kind ? (
                    <div>
                      <dt>{F.kind}</dt>
                      <dd>{kind}</dd>
                    </div>
                  ) : null}
                  {mat ? (
                    <div>
                      <dt>{F.mat}</dt>
                      <dd>{mat}</dd>
                    </div>
                  ) : null}
                  {it.year ? (
                    <div>
                      <dt>{F.year}</dt>
                      <dd>{it.year}</dd>
                    </div>
                  ) : null}
                </dl>
                {it.text ? <p>{it.text}</p> : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery sculpt-shop-floor">
      <div className="sculpt-head" data-sc="rise">
        {s.label ? <p className="sculpt-label">{s.label}</p> : null}
        {s.title ? <h2 className="sculpt-h2">{s.title}</h2> : null}
      </div>
      <ul className="sculpt-floor">
        {s.items.map((it, i) => (
          <li key={i} data-sc="seam" style={{ ['--i' as string]: i }}>
            <div className="sculpt-floor__img">
              <Media src={it.image} alt={it.caption} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="arch" className="media" />
              <span className="sculpt-floor__seam" aria-hidden="true" />
            </div>
            <p>{it.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats sculpt-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-sc="rise" style={{ ['--i' as string]: i }}>
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

function Services({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services sculpt-formats">
      <div className="sculpt-head" data-sc="rise">
        {s.label ? <p className="sculpt-label">{s.label}</p> : null}
        {s.title ? <h2 className="sculpt-h2">{s.title}</h2> : null}
        {s.intro ? <p className="sculpt-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="sculpt-formats__list">
        {s.items.map((it, i) => (
          <li key={i} data-sc="rise" style={{ ['--i' as string]: i }}>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            {it.price ? <b>{it.price}</b> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials sculpt-voices">
      <div className="sculpt-head" data-sc="rise">
        {s.label ? <p className="sculpt-label">{s.label}</p> : null}
        {s.title ? <h2 className="sculpt-h2">{s.title}</h2> : null}
      </div>
      <div className="sculpt-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-sc="rise" style={{ ['--i' as string]: i }}>
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

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq sculpt-faq">
      <div className="sculpt-head" data-sc="rise">
        {s.label ? <p className="sculpt-label">{s.label}</p> : null}
        {s.title ? <h2 className="sculpt-h2">{s.title}</h2> : null}
      </div>
      <div className="sculpt-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item sculpt-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact sculpt-contact">
      <div data-sc="rise">
        {s.label ? <p className="sculpt-label">{s.label}</p> : null}
        {s.title ? <h2 className="sculpt-contact__title">{s.title}</h2> : null}
      </div>
      <div className="sculpt-contact__side" data-sc="rise">
        {s.text ? <p>{s.text}</p> : null}
        <div className="sculpt-hero__ctas">
          {s.cta.label ? (
            <a className="sculpt-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="sculpt-btn sculpt-btn--line" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Plates, about: About, works: Works, gallery: Gallery, stats: Stats, services: Services, testimonials: Testimonials, faq: Faq, contact: Contact },
}
