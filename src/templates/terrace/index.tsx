import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { TerraceMotion } from './client'

/*
 * САД — садовая и террасная мебель. Первый экран — план двора сверху: газон с полосами покоса, дорожка,
 * деревья, на настиле обеденная группа, у бассейна лаунж, шезлонги под зонтом, сури. У каждого предмета
 * тень; солнце ходит по дуге часов работы шоурума (9–19): при входе оно встаёт на текущее время Ташкента,
 * прокрутка ведёт его к вечеру, тени поворачиваются и вытягиваются — солнечные часы (shadow-sundial).
 * Порядок входа: газон раскрывается из центра → дорожка → деревья → мебель встаёт на место с пружинкой →
 * тени проступают → солнце на дуге → текст. Кривая — (.25,1,.5,1).
 * Шрифты: Philosopher (заголовки), Nunito Sans (текст), Ubuntu Mono (время, метки, цены).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Предмет на плане: тень (копия формы, размытая) и сам предмет. h — высота, от неё длина тени. */
function Obj({ h, i, children }: { h: number; i: number; children: React.ReactNode }) {
  return (
    <g className="terrace-obj" style={{ ['--h' as string]: h, ['--i' as string]: i }}>
      <g className="terrace-obj__shadow">{children}</g>
      <g className="terrace-obj__body">{children}</g>
    </g>
  )
}

function Plan() {
  const chairs = Array.from({ length: 6 }, (_, k) => {
    const a = (k / 6) * Math.PI * 2
    return { x: 168 + Math.cos(a) * 46, y: 150 + Math.sin(a) * 46, r: (a * 180) / Math.PI }
  })
  return (
    <svg className="terrace-plan" viewBox="0 0 640 520" aria-hidden="true">
      <defs>
        <pattern id="terrace-mow" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
          <rect width="28" height="56" fill="#8fbf74" />
          <rect x="28" width="28" height="56" fill="#9cca80" />
        </pattern>
        <pattern id="terrace-deck" width="12" height="200" patternUnits="userSpaceOnUse">
          <rect width="12" height="200" fill="#d9b48a" />
          <rect x="11" width="1" height="200" fill="#b68f63" />
        </pattern>
        <clipPath id="terrace-lawn-clip">
          <rect x="10" y="10" width="620" height="500" rx="26" />
        </clipPath>
      </defs>
      <g className="terrace-lawn">
        <rect x="10" y="10" width="620" height="500" rx="26" fill="url(#terrace-mow)" />
      </g>
      <g className="terrace-paths" clipPath="url(#terrace-lawn-clip)">
        {Array.from({ length: 7 }, (_, k) => (
          <rect key={k} x={300 + (k % 2) * 12} y={500 - k * 46} width="46" height="30" rx="5" fill="#e7e0d2" style={{ ['--i' as string]: k }} />
        ))}
        <rect className="terrace-deck" x="70" y="40" width="250" height="210" rx="4" fill="url(#terrace-deck)" />
        <rect className="terrace-pool" x="430" y="300" width="170" height="110" rx="18" fill="#8fd3e8" stroke="#e7e0d2" strokeWidth="10" />
      </g>
      {/* деревья */}
      <Obj h={2.4} i={0}>
        <circle cx="560" cy="80" r="56" fill="#4f8a4a" />
        <circle cx="545" cy="66" r="30" fill="#5f9c58" />
      </Obj>
      <Obj h={2} i={1}>
        <circle cx="70" cy="440" r="48" fill="#4f8a4a" />
        <circle cx="58" cy="428" r="24" fill="#5f9c58" />
      </Obj>
      <Obj h={1.8} i={2}>
        <circle cx="400" cy="70" r="34" fill="#5a9450" />
      </Obj>
      {/* обеденная группа на настиле */}
      <Obj h={0.6} i={3}>
        {chairs.map((c, k) => (
          <rect key={k} x={c.x - 13} y={c.y - 13} width="26" height="26" rx="6" fill="#f3efe6" stroke="#8a6a46" strokeWidth="2" transform={`rotate(${c.r} ${c.x} ${c.y})`} />
        ))}
      </Obj>
      <Obj h={0.7} i={4}>
        <circle cx="168" cy="150" r="30" fill="#a37446" />
        <circle cx="168" cy="150" r="22" fill="none" stroke="#c99b6a" strokeWidth="2" />
      </Obj>
      {/* лаунж у бассейна */}
      <Obj h={0.7} i={5}>
        <path d="M430 230 h170 v34 h-136 v50 h-34 z" fill="#d8d2c4" stroke="#9c958a" strokeWidth="2" />
        <rect x="470" y="268" width="56" height="30" rx="4" fill="#a37446" />
      </Obj>
      {/* шезлонги под зонтом */}
      <Obj h={0.5} i={6}>
        <rect x="455" y="430" width="34" height="70" rx="8" fill="#f3efe6" stroke="#8a6a46" strokeWidth="2" />
        <rect x="503" y="430" width="34" height="70" rx="8" fill="#f3efe6" stroke="#8a6a46" strokeWidth="2" />
      </Obj>
      <Obj h={2.2} i={7}>
        <polygon points="496,402 528,415 541,447 528,479 496,492 464,479 451,447 464,415" fill="#e9c38a" stroke="#b8612f" strokeWidth="2" />
        <path d="M496 402 V492 M451 447 H541 M464 415 L528 479 M528 415 L464 479" stroke="#b8612f" strokeWidth="1.5" />
      </Obj>
      {/* сури */}
      <Obj h={0.8} i={8}>
        <rect x="150" y="330" width="120" height="120" rx="6" fill="#8a5a33" />
        <rect x="162" y="342" width="96" height="96" rx="4" fill="#c2463a" />
        <rect x="190" y="370" width="40" height="40" rx="3" fill="#a37446" />
      </Obj>
    </svg>
  )
}

