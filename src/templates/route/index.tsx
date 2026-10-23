import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Clock, Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { ProgressLine, RouteCanvas, RouteHeader } from './client'

/*
 * МАРШРУТ — Flexport, Maersk, Linear: тёмная навигационная карта, сигнальный оранжевый,
 * направления как табло отправлений, тарифы как таблица-калькулятор, этапы на линии пути.
 */

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <RouteHeader>
        <a href="#top" className="route-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <i aria-hidden="true" />
          {site.name}
            </>
          )}
        </a>
        <nav className="route-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="route-header__side">
          <span className="route-status">
            <i aria-hidden="true" />
            {b.city || pick(site.lang, { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent' })} <Clock lang={site.lang} />
          </span>
          {site.nav.cta.label ? (
            <a className="route-btn route-btn--sm" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </RouteHeader>
      <main id="top">{children}</main>
      <footer className="route-footer">
        <div className="route-footer__grid">
          <div className="route-footer__brand">
            <p className="route-logo">
              <i aria-hidden="true" />
              {site.name}
            </p>
            <p className="route-footer__tag">{site.tagline}</p>
          </div>
          <dl className="route-footer__facts">
            {b.phone ? (
              <div>
                <dt>{pick(site.lang, { ru: 'Диспетчерская', uz: 'Dispetcherlik', en: 'Dispatch' })}</dt>
                <dd>
                  <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a>
                </dd>
              </div>
            ) : null}
            {b.email ? (
              <div>
                <dt>{ui(site.lang, 'email')}</dt>
                <dd>
                  <a href={`mailto:${b.email}`}>{b.email}</a>
                </dd>
              </div>
            ) : null}
            {b.street ? (
              <div>
                <dt>{pick(site.lang, { ru: 'Склад и офис', uz: 'Ombor va ofis', en: 'Warehouse and office' })}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
              </div>
            ) : null}
            {b.hours.length ? (
              <div>
                <dt>{ui(site.lang, 'hours')}</dt>
                <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(', ')}</dd>
              </div>
            ) : null}
          </dl>
          <ul className="route-footer__social">
            {b.socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="route-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="route-footer__bar">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>41.31° N · 69.24° E</span>
          <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  const routes = site.sections.find((x) => x.type === 'services' && x.enabled)
  const first = routes && routes.type === 'services' ? routes.items[0] : undefined
  return (
    <section id={s.anchor || undefined} className="s s-hero route-hero">
      <RouteCanvas colors={[t.bg, t.accent, t.fg, t.muted]} />
      <div className="route-hero__inner">
        {s.eyebrow ? (
          <p className="route-eyebrow route-rise" style={{ ['--d' as string]: '0.1s' }}>
            <i aria-hidden="true" />
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="route-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="route-hero__sub route-rise" style={{ ['--d' as string]: '0.5s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="route-hero__ctas route-rise" style={{ ['--d' as string]: '0.65s' }}>
          {s.cta.label ? (
            <a className="route-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
              <i aria-hidden="true">→</i>
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="route-btn route-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {first ? (
          <div className="route-track route-rise" style={{ ['--d' as string]: '0.85s' }} aria-label={pick(site.lang, { ru: 'Пример направления', uz: 'Yo‘nalish namunasi', en: 'Sample route' })}>
            <div className="route-track__row">
              <span className="route-track__code">{first.tag || pick(site.lang, { ru: 'В пути', uz: 'Yo‘lda', en: 'In transit' })}</span>
              <span className="route-track__live">
                <i aria-hidden="true" /> {pick(site.lang, { ru: 'в пути', uz: 'yo‘lda', en: 'in transit' })}
              </span>
            </div>
            <p className="route-track__name">{first.title}</p>
            <div className="route-track__bar" aria-hidden="true">
              <span />
            </div>
            <div className="route-track__row route-track__row--muted">
              <span>{first.price}</span>
              <span>{site.business.city || pick(site.lang, { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent' })}</span>
            </div>
          </div>
        ) : null}
      </div>
      {s.words.length ? (
        <div className="route-hero__ticker" aria-hidden="true">
          <Marquee items={s.words} speed={36} sep="●" />
        </div>
      ) : null}
    </section>
  )
}

/** «Китай → Ташкент» → ['Китай', 'Ташкент'] */
function split(title: string): [string, string] {
  const [a, b] = title.split(/\s*[→>—-]{1,2}\s*/)
  return [a || title, b || '']
}

function Services({ section: s, site }: SectionProps<'services'>) {
  const L = (ru: string, uz: string, en: string) => pick(site.lang, { ru, uz, en })
  return (
    <Sec id={s.anchor} type="services" className="route-board-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="route-board" role="table" aria-label={s.title || L('Направления', 'Yo‘nalishlar', 'Routes')}>
        <div className="route-board__head" role="row">
          <span role="columnheader">{L('Откуда', 'Qayerdan', 'From')}</span>
          <span role="columnheader">{L('Куда', 'Qayerga', 'To')}</span>
          <span role="columnheader">{L('Срок и транспорт', 'Muddat va transport', 'Transit and mode')}</span>
          <span role="columnheader">{L('Ставка', 'Tarif', 'Rate')}</span>
        </div>
        {s.items.map((it, i) => {
          const [from, to] = split(it.title)
          return (
            <div key={i} className="route-board__row" role="row" data-reveal="up" data-delay={String(i * 0.05)}>
              <span role="cell" className="route-board__from">
                <b>{String(i + 1).padStart(2, '0')}</b>
                {from}
              </span>
              <span role="cell" className="route-board__to">
                <i aria-hidden="true">→</i>
                {to}
              </span>
              <span role="cell" className="route-board__tag">
                {it.tag}
              </span>
              <span role="cell" className="route-board__price">
                {it.price}
              </span>
              {it.text ? (
                <span role="cell" className="route-board__text">
                  {it.text}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </Sec>
  )
}

function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="route-calc-sec">
      <Head label={s.label} title={s.title} />
      <div className="route-calc">
        {s.items.map((it, i) => (
          <article key={i} className={`route-calc__row${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.06)}>
            <div className="route-calc__name">
              <span className="route-calc__idx">{String.fromCharCode(65 + i)}</span>
              <h3>{it.name}</h3>
            </div>
            <ul className="route-calc__features">
              {it.features.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
            <p className="route-calc__price">
              {it.price}
              {it.period ? <small>{it.period}</small> : null}
            </p>
          </article>
        ))}
      </div>
      <p className="route-calc__note">
        {pick(site.lang, {
          ru: 'Ставки ориентировочные: точную сумму считаем по весу, объёму и коду ТН ВЭД в течение часа.',
          uz: 'Tariflar taxminiy: aniq summani og‘irlik, hajm va TIF TN kodi bo‘yicha bir soat ichida hisoblaymiz.',
          en: 'Rates are indicative: we calculate the exact amount by weight, volume and HS code within an hour.',
        })}
      </p>
    </Sec>
  )
}

function Process({ section: s, site }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="route-process">
      <Head label={s.label} title={s.title} />
      <ProgressLine>
        <ol className="route-steps__list">
          {s.items.map((it, i) => (
            <li key={i} className="route-steps__item" data-reveal="up" data-delay={String(i * 0.08)}>
              <span className="route-steps__node" aria-hidden="true">
                <i />
              </span>
              <span className="route-steps__km">{pick(site.lang, { ru: 'КП', uz: 'NP', en: 'CP' })} {String(i + 1).padStart(2, '0')}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </ProgressLine>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, pricing: Pricing, process: Process },
}
