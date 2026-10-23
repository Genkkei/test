import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Aura, LiveClock, OpenDot, Spot, Ticker } from './client'

/*
 * БЕНТО — продуктовая подача в духе Linear, Notion и презентаций Apple: всё собрано из плиток
 * разного размера, у каждой одна мысль. Плитки живые: часы, «открыто сейчас», лента событий,
 * мягкое цветовое поле; свет идёт за курсором по границе плитки.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Простые линейные значки для плиток: по номеру, без внешних наборов. */
const ICONS = [
  'M4 18h16M6 18V9h12v9M9 9V6h6v3', // рабочее место
  'M5 20V4h10l4 4v12H5zM15 4v4h4M9 13h6', // кабинет / документ
  'M3 10l9-6 9 6v10H3V10zM9 20v-6h6v6', // офис / дом
  'M7 4h10v16H7zM10 8h4M10 12h4', // переговорная / телефонная будка
  'M4 12a8 8 0 1016 0 8 8 0 00-16 0zM12 8v4l3 2', // время
  'M5 8h14v8H5zM8 16v3M16 16v3M9 12h6', // мероприятия
  'M12 3v18M3 12h18', // плюс
]
function Icon({ i }: { i: number }) {
  return (
    <svg className="bento-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[i % ICONS.length]} />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="bento-header">
        <a href="#top" className="bento-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <span className="bento-logo__mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          {site.name}
            </>
          )}
        </a>
        <nav className="bento-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="bento-header__side">
          {site.nav.cta.label ? (
            <a className="bento-btn bento-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="bento-footer">
        <Spot className="bento-grid bento-footer__grid">
          <div className="bento-tile bento-footer__name" data-tile>
            <p className="bento-footer__word" aria-hidden="true">
              {site.name}
            </p>
            <p className="bento-footer__tag">{site.tagline}</p>
          </div>
          {b.street ? (
            <div className="bento-tile" data-tile>
              <p className="bento-k">{ui(site.lang, 'address')}</p>
              <p className="bento-v">{[b.street, b.city].filter(Boolean).join(', ')}</p>
            </div>
          ) : null}
          {b.hours.length ? (
            <div className="bento-tile" data-tile>
              <p className="bento-k">{ui(site.lang, 'hours')}</p>
              <p className="bento-v">{b.hours.map((h) => humanHours(h, site.lang)).join(', ')}</p>
              <OpenDot hours={b.hours} lang={site.lang} />
            </div>
          ) : null}
          <div className="bento-tile" data-tile>
            <p className="bento-k">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {b.phone ? (
              <a className="bento-v" href={tel(b.phone)}>
                {b.phone}
              </a>
            ) : null}
            {b.email ? (
              <a className="bento-v bento-v--sm" href={`mailto:${b.email}`}>
                {b.email}
              </a>
            ) : null}
          </div>
          <div className="bento-tile" data-tile>
            <p className="bento-k">{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</p>
            <ul className="bento-footer__social">
              {b.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener me">
                    {s.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Spot>
        <p className="bento-footer__legal">
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
  const t = site.theme
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-hero bento-hero">
      <Spot className="bento-grid bento-hero__grid">
        <div className="bento-tile bento-hero__main" data-tile>
          {s.eyebrow ? (
            <p className="bento-chip bento-rise" style={{ ['--d' as string]: '.05s' }}>
              <i aria-hidden="true" /> {s.eyebrow}
            </p>
          ) : null}
          <h1 className="bento-hero__title" data-split="words">
            {s.title || site.name}
          </h1>
          {s.subtitle ? (
            <p className="bento-hero__sub bento-rise" style={{ ['--d' as string]: '.5s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="bento-hero__ctas bento-rise" style={{ ['--d' as string]: '.65s' }}>
            {s.cta.label ? (
              <a className="bento-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label} <span aria-hidden="true">→</span>
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="bento-btn bento-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        <div className="bento-tile bento-hero__clock bento-rise" data-tile style={{ ['--d' as string]: '.2s' }}>
          <p className="bento-k">{b.city || pick(site.lang, { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent' })}</p>
          <LiveClock lang={site.lang} />
          {b.hours.length ? <OpenDot hours={b.hours} lang={site.lang} /> : null}
        </div>
        <div className="bento-tile bento-hero__aura bento-rise" data-tile style={{ ['--d' as string]: '.3s' }}>
          <Aura colors={[t.surface, t.accent, '#38bdf8']} />
          <p className="bento-hero__aura-cap">
            {pick(site.lang, { ru: 'Свет, тишина и быстрый интернет', uz: 'Yorug‘lik, sokinlik va tez internet', en: 'Light, quiet and fast internet' })}
          </p>
        </div>
        {s.words.length ? (
          <div className="bento-tile bento-hero__now bento-rise" data-tile style={{ ['--d' as string]: '.4s' }}>
            <p className="bento-k">{pick(site.lang, { ru: 'Внутри', uz: 'Ichkarida', en: 'Inside' })}</p>
            <p className="bento-hero__now-v">
              <Ticker words={s.words} />
            </p>
            <ul className="bento-dots" aria-hidden="true">
              {s.words.map((w) => (
                <li key={w} />
              ))}
            </ul>
          </div>
        ) : null}
      </Spot>
    </section>
  )
}

/** Услуги — бенто: первая плитка широкая, у каждой значок, метка и цена внизу. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="bento-svc-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <Spot className="bento-grid bento-svc">
        {s.items.map((it, i) => (
          <article key={i} className={`bento-tile bento-svc__item${i === 0 ? ' is-wide' : ''}${i > 0 && i === s.items.length - 1 && s.items.length % 3 === 0 ? ' is-full' : ''}`} data-tile data-reveal="up" data-delay={String((i % 3) * 0.07)}>
            <div className="bento-svc__top">
              <Icon i={i} />
              {it.tag ? <span className="bento-chip bento-chip--sm">{it.tag}</span> : null}
            </div>
            <h3 className="bento-svc__name">{it.title}</h3>
            {it.text ? <p className="bento-svc__text">{it.text}</p> : null}
            {it.price ? <p className="bento-svc__price">{it.price}</p> : null}
          </article>
        ))}
      </Spot>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="bento-stats-sec">
      <Head label={s.label} title={s.title} />
      <Spot className="bento-grid bento-stats">
        {s.items.map((it, i) => (
          <div key={i} className="bento-tile bento-stat" data-tile data-reveal="scale" data-delay={String(i * 0.06)}>
            <p className="bento-stat__v">
              <span data-count>{it.value}</span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </p>
            <p className="bento-stat__l">{it.label}</p>
            <span className="bento-stat__ring" aria-hidden="true" />
          </div>
        ))}
      </Spot>
    </Sec>
  )
}

/** Тарифы: выделенный горит бегущей по кромке подсветкой. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="bento-plans-sec">
      <Head label={s.label} title={s.title} />
      <Spot className="bento-grid bento-plans">
        {s.items.map((it, i) => (
          <article key={i} className={`bento-tile bento-plan${it.featured ? ' is-featured' : ''}`} data-tile data-reveal="up" data-delay={String(i * 0.08)}>
            <div className="bento-plan__top">
              <h3>{it.name}</h3>
              {it.featured ? <span className="bento-chip bento-chip--sm">{pick(site.lang, { ru: 'Чаще берут', uz: 'Ko‘proq olishadi', en: 'Most popular' })}</span> : null}
            </div>
            <p className="bento-plan__price">
              {it.price}
              {it.period ? <small> / {it.period}</small> : null}
            </p>
            <ul>
              {it.features.map((f, j) => (
                <li key={j}>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8.5l3 3 7-7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {site.nav.cta.href ? (
              <a className={`bento-btn ${it.featured ? '' : 'bento-btn--ghost'} bento-plan__cta`} href={site.nav.cta.href}>
                {pick(site.lang, { ru: 'Выбрать', uz: 'Tanlash', en: 'Choose' })}
              </a>
            ) : null}
          </article>
        ))}
      </Spot>
    </Sec>
  )
}

/** Галерея — мозаика разного размера, как раскладка на странице продукта. */
function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <Sec id={s.anchor} type="gallery" className="bento-gal-sec">
      <Head label={s.label} title={s.title} />
      <div className="bento-grid bento-gal">
        {s.items.map((it, i) => (
          <figure key={i} className="bento-tile bento-gal__item" data-reveal="clip" data-delay={String((i % 3) * 0.07)}>
            <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
            {it.caption ? <figcaption className="bento-chip bento-chip--glass">{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, stats: Stats, pricing: Pricing, gallery: Gallery },
}