function Dial({ lang, hours }: { lang: string; hours: string }) {
  return (
    <div className="terrace-dial" data-terrace-dial>
      <svg viewBox="0 0 220 120" aria-hidden="true">
        <path d="M14 108 A96 96 0 0 1 206 108" className="terrace-dial__arc" />
        {Array.from({ length: 11 }, (_, k) => {
          const a = Math.PI - (k / 10) * Math.PI
          const x1 = 110 + Math.cos(a) * 96
          const y1 = 108 - Math.sin(a) * 96
          const x2 = 110 + Math.cos(a) * (k % 5 ? 88 : 82)
          const y2 = 108 - Math.sin(a) * (k % 5 ? 88 : 82)
          return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
        <text x="14" y="120">9</text>
        <text x="110" y="8" textAnchor="middle">14</text>
        <text x="206" y="120" textAnchor="end">19</text>
        <circle className="terrace-dial__sun" r="9" cx="110" cy="12" />
      </svg>
      <p>
        <b data-terrace-time>14:00</b>
        <span>{pick(lang, { ru: `шоурум открыт ${hours}`, uz: `shourum ochiq ${hours}`, en: `showroom open ${hours}` })}</span>
      </p>
    </div>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <TerraceMotion />
      <header className="terrace-bar">
        <a href="#top" className="terrace-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="terrace-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="terrace-bar__side">
          {site.nav.cta.label ? (
            <a className="terrace-btn terrace-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="terrace-foot">
        <div className="terrace-foot__hedge" aria-hidden="true" />
        <div className="terrace-foot__inner">
          <p className="terrace-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
          <p className="terrace-foot__tag">{site.tagline}</p>
          <div className="terrace-foot__cols">
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
          <p className="terrace-foot__legal">
            <span>
              © {new Date().getFullYear()} {b.legalName || site.name}
            </span>
            <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const hours = site.business.hours.length ? site.business.hours.map((h) => humanHours(h, site.lang)).join(', ') : ''
  return (
    <section id={s.anchor || undefined} className="s s-hero terrace-hero" data-terrace-hero>
      <div className="terrace-hero__text">
        {s.eyebrow ? <p className="terrace-label terrace-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="terrace-title terrace-in" style={{ ['--i' as string]: 1 }}>
          {s.title || site.name}
        </h1>
        {s.subtitle ? <p className="terrace-hero__sub terrace-in" style={{ ['--i' as string]: 2 }}>{s.subtitle}</p> : null}
        <div className="terrace-hero__ctas terrace-in" style={{ ['--i' as string]: 3 }}>
          {s.cta.label ? (
            <a className="terrace-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="terrace-btn terrace-btn--line" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        <Dial lang={site.lang} hours={hours} />
      </div>
      <div className="terrace-hero__plan" data-terrace-plan>
        <Plan />
      </div>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  const paras = s.text.split(/\n+/).filter(Boolean)
  return (
    <section id={s.anchor || undefined} className="s s-about terrace-about">
      <div className="terrace-about__photo" data-tr="grow">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="blobs" className="media" />
      </div>
      <div className="terrace-about__text" data-tr="rise">
        {s.label ? <p className="terrace-label">{s.label}</p> : null}
        {s.title ? <h2 className="terrace-h2">{s.title}</h2> : null}
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  )
}

/** Наборы — карточки-участки: фото, состав, цена «от» (в works.year). */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works terrace-sets">
      <div className="terrace-head" data-tr="rise">
        {s.label ? <p className="terrace-label">{s.label}</p> : null}
        {s.title ? <h2 className="terrace-h2">{s.title}</h2> : null}
      </div>
      <ul className="terrace-sets__list">
        {s.items.map((it, i) => (
          <li key={i} data-tr="grow" style={{ ['--i' as string]: i % 2 }}>
            <div className="terrace-sets__img">
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="blobs" className="media" />
            </div>
            <p className="terrace-sets__meta">{it.category}</p>
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
            {it.year ? <b>{it.year}</b> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Services({ section: s }: SectionProps<'services'>) {
  const icons = [
    <path key="t" d="M3 17h2m10 0h4v-5l-3-4h-3v9M3 17V6h12v11M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
    <path key="w" d="M14 6a4 4 0 0 0-5 5L3 17l3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3 3-3Z" />,
    <path key="s" d="M12 2v20M4 6l16 12M20 6 4 18M8 3l4 3 4-3M8 21l4-3 4 3" />,
  ]
  return (
    <section id={s.anchor || undefined} className="s s-services terrace-care">
      <div className="terrace-head" data-tr="rise">
        {s.label ? <p className="terrace-label">{s.label}</p> : null}
        {s.title ? <h2 className="terrace-h2">{s.title}</h2> : null}
        {s.intro ? <p className="terrace-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="terrace-care__list">
        {s.items.map((it, i) => (
          <li key={i} data-tr="rise" style={{ ['--i' as string]: i }}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {icons[i % icons.length]}
            </svg>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            {it.price ? <b>{it.price}</b> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Как заказать — камни дорожки: по ним идёт шаг за шагом, камень «утапливается», когда шаг прочитан. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process terrace-stones">
      <div className="terrace-head" data-tr="rise">
        {s.label ? <p className="terrace-label">{s.label}</p> : null}
        {s.title ? <h2 className="terrace-h2">{s.title}</h2> : null}
      </div>
      <ol className="terrace-stones__list">
        {s.items.map((it, i) => (
          <li key={i} data-tr="stone" style={{ ['--i' as string]: i }}>
            <span className="terrace-stones__stone" aria-hidden="true">
              {i + 1}
            </span>
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
    <section id={s.anchor || undefined} className="s s-gallery terrace-yards">
      <div className="terrace-head" data-tr="rise">
        {s.label ? <p className="terrace-label">{s.label}</p> : null}
        {s.title ? <h2 className="terrace-h2">{s.title}</h2> : null}
      </div>
      <ul className="terrace-yards__grid">
        {s.items.map((it, i) => (
          <li key={i} data-tr="grow" style={{ ['--i' as string]: i }}>
            <div className="terrace-yards__img">
              <Media src={it.image} alt={it.caption} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="blobs" className="media" />
            </div>
            <p>{it.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials terrace-words">
      <div className="terrace-head" data-tr="rise">
        {s.label ? <p className="terrace-label">{s.label}</p> : null}
        {s.title ? <h2 className="terrace-h2">{s.title}</h2> : null}
      </div>
      <div className="terrace-words__list">
        {s.items.map((it, i) => (
          <figure key={i} data-tr="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq terrace-faq">
      <div className="terrace-head" data-tr="rise">
        {s.label ? <p className="terrace-label">{s.label}</p> : null}
        {s.title ? <h2 className="terrace-h2">{s.title}</h2> : null}
      </div>
      <div className="terrace-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item terrace-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact terrace-contact">
      <div className="terrace-contact__card" data-tr="rise">
        {s.label ? <p className="terrace-label">{s.label}</p> : null}
        {s.title ? <h2 className="terrace-contact__title">{s.title}</h2> : null}
        {s.text ? <p>{s.text}</p> : null}
        <div className="terrace-hero__ctas">
          {s.cta.label ? (
            <a className="terrace-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="terrace-btn terrace-btn--line" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: () => null, about: About, works: Works, services: Services, process: Process, gallery: Gallery, testimonials: Testimonials, faq: Faq, contact: Contact },
}
