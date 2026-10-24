import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { StockClock, StockMotion } from './client'

/*
 * ТАБЛО — металлобаза. Ведущий приём один — флажковое табло (split-flap, как на вокзале): заголовок
 * набран буквами на флажках, третья строка перещёлкивается словами из hero.words, прайс — табло
 * отправлений. Вокруг — приборы базы: часы, камера площадки с отметкой времени, счётчики склада.
 * Порядок входа: линия табло → пустые флажки → буквы падают слева направо, строка за строкой →
 * камера включается (полоса → кадр) → счётчики → текст и кнопки. Кривая — haoqi (.66,0,.01,1).
 * Шрифты: Alumni Sans (табло и заголовки), PT Sans Narrow (текст), Fira Mono (метки, цены).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const up = (s: string) => s.toLocaleUpperCase('ru')

/** Строка табло: фиксированное число флажков, лишние — пустые (как у настоящего Solari). */
function FlapRow({ text, cols, row, live }: { text: string; cols: number; row: number; live?: boolean }) {
  const chars = [...up(text)].slice(0, cols)
  return (
    <span className="stock-row" data-stock-row={live ? 'live' : undefined} aria-hidden="true">
      {Array.from({ length: cols }, (_, i) => (
        <span key={i} className="stock-flap" style={{ ['--k' as string]: row * cols * 0.35 + i }}>
          <span className="stock-flap__ch">{chars[i] && chars[i] !== ' ' ? chars[i] : ' '}</span>
        </span>
      ))}
    </span>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <StockMotion />
      <header className="stock-bar">
        <a href="#top" className="stock-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="stock-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <small>{String(i + 1).padStart(2, '0')}</small>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="stock-bar__side">
          {b.phone ? (
            <a className="stock-bar__phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="stock-btn stock-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="stock-foot">
        <div className="stock-foot__hazard" aria-hidden="true" />
        <div className="stock-foot__grid">
          <div className="stock-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</div>
          <p className="stock-foot__tag">{site.tagline}</p>
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
          {b.phone ? (
            <p>
              <small>{ui(site.lang, 'phone')}</small>
              <a href={tel(b.phone)}>{b.phone}</a>
            </p>
          ) : null}
          <p className="stock-foot__social">
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </p>
        </div>
        <p className="stock-foot__legal">
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
  const stats = site.sections.find((x) => x.type === 'stats' && x.enabled)
  const counters = stats && stats.type === 'stats' ? stats.items.slice(0, 4) : []
  const title = (s.title || site.name).split(/\s+/).filter(Boolean)
  const words = s.words.filter(Boolean)
  const cols = Math.max(8, ...title.map((w) => w.length), ...words.map((w) => w.length))
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-hero stock-hero" data-stock-hero>
      <p className="stock-hero__strip">
        <span>{s.eyebrow || site.tagline}</span>
        <StockClock />
        {b.hours.length ? <span>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</span> : null}
      </p>
      <div className="stock-board" style={{ ['--cols' as string]: cols }}>
        <h1 className="stock-board__title">
          {title.map((w, i) => (
            <FlapRow key={i} text={w} cols={cols} row={i} />
          ))}
          {words.length ? <FlapRow text={words[0]} cols={cols} row={title.length} live /> : null}
          <span className="sr-only">{[s.title || site.name, words[0]].filter(Boolean).join(' ')}</span>
        </h1>
        {words.length > 1 ? <script type="application/json" data-stock-words dangerouslySetInnerHTML={{ __html: JSON.stringify(words.map(up)) }} /> : null}
      </div>
      <div className="stock-hero__info">
        {s.subtitle ? <p className="stock-hero__sub">{s.subtitle}</p> : null}
        <div className="stock-hero__ctas">
          {s.cta.label ? (
            <a className="stock-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="stock-btn stock-btn--line" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <figure className="stock-cam">
        <div className="stock-cam__screen">
          {s.video ? (
            <video src={s.video} poster={s.image || undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
          ) : (
            <Media src={s.image} alt="" seed={`${site.slug}-hero`} colors={palette(site)} kind="stripes" className="media" />
          )}
          <span className="stock-cam__rec" aria-hidden="true">
            REC
          </span>
          <StockClock className="stock-cam__time" withDate />
        </div>
        <figcaption>{pick(site.lang, { ru: 'КАМ 02 · ПЛОЩАДКА', uz: 'KAM 02 · MAYDON', en: 'CAM 02 · YARD' })}</figcaption>
      </figure>
      {counters.length ? (
        <dl className="stock-counters">
          {counters.map((c, i) => (
            <div key={i} className="stock-counter" style={{ ['--i' as string]: i }}>
              <dt>{c.label}</dt>
              <dd>
                {c.value}
                {c.suffix ? <small>{c.suffix.trim()}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about stock-about">
      <div className="stock-about__photo" data-st="open">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="stripes" className="media" />
        {s.video ? (
          <figure className="stock-cam stock-cam--inset">
            <div className="stock-cam__screen">
              <video src={s.video} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
              <span className="stock-cam__rec" aria-hidden="true">
                REC
              </span>
            </div>
            <figcaption>{pick(site.lang, { ru: 'КАМ 03 · ЦЕХ ПОРЕЗКИ', uz: 'KAM 03 · KESISH SEXI', en: 'CAM 03 · CUTTING SHOP' })}</figcaption>
          </figure>
        ) : null}
      </div>
      <div className="stock-about__text" data-st="rise">
        {s.label ? <p className="stock-label">{s.label}</p> : null}
        {s.title ? <h2 className="stock-h2">{s.title}</h2> : null}
        {s.text ? <p className="stock-about__body">{s.text}</p> : null}
      </div>
    </section>
  )
}

/** Прайс — табло отправлений: группа — строка-заголовок, позиции — строки на флажках. */
function Menu({ section: s, site }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu stock-price">
      <div className="stock-head" data-st="rise">
        {s.label ? <p className="stock-label">{s.label}</p> : null}
        {s.title ? <h2 className="stock-h2">{s.title}</h2> : null}
      </div>
      <div className="stock-departures" role="table" aria-label={s.title || s.label}>
        <div className="stock-departures__cap" role="row">
          <span role="columnheader">{pick(site.lang, { ru: 'Позиция', uz: 'Mahsulot', en: 'Item' })}</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Для чего', uz: 'Nima uchun', en: 'Used for' })}</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Цена', uz: 'Narx', en: 'Price' })}</span>
        </div>
        {s.groups.map((g, gi) => (
          <div key={gi} className="stock-departures__group" role="rowgroup">
            <p className="stock-departures__name" role="row" data-st="flip">
              <span role="cell">{g.name}</span>
            </p>
            {g.items.map((it, i) => (
              <p key={i} className="stock-departures__row" role="row" data-st="flip" style={{ ['--i' as string]: i + 1 }}>
                <b role="cell">{it.name}</b>
                <span role="cell">{it.text}</span>
                <span role="cell" className="stock-departures__price">
                  {it.price}
                </span>
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

/** Услуги — лист порезки: под каждой строкой размерная линия чертежа. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services stock-cut">
      <div className="stock-head" data-st="rise">
        {s.label ? <p className="stock-label">{s.label}</p> : null}
        {s.title ? <h2 className="stock-h2">{s.title}</h2> : null}
        {s.intro ? <p className="stock-head__intro">{s.intro}</p> : null}
      </div>
      <ol className="stock-cut__list">
        {s.items.map((it, i) => (
          <li key={i} className="stock-cut__item" data-st="dim" style={{ ['--i' as string]: i }}>
            <span className="stock-cut__n">{String(i + 1).padStart(2, '0')}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            {it.price ? <span className="stock-cut__price">{it.price}</span> : null}
            <svg className="stock-cut__dim" viewBox="0 0 400 12" preserveAspectRatio="none" aria-hidden="true">
              <path d="M1 0 V12 M399 0 V12 M1 6 H399 M1 6 L9 2 M1 6 L9 10 M399 6 L391 2 M399 6 L391 10" pathLength="1" vectorEffect="non-scaling-stroke" />
            </svg>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Цифры склада — счётчики на первом экране. */
const Stats = () => null

/** Как заказать — рулетка: лента вытягивается прокруткой, шаги стоят на метровых отметках. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process stock-tape" data-stock-tape>
      <div className="stock-head" data-st="rise">
        {s.label ? <p className="stock-label">{s.label}</p> : null}
        {s.title ? <h2 className="stock-h2">{s.title}</h2> : null}
      </div>
      <div className="stock-tape__body">
        <div className="stock-tape__strip" aria-hidden="true">
          <span />
        </div>
        <ol className="stock-tape__steps" style={{ ['--n' as string]: s.items.length }}>
          {s.items.map((it, i) => (
            <li key={i} style={{ ['--i' as string]: i }}>
              <span className="stock-tape__mark">{i}м</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials stock-quotes">
      <div className="stock-head" data-st="rise">
        {s.label ? <p className="stock-label">{s.label}</p> : null}
        {s.title ? <h2 className="stock-h2">{s.title}</h2> : null}
      </div>
      <div className="stock-quotes__list">
        {s.items.map((it, i) => (
          <figure key={i} className="stock-quote" data-st="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq stock-faq">
      <div className="stock-head" data-st="rise">
        {s.label ? <p className="stock-label">{s.label}</p> : null}
        {s.title ? <h2 className="stock-h2">{s.title}</h2> : null}
      </div>
      <div className="stock-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item stock-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact stock-gate">
      <div className="stock-gate__text" data-st="rise">
        {s.label ? <p className="stock-label">{s.label}</p> : null}
        {s.title ? <h2 className="stock-gate__title">{s.title}</h2> : null}
        <div className="stock-hero__ctas">
          {s.cta.label ? (
            <a className="stock-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="stock-btn stock-btn--line" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
        </div>
      </div>
      {s.text ? (
        <div className="stock-gate__sign" data-st="rise">
          <p className="stock-gate__sign-head">{pick(site.lang, { ru: 'ВЪЕЗД', uz: 'KIRISH', en: 'ENTRANCE' })}</p>
          <p>{s.text}</p>
        </div>
      ) : null}
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: () => null, about: About, menu: Menu, services: Services, process: Process, stats: Stats, testimonials: Testimonials, faq: Faq, contact: Contact },
}
