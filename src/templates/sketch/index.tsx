import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { SketchMotion } from './client'

/*
 * ЭСКИЗ — мебельное ателье. Первый экран — чертёжный лист: рамка чертится, карандашный эскиз предмета
 * проступает штриховкой слева направо, проводится размерная линия, и из эскиза проявляется фотография
 * готовой вещи (pencil-to-photo). Потом под курсором фото снова становится эскизом — «рентген» замысла.
 * В штампе листа перещёлкивается изделие (hero.words). Цены — спецификация, этапы — зоны рамки А–Д,
 * подвал — штамп чертежа. Кривая — Эмиль (.23,1,.32,1).
 * Шрифты: Brygada 1918 (заголовки, курсив — рука), Ysabeau (текст), Roboto Mono (размеры, штамп).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const ZONES = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'И']

/** Образцы материалов: по названию — своя фактура (CSS), неизвестное — нейтральный шпон. */
const SWATCH: [RegExp, string][] = [
  [/дуб|eman|oak/i, 'oak'],
  [/орех|yong‘oq|yong'oq|walnut/i, 'walnut'],
  [/ясен|shumtol|ash/i, 'ash'],
  [/латун|latun|jez|brass/i, 'brass'],
  [/букле|bukle|boucl/i, 'boucle'],
  [/шпон|shpon|veneer/i, 'veneer'],
]
const swatchOf = (s: string) => SWATCH.find(([re]) => re.test(s))?.[1] || 'veneer'

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <SketchMotion />
      <header className="sketch-bar">
        <a href="#top" className="sketch-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="sketch-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="sketch-bar__side">
          {site.nav.cta.label ? (
            <a className="sketch-btn sketch-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="sketch-foot">
        <div className="sketch-stamp">
          <div className="sketch-stamp__name">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</div>
          <div className="sketch-stamp__cell sketch-stamp__cell--wide">
            <small>{pick(site.lang, { ru: 'Назначение', uz: 'Vazifa', en: 'Purpose' })}</small>
            {site.tagline}
          </div>
          {address ? (
            <div className="sketch-stamp__cell">
              <small>{ui(site.lang, 'address')}</small>
              {address}
            </div>
          ) : null}
          {b.hours.length ? (
            <div className="sketch-stamp__cell">
              <small>{ui(site.lang, 'hours')}</small>
              {b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}
            </div>
          ) : null}
          {b.phone ? (
            <div className="sketch-stamp__cell">
              <small>{ui(site.lang, 'phone')}</small>
              <a href={tel(b.phone)}>{b.phone}</a>
            </div>
          ) : null}
          <div className="sketch-stamp__cell">
            <small>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</small>
            <span className="sketch-stamp__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </span>
          </div>
          <div className="sketch-stamp__cell">
            <small>{pick(site.lang, { ru: 'Лист', uz: 'Varaq', en: 'Sheet' })}</small>© {new Date().getFullYear()} {b.legalName || site.name}
          </div>
          <a className="sketch-stamp__cell sketch-stamp__top" href="#top">
            ↑ {ui(site.lang, 'toTop')}
          </a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const [head, ...rest] = (s.title || site.name).split(/\s+[—–-]\s+/)
  const tail = rest.join(' — ')
  const menu = site.sections.find((x) => x.type === 'menu' && x.enabled)
  const dims = menu && menu.type === 'menu' ? JSON.stringify(menu.groups).match(/(\d{2,3})\s*[×x]\s*(\d{2,3})\s*см/) : null
  const words = s.words.filter(Boolean)
  return (
    <section id={s.anchor || undefined} className="s s-hero sketch-hero" data-sketch-hero>
      <div className="sketch-hero__text">
        {s.eyebrow ? <p className="sketch-label sketch-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="sketch-title">
          <span className="sketch-title__hand sketch-in" style={{ ['--i' as string]: 1 }}>
            {head}
            {tail ? ' —' : ''}
          </span>
          {tail ? (
            <span className="sketch-title__made sketch-in" style={{ ['--i' as string]: 2 }}>
              {tail}
            </span>
          ) : null}
        </h1>
        {s.subtitle ? <p className="sketch-hero__sub sketch-in" style={{ ['--i' as string]: 3 }}>{s.subtitle}</p> : null}
        <div className="sketch-hero__ctas sketch-in" style={{ ['--i' as string]: 4 }}>
          {s.cta.label ? (
            <a className="sketch-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="sketch-btn sketch-btn--line" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <figure className="sketch-sheet" data-sketch-sheet>
        <div className="sketch-sheet__art">
          {s.sketch ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="sketch-sheet__pencil" src={s.sketch} alt="" decoding="async" />
          ) : null}
          <div className={`sketch-sheet__photo${s.sketch ? '' : ' is-solo'}`}>
            <Media src={s.image} alt={words[0] || s.title || site.name} seed={`${site.slug}-hero`} colors={palette(site)} kind="grid" className="media" />
          </div>
          {dims ? (
            <svg className="sketch-sheet__dim" viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true">
              <path d="M1 2 V18 M399 2 V18 M1 10 H399 M1 10 L10 6 M1 10 L10 14 M399 10 L390 6 M399 10 L390 14" pathLength="1" />
            </svg>
          ) : null}
          {dims ? <span className="sketch-sheet__dim-label">{Number(dims[1]) * 10}</span> : null}
        </div>
        <figcaption className="sketch-sheet__stamp">
          <span>
            <small>{pick(site.lang, { ru: 'Изделие', uz: 'Buyum', en: 'Piece' })}</small>
            <b data-sketch-word>{words[0] || site.niche}</b>
          </span>
          <span>
            <small>{pick(site.lang, { ru: 'Масштаб', uz: 'Masshtab', en: 'Scale' })}</small>1:10
          </span>
          <span>
            <small>{pick(site.lang, { ru: 'Лист', uz: 'Varaq', en: 'Sheet' })}</small>1
          </span>
        </figcaption>
        {words.length > 1 ? <script type="application/json" data-sketch-words dangerouslySetInnerHTML={{ __html: JSON.stringify(words) }} /> : null}
      </figure>
    </section>
  )
}

/** Материалы — образцы на картоне, а не бегущая строка. */
function Swatches({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s sketch-swatches" aria-label={pick(site.lang, { ru: 'Материалы', uz: 'Materiallar', en: 'Materials' })}>
      <p className="sketch-label">{pick(site.lang, { ru: 'Образцы в ателье', uz: 'Atelyedagi namunalar', en: 'Samples in the studio' })}</p>
      <ul>
        {s.items.map((m, i) => (
          <li key={i} data-sk="swatch" style={{ ['--i' as string]: i }}>
            <span className={`sketch-swatch sketch-swatch--${swatchOf(m)}`} aria-hidden="true" />
            {m}
          </li>
        ))}
      </ul>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  const paras = s.text.split(/\n+/).filter(Boolean)
  return (
    <section id={s.anchor || undefined} className="s s-about sketch-about">
      <div className="sketch-about__text" data-sk="rise">
        {s.label ? <p className="sketch-label">{s.label}</p> : null}
        {s.title ? <h2 className="sketch-h2">{s.title}</h2> : null}
        {paras.map((p, i) => (
          <p key={i} className={i === 0 ? 'sketch-about__lead' : 'sketch-about__body'}>
            {p}
          </p>
        ))}
      </div>
      <div className="sketch-about__photo" data-sk="lacquer">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="grid" className="media" />
      </div>
    </section>
  )
}

/** Цены — спецификация к чертежу: поз., наименование, примечание, цена «от». */
function Menu({ section: s, site }: SectionProps<'menu'>) {
  let n = 0
  return (
    <section id={s.anchor || undefined} className="s s-menu sketch-spec">
      <div className="sketch-head" data-sk="rise">
        {s.label ? <p className="sketch-label">{s.label}</p> : null}
        {s.title ? <h2 className="sketch-h2">{s.title}</h2> : null}
      </div>
      <table className="sketch-spec__table">
        <thead>
          <tr>
            <th>{pick(site.lang, { ru: 'Поз.', uz: 'Poz.', en: 'Pos.' })}</th>
            <th>{pick(site.lang, { ru: 'Наименование', uz: 'Nomi', en: 'Item' })}</th>
            <th>{pick(site.lang, { ru: 'Примечание', uz: 'Izoh', en: 'Notes' })}</th>
            <th>{pick(site.lang, { ru: 'Цена', uz: 'Narx', en: 'Price' })}</th>
          </tr>
        </thead>
        {s.groups.map((g, gi) => (
          <tbody key={gi}>
            <tr className="sketch-spec__group">
              <th colSpan={4}>{g.name}</th>
            </tr>
            {g.items.map((it, i) => {
              n += 1
              return (
                <tr key={i} data-sk="row" style={{ ['--i' as string]: i }}>
                  <td className="sketch-spec__pos">{n}</td>
                  <td className="sketch-spec__name">{it.name}</td>
                  <td className="sketch-spec__note">{it.text}</td>
                  <td className="sketch-spec__price">{it.price}</td>
                </tr>
              )
            })}
          </tbody>
        ))}
      </table>
    </section>
  )
}

/** Этапы — зоны чертёжной рамки А, Б, В…: рамка дочерчивается по мере чтения. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process sketch-zones" data-sketch-zones>
      <div className="sketch-head" data-sk="rise">
        {s.label ? <p className="sketch-label">{s.label}</p> : null}
        {s.title ? <h2 className="sketch-h2">{s.title}</h2> : null}
      </div>
      <ol className="sketch-zones__frame" style={{ ['--n' as string]: s.items.length }}>
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="sketch-zones__mark">{ZONES[i] || i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery sketch-works">
      <div className="sketch-head" data-sk="rise">
        {s.label ? <p className="sketch-label">{s.label}</p> : null}
        {s.title ? <h2 className="sketch-h2">{s.title}</h2> : null}
      </div>
      <ul className="sketch-works__grid">
        {s.items.map((it, i) => (
          <li key={i} className="sketch-work" data-sk="lacquer" style={{ ['--i' as string]: i % 3 }}>
            <div className="sketch-work__img">
              <Media src={it.image} alt={it.caption} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="grid" className="media" />
            </div>
            <p>
              <span>{pick(site.lang, { ru: 'Лист', uz: 'Varaq', en: 'Sheet' })} {i + 2}</span>
              {it.caption}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials sketch-notes">
      <div className="sketch-head" data-sk="rise">
        {s.label ? <p className="sketch-label">{s.label}</p> : null}
        {s.title ? <h2 className="sketch-h2">{s.title}</h2> : null}
      </div>
      <div className="sketch-notes__list">
        {s.items.map((it, i) => (
          <figure key={i} className="sketch-note" data-sk="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq sketch-faq">
      <div className="sketch-head" data-sk="rise">
        {s.label ? <p className="sketch-label">{s.label}</p> : null}
        {s.title ? <h2 className="sketch-h2">{s.title}</h2> : null}
      </div>
      <div className="sketch-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item sketch-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact sketch-contact">
      <div className="sketch-contact__sheet" data-sk="frame">
        {s.label ? <p className="sketch-label">{s.label}</p> : null}
        {s.title ? <h2 className="sketch-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="sketch-contact__text">{s.text}</p> : null}
        <div className="sketch-hero__ctas">
          {s.cta.label ? (
            <a className="sketch-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="sketch-btn sketch-btn--line" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Swatches, about: About, menu: Menu, process: Process, gallery: Gallery, testimonials: Testimonials, faq: Faq, contact: Contact },
}
