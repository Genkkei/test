import type React from 'react'
import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Media } from '@/motion/art'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { CezveMotion, ScaleReadout } from './client'

/*
 * КАППИНГ — спешелти-кофейня. Первый экран — бар заваривания: весы с табло (граммы с десятыми и таймер),
 * над ними круглое окно с воронкой, куда льётся вода. Ведущий приём — «весы»: табло загорается сегментами,
 * граммы набегают до дозы, потом идёт таймер пролива. Карта лотов — лист каппинга с колесом вкусов:
 * наведение на лот подсвечивает его ноты на колесе. Каппинг — циферблат, стрелка идёт с прокруткой.
 * Порядок входа: корпус весов → сегменты табло → граммы → окно раскрывается из точки → строки заголовка
 * проступают из размытия → текст → кнопки → таймер. Кривая — expo-out (.19,1,.22,1).
 * Шрифты: Spectral (заголовки, светлый и курсив), Commissioner (текст), Geist Mono (табло, метки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Колесо вкусов: восемь секторов, ноты лота раскладываются по ключевым словам (ru/uz/en). */
const WHEEL: { ru: string; uz: string; en: string; re: RegExp }[] = [
  { ru: 'Ягоды', uz: 'Rezavor', en: 'Berries', re: /клубник|малин|черник|ягод|вишн|qulupnay|malina|rezavor|olcha|strawberr|raspberr|berr|cherr/i },
  { ru: 'Фрукты', uz: 'Mevalar', en: 'Fruit', re: /фрукт|персик|абрикос|манго|яблок|слив|meva|shaftoli|o‘rik|olma|fruit|peach|apricot|mango|apple|plum/i },
  { ru: 'Цитрус', uz: 'Sitrus', en: 'Citrus', re: /цитрус|лимон|бергамот|апельсин|грейпфрут|limon|bergamot|apelsin|citrus|lemon|orange|grapefruit/i },
  { ru: 'Цветы', uz: 'Gullar', en: 'Floral', re: /жасмин|цвет|роз|лаванд|чай|yasmin|gul|choy|jasmine|floral|rose|lavender|tea/i },
  { ru: 'Шоколад', uz: 'Shokolad', en: 'Chocolate', re: /шоколад|какао|shokolad|kakao|chocolate|cocoa/i },
  { ru: 'Карамель', uz: 'Karamel', en: 'Caramel', re: /карамел|мёд|мед|орех|ирис|сахар|karamel|asal|yong‘oq|caramel|honey|nut|toffee/i },
  { ru: 'Специи', uz: 'Ziravor', en: 'Spice', re: /специ|кориц|гвоздик|перец|ziravor|dolchin|qalampir|spice|cinnamon|clove|pepper/i },
  { ru: 'Брожение', uz: 'Bijg‘ish', en: 'Ferment', re: /ром|вин|анаэроб|ликёр|rom|vino|anaerob|rum|wine|anaerobic|liqueur/i },
]
const notesOf = (s: string) => WHEEL.map((w, i) => (w.re.test(s) ? i : -1)).filter((i) => i >= 0)

function sector(i: number, r0: number, r1: number) {
  const a0 = ((i * 45 - 90 - 22.5 + 1.2) * Math.PI) / 180
  const a1 = ((i * 45 - 90 + 22.5 - 1.2) * Math.PI) / 180
  const p = (r: number, a: number) => `${(100 + r * Math.cos(a)).toFixed(2)} ${(100 + r * Math.sin(a)).toFixed(2)}`
  return `M${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`
}

function Wheel({ lang }: { lang: string }) {
  return (
    <figure className="cezve-wheel" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        {WHEEL.map((w, i) => {
          const a = i * 45
          const flip = a > 90 && a < 270
          return (
            <g key={i} data-cezve-seg={i}>
              <path d={sector(i, 52, 96)} />
              <text transform={`rotate(${a} 100 100) translate(100 ${flip ? 26 : 22}) rotate(${flip ? 180 : 0})`} textAnchor="middle" dominantBaseline="middle">
                {pick(lang, w)}
              </text>
            </g>
          )
        })}
        <circle cx="100" cy="100" r="46" className="cezve-wheel__hub" />
      </svg>
      <figcaption data-cezve-hub>{pick(lang, { ru: 'наведите на лот', uz: 'lotni tanlang', en: 'point at a lot' })}</figcaption>
    </figure>
  )
}

