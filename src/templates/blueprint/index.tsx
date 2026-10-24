import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { BlueprintMotion } from './client'

/*
 * ЧЕРТЁЖ — проектирование и монтаж металлоконструкций. Первый экран — расчётная схема антресоли:
 * оси в кружках → колонны и балка чертятся → стрелки нагрузки q падают на балку → балка прогибается,
 * под ней рисуется эпюра → штамп «проверено» с прогибом. Слова заголовка загораются по одному вместе
 * со стадиями (считаем → чертим → варим → монтируем). Услуги — спецификация, этапы — диаграмма Ганта,
 * объекты — листы чертежа. Шрифты: IBM Plex Mono (заголовки), Sofia Sans (текст), JetBrains Mono (метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Scheme({ lang }: { lang: string }) {
  const arrows = Array.from({ length: 11 }, (_, i) => 120 + i * 36)
  return (
    <svg className="bp-scheme" viewBox="0 0 600 420" role="img" aria-label={pick(lang, { ru: 'Расчётная схема балки антресоли', uz: 'Antresol to‘sinining hisob sxemasi', en: 'Mezzanine beam design scheme' })}>
      <g className="bp-axes">
        <path d="M120 40 V380 M480 40 V380 M60 300 H540" pathLength="1" />
        <circle cx="120" cy="24" r="14" />
        <circle cx="480" cy="24" r="14" />
        <text x="120" y="29" textAnchor="middle">1</text>
        <text x="480" y="29" textAnchor="middle">2</text>
      </g>
      <g className="bp-frame">
        <path d="M120 300 V160 M480 300 V160" pathLength="1" />
        <path className="bp-beam" d="M110 160 Q300 160 490 160" />
        <path d="M100 300 H140 M460 300 H500 M108 300 l-8 10 M120 300 l-8 10 M132 300 l-8 10 M468 300 l-8 10 M480 300 l-8 10 M492 300 l-8 10" pathLength="1" />
      </g>
      <g className="bp-load">
        <path d="M120 88 H480" />
        {arrows.map((x, i) => (
          <path key={i} d={`M${x} 90 V146 M${x - 5} 138 L${x} 148 L${x + 5} 138`} style={{ ['--i' as string]: i }} />
        ))}
        <text x="300" y="78" textAnchor="middle">q = 500 {pick(lang, { ru: 'кг/м²', uz: 'kg/m²', en: 'kg/m²' })}</text>
      </g>
      <g className="bp-epure">
        <path d="M120 200 Q300 290 480 200" pathLength="1" />
        <path d="M120 200 H480" className="bp-epure__base" pathLength="1" />
        <text x="300" y="268" textAnchor="middle">M max</text>
      </g>
      <g className="bp-dim">
        <path d="M120 350 H480 M120 342 V358 M480 342 V358" />
        <text x="300" y="344" textAnchor="middle">L = 6000</text>
      </g>
      <g className="bp-check">
        <rect x="372" y="370" width="210" height="40" />
        <text x="384" y="395">
          ✓ f = 8 {pick(lang, { ru: 'мм', uz: 'mm', en: 'mm' })} &lt; L/250
        </text>
      </g>
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <BlueprintMotion />
      <header className="bp-bar">
        <a href="#top" className="bp-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="bp-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="bp-bar__side">
          {b.phone ? (
            <a className="bp-btn bp-btn--sm" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="bp-foot">
        <div className="bp-foot__block">
          <div className="bp-foot__name">
            <small>{pick(site.lang, { ru: 'Организация', uz: 'Tashkilot', en: 'Company' })}</small>
            {site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}
          </div>
          <div>
            <small>{pick(site.lang, { ru: 'Наименование', uz: 'Nomi', en: 'Title' })}</small>
            {site.tagline}
          </div>
          {address ? (
            <div>
              <small>{ui(site.lang, 'address')}</small>
              {address}
            </div>
          ) : null}
          {b.hours.length ? (
            <div>
              <small>{ui(site.lang, 'hours')}</small>
              {b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}
            </div>
          ) : null}
          <div>
            <small>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</small>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
          <div>
            <small>{pick(site.lang, { ru: 'Лист', uz: 'Varaq', en: 'Sheet' })}</small>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </div>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const title = s.title || site.name
  const words = title.split(/(\s+)/)
  const stages = s.words.filter(Boolean).slice(0, 4)
  let w = 0
  return (
    <section id={s.anchor || undefined} className="s s-hero bp-hero">
      <div className="bp-hero__text">
        {s.eyebrow ? <p className="bp-label bp-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="bp-title">
          {words.map((part, i) =>
            /^\s+$/.test(part) ? (
              part
            ) : (
              <span key={i} className="bp-title__w" style={{ ['--w' as string]: w++ }}>
                {part}
              </span>
            ),
          )}
        </h1>
        {s.subtitle ? <p className="bp-hero__sub bp-in" style={{ ['--i' as string]: 1 }}>{s.subtitle}</p> : null}
        <div className="bp-ctas bp-in" style={{ ['--i' as string]: 2 }}>
          {s.cta.label ? (
            <a className="bp-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="bp-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label} →
            </a>
          ) : null}
        </div>
      </div>
      <figure className="bp-hero__sheet">
        <Scheme lang={site.lang} />
        {stages.length ? (
          <figcaption className="bp-tabs">
            {stages.map((st, i) => (
              <span key={i} style={{ ['--i' as string]: i }}>
                {st}
              </span>
            ))}
          </figcaption>
        ) : null}
      </figure>
    </section>
  )
}

/** Услуги — спецификация: Поз. · Наименование · Срок · Цена. */
function Spec({ section: s, site }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services bp-spec">
      <div className="bp-head" data-bp="rise">
        {s.label ? <p className="bp-label">{s.label}</p> : null}
        {s.title ? <h2 className="bp-h2">{s.title}</h2> : null}
      </div>
      <div className="bp-spec__wrap" data-bp="rise">
        <table>
          <thead>
            <tr>
              <th>{pick(site.lang, { ru: 'Поз.', uz: 'Poz.', en: 'Item' })}</th>
              <th>{pick(site.lang, { ru: 'Наименование', uz: 'Nomi', en: 'Description' })}</th>
              <th>{pick(site.lang, { ru: 'Срок', uz: 'Muddat', en: 'Lead time' })}</th>
              <th>{pick(site.lang, { ru: 'Цена', uz: 'Narx', en: 'Price' })}</th>
            </tr>
          </thead>
          <tbody>
            {s.items.map((it, i) => (
              <tr key={i}>
                <td className="bp-spec__n">{String(i + 1).padStart(2, '0')}</td>
                <td>
                  <b>{it.title}</b>
                  {it.text ? <span>{it.text}</span> : null}
                </td>
                <td className="bp-spec__mono">{it.tag || '—'}</td>
                <td className="bp-spec__mono bp-spec__price">{it.price || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** Объекты — листы чертежа: фото синькой, характеристики выносками. */
function Sheets({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works bp-sheets">
      <div className="bp-head" data-bp="rise">
        {s.label ? <p className="bp-label">{s.label}</p> : null}
        {s.title ? <h2 className="bp-h2">{s.title}</h2> : null}
      </div>
      <ul className="bp-sheets__list">
        {s.items.map((it, i) => {
          const [lead, ...specs] = (it.text || '').split(' · ')
          return (
            <li key={i} data-bp="rise" style={{ ['--i' as string]: i % 2 }}>
              <figure>
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="grid" className="media" />
                <span className="bp-sheets__no">
                  {pick(site.lang, { ru: 'Лист', uz: 'Varaq', en: 'Sheet' })} {String(i + 1).padStart(2, '0')}
                </span>
              </figure>
              <div className="bp-sheets__body">
                <p className="bp-label">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
                <h3>{it.title}</h3>
                {lead ? <p>{lead}</p> : null}
                {specs.length ? (
                  <ul className="bp-callouts">
                    {specs.map((x, j) => (
                      <li key={j}>{x}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about bp-about">
      <figure className="bp-about__photo" data-bp="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="grid" className="media" />
      </figure>
      <div className="bp-about__text" data-bp="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="bp-label">{s.label}</p> : null}
        {s.title ? <h2 className="bp-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Этапы — диаграмма Ганта: полосы со сдвигом, растут при появлении. */
function Gantt({ section: s, site }: SectionProps<'process'>) {
  const n = s.items.length
  return (
    <section id={s.anchor || undefined} className="s s-process bp-gantt">
      <div className="bp-head" data-bp="rise">
        {s.label ? <p className="bp-label">{s.label}</p> : null}
        {s.title ? <h2 className="bp-h2">{s.title}</h2> : null}
      </div>
      <ol className="bp-gantt__rows" data-bp="bars" style={{ ['--n' as string]: n }}>
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <div className="bp-gantt__name">
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
            <div className="bp-gantt__track" aria-hidden="true">
              <i />
            </div>
          </li>
        ))}
      </ol>
      <p className="bp-gantt__axis" aria-hidden="true">
        {Array.from({ length: n }, (_, i) => (
          <span key={i}>
            {pick(site.lang, { ru: 'этап', uz: 'bosqich', en: 'stage' })} {i + 1}
          </span>
        ))}
      </p>
    </section>
  )
}

/** Цифры — выноски с полкой, как на чертеже. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats bp-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-bp="rise" style={{ ['--i' as string]: i }}>
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

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq bp-faq">
      <div className="bp-head" data-bp="rise">
        {s.label ? <p className="bp-label">{s.label}</p> : null}
        {s.title ? <h2 className="bp-h2">{s.title}</h2> : null}
      </div>
      <div className="bp-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item bp-faq__item" open={i === 0}>
            <summary>
              <span className="bp-faq__n">Q{i + 1}</span>
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
    <section id={s.anchor || undefined} className="s s-contact bp-contact">
      <div className="bp-contact__inner" data-bp="rise">
        {s.label ? <p className="bp-label">{s.label}</p> : null}
        {s.title ? <h2 className="bp-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="bp-contact__text">{s.text}</p> : null}
        <div className="bp-ctas">
          {s.cta.label ? (
            <a className="bp-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="bp-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, services: Spec, works: Sheets, about: About, process: Gantt, stats: Stats, faq: Faq, contact: Contact },
}
