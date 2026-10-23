import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { pick, ui } from '@/lib/i18n'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Catalog, PodiumStage } from './client'

/* ДУБ — в духе HAY, Muuto, Ferm Living: светлая бумага, предметы на цветных постаментах,
   мягкие пастельные плитки каталога, круглые кнопки-таблетки. */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Пастель плиток: тёплые и холодные вперемешку, чтобы соседние карточки не сливались. */
const TILES = ['#e8dccd', '#cddbd2', '#f1cdbb', '#dad6ea', '#f2e3ad', '#d2dce6', '#e9d0d6', '#d9e4c4']

export const orderHref = (site: Site) => (site.leads.enabled ? '#order' : site.sections.find((s) => s.type === 'contact')?.anchor ? `#${site.sections.find((s) => s.type === 'contact')!.anchor}` : '#top')

function bodies(site: Site) {
  return [site.theme.accent, '#3f5a4f', '#c46a4b', '#b8a07e', '#5c6f8a', site.theme.fg]
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="oak-header">
        <a href="#top" className="oak-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          {site.name.toLowerCase()}
            </>
          )}
        </a>
        <nav className="oak-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="oak-header__side">
          {site.nav.cta.label ? (
            <a className="oak-pill" href={site.nav.cta.href || '#'}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="oak-footer">
        <p className="oak-footer__word" aria-hidden="true">
          {site.name.toLowerCase()}
        </p>
        <div className="oak-footer__grid">
          <div>
            <p className="oak-footer__h">{pick(site.lang, { ru: 'Шоурум', uz: 'Shou-rum', en: 'Showroom' })}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="oak-footer__h">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="oak-footer__h">{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
          <p className="oak-footer__legal">
            © {new Date().getFullYear()} {b.legalName || site.name}
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  const seasons = [
    { name: pick(site.lang, { ru: 'Песок', uz: 'Qum', en: 'Sand' }), colors: ['#eadbc6', '#f0c7b2', '#d7ccbb'] },
    { name: pick(site.lang, { ru: 'Шалфей', uz: 'Shalfey', en: 'Sage' }), colors: ['#cfdccf', '#b9cbbf', '#e4e7d6'] },
    { name: pick(site.lang, { ru: 'Лаванда', uz: 'Lavanda', en: 'Lavender' }), colors: ['#dcd6ec', '#c8cfe6', '#efdbe2'] },
    { name: pick(site.lang, { ru: 'Охра', uz: 'Oxra', en: 'Ochre' }), colors: ['#f0dca0', '#e7b98d', '#f3e9cf'] },
  ]
  return (
    <section id={s.anchor || undefined} className="s s-hero oak-hero">
      <div className="oak-hero__text">
        {s.eyebrow ? <p className="oak-eyebrow oak-in">{s.eyebrow}</p> : null}
        <h1 className="oak-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="oak-hero__sub oak-in" style={{ ['--oak-d' as string]: '.6s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="oak-hero__ctas oak-in" style={{ ['--oak-d' as string]: '.8s' }}>
          {s.cta.label ? (
            <a className="btn btn--primary" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="oak-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label} →
            </a>
          ) : null}
        </div>
        {s.words.length ? (
          <ul className="oak-hero__words oak-in" style={{ ['--oak-d' as string]: '1s' }}>
            {s.words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {s.image ? (
        <figure className="oak-hero__img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="media" src={s.image} alt={s.title || site.name} />
        </figure>
      ) : (
        <PodiumStage seasons={seasons} label={pick(site.lang, { ru: 'Палитра сезона', uz: 'Mavsum palitrasi', en: 'Season palette' })} body={bodies(site)} wood="#b0855a" line={t.fg} />
      )}
    </section>
  )
}

/** Каталог: плитки-подиумы в пастели, предмет нарисован по категории, фильтр по категориям. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="oak-catalog">
      <Head label={s.label} title={s.title}>
        {s.intro ? <p className="s__intro">{s.intro}</p> : null}
      </Head>
      <Catalog
        items={s.items}
        all={pick(site.lang, { ru: 'Всё', uz: 'Hammasi', en: 'All' })}
        add={pick(site.lang, { ru: 'Заказать', uz: 'Buyurtma', en: 'Order' })}
        href={orderHref(site)}
        tiles={TILES}
        body={bodies(site)}
        wood="#b0855a"
        line={site.theme.fg}
      />
    </Sec>
  )
}

/** Интерьеры: мозаика разного размера, подписи-таблетки поверх кадра. */
function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <Sec id={s.anchor} type="gallery" className="oak-rooms">
      <Head label={s.label} title={s.title} />
      <ul className="oak-rooms__grid">
        {s.items.map((it, i) => (
          <li key={i} className={`oak-room oak-room--${i % 5}`} data-reveal="scale" data-delay={String((i % 3) * 0.08)}>
            <Media src={it.image} alt={it.caption} seed={`${site.slug}-g${i}`} colors={[TILES[i % TILES.length], TILES[(i + 3) % TILES.length], '#b0855a', site.theme.accent, '#fffaf2']} kind={art} className="media" />
            {it.caption ? <span className="oak-room__cap">{it.caption}</span> : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Доставка и сборка: шаги-таблетки на одной линии, линия прорисовывается при прокрутке. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="oak-steps">
      <Head label={s.label} title={s.title} />
      <ol className="oak-steps__list">
        {s.items.map((it, i) => (
          <li key={i} data-reveal="up" data-delay={String(i * 0.08)}>
            <span className="oak-steps__dot">{i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, gallery: Gallery, process: Process },
}
