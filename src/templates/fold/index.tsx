import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { FoldMotion } from './client'

/*
 * СКЛАДКА — мебель-трансформер. Первый экран — разрез студии и переключатель «день / ночь / гости»:
 * кровать опускается из шкафа на газлифте, консоль раскладывается в стол на восьмерых, за окном меняется
 * небо, а заголовок Handjet меняет толщину вместе со сценарием. Сценарии один раз проходят сами, дальше —
 * по нажатию. Модели — карточки-спецификации, цифры — светодиодное табло, установка — лог по шагам.
 * Шрифты: Handjet (заголовки, табло), Inter Tight (текст), Fira Code (метки, лог).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Room({ lang }: { lang: string }) {
  return (
    <svg className="fold-room" viewBox="0 0 640 360" role="img" aria-label={pick(lang, { ru: 'Студия в разрезе: шкаф-кровать, кресло и стол-консоль', uz: 'Studiya kesimi: shkaf-karavot, kreslo va konsol-stol', en: 'Studio section: wall bed, armchair and console table' })}>
      <rect x="0" y="0" width="640" height="360" className="fold-room__bg" />
      <g className="fold-room__window">
        <rect x="250" y="50" width="130" height="120" rx="4" className="fold-room__sky" />
        <circle cx="350" cy="80" r="14" className="fold-room__moon" />
        <circle cx="290" cy="90" r="18" className="fold-room__sun" />
        <path d="M315 50 V170 M250 110 H380" className="fold-room__frame" />
      </g>
      <path d="M0 320 H640" className="fold-room__floor" />
      <rect x="40" y="60" width="86" height="260" className="fold-room__cab" />
      <path d="M48 70 H118" className="fold-room__line" />
      <g className="fold-bed">
        <rect x="126" y="290" width="210" height="30" rx="3" className="fold-bed__frame" />
        <rect x="132" y="276" width="198" height="18" rx="8" className="fold-bed__mattress" />
        <rect x="140" y="268" width="44" height="14" rx="6" className="fold-bed__pillow" />
      </g>
      <rect x="80" y="100" width="46" height="220" className="fold-room__front" />
      <g className="fold-chair">
        <path d="M430 320 V280 H500 V320 M424 280 V250 Q424 236 438 236 H492 Q506 236 506 250 V280" />
      </g>
      <g className="fold-table">
        <rect x="380" y="200" width="220" height="12" className="fold-table__top" />
        <path d="M392 212 V320 M588 212 V320" className="fold-table__legs" />
      </g>
      <g className="fold-guests">
        {[400, 455, 510, 565].map((x, i) => (
          <path key={i} d={`M${x} 320 V270 H${x + 26} V320 M${x} 270 V236`} style={{ ['--i' as string]: i }} />
        ))}
      </g>
      <g className="fold-lamp">
        <path d="M600 60 V110 M584 110 H616 L606 96 H594 Z" />
        <ellipse cx="600" cy="200" rx="70" ry="110" className="fold-lamp__glow" />
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
      <FoldMotion />
      <header className="fold-bar">
        <a href="#top" className="fold-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="fold-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="fold-bar__side">
          {site.nav.cta.label ? (
            <a className="fold-btn fold-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="fold-foot">
        <p className="fold-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="fold-foot__cols">
          <p>{site.tagline}</p>
          {address ? (
            <p>
              <small>{pick(site.lang, { ru: 'Шоурум', uz: 'Shou-rum', en: 'Showroom' })}</small>
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
        <p className="fold-foot__legal">
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
  const modes = [pick(site.lang, { ru: 'День', uz: 'Kunduz', en: 'Day' }), pick(site.lang, { ru: 'Ночь', uz: 'Tun', en: 'Night' }), pick(site.lang, { ru: 'Гости', uz: 'Mehmonlar', en: 'Guests' })]
  const feats = s.words.filter(Boolean).slice(0, 4)
  return (
    <section id={s.anchor || undefined} className="s s-hero fold-hero" data-fold-hero data-mode="0">
      <div className="fold-hero__text">
        {s.eyebrow ? <p className="fold-label fold-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="fold-title fold-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="fold-hero__sub fold-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="fold-ctas fold-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="fold-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="fold-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label} →
            </a>
          ) : null}
        </div>
      </div>
      <div className="fold-hero__stage">
        <div className="fold-seg fold-in" style={{ ['--i' as string]: 1 }} role="group" aria-label={pick(site.lang, { ru: 'Сценарий комнаты', uz: 'Xona stsenariysi', en: 'Room scenario' })}>
          <span className="fold-seg__thumb" aria-hidden="true" />
          {modes.map((m, i) => (
            <button key={i} type="button" data-mode-btn={i} aria-pressed={i === 0}>
              {m}
            </button>
          ))}
        </div>
        <Room lang={site.lang} />
        {feats.length ? (
          <ul className="fold-feats">
            {feats.map((f, i) => (
              <li key={i} className="fold-in" style={{ ['--i' as string]: 4 + i }}>
                {f}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

/** Строка возможностей — как бегущая строка табло, но неподвижная: точки-разделители. */
function Ticker({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s fold-ticker" aria-label={s.items.join(', ')}>
      <p data-fd="rise">
        {s.items.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </p>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about fold-about">
      <div className="fold-about__text" data-fd="rise">
        {s.label ? <p className="fold-label">{s.label}</p> : null}
        {s.title ? <h2 className="fold-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
      <figure className="fold-about__photo" data-fd="rise" style={{ ['--i' as string]: 1 }}>
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="grid" className="media" />
      </figure>
    </section>
  )
}

/** Модели — карточки-спецификации: характеристики через « · » становятся строками. */
function Models({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services fold-models">
      <div className="fold-head" data-fd="rise">
        {s.label ? <p className="fold-label">{s.label}</p> : null}
        {s.title ? <h2 className="fold-h2">{s.title}</h2> : null}
        {s.intro ? <p className="fold-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="fold-models__list">
        {s.items.map((it, i) => (
          <li key={i} data-fd="rise" style={{ ['--i' as string]: i }}>
            <div className="fold-models__top">
              <h3>{it.title}</h3>
              {it.tag ? <em>{it.tag}</em> : null}
            </div>
            <ul>
              {(it.text || '').split(' · ').map((x, j) => (
                <li key={j}>{x}</li>
              ))}
            </ul>
            {it.price ? <b>{it.price}</b> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Цифры — светодиодное табло. */
function Board({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats fold-led">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-fd="led" style={{ ['--i' as string]: i }}>
            <dd>
              {Number(it.value) >= 10000 ? Number(it.value).toLocaleString('ru-RU').replace(/ /g, ' ') : it.value}
              {it.suffix ? <small>{it.suffix.trim()}</small> : null}
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Установка — лог по шагам, строки печатаются одна за другой. */
function Log({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process fold-log">
      <div className="fold-head" data-fd="rise">
        {s.label ? <p className="fold-label">{s.label}</p> : null}
        {s.title ? <h2 className="fold-h2">{s.title}</h2> : null}
      </div>
      <ol className="fold-log__term" data-fd="log">
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="fold-log__n">[{String(i + 1).padStart(2, '0')}]</span>
            <b>{it.title}</b>
            <span className="fold-log__ok">OK</span>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials fold-voices">
      <div className="fold-head" data-fd="rise">
        {s.label ? <p className="fold-label">{s.label}</p> : null}
        {s.title ? <h2 className="fold-h2">{s.title}</h2> : null}
      </div>
      <div className="fold-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-fd="rise" style={{ ['--i' as string]: i }}>
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

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery fold-gallery">
      <div className="fold-head" data-fd="rise">
        {s.label ? <p className="fold-label">{s.label}</p> : null}
        {s.title ? <h2 className="fold-h2">{s.title}</h2> : null}
      </div>
      <ul className="fold-gallery__grid">
        {s.items.map((it, i) => (
          <li key={i} data-fd="rise" style={{ ['--i' as string]: i % 2 }}>
            <figure>
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="grid" className="media" />
              {it.caption ? <figcaption>{it.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq fold-faq">
      <div className="fold-head" data-fd="rise">
        {s.label ? <p className="fold-label">{s.label}</p> : null}
        {s.title ? <h2 className="fold-h2">{s.title}</h2> : null}
      </div>
      <div className="fold-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item fold-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact fold-contact">
      <div className="fold-contact__inner" data-fd="rise">
        {s.label ? <p className="fold-label">{s.label}</p> : null}
        {s.title ? <h2 className="fold-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="fold-contact__text">{s.text}</p> : null}
        <div className="fold-ctas">
          {s.cta.label ? (
            <a className="fold-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="fold-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Ticker, about: About, services: Models, stats: Board, process: Log, testimonials: Testimonials, gallery: Gallery, faq: Faq, contact: Contact },
}
