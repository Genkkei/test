import { pick } from '@/lib/i18n'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { EmberHeader, FireCanvas, OpenNow } from './client'

/* УГЛИ — Noma, Dishoom, Kalm Kitchen: тёплая темнота, живой огонь, меню как печатная карта
   на кремовой бумаге посреди тёмного зала. Кнопки — овальные «таблички», разделители — орнамент. */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Ornament() {
  return (
    <svg className="em-orn" viewBox="0 0 120 12" aria-hidden="true">
      <path d="M0 6h48M72 6h48" stroke="currentColor" strokeWidth="1" />
      <path d="M60 1l5 5-5 5-5-5z" fill="currentColor" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <EmberHeader>
        <a href="#top" className="em-logo" aria-label={`${site.name} — ${pick(site.lang, { ru: 'наверх', uz: 'yuqoriga', en: 'back to top' })}`}>
          {site.name}
        </a>
        <nav className="em-nav" aria-label={pick(site.lang, { ru: 'Разделы', uz: 'Bo‘limlar', en: 'Sections' })}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="em-header__side">
          <OpenNow hours={b.hours} lang={site.lang} />
          {site.nav.cta.label ? (
            <a className="em-btn em-btn--fire" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </EmberHeader>
      <main id="top">{children}</main>
      <footer className="em-footer">
        <Ornament />
        <p className="em-footer__name">{site.name}</p>
        <p className="em-footer__tag">{site.tagline}</p>
        <div className="em-footer__grid">
          <div>
            <h3>{pick(site.lang, { ru: 'Где', uz: 'Qayerda', en: 'Where' })}</h3>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([b.street, b.city].filter(Boolean).join(', '))}`} target="_blank" rel="noopener">
              {[b.street, b.city].filter(Boolean).join(', ')}
            </a>
          </div>
          <div>
            <h3>{pick(site.lang, { ru: 'Когда', uz: 'Qachon', en: 'When' })}</h3>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <h3>{pick(site.lang, { ru: 'Бронь', uz: 'Bron', en: 'Bookings' })}</h3>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <p className="em-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

/** Светлая тема (яркость фона > 0.55): огонь — тёплым свечением, тексту не нужна тёмная тень. */
function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16)
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255 > 0.55
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  const b = site.business
  return (
    <section id={s.anchor || undefined} className={`s s-hero em-hero${isLight(t.bg) ? ' em-hero--light' : ''}`}>
      <FireCanvas colors={[t.bg, t.accent, t.fg, t.surface]} />
      <div className="em-hero__inner">
        {s.eyebrow ? (
          <p className="em-hero__eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="em-hero__title" data-split="words">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="em-hero__sub" data-reveal="up" data-delay="0.4">
            {s.subtitle}
          </p>
        ) : null}
        <div className="em-hero__ctas" data-reveal="fade" data-delay="0.55">
          {s.cta.label ? (
            <a className="em-btn em-btn--fire" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="em-btn" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <dl className="em-hero__facts" data-reveal="fade" data-delay="0.8">
        <div>
          <dt>{pick(site.lang, { ru: 'Адрес', uz: 'Manzil', en: 'Address' })}</dt>
          <dd>{b.street}</dd>
        </div>
        <div>
          <dt>{pick(site.lang, { ru: 'Часы', uz: 'Ish vaqti', en: 'Hours' })}</dt>
          <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(', ')}</dd>
        </div>
        <div>
          <dt>{pick(site.lang, { ru: 'Бронь', uz: 'Bron', en: 'Bookings' })}</dt>
          <dd>{b.phone}</dd>
        </div>
      </dl>
    </section>
  )
}

function Menu({ section: s, site }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="em-menu">
      <div className="em-card" data-reveal="up">
        <header className="em-card__head">
          {s.label ? <p className="em-card__label">{s.label}</p> : null}
          <h2 className="em-card__title">{s.title}</h2>
          <Ornament />
        </header>
        <div className="em-card__groups">
          {s.groups.map((g, i) => (
            <div key={i} className="em-card__group">
              <h3>{g.name}</h3>
              <ul>
                {g.items.map((it, j) => (
                  <li key={j}>
                    <div className="s-menu__row">
                      <span className="s-menu__name">{it.name}</span>
                      <span className="s-menu__dots" aria-hidden="true" />
                      <span className="s-menu__price">{it.price}</span>
                    </div>
                    {it.text ? <p className="s-menu__text">{it.text}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="em-card__foot">{pick(site.lang, { ru: 'Цены в сумах · обслуживание 10% · о непереносимости продуктов скажите официанту', uz: 'Narxlar so‘mda · xizmat 10% · oziq-ovqat ko‘tara olmasligingiz haqida ofitsiantga ayting', en: 'Prices in UZS · 10% service · please tell your server about any food intolerances' })}</p>
      </div>
    </Sec>
  )
}

function Team({ section: s, site }: SectionProps<'team'>) {
  const [lead, ...rest] = s.items
  if (!lead) return null
  return (
    <Sec id={s.anchor} type="team" className="em-team">
      <div className="em-chef">
        <figure className="em-chef__media" data-reveal="clip">
          <div data-parallax="0.1" className="em-chef__inner">
            <Media src={lead.image} alt={`${lead.name}, ${lead.role}`} seed={`${site.slug}-chef`} colors={palette(site)} kind="blobs" className="media" />
          </div>
        </figure>
        <div className="em-chef__text">
          <p className="s__label" data-reveal="fade">
            {s.label}
          </p>
          <h2 className="s__title" data-split="lines">
            {s.title}
          </h2>
          <p className="em-chef__name" data-reveal="up">
            {lead.name}
            <span>{lead.role}</span>
          </p>
          {rest.length ? (
            <ul className="em-chef__crew" data-reveal="up">
              {rest.map((p) => (
                <li key={p.name}>
                  <b>{p.name}</b> — {p.role}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Sec>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee em-marquee" aria-label={s.title || pick(site.lang, { ru: 'О кухне', uz: 'Oshxona haqida', en: 'About the kitchen' })}>
      <Marquee items={s.items} speed={60} sep="✺" />
    </section>
  )
}

function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <Sec id={s.anchor} type="gallery" className="em-gallery">
      <Head label={s.label} title={s.title} />
      <div className="em-gallery__grid">
        {s.items.map((it, i) => (
          <figure key={i} className="em-gallery__item" data-reveal="blur" data-delay={String((i % 3) * 0.1)}>
            <div className="em-gallery__frame">
              <Media src={it.image} alt={it.caption || `${site.name} — ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
            </div>
            {it.caption ? <figcaption>{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, menu: Menu, team: Team, marquee: MarqueeSec, gallery: Gallery },
}
