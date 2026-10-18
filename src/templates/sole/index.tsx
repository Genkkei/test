import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Countdown, Tilt } from './client'

/*
 * ПОДОШВА — магазин кроссовок в духе Nike SNKRS и END. Launches: светло-серая витрина,
 * моноширинный гротеск капсом, огромная пара на первом экране, таймер до субботнего дропа,
 * релизы карточками с размерами, бегущая строка брендов на чёрном.
 */

const COLORWAYS: [string, string, string][] = [
  ['#d9dbe0', '#9aa0aa', '#f5f5f3'],
  ['#ffffff', '#c8102e', '#e9e4da'],
  ['#ffffff', '#111111', '#e6dcc4'],
  ['#e9e5dc', '#2f6bff', '#f2f2f0'],
  ['#2b2b2b', '#a6c43a', '#4a4a4a'],
  ['#f2ece0', '#111111', '#ffffff'],
]

/** Кроссовок сбоку: подошва, верх, полоса, шнуровка. Цвета — расцветка релиза. */
export function Sneaker({ cw = 0, className = '' }: { cw?: number; className?: string }) {
  const [upper, stripe, sole] = COLORWAYS[cw % COLORWAYS.length]
  return (
    <svg className={`sole-sneaker ${className}`} viewBox="0 0 400 200" aria-hidden="true">
      <ellipse cx="205" cy="186" rx="180" ry="8" fill="#000" opacity=".12" />
      <path d="M22 146 Q14 176 52 178 L368 178 Q394 177 393 156 L390 140 Z" fill={sole} stroke="#111" strokeWidth="3" />
      <path d="M26 162 L388 162" stroke="#111" strokeWidth="2" opacity=".35" />
      <path d="M28 150 L30 98 Q32 70 62 66 L94 70 Q112 86 134 80 L150 52 Q160 40 174 48 L204 78 Q252 98 302 112 Q358 120 386 140 L390 150 Z" fill={upper} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
      <path d="M30 104 Q44 108 52 96 L56 70" fill="none" stroke="#111" strokeWidth="2.5" opacity=".5" />
      <path d="M318 116 Q366 122 386 142" fill="none" stroke="#111" strokeWidth="2.5" opacity=".45" />
      <path d="M100 142 Q206 96 334 126 Q236 118 124 150 Z" fill={stripe} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={176 + i * 17} y1={70 + i * 8} x2={190 + i * 17} y2={58 + i * 8} stroke="#111" strokeWidth="4" strokeLinecap="round" />
      ))}
      <path d="M150 52 Q150 28 170 30" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
      <circle cx="44" cy="124" r="4" fill="#111" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="sole-header">
        <a href="#top" className="sole-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.name}
        </a>
        <nav className="sole-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <sup>{String(i + 1).padStart(2, '0')}</sup>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="sole-header__side">
          {site.nav.cta.label ? (
            <a className="sole-btn sole-btn--sm" href={site.nav.cta.href} target={site.nav.cta.href.startsWith('http') ? '_blank' : undefined} rel="noopener">
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="sole-footer">
        <div className="sole-footer__top">
          <p className="sole-footer__tag">{site.tagline}</p>
          <dl className="sole-footer__facts">
            <div>
              <dt>{ui(site.lang, 'address')}</dt>
              <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
            </div>
            <div>
              <dt>{ui(site.lang, 'hours')}</dt>
              <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
            </div>
            <div>
              <dt>{ui(site.lang, 'phone')}</dt>
              <dd>{b.phone}</dd>
            </div>
            <div>
              <dt>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</dt>
              <dd className="sole-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name} ↗
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <p className="sole-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <p className="sole-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Только оригиналы', uz: 'Faqat originallar', en: 'Authentic only' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const sizes = ['40', '40.5', '41', '42', '42.5', '43', '44', '45']
  return (
    <section id={s.anchor || undefined} className="s s-hero sole-hero">
      <p className="sole-hero__bg" aria-hidden="true">
        DROP
      </p>
      <div className="sole-hero__top">
        <h1 className="sole-hero__title">
          <span data-split="chars">{s.title || site.name}</span>
        </h1>
        <Countdown
          labels={{
            d: pick(site.lang, { ru: 'дн', uz: 'kun', en: 'd' }),
            h: pick(site.lang, { ru: 'ч', uz: 'soat', en: 'h' }),
            m: pick(site.lang, { ru: 'мин', uz: 'daq', en: 'm' }),
            s: pick(site.lang, { ru: 'сек', uz: 'son', en: 's' }),
            when: pick(site.lang, { ru: 'Суббота, 10:00 по Ташкенту', uz: 'Shanba, Toshkent vaqti bilan 10:00', en: 'Saturday, 10:00 Tashkent time' }),
          }}
        />
      </div>
      <Tilt>
        <Sneaker cw={0} className="sole-hero__shoe" />
      </Tilt>
      <div className="sole-hero__bottom">
        <div className="sole-hero__info sole-in">
          {s.eyebrow ? <p className="sole-hero__model">{s.eyebrow}</p> : null}
          {s.subtitle ? <p className="sole-hero__sub">{s.subtitle}</p> : null}
        </div>
        <div className="sole-hero__buy sole-in" style={{ ['--d' as string]: '.5s' }}>
          <p className="sole-hero__sizes-label">{pick(site.lang, { ru: 'Размеры EU', uz: 'EU o‘lchamlari', en: 'EU sizes' })}</p>
          <ul className="sole-sizes">
            {sizes.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
          <div className="sole-hero__ctas">
            {s.cta.label ? (
              <a className="sole-btn" href={s.cta.href || '#'} target={s.cta.href.startsWith('http') ? '_blank' : undefined} rel="noopener" data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="sole-btn sole-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee sole-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={26} sep="✕" />
    </section>
  )
}

function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="sole-drops-sec">
      <Head label={s.label} title={s.title} />
      <ul className="sole-drops">
        {s.items.map((it, i) => (
          <li key={i} className="sole-drop" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <div className="sole-drop__stage">
              <span className="sole-drop__badge">{it.year}</span>
              {it.image ? (
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} className="media" />
              ) : (
                <Sneaker cw={i + 1} className="sole-drop__shoe" />
              )}
            </div>
            <div className="sole-drop__cap">
              <p className="sole-drop__brand">{it.category}</p>
              <h3 className="sole-drop__name">{it.title}</h3>
              {it.text ? <p className="sole-drop__text">{it.text}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Мастерская — как чек: строки с пунктиром, срок справа, цена жирно. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="sole-receipt-sec">
      <div className="sole-receipt-grid">
        <Head label={s.label} title={s.title}>
          {s.intro ? (
            <p className="s__intro" data-reveal="up">
              {s.intro}
            </p>
          ) : null}
        </Head>
        <div className="sole-receipt" data-reveal="up">
          <p className="sole-receipt__head">
            {site.name} · {pick(site.lang, { ru: 'мастерская', uz: 'ustaxona', en: 'workshop' })}
          </p>
          <ul>
            {s.items.map((it, i) => (
              <li key={i}>
                <div className="sole-receipt__row">
                  <span>{it.title}</span>
                  <i aria-hidden="true" />
                  <b>{it.price}</b>
                </div>
                <p>
                  {it.text}
                  {it.tag ? <em> · {it.tag}</em> : null}
                </p>
              </li>
            ))}
          </ul>
          <p className="sole-receipt__code" aria-hidden="true">
            ||| | |||| || | ||| ||||| | || |||
          </p>
        </div>
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, works: Works, services: Services },
}
