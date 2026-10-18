import './style.css'
import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { RoastClock } from './client'

/*
 * ЗЕРНО — обжарочная в духе Onyx Coffee Lab, Square Mile и Sey: тёмный лист, моноширинные
 * данные, медь. Первый экран — живой профиль обжарки: кривая температуры зерна рисуется по
 * фазам (сушка, Майяр, развитие), таймер идёт вместе с ней. Происхождения — строки с
 * колесом вкуса, подписка — пачки кофе с этикеткой.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Профиль обжарки: температура зерна (BT), скорость роста (RoR) и фазы. Координаты — минуты × °C. */
function RoastCurve({ site }: { site: Site }) {
  const W = 600
  const H = 320
  const x = (min: number) => 40 + (min / 12) * (W - 60)
  const y = (c: number) => H - 30 - ((c - 80) / 150) * (H - 60)
  // BT: падение после загрузки (turning point), затем выпуклый рост до 212 °C к 11:40
  const bt: [number, number][] = [[0, 200], [0.6, 120], [1.2, 96], [2, 104], [3, 124], [4, 142], [5, 158], [6, 171], [7, 182], [8, 191], [9, 199], [10, 205], [11, 210], [11.7, 212]]
  const ror: [number, number][] = [[1.2, 220], [2, 205], [3, 190], [4, 176], [5, 164], [6, 152], [7, 142], [8, 132], [9, 124], [10, 116], [11, 108], [11.7, 104]]
  const path = (pts: [number, number][]) => pts.map(([m, c], i) => `${i ? 'L' : 'M'}${x(m).toFixed(1)} ${y(c).toFixed(1)}`).join(' ')
  const phases = [
    { from: 0, to: 4.5, label: pick(site.lang, { ru: 'сушка', uz: 'quritish', en: 'drying' }) },
    { from: 4.5, to: 9.4, label: pick(site.lang, { ru: 'Майяр', uz: 'Mayyar', en: 'Maillard' }) },
    { from: 9.4, to: 11.7, label: pick(site.lang, { ru: 'развитие', uz: 'rivojlanish', en: 'development' }) },
  ]
  return (
    <svg className="bean-curve" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={pick(site.lang, { ru: 'Профиль обжарки', uz: 'Qovurish profili', en: 'Roast profile' })}>
      {phases.map((p, i) => (
        <g key={i}>
          <rect className={`bean-curve__phase bean-curve__phase--${i}`} x={x(p.from)} y={20} width={x(p.to) - x(p.from)} height={H - 50} />
          <text className="bean-curve__plabel" x={x(p.from) + 8} y={36}>
            {p.label}
          </text>
        </g>
      ))}
      {[100, 150, 200].map((c) => (
        <g key={c}>
          <line className="bean-curve__grid" x1={40} x2={W - 20} y1={y(c)} y2={y(c)} />
          <text className="bean-curve__axis" x={6} y={y(c) + 4}>
            {c}°
          </text>
        </g>
      ))}
      {[0, 3, 6, 9, 12].map((m) => (
        <text key={m} className="bean-curve__axis" x={x(m) - 8} y={H - 8}>
          {String(m).padStart(2, '0')}:00
        </text>
      ))}
      <path className="bean-curve__ror" d={path(ror)} pathLength={1} />
      <path className="bean-curve__bt" d={path(bt)} pathLength={1} />
      <circle className="bean-curve__crack" cx={x(9.4)} cy={y(199)} r={5} />
      <text className="bean-curve__note" x={x(9.4) - 66} y={y(199) - 14}>
        {pick(site.lang, { ru: 'первый крэк', uz: 'birinchi chirsillash', en: 'first crack' })}
      </text>
    </svg>
  )
}

