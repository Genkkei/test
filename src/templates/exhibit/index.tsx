import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { ExhibitMotion } from './client'

/*
 * ЭКСПОЗИЦИЯ — галерея дизайнерской мебели. Тёмный зал; на первом экране один предмет, свет на нём
 * включается софитом (вспышка, разгорание), потом курсор становится лучом: там, куда смотрите, предмет
 * в полном свете, вокруг — полутьма. Рядом — музейная этикетка, собранная из hero.eyebrow (« · »).
 * Выставки — афиша с превью под курсором, зал — проход вдоль стены (горизонтальная лента от прокрутки).
 * Порядок входа: тьма → заголовок проступает тонкой антиквой → софит мигает и разгорается → этикетка →
 * текст и кнопки. Кривая — (.65,0,.35,1) у света, (.22,1,.36,1) у текста.
 * Шрифты: Noto Serif Display (тонкий, заголовки), Wix Madefor Text (текст, этикетки), IBM Plex Mono (даты).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <ExhibitMotion />
      <header className="exhibit-bar">
        <a href="#top" className="exhibit-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="exhibit-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="exhibit-bar__side">
          {site.nav.cta.label ? (
            <a className="exhibit-btn exhibit-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="exhibit-foot">
        <p className="exhibit-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="exhibit-foot__cols">
          <p>{site.tagline}</p>
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
        <p className="exhibit-foot__legal">
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
  const label = s.eyebrow.split(/\s+·\s+/).filter(Boolean)
  return (
    <section id={s.anchor || undefined} className="s s-hero exhibit-hero" data-exhibit-hero>
      <h1 className="exhibit-title">{s.title || site.name}</h1>
      <div className="exhibit-object" data-exhibit-object>
        <div className="exhibit-object__dim">
          <Media src={s.image} alt="" seed={`${site.slug}-hero`} colors={palette(site)} kind="orbit" className="media" />
        </div>
        <div className="exhibit-object__lit">
          <Media src={s.image} alt={label[0] || s.title || site.name} seed={`${site.slug}-hero`} colors={palette(site)} kind="orbit" className="media" />
        </div>
        <span className="exhibit-object__cone" aria-hidden="true" />
      </div>
      {label.length ? (
        <div className="exhibit-tag">
          <b>{label[0]}</b>
          {label.slice(1).map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      ) : null}
      <div className="exhibit-hero__foot">
        {s.subtitle ? <p className="exhibit-hero__sub">{s.subtitle}</p> : null}
        <div className="exhibit-hero__ctas">
          {s.cta.label ? (
            <a className="exhibit-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="exhibit-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about exhibit-about">
      <div className="exhibit-about__text" data-ex="rise">
        {s.label ? <p className="exhibit-label">{s.label}</p> : null}
        {s.title ? <h2 className="exhibit-h2">{s.title}</h2> : null}
        {s.text ? <p className="exhibit-about__body">{s.text}</p> : null}
      </div>
      <div className="exhibit-about__photo" data-ex="light">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="orbit" className="media" />
      </div>
    </section>
  )
}

/** Выставки — афиша: даты моноширинным, название крупно; под курсором всплывает вид выставки. */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works exhibit-shows" data-exhibit-shows>
      <div className="exhibit-head" data-ex="rise">
        {s.label ? <p className="exhibit-label">{s.label}</p> : null}
        {s.title ? <h2 className="exhibit-h2">{s.title}</h2> : null}
      </div>
      <ol className="exhibit-shows__list">
        {s.items.map((it, i) => (
          <li key={i} className="exhibit-show" data-ex="rise" data-exhibit-show={i} style={{ ['--i' as string]: i }}>
            <span className="exhibit-show__date">{it.year}</span>
            <h3 className="exhibit-show__title">{it.title}</h3>
            <p className="exhibit-show__meta">
              <b>{it.category}</b>
              {it.text}
            </p>
            <div className="exhibit-show__img">
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="orbit" className="media" />
            </div>
          </li>
        ))}
      </ol>
      <div className="exhibit-shows__float" aria-hidden="true" data-exhibit-float>
        {s.items.map((it, i) =>
          it.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={it.image} alt="" loading="lazy" decoding="async" data-i={i} />
          ) : null,
        )}
      </div>
    </section>
  )
}

/** Зал — проход вдоль стены: на компьютере лента едет вбок от прокрутки, на телефоне листается пальцем. */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery exhibit-walk" data-exhibit-walk style={{ ['--n' as string]: s.items.length }}>
      <div className="exhibit-walk__pin">
        <div className="exhibit-head">
          {s.label ? <p className="exhibit-label">{s.label}</p> : null}
          {s.title ? <h2 className="exhibit-h2">{s.title}</h2> : null}
        </div>
        <ul className="exhibit-walk__track">
          {s.items.map((it, i) => (
            <li key={i} className="exhibit-walk__item">
              <div className="exhibit-walk__img">
                <Media src={it.image} alt={it.caption} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="orbit" className="media" />
              </div>
              <p>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {it.caption}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats exhibit-wall">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-ex="rise" style={{ ['--i' as string]: i }}>
            <dd>
              {it.value}
              {it.suffix ? <small>{it.suffix}</small> : null}
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
    <section id={s.anchor || undefined} className="s s-services exhibit-buy">
      <div className="exhibit-head" data-ex="rise">
        {s.label ? <p className="exhibit-label">{s.label}</p> : null}
        {s.title ? <h2 className="exhibit-h2">{s.title}</h2> : null}
        {s.intro ? <p className="exhibit-head__intro">{s.intro}</p> : null}
      </div>
      <ol className="exhibit-buy__list">
        {s.items.map((it, i) => (
          <li key={i} data-ex="rise" style={{ ['--i' as string]: i }}>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            {it.price || it.tag ? (
              <p className="exhibit-buy__price">
                {it.price}
                {it.tag ? <small> · {it.tag}</small> : null}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Отзывы — страница книги отзывов у входа. */
function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials exhibit-book">
      <div className="exhibit-book__page" data-ex="rise">
        {s.label ? <p className="exhibit-label">{s.label}</p> : null}
        {s.title ? <h2 className="exhibit-book__title">{s.title}</h2> : null}
        {s.items.map((it, i) => (
          <figure key={i} className="exhibit-book__entry">
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
    <section id={s.anchor || undefined} className="s s-faq exhibit-faq">
      <div className="exhibit-head" data-ex="rise">
        {s.label ? <p className="exhibit-label">{s.label}</p> : null}
        {s.title ? <h2 className="exhibit-h2">{s.title}</h2> : null}
      </div>
      <div className="exhibit-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item exhibit-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact exhibit-visit">
      <div data-ex="rise">
        {s.label ? <p className="exhibit-label">{s.label}</p> : null}
        {s.title ? <h2 className="exhibit-visit__title">{s.title}</h2> : null}
      </div>
      <div className="exhibit-visit__plaque" data-ex="rise">
        {s.text ? <p>{s.text}</p> : null}
        <div className="exhibit-hero__ctas">
          {s.cta.label ? (
            <a className="exhibit-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="exhibit-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: () => null, about: About, works: Works, gallery: Gallery, stats: Stats, services: Services, testimonials: Testimonials, faq: Faq, contact: Contact },
}
