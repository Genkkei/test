import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { BlacklineMotion } from './client'

/*
 * ЧЁРНАЯ ЛИНИЯ — мастерская кованого декора и лофт-аксессуаров. Всё рисуется одной чёрной линией, как эскиз мастера.
 * Первый экран — подсвечник: линия эскиза → сырой серый металл → кисть с горячим воском проходит слева направо,
 * металл темнеет до тёплого чёрного с коричневым отливом → загораются свечи. Работы открываются мазком кисти,
 * этапы связаны одной змеящейся линией, цены — листы эскизов с рамкой от руки.
 * Шрифты: Yanone Kaffeesatz (заголовки), Manrope (текст), JetBrains Mono (метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <BlacklineMotion />
      <header className="bl-bar">
        <a href="#top" className="bl-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="bl-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="bl-bar__side">
          {site.nav.cta.label ? (
            <a className="bl-btn bl-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="bl-foot">
        <p className="bl-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <div className="bl-foot__cols">
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
        <p className="bl-foot__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

/** Подсвечник одной линией. Рисуется тонкой линией эскиза, становится сырым серым металлом, потом кисть с горячим
 *  воском проходит слева направо — металл темнеет до тёплого чёрного с коричневым отливом, загораются свечи. */
const HOLDER =
  'M84 318 H216 M150 318 V206 M150 270 C138 270 138 248 150 248 C162 248 162 270 150 270 M150 206 C150 168 88 196 80 156 M150 206 C150 168 212 196 220 156 M150 206 V134 M64 156 H96 M134 134 H166 M204 156 H236 M108 318 C108 306 120 300 132 300 M192 318 C192 306 180 300 168 300'

