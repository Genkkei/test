import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { TerroirMotion } from './client'

/*
 * ПРОИСХОЖДЕНИЕ — обжарщик спешелти. Первый экран — навигационная карта кофейного пояса без материков
 * (только сетка, тропики и точки): фермы — из стран на полке этой недели (services.tag), от каждой к
 * обжарочной в Ташкенте чертится пунктир «тропы зерна», у Ташкента раскрывается окно с остывающим зерном.
 * У каждой пачки на полке — координаты фермы и посчитанное расстояние по дуге большого круга (не выдумано).
 * Порядок: сетка → пояс → фермы → тропы по очереди → Ташкент и окно обжарки. Кривая — (.65,0,.35,1) у линий.
 * Шрифты: Vollkorn (заголовки), Libre Franklin (текст), Source Code Pro (координаты, метки, цены).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

type Origin = { ru: string; uz: string; en: string; re: RegExp; lat: number; lon: number }
const ORIGINS: Origin[] = [
  { ru: 'Эфиопия', uz: 'Efiopiya', en: 'Ethiopia', re: /эфиоп|efiop|ethiop/i, lat: 6.2, lon: 38.7 },
  { ru: 'Кения', uz: 'Keniya', en: 'Kenya', re: /кени|keniya|kenya/i, lat: -0.4, lon: 36.9 },
  { ru: 'Руанда', uz: 'Ruanda', en: 'Rwanda', re: /руанд|ruanda|rwanda/i, lat: -2.3, lon: 29.1 },
  { ru: 'Колумбия', uz: 'Kolumbiya', en: 'Colombia', re: /колумб|kolumb|colomb/i, lat: 2.5, lon: -75.6 },
  { ru: 'Бразилия', uz: 'Braziliya', en: 'Brazil', re: /бразил|braziliya|brazil/i, lat: -18.9, lon: -46.9 },
  { ru: 'Гватемала', uz: 'Gvatemala', en: 'Guatemala', re: /гватем|gvatem|guatem/i, lat: 14.6, lon: -90.7 },
  { ru: 'Панама', uz: 'Panama', en: 'Panama', re: /панам|panam/i, lat: 8.8, lon: -82.4 },
  { ru: 'Коста-Рика', uz: 'Kosta-Rika', en: 'Costa Rica', re: /коста|kosta|costa/i, lat: 9.9, lon: -84 },
  { ru: 'Перу', uz: 'Peru', en: 'Peru', re: /перу|peru/i, lat: -11.6, lon: -76.3 },
  { ru: 'Гондурас', uz: 'Gonduras', en: 'Honduras', re: /гондур|gondur|hondur/i, lat: 14.8, lon: -87.2 },
  { ru: 'Уганда', uz: 'Uganda', en: 'Uganda', re: /уганд|uganda/i, lat: 1.1, lon: 34.2 },
  { ru: 'Бурунди', uz: 'Burundi', en: 'Burundi', re: /бурунд|burundi/i, lat: -3.4, lon: 29.9 },
  { ru: 'Йемен', uz: 'Yaman', en: 'Yemen', re: /йемен|yaman|yemen/i, lat: 15.4, lon: 44.2 },
  { ru: 'Индия', uz: 'Hindiston', en: 'India', re: /индия|hindiston|india/i, lat: 13.3, lon: 75.7 },
  { ru: 'Индонезия', uz: 'Indoneziya', en: 'Indonesia', re: /индонез|indonez|indones/i, lat: -2.5, lon: 101.5 },
  { ru: 'Вьетнам', uz: 'Vyetnam', en: 'Vietnam', re: /вьетнам|vyetnam|vietnam/i, lat: 12.7, lon: 108.2 },
]
const HOME = { lat: 41.3, lon: 69.2 }

/* карта: равнопромежуточная проекция, окно −95…125° долготы, −32…50° широты */
const W = 1000
const LON0 = -95
const LON1 = 125
const LAT0 = 50
const LAT1 = -32
const K = W / (LON1 - LON0)
const H = Math.round((LAT0 - LAT1) * K)
const X = (lon: number) => (lon - LON0) * K
const Y = (lat: number) => (LAT0 - lat) * K

/** Расстояние по дуге большого круга, км. */
function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = Math.PI / 180
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2
  return Math.round((2 * 6371 * Math.asin(Math.sqrt(h))) / 10) * 10
}
const coord = (o: { lat: number; lon: number }) => `${Math.abs(o.lat).toFixed(1)}°${o.lat >= 0 ? 'N' : 'S'} ${Math.abs(o.lon).toFixed(1)}°${o.lon >= 0 ? 'E' : 'W'}`
const findOrigin = (s: string) => (s.includes('+') ? undefined : ORIGINS.find((o) => o.re.test(s)))

