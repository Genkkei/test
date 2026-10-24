import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { ChapterMotion } from './client'

/*
 * ГЛАВА — книжная кофейня. Первый экран — книга на столе: обложка с тиснением открывается, две страницы
 * перелистываются, на развороте слева — «Глава I», буквица и заголовок, справа — оглавление: жанры с точками
 * и номерами страниц. Книги сезона — серийные обложки классики (рисует CSS, без фото), форматы — библиотечные
 * формуляры со штампом дня. Шрифты: EB Garamond (заголовки), Lora (текст), Playfair Display SC (метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const COVERS = ['#d9662b', '#2f6b4f', '#2b4a7a', '#8a2c1f', '#5b4a8a', '#3a3a3a']
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <ChapterMotion />
      <header className="ch-bar">
        <a href="#top" className="ch-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="ch-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <small>{ROMAN[i] ?? i + 1}</small> {l.label}
            </a>
          ))}
        </nav>
        <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
      </header>
      <main id="top">{children}</main>
      <footer className="ch-foot">
        <p className="ch-foot__fin">{pick(site.lang, { ru: 'Конец', uz: 'Tamom', en: 'The End' })}</p>
        <p className="ch-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="ch-foot__cols">
          {address ? <p>{address}</p> : null}
          {b.hours.length ? <p>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</p> : null}
          <p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </p>
        </div>
        <p className="ch-foot__legal">
          © {new Date().getFullYear()} {b.legalName || site.name} · <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const title = s.title || site.name
  const contents = s.words.filter(Boolean).slice(0, 6)
  return (
    <section id={s.anchor || undefined} className="s s-hero ch-hero">
      <div className="ch-book">
        <div className="ch-book__page ch-book__page--l">
          <p className="ch-book__chapter">{pick(site.lang, { ru: 'Глава I', uz: 'I bob', en: 'Chapter I' })}</p>
          {s.eyebrow ? <p className="ch-label">{s.eyebrow}</p> : null}
          <h1 className="ch-title">
            <span className="ch-title__cap">{title.slice(0, 1)}</span>
            {title.slice(1)}
          </h1>
          <p className="ch-book__folio">— 1 —</p>
        </div>
        <div className="ch-book__page ch-book__page--r">
          {s.subtitle ? <p className="ch-hero__sub">{s.subtitle}</p> : null}
          {contents.length ? (
            <ol className="ch-toc">
              {contents.map((c, i) => (
                <li key={i} style={{ ['--i' as string]: i }}>
                  <span>{c}</span>
                  <i aria-hidden="true" />
                  <b>{12 + i * 37}</b>
                </li>
              ))}
            </ol>
          ) : null}
          <div className="ch-ctas">
            {s.cta.label ? (
              <a className="ch-btn" href={s.cta.href || '#'}>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="ch-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          <p className="ch-book__folio">— 2 —</p>
        </div>
        <div className="ch-book__leaf ch-book__leaf--2" aria-hidden="true" />
        <div className="ch-book__leaf ch-book__leaf--1" aria-hidden="true" />
        <div className="ch-book__cover" aria-hidden="true">
          <span>{site.name}</span>
        </div>
      </div>
    </section>
  )
}

/** Строка про кофейню — как колонтитул: через звёздочки. */
function Running({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s ch-running" aria-label={s.items.join(', ')}>
      <p data-ch="rise">
        {s.items.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </p>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about ch-about">
      <div className="ch-about__text" data-ch="rise">
        {s.label ? <p className="ch-label">{s.label}</p> : null}
        {s.title ? <h2 className="ch-h2">{s.title}</h2> : null}
        <p className="ch-about__body">{s.text}</p>
      </div>
      <figure className="ch-about__photo" data-ch="rise" style={{ ['--i' as string]: 1 }}>
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="stripes" className="media" />
      </figure>
    </section>
  )
}

/** Книги сезона — серийные обложки: цветная полоса, название, автор, дата встречи. */
function Books({ section: s }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works ch-books">
      <div className="ch-head" data-ch="rise">
        {s.label ? <p className="ch-label">{s.label}</p> : null}
        {s.title ? <h2 className="ch-h2">{s.title}</h2> : null}
      </div>
      <ul className="ch-books__shelf">
        {s.items.map((it, i) => (
          <li key={i} data-ch="pull" style={{ ['--c' as string]: COVERS[i % COVERS.length], ['--i' as string]: i }}>
            <div className="ch-cover">
              <span className="ch-cover__band" />
              <p className="ch-cover__author">{it.category}</p>
              <h3>{it.title}</h3>
              <span className="ch-cover__mark" aria-hidden="true">❦</span>
            </div>
            {it.year ? <p className="ch-books__date">{it.year}</p> : null}
            {it.text ? <p className="ch-books__note">{it.text}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Форматы — библиотечные формуляры: строки, штамп дня недели. */
function Formats({ section: s, site }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services ch-cards">
      <div className="ch-head" data-ch="rise">
        {s.label ? <p className="ch-label">{s.label}</p> : null}
        {s.title ? <h2 className="ch-h2">{s.title}</h2> : null}
      </div>
      <ul className="ch-cards__list">
        {s.items.map((it, i) => (
          <li key={i} data-ch="stamp" style={{ ['--i' as string]: i }}>
            <p className="ch-cards__kind">{pick(site.lang, { ru: 'Формуляр', uz: 'Formulyar', en: 'Library card' })} № {i + 1}</p>
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
            {it.price ? <p className="ch-cards__price">{it.price}</p> : null}
            {it.tag ? <span className="ch-cards__stamp">{it.tag}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Меню — как оглавление: название, точки, цена. */
function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu ch-menu">
      <div className="ch-head" data-ch="rise">
        {s.label ? <p className="ch-label">{s.label}</p> : null}
        {s.title ? <h2 className="ch-h2">{s.title}</h2> : null}
      </div>
      <div className="ch-menu__cols">
        {s.groups.map((g, gi) => (
          <div key={gi} data-ch="rise" style={{ ['--i' as string]: gi }}>
            <h3>{g.name}</h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={i}>
                  <span>{it.name}</span>
                  <i aria-hidden="true" />
                  <b>{it.price}</b>
                  {it.text ? <small>{it.text}</small> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Что говорят — пометки на полях: цитата с карандашной скобкой. */
function Margins({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials ch-margins">
      <div className="ch-head" data-ch="rise">
        {s.label ? <p className="ch-label">{s.label}</p> : null}
        {s.title ? <h2 className="ch-h2">{s.title}</h2> : null}
      </div>
      <div className="ch-margins__list">
        {s.items.map((it, i) => (
          <figure key={i} data-ch="rise" style={{ ['--i' as string]: i }}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              — {it.author}
              {it.role ? `, ${it.role}` : ''}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq ch-faq">
      <div className="ch-head" data-ch="rise">
        {s.label ? <p className="ch-label">{s.label}</p> : null}
        {s.title ? <h2 className="ch-h2">{s.title}</h2> : null}
      </div>
      <div className="ch-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item ch-faq__item" open={i === 0}>
            <summary>
              <span className="ch-faq__n">§ {i + 1}</span>
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
    <section id={s.anchor || undefined} className="s s-contact ch-contact">
      <div className="ch-contact__inner" data-ch="rise">
        {s.label ? <p className="ch-label">{s.label}</p> : null}
        {s.title ? <h2 className="ch-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="ch-contact__text">{s.text}</p> : null}
        <div className="ch-ctas">
          {s.cta.label ? (
            <a className="ch-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="ch-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Running, about: About, works: Books, services: Formats, menu: Menu, testimonials: Margins, faq: Faq, contact: Contact },
}