/** Строки заголовка: проступают из размытия (unbelievablycrap), шаг между строками короткий. */
function lines(title: string): string[] {
  const words = title.split(/\s+/).filter(Boolean)
  const out: string[] = []
  let cur = ''
  const max = Math.max(10, Math.ceil(title.length / 3))
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (cur && next.length > max) {
      out.push(cur)
      cur = w
    } else cur = next
  }
  if (cur) out.push(cur)
  // предлог или союз в конце строки переносим на следующую: «пробуют, / а не пьют»
  for (let i = 0; i < out.length - 1; i++) {
    const m = out[i].match(/^(.*\S)\s+(\S{1,2})$/)
    if (m) {
      out[i] = m[1]
      out[i + 1] = `${m[2]} ${out[i + 1]}`
    }
  }
  return out
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <>
      <CezveMotion />
      <header className="cezve-bar">
        <a href="#top" className="cezve-bar__logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="cezve-bar__nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="cezve-bar__side">
          {site.nav.cta.label ? (
            <a className="cezve-btn cezve-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="cezve-foot">
        <div className="cezve-foot__logo">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</div>
        <dl className="cezve-foot__sheet">
          {site.tagline ? (
            <div>
              <dt>{pick(site.lang, { ru: 'Профиль', uz: 'Profil', en: 'Profile' })}</dt>
              <dd>{site.tagline}</dd>
            </div>
          ) : null}
          {address ? (
            <div>
              <dt>{ui(site.lang, 'address')}</dt>
              <dd>{address}</dd>
            </div>
          ) : null}
          {b.hours.length ? (
            <div>
              <dt>{ui(site.lang, 'hours')}</dt>
              <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
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
          <div>
            <dt>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</dt>
            <dd className="cezve-foot__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </dd>
          </div>
        </dl>
        <p className="cezve-foot__legal">
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
  const ls = lines(s.title || site.name)
  const facts = site.sections.find((x) => x.type === 'marquee' && x.enabled)
  return (
    <section id={s.anchor || undefined} className="s s-hero cezve-hero" data-cezve-hero>
      <div className="cezve-hero__text">
        {s.eyebrow ? <p className="cezve-label cezve-in" style={{ ['--i' as string]: 0 }}>{s.eyebrow}</p> : null}
        <h1 className="cezve-title">
          {ls.map((l, i) => (
            <span key={i} className="cezve-title__line" style={{ ['--i' as string]: i }}>
              {l}
            </span>
          ))}
        </h1>
        {s.subtitle ? <p className="cezve-hero__sub cezve-in" style={{ ['--i' as string]: 4 }}>{s.subtitle}</p> : null}
        <div className="cezve-hero__ctas cezve-in" style={{ ['--i' as string]: 5 }}>
          {s.cta.label ? (
            <a className="cezve-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="cezve-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label} <span aria-hidden="true">→</span>
            </a>
          ) : null}
        </div>
      </div>
      <div className="cezve-station" aria-hidden="true">
        <div className="cezve-station__window">
          {s.video ? (
            <video src={s.video} poster={s.image || undefined} autoPlay muted loop playsInline preload="metadata" />
          ) : (
            <Media src={s.image} alt="" seed={`${site.slug}-hero`} colors={palette(site)} kind="rings" className="media" />
          )}
        </div>
        <div className="cezve-scale">
          <div className="cezve-scale__lcd">
            <ScaleReadout />
          </div>
          <span className="cezve-scale__btn" />
          <span className="cezve-scale__btn" />
        </div>
      </div>
      {facts && facts.type === 'marquee' && facts.items.length ? (
        <ul className="cezve-facts">
          {facts.items.map((f, i) => (
            <li key={i} className="cezve-in" style={{ ['--i' as string]: 6 + i * 0.5 }}>
              {f}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <section id={s.anchor || undefined} className="s s-about cezve-about">
      <div className="cezve-about__photo" data-cz="lift">
        <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="rings" className="media" />
      </div>
      <div className="cezve-about__text" data-cz="rise">
        {s.label ? <p className="cezve-label">{s.label}</p> : null}
        {s.title ? <h2 className="cezve-h2">{s.title}</h2> : null}
        {s.text ? <p className="cezve-about__body">{s.text}</p> : null}
      </div>
    </section>
  )
}

/** Карта лотов — лист каппинга: строки лотов слева, колесо вкусов справа. */
function Menu({ section: s, site }: SectionProps<'menu'>) {
  let n = 0
  return (
    <section id={s.anchor || undefined} className="s s-menu cezve-menu">
      <div className="cezve-head" data-cz="rise">
        {s.label ? <p className="cezve-label">{s.label}</p> : null}
        {s.title ? <h2 className="cezve-h2">{s.title}</h2> : null}
      </div>
      <div className="cezve-menu__body">
        <div className="cezve-sheet">
          {s.groups.map((g, gi) => (
            <div key={gi} className="cezve-sheet__group">
              <h3 className="cezve-sheet__name">{g.name}</h3>
              <ul>
                {g.items.map((it, i) => {
                  n += 1
                  const notes = notesOf(`${it.name} ${it.text}`)
                  return (
                    <li key={i} className="cezve-lot" tabIndex={0} data-cz="rise" data-cezve-notes={notes.join(',')} data-cezve-text={it.text || it.name} style={{ ['--i' as string]: i }}>
                      <span className="cezve-lot__n">№ {String(n).padStart(2, '0')}</span>
                      <b className="cezve-lot__name">{it.name}</b>
                      <span className="cezve-lot__price">{it.price}</span>
                      {it.text ? <span className="cezve-lot__notes">{it.text}</span> : null}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        <Wheel lang={site.lang} />
      </div>
    </section>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery cezve-bar-photos">
      <div className="cezve-head" data-cz="rise">
        {s.label ? <p className="cezve-label">{s.label}</p> : null}
        {s.title ? <h2 className="cezve-h2">{s.title}</h2> : null}
      </div>
      <ul className="cezve-strip">
        {s.items.map((it, i) => (
          <li key={i} className="cezve-strip__item" data-cz="lift" style={{ ['--i' as string]: i }}>
            <div className="cezve-strip__img">
              <Media src={it.image} alt={it.caption} seed={`${site.slug}-g${i}`} colors={palette(site)} kind="rings" className="media" />
            </div>
            <p>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {it.caption}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Каппинг — циферблат таймера: стрелка проходит круг вместе с прокруткой шагов. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <section id={s.anchor || undefined} className="s s-process cezve-cupping" data-cezve-cupping>
      <div className="cezve-cupping__dial" aria-hidden="true">
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="92" className="cezve-dial__face" />
          {Array.from({ length: 60 }, (_, i) => (
            <line key={i} x1="100" y1={i % 5 ? 12 : 8} x2="100" y2="18" transform={`rotate(${i * 6} 100 100)`} className={i % 5 ? '' : 'is-major'} />
          ))}
          <circle cx="100" cy="100" r="74" className="cezve-dial__track" pathLength="1" />
          <circle cx="100" cy="100" r="74" className="cezve-dial__fill" pathLength="1" />
          <line x1="100" y1="100" x2="100" y2="30" className="cezve-dial__hand" />
          <circle cx="100" cy="100" r="5" className="cezve-dial__pin" />
        </svg>
      </div>
      <div className="cezve-cupping__text">
        <div className="cezve-head" data-cz="rise">
          {s.label ? <p className="cezve-label">{s.label}</p> : null}
          {s.title ? <h2 className="cezve-h2">{s.title}</h2> : null}
        </div>
        <ol className="cezve-steps">
          {s.items.map((it, i) => (
            <li key={i} data-cz="rise">
              <span className="cezve-steps__n">{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][i] || i + 1}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <section id={s.anchor || undefined} className="s s-testimonials cezve-quotes">
      <div className="cezve-head" data-cz="rise">
        {s.label ? <p className="cezve-label">{s.label}</p> : null}
        {s.title ? <h2 className="cezve-h2">{s.title}</h2> : null}
      </div>
      <div className="cezve-quotes__list">
        {s.items.map((it, i) => (
          <figure key={i} className="cezve-quote" data-cz="rise" style={{ ['--i' as string]: i }}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              {it.author}
              {it.role ? <span> · {it.role}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  return (
    <section id={s.anchor || undefined} className="s s-faq cezve-faq">
      <div className="cezve-head" data-cz="rise">
        {s.label ? <p className="cezve-label">{s.label}</p> : null}
        {s.title ? <h2 className="cezve-h2">{s.title}</h2> : null}
      </div>
      <div className="cezve-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item cezve-faq__item" open={i === 0}>
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
    <section id={s.anchor || undefined} className="s s-contact cezve-contact">
      <div data-cz="rise">
        {s.label ? <p className="cezve-label">{s.label}</p> : null}
        {s.title ? <h2 className="cezve-contact__title">{s.title}</h2> : null}
      </div>
      <div className="cezve-contact__side" data-cz="rise">
        {s.text ? <p>{s.text}</p> : null}
        <div className="cezve-hero__ctas">
          {s.cta.label ? (
            <a className="cezve-btn" href={s.cta.href || (b.phone ? tel(b.phone) : '#')}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="cezve-link" href={tel(b.phone)}>
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
  sections: { hero: Hero, marquee: () => null, about: About, menu: Menu, gallery: Gallery, process: Process, testimonials: Testimonials, faq: Faq, contact: Contact },
}
