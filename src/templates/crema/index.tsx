import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'

/*
 * КРЕМА — японская кофейня навынос в духе % Arabica, Fuglen и Onibus: белый куб,
 * чёрный текст, один бежевый. Первый экран — чашка сверху: латте-арт «розетта»
 * прорисовывается линией и медленно поворачивается. Меню — карточки-талоны с номерами,
 * галерея — строгая квадратная сетка, контакт — большая круглая кнопка заказа.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Mark({ className = '' }: { className?: string }) {
  return (
    <svg className={`crema-mark ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  )
}

/** Чашка сверху: блюдце, край, крема и розетта из сердечек по стеблю. */
function Cup() {
  const leaves = [0, 1, 2, 3, 4, 5]
  return (
    <svg className="crema-cup" viewBox="-160 -160 320 320" aria-hidden="true">
      <circle r="156" className="crema-cup__saucer" />
      <circle r="150" className="crema-cup__line" />
      <circle r="104" className="crema-cup__rim" />
      <circle r="92" className="crema-cup__coffee" />
      <circle r="92" className="crema-cup__line crema-cup__line--in" />
      <g className="crema-cup__art">
        {leaves.map((i) => {
          const y = -58 + i * 19
          const w = 40 - i * 5
          return <path key={i} pathLength={1} className="crema-cup__draw" style={{ ['--i' as string]: i }} d={`M${-w} ${y + 6} C ${-w * 0.6} ${y - 10}, ${w * 0.6} ${y - 10}, ${w} ${y + 6}`} />
        })}
        <path pathLength={1} className="crema-cup__draw" style={{ ['--i' as string]: 6 }} d="M0 -66 V 62" />
        <path pathLength={1} className="crema-cup__draw" style={{ ['--i' as string]: 7 }} d="M-9 54 C -9 66, 9 66, 9 54 C 9 46, 0 44, 0 40 C 0 44, -9 46, -9 54 Z" />
      </g>
      <path className="crema-cup__handle" d="M104 -12 C 140 -12 140 12 104 12" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="crema-header">
        <a href="#top" className="crema-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <Mark />
          <span>{site.name.toLowerCase()}</span>
        </a>
        <nav className="crema-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <sup>{String(i + 1).padStart(2, '0')}</sup>
              {l.label}
            </a>
          ))}
          {site.nav.cta.label ? (
            <a className="crema-nav__cta" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
        </nav>
        <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
      </header>
      <p className="crema-side" aria-hidden="true">
        {site.name} ・ {b.hours[0] ? humanHours(b.hours[0], site.lang) : ''} ・ {b.city}
      </p>
      <main id="top">{children}</main>
      <footer className="crema-footer">
        <div className="crema-footer__grid">
          <div className="crema-footer__brand">
            <Mark />
            <p>{site.name.toLowerCase()}</p>
          </div>
          <div>
            <p className="crema-footer__k">{ui(site.lang, 'address')}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
          </div>
          <div>
            <p className="crema-footer__k">{ui(site.lang, 'hours')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="crema-footer__k">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {b.phone ? (
              <p>
                <a href={tel(b.phone)}>{b.phone}</a>
              </p>
            ) : null}
            {b.socials.map((s) => (
              <p key={s.url}>
                <a href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              </p>
            ))}
          </div>
        </div>
        <p className="crema-footer__bottom">
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
  return (
    <section id={s.anchor || undefined} className="s s-hero crema-hero">
      <div className="crema-hero__cup crema-in" style={{ ['--d' as string]: '.1s' }}>
        <Cup />
      </div>
      <div className="crema-hero__text">
        {s.eyebrow ? (
          <p className="crema-hero__eyebrow crema-in" style={{ ['--d' as string]: '.5s' }}>
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="crema-hero__title">
          <span data-split="chars">{s.title || site.name}</span>
        </h1>
        {s.subtitle ? (
          <p className="crema-hero__sub crema-in" style={{ ['--d' as string]: '.9s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="crema-hero__ctas crema-in" style={{ ['--d' as string]: '1.05s' }}>
          {s.cta.label ? (
            <a className="crema-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="crema-btn crema-btn--line" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee crema-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={60} sep="◯" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="crema-about">
      <div className="crema-about__grid">
        <p className="s__label" data-reveal="fade">
          {s.label}
        </p>
        <div>
          <h2 className="crema-about__title" data-split="lines">
            {s.title}
          </h2>
          <p className="crema-about__text" data-reveal="up">
            {s.text}
          </p>
        </div>
        <figure className="crema-about__media" data-reveal="clip">
          <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="grid" className="media" />
        </figure>
      </div>
    </Sec>
  )
}

/** Меню — талоны: квадрат с номером, названием и ценой, как кнопки автомата. */
function Menu({ section: s, site }: SectionProps<'menu'>) {
  let n = 0
  return (
    <Sec id={s.anchor} type="menu" className="crema-menu-sec">
      <Head label={s.label} title={s.title} />
      {s.groups.map((g, i) => (
        <div key={i} className="crema-menu__group">
          <h3 className="crema-menu__gname">{g.name}</h3>
          <ul className="crema-menu">
            {g.items.map((it, j) => {
              n += 1
              return (
                <li key={j} className="crema-ticket" data-reveal="up" data-delay={String((j % 4) * 0.06)}>
                  <span className="crema-ticket__no">{String(n).padStart(2, '0')}</span>
                  <span className="crema-ticket__name">{it.name}</span>
                  {it.text ? <span className="crema-ticket__text">{it.text}</span> : null}
                  <span className="crema-ticket__price">{it.price}</span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      <p className="crema-menu__note">{pick(site.lang, { ru: 'Все напитки — в стакане с собой или в керамике у окна.', uz: 'Barcha ichimliklar — olib ketish stakanida yoki deraza yonida keramikada.', en: 'Every drink comes in a to-go cup or in ceramic by the window.' })}</p>
    </Sec>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <Sec id={s.anchor} type="gallery" className="crema-gallery-sec">
      <Head label={s.label} title={s.title} />
      <div className="crema-gallery">
        {s.items.map((it, i) => (
          <figure key={i} className="crema-gallery__item" data-reveal="fade" data-delay={String((i % 3) * 0.08)}>
            <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={i % 2 ? 'rings' : 'grid'} className="media" />
            {it.caption ? <figcaption>{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Sec>
  )
}

/** Контакт — одна круглая кнопка заказа и адрес мелко: как окошко выдачи. */
function Contact({ section: s, site }: SectionProps<'contact'>) {
  const b = site.business
  const cta = s.cta.label ? s.cta : site.nav.cta
  return (
    <Sec id={s.anchor} type="contact" className="crema-contact">
      <div className="crema-contact__grid">
        <div>
          <Head label={s.label} title={s.title} />
          {s.text ? (
            <p className="crema-contact__text" data-reveal="up">
              {s.text}
            </p>
          ) : null}
          <dl className="crema-contact__facts" data-reveal="up">
            {b.street ? (
              <div>
                <dt>{ui(site.lang, 'address')}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
              </div>
            ) : null}
            {b.hours.length ? (
              <div>
                <dt>{ui(site.lang, 'hours')}</dt>
                <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(', ')}</dd>
              </div>
            ) : null}
            {b.phone ? (
              <div>
                <dt>{ui(site.lang, 'phone')}</dt>
                <dd>
                  <a href={tel(b.phone)}>{b.phone}</a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        {cta.label ? (
          <a className="crema-round" href={cta.href || '#'} data-magnetic data-reveal="scale">
            <span>{cta.label}</span>
          </a>
        ) : null}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, about: About, menu: Menu, gallery: Gallery, contact: Contact },
}
