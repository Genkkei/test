import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { HearthMotion, MenuPlate } from './client'

/*
 * УСТЬЕ — пиццерия, где всё освещено печью. Тёмный зал; первый экран — устье печи (купол из знака бренда),
 * внутри живой огонь (видео). Вход: в темноте разгорается жар → чертится контур купола → в нём проявляется
 * огонь → строки заголовка поднимаются, остывая из оранжевого в цвет муки → термометр досчитывает до 450.
 * Прокрутка: купол раскрывается на весь экран — шаг в свет печи. Меню — чек заказа с фото на тарелке,
 * отзывы — бумажные заказы на кухонной рейке. Ведущий приём один: жар (ember-reveal); остальное тихо.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Заголовок по строкам: слова делятся на 2–3 строки примерно поровну по длине. */
function lines(title: string): string[] {
  const words = title.split(/\s+/).filter(Boolean)
  if (words.length <= 2) return words
  const total = title.length
  const n = words.length <= 4 ? 3 : Math.min(4, Math.ceil(total / 12))
  const out: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (cur && next.length > total / n + 2 && out.length < n - 1) {
      out.push(cur)
      cur = w
    } else cur = next
  }
  if (cur) out.push(cur)
  return out
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <HearthMotion />
      <header className="hearth-bar">
        <a href="#top" className="hearth-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="hearth-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hearth-bar__side">
          {b.phone ? (
            <a className="hearth-bar__phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="hearth-btn hearth-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="hearth-foot">
        <div className="hearth-foot__dome" aria-hidden="true">
          <span className="hearth-foot__fire" />
        </div>
        <div className="hearth-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</div>
        <div className="hearth-foot__cols">
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
          <p className="hearth-foot__social">
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </p>
        </div>
        <p className="hearth-foot__legal">
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
  const gauges = stats && stats.type === 'stats' ? stats.items.slice(0, 3) : []
  const ls = lines(s.title || site.name)
  return (
    <section id={s.anchor || undefined} className="s s-hero hearth-hero" data-hearth-hero>
      <div className="hearth-hero__heat" aria-hidden="true" />
      <div className="hearth-hero__top">
        {s.eyebrow ? <p className="hearth-label hearth-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="hearth-title">
          {ls.map((l, i) => (
            <span key={i} className="hearth-title__line">
              <span style={{ ['--i' as string]: i }}>{l}</span>
            </span>
          ))}
        </h1>
      </div>
      {gauges.length ? (
        <dl className="hearth-gauges">
          {gauges.map((g, i) => (
            <div key={i} className="hearth-gauge hearth-in" style={{ ['--i' as string]: i + 3 }}>
              <dt>{g.label}</dt>
              <dd>
                <b data-hearth-count={g.value}>{g.value}</b>
                <small>{g.suffix}</small>
              </dd>
              <i aria-hidden="true" />
            </div>
          ))}
        </dl>
      ) : null}
      <div className="hearth-mouth" data-hearth-mouth>
        <div className="hearth-mouth__fire">
          {s.video ? (
            <video src={s.video} poster={s.image || undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
          ) : (
            <Media src={s.image} alt="" seed={`${site.slug}-hero`} colors={palette(site)} kind="arch" className="media" />
          )}
        </div>
        <svg className="hearth-mouth__rim" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0.5 100 V48 C0.5 21 22 0.5 50 0.5 C78 0.5 99.5 21 99.5 48 V100" pathLength="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="hearth-hero__foot">
        {s.subtitle ? <p className="hearth-hero__sub hearth-in" style={{ ['--i' as string]: 6 }}>{s.subtitle}</p> : null}
        <div className="hearth-hero__ctas hearth-in" style={{ ['--i' as string]: 7 }}>
          {s.cta.label ? (
            <a className="hearth-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="hearth-btn hearth-btn--line" href={s.ctaSecondary.href || '#'}>
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
    <section id={s.anchor || undefined} className="s s-about hearth-about">
      <div className="hearth-about__photo" data-reveal="clip">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="arch" className="media" />
      </div>
      <div className="hearth-about__text">
        {s.label ? <p className="hearth-label">{s.label}</p> : null}
        {s.title ? <h2 className="hearth-h2" data-split="lines">{s.title}</h2> : null}
        {s.text ? <p className="hearth-about__body" data-reveal="up">{s.text}</p> : null}
      </div>
    </section>
  )
}

function Menu({ section: s, site }: SectionProps<'menu'>) {
  const all = s.groups.flatMap((g) => g.items)
  const photos = all.map((it) => it.image)
  let n = -1
  return (
    <section id={s.anchor || undefined} className="s s-menu hearth-menu">
      <div className="hearth-menu__head">
        {s.label ? <p className="hearth-label">{s.label}</p> : null}
        {s.title ? <h2 className="hearth-h2" data-split="lines">{s.title}</h2> : null}
      </div>
      <div className="hearth-menu__body">
        <div className="hearth-ticket" data-reveal="up">
          <p className="hearth-ticket__top" aria-hidden="true">
            <span>{pick(site.lang, { ru: 'ЗАКАЗ', uz: 'BUYURTMA', en: 'ORDER' })} № 0450</span>
            <span>32 см</span>
          </p>
          {s.groups.map((g, gi) => (
            <div key={gi} className="hearth-ticket__group">
              <h3>{g.name}</h3>
              <ul>
                {g.items.map((it, i) => {
                  n += 1
                  return (
                    <li key={i} data-hearth-dish={n} tabIndex={0}>
                      {it.image ? (
                        <span className="hearth-ticket__thumb" aria-hidden="true">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.image} alt="" loading="lazy" decoding="async" />
                        </span>
                      ) : null}
                      <span className="hearth-ticket__row">
                        <b>{it.name}</b>
                        <i aria-hidden="true" />
                        <span className="hearth-ticket__price">{it.price}</span>
                      </span>
                      {it.text ? <span className="hearth-ticket__text">{it.text}</span> : null}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
          <p className="hearth-ticket__bottom" aria-hidden="true">
            * * * {pick(site.lang, { ru: 'спасибо, печь уже горячая', uz: 'rahmat, tandir qizigan', en: 'thank you, the oven is hot' })} * * *
          </p>
        </div>
        {photos.some(Boolean) ? <MenuPlate photos={photos} names={all.map((it) => it.name)} /> : null}
      </div>
    </section>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process hearth-process" data-hearth-process>
      <div className="hearth-process__head">
        {s.label ? <p className="hearth-label">{s.label}</p> : null}
        {s.title ? <h2 className="hearth-h2" data-split="lines">{s.title}</h2> : null}
      </div>
      <ol className="hearth-steps">
        <span className="hearth-steps__line" aria-hidden="true">
          <span />
        </span>
        {s.items.map((it, i) => (
          <li key={i} className="hearth-step">
            <span className="hearth-step__n">{String(i + 1).padStart(2, '0')}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Цифры уже стоят термометром на первом экране — второй раз их не показываем. */
const Stats = () => null

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials hearth-rail-sec">
      <div className="hearth-rail-sec__head">
        {s.label ? <p className="hearth-label">{s.label}</p> : null}
        {s.title ? <h2 className="hearth-h2" data-split="lines">{s.title}</h2> : null}
      </div>
      <div className="hearth-rail">
        <span className="hearth-rail__bar" aria-hidden="true" />
        {s.items.map((it, i) => (
          <figure key={i} className="hearth-slip" style={{ ['--r' as string]: `${[-2.5, 1.8, -1.2, 2.4][i % 4]}deg`, ['--i' as string]: i }}>
            <span className="hearth-slip__clip" aria-hidden="true" />
            <p className="hearth-slip__n" aria-hidden="true">
              #{String(31 + i * 7).padStart(3, '0')}
            </p>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              {it.author}
              {it.role ? <small>{it.role}</small> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq hearth-faq">
      <div className="hearth-faq__head">
        {s.label ? <p className="hearth-label">{s.label}</p> : null}
        {s.title ? <h2 className="hearth-h2" data-split="lines">{s.title}</h2> : null}
      </div>
      <div className="hearth-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item hearth-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact hearth-contact">
      <div className="hearth-contact__glow" aria-hidden="true" />
      {s.label ? <p className="hearth-label">{s.label}</p> : null}
      {s.title ? <h2 className="hearth-contact__title" data-split="lines">{s.title}</h2> : null}
      {s.text ? <p className="hearth-contact__text" data-reveal="up">{s.text}</p> : null}
      <div className="hearth-contact__ctas" data-reveal="up">
        {s.cta.label ? (
          <a className="hearth-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
            {s.cta.label}
          </a>
        ) : null}
        {b.phone ? (
          <a className="hearth-btn hearth-btn--line" href={tel(b.phone)}>
            {b.phone}
          </a>
        ) : null}
      </div>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: () => null, about: About, menu: Menu, process: Process, stats: Stats, testimonials: Testimonials, faq: Faq, contact: Contact },
}
