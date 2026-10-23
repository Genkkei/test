import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Route } from './client'

/*
 * ПОЛЕ — фермерская доставка в духе Oddbox и Farmdrop: тёплая бумага, коробка с овощами
 * на первом экране (продукты «падают» в ящик по очереди), карточки урожая недели с
 * пометкой сезона, коробки трёх размеров вместо тарифов и маршрут доставки с фургоном,
 * который едет по линии вместе с прокруткой.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

type Kind = 'tomato' | 'carrot' | 'cucumber' | 'apple' | 'eggplant' | 'pepper' | 'grape' | 'greens'
const KINDS: Kind[] = ['tomato', 'carrot', 'cucumber', 'apple', 'eggplant', 'pepper', 'grape', 'greens']

/** Овощ линией и заливкой: простые формы читаются издалека и не спорят с фото. */
export function Veg({ kind, className = '' }: { kind: Kind; className?: string }) {
  const leaf = '#4f7d24'
  const body: Record<Kind, React.ReactNode> = {
    tomato: (
      <>
        <circle cx="50" cy="56" r="34" fill="#d9472b" />
        <path d="M50 24 l-10 -8 M50 24 l12 -6 M50 24 l-2 -12 M50 24 l-14 4 M50 24 l14 4" stroke={leaf} strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="38" cy="46" rx="7" ry="4" fill="#fff" opacity=".35" />
      </>
    ),
    carrot: (
      <>
        <path d="M30 34 Q50 24 70 34 L52 92 Q50 96 48 92 Z" fill="#ec7a1c" />
        <path d="M38 50 h10 M44 64 h10 M42 78 h8" stroke="#b9530c" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 30 Q42 12 36 8 M50 30 Q52 10 58 4 M50 30 Q62 16 70 14" stroke={leaf} strokeWidth="5" fill="none" strokeLinecap="round" />
      </>
    ),
    cucumber: (
      <>
        <rect x="18" y="38" width="64" height="26" rx="13" fill="#3f7a2a" transform="rotate(-24 50 51)" />
        <g fill="#8fc061">
          <circle cx="34" cy="56" r="2.4" />
          <circle cx="48" cy="48" r="2.4" />
          <circle cx="62" cy="42" r="2.4" />
          <circle cx="56" cy="56" r="2.4" />
        </g>
      </>
    ),
    apple: (
      <>
        <path d="M50 34 C30 20 14 40 20 62 C26 86 42 90 50 84 C58 90 74 86 80 62 C86 40 70 20 50 34 Z" fill="#c8312a" />
        <path d="M50 34 Q52 20 58 12" stroke="#5a3a1a" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M54 22 Q68 12 76 20 Q66 30 54 22 Z" fill={leaf} />
      </>
    ),
    eggplant: (
      <>
        <path d="M58 30 C80 40 86 70 70 86 C56 98 30 92 28 74 C26 58 44 52 46 40 Z" fill="#4a2a5c" />
        <path d="M44 42 Q48 26 62 30 Q60 40 52 46 Z" fill={leaf} />
        <path d="M56 28 Q58 18 64 14" stroke={leaf} strokeWidth="5" fill="none" strokeLinecap="round" />
      </>
    ),
    pepper: (
      <>
        <path d="M30 40 C26 70 38 92 50 92 C62 92 74 70 70 40 C64 30 36 30 30 40 Z" fill="#f2b11a" />
        <path d="M42 40 C40 64 44 80 48 88" stroke="#d7930a" strokeWidth="3" fill="none" />
        <path d="M50 34 Q50 20 60 14" stroke={leaf} strokeWidth="6" fill="none" strokeLinecap="round" />
      </>
    ),
    grape: (
      <>
        <g fill="#7b3f8c">
          {[
            [38, 40], [52, 40], [66, 40], [44, 54], [58, 54], [50, 68], [36, 54], [64, 54], [44, 80], [56, 80],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="8" />
          ))}
        </g>
        <path d="M52 30 Q52 18 60 12" stroke="#5a3a1a" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    ),
    greens: (
      <>
        <path d="M50 92 C20 70 18 40 30 18 C40 40 46 60 50 92 Z" fill="#5d9a2c" />
        <path d="M50 92 C80 70 82 40 70 18 C60 40 54 60 50 92 Z" fill="#4a8424" />
        <path d="M50 92 C44 60 46 30 50 8 C54 30 56 60 50 92 Z" fill="#78b23f" />
      </>
    ),
  }
  return (
    <svg className={`field-veg ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      {body[kind]}
    </svg>
  )
}

const kindOf = (i: number) => KINDS[i % KINDS.length]

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="field-header">
        <a href="#top" className="field-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <Veg kind="greens" className="field-logo__mark" />
          {site.name}
            </>
          )}
        </a>
        <nav className="field-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="field-header__side">
          {site.nav.cta.label ? (
            <a className="field-btn field-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="field-footer">
        <div className="field-footer__rows" aria-hidden="true">
          {KINDS.concat(KINDS).map((k, i) => (
            <Veg key={i} kind={k} />
          ))}
        </div>
        <div className="field-footer__inner">
          <div>
            <p className="field-footer__name">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
            <p className="field-footer__tag">{site.tagline}</p>
          </div>
          <dl className="field-footer__facts">
            {b.phone ? (
              <div>
                <dt>{ui(site.lang, 'phone')}</dt>
                <dd>
                  <a href={tel(b.phone)}>{b.phone}</a>
                </dd>
              </div>
            ) : null}
            {b.hours.length ? (
              <div>
                <dt>{pick(site.lang, { ru: 'Принимаем заказы', uz: 'Buyurtma qabul qilamiz', en: 'Orders taken' })}</dt>
                <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
              </div>
            ) : null}
            {b.street ? (
              <div>
                <dt>{pick(site.lang, { ru: 'Склад и самовывоз', uz: 'Ombor va olib ketish', en: 'Warehouse & pickup' })}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
              </div>
            ) : null}
            <div>
              <dt>{pick(site.lang, { ru: 'Мы в сетях', uz: 'Tarmoqlarda', en: 'Follow us' })}</dt>
              <dd className="field-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div className="field-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero field-hero">
      <div className="field-hero__inner">
        <div className="field-hero__copy">
          {s.eyebrow ? (
            <p className="field-hero__eyebrow field-in">
              <i aria-hidden="true" />
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="field-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="field-hero__sub field-in" style={{ ['--d' as string]: '.5s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="field-hero__ctas field-in" style={{ ['--d' as string]: '.65s' }}>
            {s.cta.label ? (
              <a className="field-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="field-btn field-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          {s.words.length ? (
            <ul className="field-hero__words field-in" style={{ ['--d' as string]: '.8s' }}>
              {s.words.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="field-crate" aria-hidden="true">
          <div className="field-crate__pile">
            {KINDS.map((k, i) => (
              <span key={k} className={`field-crate__item field-crate__item--${i}`} style={{ ['--i' as string]: i }}>
                <Veg kind={k} />
              </span>
            ))}
          </div>
          <div className="field-crate__box">
            <span className="field-crate__label">{site.name}</span>
            <span className="field-crate__stamp">{pick(site.lang, { ru: 'с грядки', uz: 'dalanadan', en: 'farm fresh' })}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee field-ticker" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={42} sep="❦" />
    </section>
  )
}

/** Урожай недели — карточки-ярлыки с овощем, ценой за кило и пометкой сезона. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="field-harvest-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="field-harvest">
        {s.items.map((it, i) => (
          <li key={i} className="field-tag-card" data-reveal="up" data-delay={String((i % 4) * 0.07)} style={{ ['--tilt' as string]: `${[-1.2, 0.8, -0.4, 1.4][i % 4]}deg` }}>
            <span className="field-tag-card__hole" aria-hidden="true" />
            <Veg kind={kindOf(i)} className="field-tag-card__veg" />
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
            <div className="field-tag-card__foot">
              {it.price ? <strong>{it.price}</strong> : null}
              {it.tag ? <span>{it.tag}</span> : null}
            </div>
          </li>
        ))}
      </ul>
      <p className="field-harvest__note" data-reveal="fade">
        {pick(site.lang, { ru: 'Состав коробки меняется каждую неделю — по тому, что созрело.', uz: 'Quti tarkibi har hafta pishgan mahsulotga qarab o‘zgaradi.', en: 'The box changes every week, depending on what is ripe.' })}
      </p>
    </Sec>
  )
}

/** Коробки трёх размеров: высота ящика растёт вместе с объёмом. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="field-boxes-sec">
      <Head label={s.label} title={s.title} center />
      <div className="field-boxes">
        {s.items.map((it, i) => (
          <article key={i} className={`field-box${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.1)}>
            <div className="field-box__crate" style={{ ['--h' as string]: `${70 + i * 26}px` }} aria-hidden="true">
              <div className="field-box__veg">
                {Array.from({ length: 3 + i * 2 }, (_, k) => (
                  <Veg key={k} kind={kindOf(k + i)} />
                ))}
              </div>
              <span className="field-box__slats" />
            </div>
            {it.featured ? <span className="field-box__flag">{pick(site.lang, { ru: 'Берут чаще всего', uz: 'Eng ko‘p olinadi', en: 'Most popular' })}</span> : null}
            <h3 className="field-box__name">{it.name}</h3>
            <p className="field-box__price">
              {it.price}
              {it.period ? <small> / {it.period}</small> : null}
            </p>
            <ul className="field-box__list">
              {it.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Sec>
  )
}

/** Путь коробки: линия маршрута, остановки и фургон, который едет вместе с прокруткой. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="field-route-sec">
      <Head label={s.label} title={s.title} />
      <Route count={s.items.length}>
        <ol className="field-route__stops">
          {s.items.map((it, i) => (
            <li key={i} className="field-stop" data-reveal="up" data-delay={String(i * 0.08)}>
              <span className="field-stop__pin">{i + 1}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </Route>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, pricing: Pricing, process: Process },
}