function originsOf(site: Site): Origin[] {
  const sv = site.sections.find((x) => x.type === 'services' && x.enabled)
  const text = sv && sv.type === 'services' ? sv.items.map((it) => `${it.tag} ${it.title}`).join(' | ') : ''
  const found = ORIGINS.filter((o) => o.re.test(text))
  return found.length ? found : ORIGINS.slice(0, 5)
}

/** Подписи точек без наложений: перебираем четыре стороны, берём первую, где подпись никого не задевает. */
function placeLabels(list: Origin[], lang: string) {
  const boxes: { x0: number; y0: number; x1: number; y1: number }[] = []
  const hit = (b: { x0: number; y0: number; x1: number; y1: number }) => boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0)
  return list.map((o) => {
    const x = X(o.lon)
    const y = Y(o.lat)
    const w = Math.max(pick(lang, o).length * 8.6, 82) + 10
    const opts = [
      { dx: 9, dy: -8, anchor: 'start' as const },
      { dx: 9, dy: 26, anchor: 'start' as const },
      { dx: -9, dy: -8, anchor: 'end' as const },
      { dx: -9, dy: 26, anchor: 'end' as const },
    ]
    const box = (p: (typeof opts)[number]) => (p.anchor === 'start' ? { x0: x + p.dx, x1: x + p.dx + w } : { x0: x + p.dx - w, x1: x + p.dx }) as { x0: number; x1: number }
    const pick1 = opts.find((p) => !hit({ ...box(p), y0: y + p.dy - 16, y1: y + p.dy + 18 })) || opts[0]
    boxes.push({ ...box(pick1), y0: y + pick1.dy - 16, y1: y + pick1.dy + 18 })
    return pick1
  })
}

