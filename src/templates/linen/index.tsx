import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { LinenMotion } from './client'

/*
 * ЛЁН — мебель и домашний текстиль. Первый экран — окно в гостиной: рулетка вытягивается по ширине и сбегает
 * вниз по высоте (сантиметры бегут), затем льняные шторы разворачиваются с карниза по этим меркам; у окна диван,
 * на подлокотник ложится плед. Коллекции — журнальные развороты с размерами, ткани — образцы с загнутым уголком,
 * пошив — тканые ярлыки, этапы — на сантиметровой ленте.
 * Шрифты: Cormorant Infant (заголовки), Mulish (текст), Fira Mono (метки, сантиметры).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <LinenMotion />
      <header className="ln-bar">
        <a href="#top" className="ln-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="ln-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ln-bar__side">
          {site.nav.cta.label ? (
            <a className="ln-btn ln-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="ln-foot">
        <p className="ln-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="ln-foot__cols">
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
        <p className="ln-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Окно в гостиной: рулетка вытягивается по ширине и сбегает вниз по высоте, цифры сантиметров бегут, затем
 *  льняная штора разворачивается с карниза ровно по этим меркам, у окна — диван с пледом. */
function Measure({ site }: { site: Site }) {
  const cm = pick(site.lang, { ru: 'см', uz: 'sm', en: 'cm' })
  return (
    <div className="ln-room" aria-hidden="true">
      <div className="ln-window">
        <i className="ln-window__view" />
      </div>
      <i className="ln-rod" />
      <div className="ln-tape ln-tape--w">
        <i />
        <b className="ln-tape__n ln-tape__n--w">
          <i /> {cm}
        </b>
      </div>
      <div className="ln-tape ln-tape--h">
        <i />
        <b className="ln-tape__n ln-tape__n--h">
          <i /> {cm}
        </b>
      </div>
      <div className="ln-curtain ln-curtain--l" />
      <div className="ln-curtain ln-curtain--r" />
      <div className="ln-sofa">
        <i className="ln-sofa__back" />
        <i className="ln-sofa__seat" />
        <i className="ln-sofa__throw" />
      </div>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero ln-hero">
      <div className="ln-hero__text">
        {s.eyebrow ? <p className="ln-label ln-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="ln-title ln-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="ln-hero__sub ln-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="ln-ctas ln-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="ln-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="ln-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <Measure site={site} />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about ln-about">
      <figure className="ln-about__photo" data-ln="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="ln-about__text" data-ln="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="ln-label">{s.label}</p> : null}
        {s.title ? <h2 className="ln-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Коллекции — журнальные развороты: снимок комнаты слева, справа описание и размеры строкой спецификации. */
function Spreads({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works ln-spreads">
      <div className="ln-head" data-ln="rise">
        {s.label ? <p className="ln-label">{s.label}</p> : null}
        {s.title ? <h2 className="ln-h2">{s.title}</h2> : null}
      </div>
      <ul className="ln-spreads__list">
        {s.items.map((it, i) => {
          const [lead, ...specs] = (it.text || '').split(' · ')
          return (
            <li key={i} data-ln="spread" style={{ ['--i' as string]: i }}>
              <figure>
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="arch" className="media" />
              </figure>
              <div className="ln-spreads__page">
                <p className="ln-spreads__meta">
                  {it.category}
                  {it.year ? <span>{it.year}</span> : null}
                </p>
                <h3>{it.title}</h3>
                {lead ? <p>{lead}</p> : null}
                {specs.length ? (
                  <dl>
                    {specs.map((sp, j) => {
                      const k = sp.indexOf(':')
                      return (
                        <div key={j}>
                          <dt>{k > 0 ? sp.slice(0, k) : ''}</dt>
                          <dd>{k > 0 ? sp.slice(k + 1).trim() : sp}</dd>
                        </div>
                      )
                    })}
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

/** Пошив — тканые ярлыки: вшитая этикетка с подогнутыми концами, цена — на ней. */
function Labels({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing ln-labels">
      <div className="ln-head" data-ln="rise">
        {s.label ? <p className="ln-label">{s.label}</p> : null}
        {s.title ? <h2 className="ln-h2">{s.title}</h2> : null}
      </div>
      <div className="ln-labels__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-ln="rise" style={{ ['--i' as string]: i }}>
            <p className="ln-labels__tag">
              <b>{it.name}</b>
              <span>
                {it.price}
                {it.period ? <small>{it.period}</small> : null}
              </span>
            </p>
            <ul>
              {it.features.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

/** Ткани — образцы на кольце: квадрат ткани, у каждого загибается уголок при появлении и наведении. */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery ln-fabrics">
      <div className="ln-head" data-ln="rise">
        {s.label ? <p className="ln-label">{s.label}</p> : null}
        {s.title ? <h2 className="ln-h2">{s.title}</h2> : null}
      </div>
      <ul className="ln-fabrics__grid">
        {s.items.map((it, i) => (
          <li key={i} data-ln="corner" style={{ ['--i' as string]: i }}>
            <figure>
              <span className="ln-fabrics__ring" aria-hidden="true" />
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="arch" className="media" />
              {it.caption ? <figcaption>{it.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats ln-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-ln="rise" style={{ ['--i' as string]: i }}>
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

function Team({ section: s, site }: SectionProps<'team'>) {
  return (
    <section id={s.anchor || undefined} className="s s-team ln-team">
      <div className="ln-head" data-ln="rise">
        {s.label ? <p className="ln-label">{s.label}</p> : null}
        {s.title ? <h2 className="ln-h2">{s.title}</h2> : null}
      </div>
      <ul className="ln-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-ln="rise" style={{ ['--i' as string]: i }}>
            <figure>
              <Media src={it.image} alt={`${it.name}, ${it.role}`} seed={`${site.slug}-t${i}`} colors={palette(site)} kind="arch" className="media" />
            </figure>
            <h3>{it.name}</h3>
            <p>{it.role}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Как заказать — шаги на сантиметровой ленте: деления, шаг стоит на своей отметке. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process ln-ruler">
      <div className="ln-head" data-ln="rise">
        {s.label ? <p className="ln-label">{s.label}</p> : null}
        {s.title ? <h2 className="ln-h2">{s.title}</h2> : null}
      </div>
      <ol className="ln-ruler__list" data-ln="tape">
        <i className="ln-ruler__tape" aria-hidden="true" />
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="ln-ruler__cm" aria-hidden="true">
              {(i + 1) * 10}
            </span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials ln-voices">
      <div className="ln-head" data-ln="rise">
        {s.label ? <p className="ln-label">{s.label}</p> : null}
        {s.title ? <h2 className="ln-h2">{s.title}</h2> : null}
      </div>
      <div className="ln-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-ln="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq ln-faq">
      <div className="ln-head" data-ln="rise">
        {s.label ? <p className="ln-label">{s.label}</p> : null}
        {s.title ? <h2 className="ln-h2">{s.title}</h2> : null}
      </div>
      <div className="ln-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item ln-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="ln-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact ln-contact">

      <div className="ln-contact__inner" data-ln="rise">
        {s.label ? <p className="ln-label">{s.label}</p> : null}
        {s.title ? <h2 className="ln-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="ln-contact__text">{s.text}</p> : null}
        <div className="ln-ctas">
          {s.cta.label ? (
            <a className="ln-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="ln-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, works: Spreads, pricing: Labels, gallery: Gallery, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