/** Колесо вкуса: шесть осей, значения — из названия лота (одинаковы при каждом рендере). */
function Radar({ seed, labels }: { seed: string; labels: string[] }) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const vals = labels.map((_, i) => 0.35 + (((h >> (i * 4)) & 15) / 15) * 0.6)
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / labels.length - Math.PI / 2
    return `${(Math.cos(a) * r * 70).toFixed(1)},${(Math.sin(a) * r * 70).toFixed(1)}`
  }
  return (
    <svg className="bean-radar" viewBox="-100 -100 200 200" aria-hidden="true">
      {[0.33, 0.66, 1].map((r) => (
        <polygon key={r} className="bean-radar__ring" points={labels.map((_, i) => pt(i, r)).join(' ')} />
      ))}
      <polygon className="bean-radar__shape" points={vals.map((v, i) => pt(i, v)).join(' ')} />
      {labels.map((l, i) => {
        const [lx, ly] = pt(i, 1.24).split(',').map(Number)
        return (
          <text key={l} x={lx} y={ly + 3} textAnchor="middle" className="bean-radar__label">
            {l}
          </text>
        )
      })}
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="bean-header">
        <a href="#top" className="bean-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="bean-logo__seed" aria-hidden="true" />
          {site.name}
        </a>
        <nav className="bean-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="bean-header__side">
          {site.nav.cta.label ? (
            <a className="bean-btn bean-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="bean-footer">
        <p className="bean-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="bean-footer__grid">
          <p className="bean-footer__tag">{site.tagline}</p>
          <div>
            <p className="bean-k">{ui(site.lang, 'address')}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
          </div>
          <div>
            <p className="bean-k">{ui(site.lang, 'hours')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="bean-k">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {b.phone ? (
              <p>
                <a href={tel(b.phone)}>{b.phone}</a>
              </p>
            ) : null}
            {b.socials.map((s) => (
              <p key={s.url}>
                <a href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              </p>
            ))}
          </div>
        </div>
        <p className="bean-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero bean-hero">
      <div className="bean-hero__inner">
        <div className="bean-hero__text">
          {s.eyebrow ? (
            <p className="bean-hero__eyebrow bean-in" style={{ ['--d' as string]: '.1s' }}>
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="bean-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="bean-hero__sub bean-in" style={{ ['--d' as string]: '.6s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="bean-hero__ctas bean-in" style={{ ['--d' as string]: '.75s' }}>
            {s.cta.label ? (
              <a className="bean-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="bean-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
        <div className="bean-panel bean-in" style={{ ['--d' as string]: '.3s' }}>
          <div className="bean-panel__head">
            <span>{pick(site.lang, { ru: 'Профиль обжарки', uz: 'Qovurish profili', en: 'Roast profile' })}</span>
            <RoastClock />
          </div>
          <RoastCurve site={site} />
          {s.words.length ? (
            <ul className="bean-panel__lots">
              {s.words.map((w, i) => (
                <li key={w}>
                  <span>LOT {String(i + 1).padStart(3, '0')}</span> {w}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Происхождения: страна и ферма, обработка и высота, ноты чипами, колесо вкуса справа. */
function Works({ section: s, site }: SectionProps<'works'>) {
  const axes = [
    pick(site.lang, { ru: 'сладость', uz: 'shirinlik', en: 'sweet' }),
    pick(site.lang, { ru: 'кислота', uz: 'nordonlik', en: 'acidity' }),
    pick(site.lang, { ru: 'тело', uz: 'tana', en: 'body' }),
    pick(site.lang, { ru: 'фрукты', uz: 'meva', en: 'fruit' }),
    pick(site.lang, { ru: 'цветы', uz: 'gul', en: 'floral' }),
    pick(site.lang, { ru: 'какао', uz: 'kakao', en: 'cocoa' }),
  ]
  return (
    <Sec id={s.anchor} type="works" className="bean-origins-sec">
      <Head label={s.label} title={s.title} />
      <ol className="bean-origins">
        {s.items.map((it, i) => (
          <li key={i} className="bean-origin" data-reveal="up" data-delay={String((i % 3) * 0.06)}>
            <span className="bean-origin__no">{String(i + 1).padStart(2, '0')}</span>
            <div className="bean-origin__main">
              <h3 className="bean-origin__name">{it.title}</h3>
              <p className="bean-origin__meta">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
              {it.text ? (
                <ul className="bean-origin__notes">
                  {it.text.split(',').map((n) => (
                    <li key={n}>{n.trim()}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Radar seed={it.title} labels={axes} />
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Подписка: тарифы как пачки кофе с этикеткой. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="bean-subs-sec">
      <Head label={s.label} title={s.title} />
      <div className="bean-subs">
        {s.items.map((p, i) => (
          <article key={i} className={`bean-bag${p.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            <div className="bean-bag__top" aria-hidden="true">
              <span />
            </div>
            <div className="bean-bag__label">
              <p className="bean-k">{p.featured ? pick(site.lang, { ru: 'чаще выбирают', uz: 'ko‘proq tanlashadi', en: 'most chosen' }) : `№ ${String(i + 1).padStart(2, '0')}`}</p>
              <h3 className="bean-bag__name">{p.name}</h3>
              <p className="bean-bag__price">
                {p.price} <small>{p.period}</small>
              </p>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a className="bean-btn bean-btn--full" href={site.nav.cta.href || '#contact'}>
                {pick(site.lang, { ru: 'Оформить', uz: 'Rasmiylashtirish', en: 'Subscribe' })}
              </a>
            </div>
          </article>
        ))}
      </div>
    </Sec>
  )
}

/** Цифры — спецификация: строка, метка слева, значение справа, как в паспорте лота. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="bean-spec-sec">
      <div className="bean-spec">
        <Head label={s.label} title={s.title} />
        <dl>
          {s.items.map((it, i) => (
            <div key={i} className="bean-spec__row" data-reveal="fade" data-delay={String(i * 0.06)}>
              <dt>{it.label}</dt>
              <dd>
                <span data-count>{it.value}</span>
                {it.suffix ? <small> {it.suffix}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Sec>
  )
}

/** Путь зерна: горизонтальная шкала, шаги-точки на линии. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="bean-path-sec">
      <Head label={s.label} title={s.title} />
      <ol className="bean-path">
        {s.items.map((it, i) => (
          <li key={i} className="bean-path__step" data-reveal="up" data-delay={String(i * 0.08)}>
            <span className="bean-path__dot" aria-hidden="true" />
            <p className="bean-k">{String(i + 1).padStart(2, '0')}</p>
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
  sections: { hero: Hero, works: Works, pricing: Pricing, stats: Stats, process: Process },
}