function Chart({ site, video, poster }: { site: Site; video: string; poster: string }) {
  const list = originsOf(site)
  const labels = placeLabels(list, site.lang)
  const hx = X(HOME.lon)
  const hy = Y(HOME.lat)
  return (
    <div className="terroir-chart" data-terroir-chart>
      <svg viewBox={`0 0 ${W} ${H}`} className="terroir-chart__svg" aria-hidden="true">
        <defs>
          {list.map((o, i) => {
            const x = X(o.lon)
            const y = Y(o.lat)
            const cx = (x + hx) / 2
            const cy = Math.min(y, hy) - 60 - i * 6
            return (
              <mask key={i} id={`terroir-trail-${i}`} maskUnits="userSpaceOnUse">
                <path d={`M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}`} pathLength="1" className="terroir-trail__reveal" style={{ ['--i' as string]: i }} />
              </mask>
            )
          })}
        </defs>
        <g className="terroir-grid">
          {Array.from({ length: Math.floor((LON1 - LON0) / 15) + 1 }, (_, i) => {
            const lon = Math.ceil(LON0 / 15) * 15 + i * 15
            return <line key={`v${i}`} x1={X(lon)} x2={X(lon)} y1={0} y2={H} />
          })}
          {Array.from({ length: 6 }, (_, i) => {
            const lat = 45 - i * 15
            return <line key={`h${i}`} x1={0} x2={W} y1={Y(lat)} y2={Y(lat)} className={lat === 0 ? 'is-eq' : undefined} />
          })}
        </g>
        <rect className="terroir-belt" x={0} y={Y(23.4)} width={W} height={Y(-23.4) - Y(23.4)} />
        <text className="terroir-belt__label" x={12} y={Y(23.4) + 18}>
          {pick(site.lang, { ru: 'КОФЕЙНЫЙ ПОЯС · 23,4°N — 23,4°S', uz: 'QAHVA KAMARI · 23,4°N — 23,4°S', en: 'COFFEE BELT · 23.4°N — 23.4°S' })}
        </text>
        {list.map((o, i) => {
          const x = X(o.lon)
          const y = Y(o.lat)
          const cx = (x + hx) / 2
          const cy = Math.min(y, hy) - 60 - i * 6
          return (
            <g key={i} className="terroir-origin" style={{ ['--i' as string]: i }}>
              <path className="terroir-trail" d={`M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}`} mask={`url(#terroir-trail-${i})`} />
              <circle className="terroir-origin__dot" cx={x} cy={y} r="5" />
              <text className="terroir-origin__name" x={x + labels[i].dx} y={y + labels[i].dy} textAnchor={labels[i].anchor}>
                {pick(site.lang, o)}
              </text>
              <text className="terroir-origin__coord" x={x + labels[i].dx} y={y + labels[i].dy + 16} textAnchor={labels[i].anchor}>
                {coord(o)}
              </text>
            </g>
          )
        })}
        <g className="terroir-home">
          <circle className="terroir-home__ring" cx={hx} cy={hy} r="14" />
          <circle className="terroir-home__dot" cx={hx} cy={hy} r="6" />
          <text className="terroir-origin__name" x={hx + 18} y={hy - 4}>
            {pick(site.lang, { ru: 'Ташкент · обжарка', uz: 'Toshkent · qovurish', en: 'Tashkent · roastery' })}
          </text>
          <text className="terroir-origin__coord" x={hx + 18} y={hy + 12}>
            {coord(HOME)}
          </text>
        </g>
      </svg>
      <div className="terroir-chart__window" style={{ left: `${(hx / W) * 100}%`, top: `${(hy / H) * 100}%` }}>
        {video ? (
          <video src={video} poster={poster || undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        ) : (
          <Media src={poster} alt="" seed={`${site.slug}-hero`} colors={palette(site)} kind="waves" className="media" />
        )}
      </div>
    </div>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <TerroirMotion />
      <header className="terroir-bar">
        <a href="#top" className="terroir-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="terroir-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="terroir-bar__side">
          {site.nav.cta.label ? (
            <a className="terroir-btn terroir-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="terroir-foot">
        <p className="terroir-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
        <p className="terroir-foot__coord">{coord(HOME)}</p>
        <div className="terroir-foot__cols">
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
        <p className="terroir-foot__legal">
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
  const words = s.words.filter(Boolean)
  return (
    <section id={s.anchor || undefined} className="s s-hero terroir-hero" data-terroir-hero>
      <div className="terroir-hero__head">
        <div className="terroir-hero__text">
          {s.eyebrow ? <p className="terroir-label terroir-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
          <h1 className="terroir-title terroir-in" style={{ ['--i' as string]: 1 }}>
            {s.title || site.name}
          </h1>
        </div>
        <div className="terroir-hero__side">
          {words.length ? (
            <p className="terroir-cup terroir-in" style={{ ['--i' as string]: 2 }}>
              <span>{pick(site.lang, { ru: 'в чашке сегодня', uz: 'bugun piyolada', en: 'in the cup today' })}</span>
              <b data-terroir-word>{words[0]}</b>
            </p>
          ) : null}
          {s.subtitle ? <p className="terroir-hero__sub terroir-in" style={{ ['--i' as string]: 3 }}>{s.subtitle}</p> : null}
          <div className="terroir-hero__ctas terroir-in" style={{ ['--i' as string]: 4 }}>
            {s.cta.label ? (
              <a className="terroir-btn" href={s.cta.href || '#'}>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="terroir-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
        {words.length > 1 ? <script type="application/json" data-terroir-words dangerouslySetInnerHTML={{ __html: JSON.stringify(words) }} /> : null}
      </div>
      <Chart site={site} video={s.video} poster={s.image} />
    </section>
  )
}

/** Бегущая строка → штампы, как в паспорте путешественника. */
function Stamps({ section: s }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s terroir-stamps" aria-label={s.items.join(', ')}>
      <ul>
        {s.items.map((m, i) => (
          <li key={i} data-te="stamp" style={{ ['--i' as string]: i, ['--r' as string]: `${[-4, 3, -2, 5, -3][i % 5]}deg` }}>
            {m}
          </li>
        ))}
      </ul>
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about terroir-about">
      <div className="terroir-about__text" data-te="rise">
        {s.label ? <p className="terroir-label">{s.label}</p> : null}
        {s.title ? <h2 className="terroir-h2">{s.title}</h2> : null}
        {s.text ? <p>{s.text}</p> : null}
      </div>
      <div className="terroir-about__photo" data-te="rise">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="waves" className="media" />
      </div>
    </section>
  )
}

/** Зерно недели — пачки: страна и обработка из тега, ноты, цена, координаты и путь до обжарки. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services terroir-shelf">
      <div className="terroir-head" data-te="rise">
        {s.label ? <p className="terroir-label">{s.label}</p> : null}
        {s.title ? <h2 className="terroir-h2">{s.title}</h2> : null}
        {s.intro ? <p className="terroir-head__intro">{s.intro}</p> : null}
      </div>
      <ul className="terroir-bags">
        {s.items.map((it, i) => {
          const o = findOrigin(`${it.tag} ${it.title}`)
          const [country, process] = it.tag.split(/\s+·\s+/)
          return (
            <li key={i} className="terroir-bag" data-te="rise" style={{ ['--i' as string]: i % 3 }}>
              <span className="terroir-bag__valve" aria-hidden="true" />
              <p className="terroir-bag__origin">
                {country}
                {process ? <small>{process}</small> : null}
              </p>
              <h3>{it.title}</h3>
              <p className="terroir-bag__notes">{it.text}</p>
              {o ? (
                <p className="terroir-bag__route">
                  <span>{coord(o)}</span>
                  <span>
                    ≈ {km(o, HOME).toLocaleString('ru-RU')} {pick(site.lang, { ru: 'км до обжарки', uz: 'km qovurishgacha', en: 'km to the roastery' })}
                  </span>
                </p>
              ) : null}
              {it.price ? <b className="terroir-bag__price">{it.price}</b> : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Путь зерна — тропа: пунктир дорисовывается прокруткой, шаги стоят на ней точками. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process terroir-path" data-terroir-path>
      <div className="terroir-head" data-te="rise">
        {s.label ? <p className="terroir-label">{s.label}</p> : null}
        {s.title ? <h2 className="terroir-h2">{s.title}</h2> : null}
      </div>
      <ol className="terroir-path__list" style={{ ['--n' as string]: s.items.length }}>
        <span className="terroir-path__line" aria-hidden="true" />
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="terroir-path__dot" aria-hidden="true" />
            <span className="terroir-path__n">{String(i + 1).padStart(2, '0')}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <section id={s.anchor || undefined} className="s s-menu terroir-menu">
      <div className="terroir-head" data-te="rise">
        {s.label ? <p className="terroir-label">{s.label}</p> : null}
        {s.title ? <h2 className="terroir-h2">{s.title}</h2> : null}
      </div>
      <div className="terroir-menu__cols">
        {s.groups.map((g, gi) => (
          <div key={gi} data-te="rise" style={{ ['--i' as string]: gi }}>
            <h3>{g.name}</h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={i}>
                  <span>
                    <b>{it.name}</b>
                    {it.text ? <small>{it.text}</small> : null}
                  </span>
                  <em>{it.price}</em>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function Pricing({ section: s }: SectionProps<'pricing'>) {
  return (
    <section id={s.anchor || undefined} className="s s-pricing terroir-subs">
      <div className="terroir-head" data-te="rise">
        {s.label ? <p className="terroir-label">{s.label}</p> : null}
        {s.title ? <h2 className="terroir-h2">{s.title}</h2> : null}
      </div>
      <ul className="terroir-subs__list">
        {s.items.map((it, i) => (
          <li key={i} className={it.featured ? 'is-featured' : undefined} data-te="rise" style={{ ['--i' as string]: i }}>
            <h3>{it.name}</h3>
            <p className="terroir-subs__price">
              {it.price}
              {it.period ? <small> {it.period}</small> : null}
            </p>
            <ul>
              {it.features.map((f, k) => (
                <li key={k}>{f}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats terroir-stats">
      <dl>
        {s.items.map((it, i) => (
          <div key={i} data-te="rise" style={{ ['--i' as string]: i }}>
            <dd>
              {it.value}
              {it.suffix ? <small>{it.suffix.trim()}</small> : null}
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials terroir-notes">
      <div className="terroir-head" data-te="rise">
        {s.label ? <p className="terroir-label">{s.label}</p> : null}
        {s.title ? <h2 className="terroir-h2">{s.title}</h2> : null}
      </div>
      <div className="terroir-notes__list">
        {s.items.map((it, i) => (
          <figure key={i} data-te="rise" style={{ ['--i' as string]: i }}>
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
    <section id={s.anchor || undefined} className="s s-faq terroir-faq">
      <div className="terroir-head" data-te="rise">
        {s.label ? <p className="terroir-label">{s.label}</p> : null}
        {s.title ? <h2 className="terroir-h2">{s.title}</h2> : null}
      </div>
      <div className="terroir-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item terroir-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact terroir-contact">
      <div data-te="rise">
        {s.label ? <p className="terroir-label">{s.label}</p> : null}
        {s.title ? <h2 className="terroir-contact__title">{s.title}</h2> : null}
      </div>
      <div className="terroir-contact__side" data-te="rise">
        {s.text ? <p>{s.text}</p> : null}
        <div className="terroir-hero__ctas">
          {s.cta.label ? (
            <a className="terroir-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="terroir-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: Stamps, about: About, services: Services, process: Process, menu: Menu, pricing: Pricing, stats: Stats, testimonials: Testimonials, faq: Faq, contact: Contact },
}
