import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { MoodMotion } from './client'

/*
 * МУДБОРД — бюро дизайнерской мебели. Первый экран — доска архитектора: по одному прикалываются образцы
 * (шпон дуба, ясень, плашки HPL), эскиз шкафа синим карандашом, фото готовой библиотеки, карточка с
 * заголовком; потом синяя нить натягивается между булавками. Услуги — штамп чертежа, цифры — размерные
 * линии, этапы — стикеры на доске. Шрифты: Montserrat Alternates (заголовки), Inter Tight (текст),
 * IBM Plex Mono (метки, размеры).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Pin() {
  return <i className="mood-pin" aria-hidden="true" />
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <MoodMotion />
      <header className="mood-bar">
        <a href="#top" className="mood-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="mood-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <small>{String(i + 1).padStart(2, '0')}</small>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mood-bar__side">
          {site.nav.cta.label ? (
            <a className="mood-btn mood-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="mood-foot">
        <table className="mood-stamp mood-stamp--foot">
          <tbody>
            <tr>
              <th>{pick(site.lang, { ru: 'Бюро', uz: 'Byuro', en: 'Studio' })}</th>
              <td colSpan={3} className="mood-stamp__big">
                {site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}
              </td>
            </tr>
            <tr>
              <th>{ui(site.lang, 'address')}</th>
              <td>{address}</td>
              <th>{ui(site.lang, 'hours')}</th>
              <td>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</td>
            </tr>
            <tr>
              <th>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</th>
              <td>
                {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
                {b.email ? (
                  <>
                    {' · '}
                    <a href={`mailto:${b.email}`}>{b.email}</a>
                  </>
                ) : null}
              </td>
              <th>{pick(site.lang, { ru: 'Соцсети', uz: 'Tarmoqlar', en: 'Social' })}</th>
              <td>
                {b.socials.map((s, i) => (
                  <span key={s.url}>
                    {i ? ' · ' : ''}
                    <a href={s.url} target="_blank" rel="noopener me">
                      {s.name}
                    </a>
                  </span>
                ))}
              </td>
            </tr>
            <tr>
              <th>{pick(site.lang, { ru: 'Лист', uz: 'Varaq', en: 'Sheet' })}</th>
              <td>1 / 1</td>
              <th>©</th>
              <td>
                {new Date().getFullYear()} {b.legalName || site.name} · <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const tags = s.words.filter(Boolean).slice(0, 3)
  return (
    <section id={s.anchor || undefined} className="s s-hero mood-hero">
      <div className="mood-board">
        <svg className="mood-thread" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true">
          <path d="M125 32 L455 141 L830 26 M455 141 L820 410 M125 32 L115 294" pathLength="1" />
        </svg>
        <div className="mood-item mood-item--veneer" style={{ ['--i' as string]: 0 }} aria-hidden="true">
          <Pin />
          <span>{pick(site.lang, { ru: 'шпон дуба', uz: 'eman shponi', en: 'oak veneer' })}</span>
        </div>
        <div className="mood-item mood-item--chips" style={{ ['--i' as string]: 1 }} aria-hidden="true">
          <Pin />
          <i style={{ background: '#2b59c3' }} />
          <i style={{ background: '#f1efe9' }} />
          <i style={{ background: '#3b3d42' }} />
          <i style={{ background: '#c9b79a' }} />
          <span>HPL · 4</span>
        </div>
        <div className="mood-item mood-item--sketch" style={{ ['--i' as string]: 2 }} aria-hidden="true">
          <Pin />
          <svg viewBox="0 0 160 200">
            <path d="M20 20 H140 V186 H20 Z M20 70 H140 M20 120 H140 M80 120 V186 M60 40 H100 M90 150 V160 M70 150 V160" />
            <path d="M8 20 V186 M4 20 H12 M4 186 H12" className="mood-dim" />
            <text x="0" y="108" transform="rotate(-90 0 108)">2700</text>
          </svg>
        </div>
        <figure className="mood-item mood-item--photo" style={{ ['--i' as string]: 3 }}>
          <Pin />
          <Media src={s.image} alt={tags.join(', ') || site.name} seed={`${site.slug}-hero`} colors={palette(site)} kind="grid" className="media" />
          {tags.length ? <figcaption>{tags.join(' · ')}</figcaption> : null}
        </figure>
        <div className="mood-item mood-item--ash" style={{ ['--i' as string]: 4 }} aria-hidden="true">
          <Pin />
          <span>{pick(site.lang, { ru: 'ясень', uz: 'shumtol', en: 'ash' })}</span>
        </div>
        <div className="mood-card" style={{ ['--i' as string]: 5 }}>
          <Pin />
          {s.eyebrow ? <p className="mood-label">{s.eyebrow}</p> : null}
          <h1 className="mood-title">{s.title || site.name}</h1>
          {s.subtitle ? <p className="mood-card__sub">{s.subtitle}</p> : null}
          <div className="mood-ctas">
            {s.cta.label ? (
              <a className="mood-btn" href={s.cta.href || '#'}>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="mood-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about mood-about">
      <figure className="mood-about__photo" data-md="pin">
        <Pin />
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="grid" className="media" />
      </figure>
      <div className="mood-about__text" data-md="rise">
        {s.label ? <p className="mood-label">{s.label}</p> : null}
        {s.title ? <h2 className="mood-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Услуги — штампы чертежа: наименование, срок, цена в клетках рамки. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services mood-services">
      <div className="mood-head" data-md="rise">
        {s.label ? <p className="mood-label">{s.label}</p> : null}
        {s.title ? <h2 className="mood-h2">{s.title}</h2> : null}
      </div>
      <div className="mood-services__list">
        {s.items.map((it, i) => (
          <table key={i} className="mood-stamp" data-md="rise" style={{ ['--i' as string]: i }}>
            <tbody>
              <tr>
                <td colSpan={2} className="mood-stamp__big">
                  {it.title}
                </td>
                <th>{pick(site.lang, { ru: 'Поз.', uz: 'Poz.', en: 'Item' })}</th>
                <td className="mood-stamp__n">{String(i + 1).padStart(2, '0')}</td>
              </tr>
              {it.text ? (
                <tr>
                  <td colSpan={4} className="mood-stamp__text">
                    {it.text}
                  </td>
                </tr>
              ) : null}
              <tr>
                <th>{pick(site.lang, { ru: 'Срок', uz: 'Muddat', en: 'Lead time' })}</th>
                <td>{it.tag || '—'}</td>
                <th>{pick(site.lang, { ru: 'Цена', uz: 'Narx', en: 'Price' })}</th>
                <td className="mood-stamp__price">{it.price || '—'}</td>
              </tr>
            </tbody>
          </table>
        ))}
      </div>
    </section>
  )
}

/** Проекты — карточки-папки: фото, характеристики из текста («· Длина: 7,2 м · Срок: …») — в таблицу. */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works mood-works">
      <div className="mood-head" data-md="rise">
        {s.label ? <p className="mood-label">{s.label}</p> : null}
        {s.title ? <h2 className="mood-h2">{s.title}</h2> : null}
      </div>
      <ul className="mood-works__list">
        {s.items.map((it, i) => {
          const [lead, ...specs] = (it.text || '').split(' · ')
          const rows = specs.map((x) => x.split(/:\s*/)).filter((x) => x.length === 2)
          return (
            <li key={i} data-md="pin" style={{ ['--i' as string]: i }}>
              <Pin />
              <figure>
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="grid" className="media" />
              </figure>
              <div className="mood-works__body">
                <p className="mood-label">
                  {[it.category, it.year].filter(Boolean).join(' · ')}
                </p>
                <h3>{it.title}</h3>
                {lead ? <p>{lead}</p> : null}
                {rows.length ? (
                  <dl>
                    {rows.map(([k, v], j) => (
                      <div key={j}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Цифры — размерные линии: число на линии со стрелками-засечками, линия вытягивается. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats mood-dims">
      {s.title ? <h2 className="mood-label" data-md="rise">{s.title}</h2> : null}
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-md="dim" style={{ ['--i' as string]: i }}>
            <dd>
              <span>
                {it.value}
                {it.suffix ? <small>{it.suffix.trim()}</small> : null}
              </span>
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Этапы — стикеры на доске, каждый под своим углом. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process mood-notes">
      <div className="mood-head" data-md="rise">
        {s.label ? <p className="mood-label">{s.label}</p> : null}
        {s.title ? <h2 className="mood-h2">{s.title}</h2> : null}
      </div>
      <ol className="mood-notes__list">
        {s.items.map((it, i) => (
          <li key={i} data-md="pin" style={{ ['--i' as string]: i }}>
            <Pin />
            <span className="mood-notes__n">{String(i + 1).padStart(2, '0')}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq mood-faq">
      <div className="mood-head" data-md="rise">
        {s.label ? <p className="mood-label">{s.label}</p> : null}
        {s.title ? <h2 className="mood-h2">{s.title}</h2> : null}
      </div>
      <div className="mood-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item mood-faq__item" open={i === 0}>
            <summary>
              <span className="mood-faq__n">{String(i + 1).padStart(2, '0')}</span>
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
    <section id={s.anchor || undefined} className="s s-contact mood-contact">
      <div className="mood-contact__card" data-md="pin">
        <Pin />
        {s.label ? <p className="mood-label">{s.label}</p> : null}
        {s.title ? <h2 className="mood-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="mood-contact__text">{s.text}</p> : null}
        <div className="mood-ctas">
          {s.cta.label ? (
            <a className="mood-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="mood-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, services: Services, works: Works, stats: Stats, process: Process, faq: Faq, contact: Contact },
}
