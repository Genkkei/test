import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { GateMotion } from './client'

/*
 * ВОРОТА — металлоконструкции для частного дома. Первый экран — откатные ворота из ламелей во всю ширину:
 * чертится рельс, поднимаются столбы, ламели встают сверху вниз, лампа привода мигает — и ворота уезжают
 * вправо, открывая двор. Пакеты — генплан участка: выбираешь пакет, на плане загораются его части.
 * Ход работ — паспорт объекта с процентами. Шрифты: Tektur (заголовки), Manrope (текст), Roboto Mono (метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const SLATS = 13

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <GateMotion />
      <header className="gate-bar">
        <a href="#top" className="gate-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="gate-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="gate-bar__side">
          {b.phone ? (
            <a className="gate-bar__phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="gate-foot">
        <div className="gate-foot__head">
          <p className="gate-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
          <p>{site.tagline}</p>
        </div>
        <dl className="gate-foot__facts">
          {address ? (
            <div>
              <dt>{ui(site.lang, 'address')}</dt>
              <dd>{address}</dd>
            </div>
          ) : null}
          {b.hours.length ? (
            <div>
              <dt>{ui(site.lang, 'hours')}</dt>
              <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
            </div>
          ) : null}
          <div>
            <dt>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</dt>
            <dd>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
              {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </dd>
          </div>
        </dl>
        <p className="gate-foot__legal">
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
  const words = s.words.filter(Boolean).slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero gate-hero">
      <div className="gate-hero__yard">
        <Media src={s.image} alt="" seed={`${site.slug}-yard`} colors={palette(site)} kind="grid" className="media" />
      </div>
      <div className="gate-hero__shade" aria-hidden="true" />
      <div className="gate-rig" aria-hidden="true">
        <span className="gate-rig__post gate-rig__post--l">
          <i className="gate-rig__lamp" />
        </span>
        <div className="gate-rig__leaf">
          {Array.from({ length: SLATS }, (_, i) => (
            <span key={i} style={{ ['--i' as string]: i }} />
          ))}
          <b className="gate-rig__roller gate-rig__roller--a" />
          <b className="gate-rig__roller gate-rig__roller--b" />
        </div>
        <span className="gate-rig__post gate-rig__post--r" />
        <span className="gate-rig__rail" />
      </div>
      <div className="gate-hero__text">
        {s.eyebrow ? <p className="gate-label gate-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="gate-title gate-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="gate-hero__sub gate-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="gate-ctas gate-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="gate-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="gate-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      {words.length ? (
        <ul className="gate-plates">
          {words.map((w, i) => (
            <li key={i} className="gate-in" style={{ ['--i' as string]: 4 + i }}>
              {w}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about gate-about">
      <div className="gate-about__text" data-gt="rise">
        {s.label ? <p className="gate-label">{s.label}</p> : null}
        {s.title ? <h2 className="gate-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
      <figure className="gate-about__photo" data-gt="rise" style={{ ['--i' as string]: 1 }}>
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="grid" className="media" />
      </figure>
    </section>
  )
}

/** Пакеты — генплан участка. Части плана по пакетам: въезд, периметр, двор под ключ, автоматика. */
function Packages({ section: s, site }: SectionProps<'works'>) {
  const parts = ['gate wicket', 'gate wicket fence', 'gate wicket fence canopy', 'motor']
  return (
    <section id={s.anchor || undefined} className="s s-works gate-plan" data-gate-plan data-pk="2">
      <div className="gate-head" data-gt="rise">
        {s.label ? <p className="gate-label">{s.label}</p> : null}
        {s.title ? <h2 className="gate-h2">{s.title}</h2> : null}
      </div>
      <div className="gate-plan__body">
        <ul className="gate-plan__list">
          {s.items.map((it, i) => (
            <li key={i} data-gt="rise" style={{ ['--i' as string]: i }}>
              <button type="button" data-pk-btn={i} data-parts={parts[i % parts.length]} aria-pressed={i === 2}>
                <span className="gate-plan__name">{it.title}</span>
                {it.category ? <span className="gate-plan__spec">{it.category}</span> : null}
                {it.text ? <span className="gate-plan__text">{it.text}</span> : null}
                {it.year ? <b className="gate-plan__price">{it.year}</b> : null}
              </button>
            </li>
          ))}
        </ul>
        <figure className="gate-plan__sheet" data-gt="draw">
          <svg viewBox="0 0 600 460" role="img" aria-label={pick(site.lang, { ru: 'План участка', uz: 'Uchastka rejasi', en: 'Plot plan' })}>
            <defs>
              <pattern id="gate-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="1" opacity=".35" />
              </pattern>
            </defs>
            <g className="gate-plan__grid">
              {Array.from({ length: 13 }, (_, i) => (
                <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="460" />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
              ))}
            </g>
            <rect x="200" y="70" width="260" height="160" fill="url(#gate-hatch)" stroke="currentColor" strokeWidth="2" />
            <text x="330" y="156" textAnchor="middle" className="gate-plan__t">
              {pick(site.lang, { ru: 'ДОМ', uz: 'UY', en: 'HOUSE' })}
            </text>
            <rect x="240" y="230" width="130" height="180" className="gate-plan__drive" />
            <path className="p-fence" d="M226 410 H50 V40 H560 V410 H446" />
            <path className="p-gate" d="M240 410 H370" />
            <path className="p-gate p-track" d="M370 418 H500" />
            <path className="p-wicket" d="M392 410 H432" />
            <path className="p-wicket" d="M392 410 A40 40 0 0 1 432 370" />
            <g className="p-canopy">
              <rect x="236" y="250" width="138" height="140" />
              <path d="M236 250 L374 390 M374 250 L236 390" />
            </g>
            <g className="p-motor">
              <rect x="222" y="384" width="16" height="16" />
              <path d="M214 376 a14 14 0 0 1 0 -20 M206 382 a24 24 0 0 1 0 -32" />
            </g>
            <text x="305" y="446" textAnchor="middle" className="gate-plan__t">
              5 м
            </text>
            <text x="30" y="225" textAnchor="middle" className="gate-plan__t" transform="rotate(-90 30 225)">
              30 м
            </text>
          </svg>
          <figcaption>
            <span className="k-gate">{pick(site.lang, { ru: 'ворота', uz: 'darvoza', en: 'gate' })}</span>
            <span className="k-wicket">{pick(site.lang, { ru: 'калитка', uz: 'kichik eshik', en: 'wicket' })}</span>
            <span className="k-fence">{pick(site.lang, { ru: 'забор', uz: 'devor', en: 'fence' })}</span>
            <span className="k-canopy">{pick(site.lang, { ru: 'навес', uz: 'ayvon', en: 'carport' })}</span>
            <span className="k-motor">{pick(site.lang, { ru: 'привод', uz: 'yuritma', en: 'motor' })}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/** Ход работ — паспорт объекта: этап, процент, полоса. Процент берётся из названия («— 80%»). */
function Passport({ section: s, site }: SectionProps<'process'>) {
  const rows = s.items.map((it) => {
    const m = it.title.match(/(\d{1,3})\s*%/)
    return { name: it.title.replace(/[\s—–-]*\d{1,3}\s*%\s*$/, '').trim(), pct: m ? Math.min(100, Number(m[1])) : null, text: it.text }
  })
  const known = rows.filter((r) => r.pct !== null)
  const total = known.length ? Math.round(known.reduce((a, r) => a + (r.pct ?? 0), 0) / known.length) : null
  return (
    <section id={s.anchor || undefined} className="s s-process gate-passport">
      <div className="gate-passport__board" data-gt="bars">
        <div className="gate-passport__head">
          {s.label ? <p className="gate-label">{s.label}</p> : null}
          {s.title ? <h2 className="gate-h2">{s.title}</h2> : null}
          {total !== null ? (
            <p className="gate-passport__total">
              <b>{total}%</b>
              <span>{pick(site.lang, { ru: 'готовность объекта', uz: 'obyekt tayyorligi', en: 'site progress' })}</span>
            </p>
          ) : null}
        </div>
        <ol className="gate-passport__rows">
          {rows.map((r, i) => (
            <li key={i} style={{ ['--i' as string]: i, ['--p' as string]: `${r.pct ?? 0}%` }} className={r.pct === 100 ? 'is-done' : r.pct === 0 ? 'is-next' : undefined}>
              <div className="gate-passport__line">
                <h3>{r.name}</h3>
                {r.pct !== null ? <span>{r.pct}%</span> : null}
              </div>
              {r.pct !== null ? (
                <div className="gate-passport__bar" aria-hidden="true">
                  <i />
                </div>
              ) : null}
              {r.text ? <p>{r.text}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats gate-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-gt="rise" style={{ ['--i' as string]: i }}>
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

/** Дополнительно — строки сметы с квадратом-отметкой. */
function Extras({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services gate-extras">
      <div className="gate-head" data-gt="rise">
        {s.label ? <p className="gate-label">{s.label}</p> : null}
        {s.title ? <h2 className="gate-h2">{s.title}</h2> : null}
        {s.intro ? <p className="gate-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="gate-extras__list">
        {s.items.map((it, i) => (
          <li key={i} data-gt="rise" style={{ ['--i' as string]: i }}>
            <i aria-hidden="true" />
            <div>
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            {it.price ? <b>{it.price}</b> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Работы — фото с адресной табличкой. */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery gate-gallery">
      <div className="gate-head" data-gt="rise">
        {s.label ? <p className="gate-label">{s.label}</p> : null}
        {s.title ? <h2 className="gate-h2">{s.title}</h2> : null}
      </div>
      <ul className="gate-gallery__grid">
        {s.items.map((it, i) => (
          <li key={i} data-gt="rise" style={{ ['--i' as string]: i % 2 }}>
            <figure>
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="grid" className="media" />
              {it.caption ? (
                <figcaption>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {it.caption}
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq gate-faq">
      <div className="gate-head" data-gt="rise">
        {s.label ? <p className="gate-label">{s.label}</p> : null}
        {s.title ? <h2 className="gate-h2">{s.title}</h2> : null}
      </div>
      <div className="gate-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item gate-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact gate-contact">
      <div className="gate-contact__slats" aria-hidden="true" />
      <div className="gate-contact__inner" data-gt="rise">
        {s.label ? <p className="gate-label">{s.label}</p> : null}
        {s.title ? <h2 className="gate-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="gate-contact__text">{s.text}</p> : null}
        <div className="gate-ctas">
          {s.cta.label ? (
            <a className="gate-btn gate-btn--light" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="gate-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, works: Packages, process: Passport, stats: Stats, services: Extras, gallery: Gallery, faq: Faq, contact: Contact },
}