function Holder() {
  return (
    <div className="bl-holder" aria-hidden="true">
      <svg className="bl-holder__raw" viewBox="0 0 300 340">
        <path className="bl-holder__line" d={HOLDER} pathLength="1" />
        <path className="bl-holder__iron" d={HOLDER} />
      </svg>
      <svg className="bl-holder__wax" viewBox="0 0 300 340">
        <defs>
          <linearGradient id="bl-sheen" x1="0" y1="0" x2="1" y2=".3">
            <stop offset="0" stopColor="#120d0b" />
            <stop offset=".42" stopColor="#1e1410" />
            <stop offset=".52" stopColor="#6b4024" />
            <stop offset=".6" stopColor="#1c130e" />
            <stop offset="1" stopColor="#0f0b09" />
          </linearGradient>
        </defs>
        <path className="bl-holder__waxed" d={HOLDER} />
      </svg>
      <i className="bl-holder__brush" />
      <div className="bl-candles">
        {[[80, 156], [150, 134], [220, 156]].map(([x, y], i) => (
          <span key={i} style={{ left: `${(x / 300) * 100}%`, top: `${(y / 340) * 100}%`, ['--i' as string]: i }}>
            <b />
          </span>
        ))}
      </div>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero bl-hero">
      <div className="bl-hero__text">
        {s.eyebrow ? <p className="bl-label bl-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="bl-title bl-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="bl-hero__sub bl-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="bl-ctas bl-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="bl-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="bl-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {s.words.length ? (
          <ul className="bl-words bl-in" style={{ ['--i' as string]: 4 }}>
            {s.words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <Holder />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee bl-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={44} sep="/" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about bl-about">
      <figure className="bl-about__photo" data-bl="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </figure>
      <div className="bl-about__text" data-bl="rise" style={{ ['--i' as string]: 1 }}>
        {s.label ? <p className="bl-label">{s.label}</p> : null}
        {s.title ? <h2 className="bl-h2">{s.title}</h2> : null}
        <p>{s.text}</p>
      </div>
    </section>
  )
}

/** Работы — стена шоурума: снимок открывается мазком кисти слева направо, подпись подчёркнута одной линией. */
function Wall({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works bl-wall">
      <div className="bl-head" data-bl="rise">
        {s.label ? <p className="bl-label">{s.label}</p> : null}
        {s.title ? <h2 className="bl-h2">{s.title}</h2> : null}
      </div>
      <ul className="bl-wall__list">
        {s.items.map((it, i) => (
          <li key={i} data-bl="brush" style={{ ['--i' as string]: i % 4 }}>
            <figure>
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="arch" className="media" />
            </figure>
            <div className="bl-wall__body">
              <h3>{it.title}</h3>
              <p className="bl-wall__meta">
                {it.category}
                {it.year ? <span>{it.year}</span> : null}
              </p>
              {it.text ? <p>{it.text}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Цены — листы эскизов на миллиметровке, рамка нарисована от руки. */
function Sketches({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing bl-sheets">
      <div className="bl-head" data-bl="rise">
        {s.label ? <p className="bl-label">{s.label}</p> : null}
        {s.title ? <h2 className="bl-h2">{s.title}</h2> : null}
      </div>
      <div className="bl-sheets__row">
        {s.items.map((it, i) => (
          <article key={i} className={it.featured ? 'is-featured' : undefined} data-bl="rise" style={{ ['--i' as string]: i }}>
            <svg className="bl-sheets__frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M3 4 C30 2 70 5 97 3 C98 30 96 70 97 97 C70 98 30 96 3 97 C2 70 4 30 3 4" pathLength="1" />
            </svg>
            <h3>{it.name}</h3>
            <p className="bl-sheets__price">
              {it.price}
              {it.period ? <span>{it.period}</span> : null}
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

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery bl-gallery">
      <div className="bl-head" data-bl="rise">
        {s.label ? <p className="bl-label">{s.label}</p> : null}
        {s.title ? <h2 className="bl-h2">{s.title}</h2> : null}
      </div>
      <ul className="bl-gallery__grid">
        {s.items.map((it, i) => (
          <li key={i} data-bl="rise" style={{ ['--i' as string]: i }}>
            <figure>
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
    <section id={s.anchor || undefined} className="s s-stats bl-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-bl="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-team bl-team">
      <div className="bl-head" data-bl="rise">
        {s.label ? <p className="bl-label">{s.label}</p> : null}
        {s.title ? <h2 className="bl-h2">{s.title}</h2> : null}
      </div>
      <ul className="bl-team__list">
        {s.items.map((it, i) => (
          <li key={i} data-bl="rise" style={{ ['--i' as string]: i }}>
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

/** Этапы — одна линия идёт змейкой через все шаги, как эскиз одним росчерком. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process bl-path">
      <div className="bl-head" data-bl="rise">
        {s.label ? <p className="bl-label">{s.label}</p> : null}
        {s.title ? <h2 className="bl-h2">{s.title}</h2> : null}
      </div>
      <ol className="bl-path__list" data-bl="line">
        <svg className="bl-path__line" viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden="true">
          <path d="M6 0 C6 40 94 40 94 80 C94 120 6 120 6 160 C6 200 94 200 94 240 C94 280 6 280 6 320 C6 360 94 360 94 400" pathLength="1" />
        </svg>
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="bl-path__n">{String(i + 1).padStart(2, '0')}</span>
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
    <section id={s.anchor || undefined} className="s s-testimonials bl-voices">
      <div className="bl-head" data-bl="rise">
        {s.label ? <p className="bl-label">{s.label}</p> : null}
        {s.title ? <h2 className="bl-h2">{s.title}</h2> : null}
      </div>
      <div className="bl-voices__list">
        {s.items.map((it, i) => (
          <figure key={i} data-bl="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq bl-faq">
      <div className="bl-head" data-bl="rise">
        {s.label ? <p className="bl-label">{s.label}</p> : null}
        {s.title ? <h2 className="bl-h2">{s.title}</h2> : null}
      </div>
      <div className="bl-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item bl-faq__item" open={i === 0}>
            <summary>
              <span>{it.q}</span>
              <i className="bl-plus" aria-hidden="true" />
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
    <section id={s.anchor || undefined} className="s s-contact bl-contact">
      <svg className="bl-contact__hook" viewBox="0 0 120 300" aria-hidden="true">
        <path d="M60 0 V180 C60 230 110 230 110 190 C110 170 92 166 88 178" pathLength="1" />
      </svg>
      <div className="bl-contact__inner" data-bl="rise">
        {s.label ? <p className="bl-label">{s.label}</p> : null}
        {s.title ? <h2 className="bl-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="bl-contact__text">{s.text}</p> : null}
        <div className="bl-ctas">
          {s.cta.label ? (
            <a className="bl-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="bl-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, about: About, works: Wall, pricing: Sketches, gallery: Gallery, marquee: MarqueeSec, stats: Stats, team: Team, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
