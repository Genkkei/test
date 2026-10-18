import './style.css'
import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Calculator, type CalcType } from './client'

/*
 * ЗАКЛЁПКА — металлоконструкции и навесы, подача инженерного бюро: тёмная синька с сеткой,
 * ферма первого экрана прорисовывается по стержням с размерными линиями, тарифы — живой
 * калькулятор «ширина × длина × цена за м²», этапы — диаграмма Ганта, работы — чертежи.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Ферма навеса: пояса, раскосы, стойки. Вариант по номеру — односкатный, двускатный, арочный. */
function Truss({ n = 0, w = 600, className = '', reveal = true }: { n?: number; w?: number; className?: string; reveal?: boolean }) {
  const k = n % 3
  const h = 300
  const top = (x: number) => (k === 0 ? 70 + (x / w) * 50 : k === 1 ? 60 + Math.abs(x - w / 2) * (60 / (w / 2)) : 140 - Math.sin((Math.PI * x) / w) * 90)
  const panels = 10
  const bars: string[] = []
  const chord: string[] = []
  const lower: string[] = []
  for (let i = 0; i <= panels; i++) {
    const x = (w / panels) * i
    chord.push(`${i ? 'L' : 'M'}${x} ${top(x)}`)
    lower.push(`${i ? 'L' : 'M'}${x} ${top(x) + 34}`)
    bars.push(`M${x} ${top(x)} V${top(x) + 34}`)
    if (i < panels) {
      const x2 = (w / panels) * (i + 1)
      bars.push(i % 2 ? `M${x} ${top(x)} L${x2} ${top(x2) + 34}` : `M${x} ${top(x) + 34} L${x2} ${top(x2)}`)
    }
  }
  const cols = [0, w / 2, w].filter((_, i) => k === 1 || i !== 1)
  return (
    <svg className={`rivet-draw ${className}`} viewBox={`-40 0 ${w + 80} ${h + 40}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" {...(reveal ? { 'data-reveal': 'fade' } : {})}>
      <path pathLength={1} className="rivet-chord" d={chord.join(' ')} />
      <path pathLength={1} className="rivet-chord" d={lower.join(' ')} />
      <path pathLength={1} className="rivet-web" d={bars.join(' ')} />
      {cols.map((x) => (
        <g key={x}>
          <path pathLength={1} className="rivet-col" d={`M${x} ${top(x) + 34} V${h}`} />
          <path pathLength={1} className="rivet-base" d={`M${x - 16} ${h} H${x + 16}`} />
        </g>
      ))}
      <path pathLength={1} className="rivet-ground" d={`M-30 ${h} H${w + 30}`} />
      <g className="rivet-dim">
        <path d={`M0 ${h + 22} H${w} M0 ${h + 14} V${h + 30} M${w} ${h + 14} V${h + 30}`} />
        <text x={w / 2} y={h + 18}>{(w / 100).toFixed(1)} m</text>
        <path d={`M${w + 22} ${top(w) + 34} V${h} M${w + 14} ${top(w) + 34} H${w + 30} M${w + 14} ${h} H${w + 30}`} />
        <text x={w + 34} y={(top(w) + 34 + h) / 2}>{((h - top(w) - 34) / 60).toFixed(1)} m</text>
      </g>
      {cols.map((x) => (
        <circle key={`n${x}`} cx={x} cy={top(x) + 34} r={4} className="rivet-node" />
      ))}
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="rivet-header">
        <a href="#top" className="rivet-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <svg viewBox="0 0 36 28" aria-hidden="true">
            <path d="M2 24 L18 4 L34 24 Z M10 24 L18 14 L26 24 M18 4 V24" />
          </svg>
          <span>{site.name}</span>
        </a>
        <nav className="rivet-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="rivet-header__side">
          {b.phone ? (
            <a className="rivet-header__tel" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="rivet-btn rivet-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="rivet-footer">
        <div className="rivet-footer__stamp">
          <table>
            <tbody>
              <tr>
                <th>{pick(site.lang, { ru: 'Организация', uz: 'Tashkilot', en: 'Company' })}</th>
                <td colSpan={3}>{b.legalName || site.name}</td>
              </tr>
              <tr>
                <th>{ui(site.lang, 'address')}</th>
                <td colSpan={3}>{[b.street, b.city].filter(Boolean).join(', ')}</td>
              </tr>
              <tr>
                <th>{ui(site.lang, 'phone')}</th>
                <td>{b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : '—'}</td>
                <th>{ui(site.lang, 'hours')}</th>
                <td>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</td>
              </tr>
              <tr>
                <th>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</th>
                <td colSpan={3}>
                  {b.socials.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                      {s.name}
                    </a>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="rivet-footer__name">{site.name}</p>
        </div>
        <div className="rivet-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Лист 1 из 1 · масштаб 1:100', uz: 'Varaq 1 / 1 · masshtab 1:100', en: 'Sheet 1 of 1 · scale 1:100' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero rivet-hero">
      <div className="rivet-hero__inner">
        <div className="rivet-hero__text">
          {s.eyebrow ? (
            <p className="rivet-hero__eyebrow" data-reveal="fade">
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="rivet-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="rivet-hero__sub" data-reveal="up" data-delay="0.3">
              {s.subtitle}
            </p>
          ) : null}
          <div className="rivet-hero__ctas" data-reveal="up" data-delay="0.45">
            {s.cta.label ? (
              <a className="rivet-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="rivet-btn rivet-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        <div className="rivet-hero__draw">
          <Truss n={1} />
          {s.words.length ? (
            <ul className="rivet-hero__specs" data-reveal="fade" data-delay="1.2">
              {s.words.map((w, i) => (
                <li key={w}>
                  <span>{String.fromCharCode(65 + i)}</span>
                  {w}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Конструкции: карточки-чертежи с маркой «КМ-01», ценой и сроком. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="rivet-types-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="rivet-types">
        {s.items.map((it, i) => (
          <li key={i} className="rivet-type" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <span className="rivet-type__mark">KM-{String(i + 1).padStart(2, '0')}</span>
            <Truss n={i} w={420} className="rivet-type__draw" />
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
            <div className="rivet-type__foot">
              {it.price ? <b>{it.price}</b> : null}
              {it.tag ? <span>{it.tag}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Тарифы как калькулятор: цена за м² из тарифов сайта, площадь задаёт посетитель. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  const types: CalcType[] = s.items
    .map((it) => ({ name: it.name, rate: Number(it.price.replace(/[^\d]/g, '')) || 0, unit: it.period, features: it.features }))
    .filter((t) => t.rate > 0)
  return (
    <Sec id={s.anchor} type="pricing" className="rivet-calc-sec">
      <Head label={s.label} title={s.title} />
      <Calculator types={types} lang={site.lang} cta={site.nav.cta} />
    </Sec>
  )
}

/** Этапы — диаграмма Ганта: полоса каждого шага начинается там, где кончилась предыдущая. */
function Process({ section: s, site }: SectionProps<'process'>) {
  const n = s.items.length || 1
  return (
    <Sec id={s.anchor} type="process" className="rivet-gantt-sec">
      <Head label={s.label} title={s.title} />
      <div className="rivet-gantt" style={{ ['--n' as string]: n }}>
        <div className="rivet-gantt__weeks" aria-hidden="true">
          {Array.from({ length: n }, (_, i) => (
            <span key={i}>
              {pick(site.lang, { ru: 'Нед.', uz: 'Hafta', en: 'Wk' })} {i + 1}
            </span>
          ))}
        </div>
        <ol>
          {s.items.map((it, i) => (
            <li key={i} style={{ ['--i' as string]: i }}>
              <div className="rivet-gantt__label">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </div>
              <div className="rivet-gantt__track">
                <i className="rivet-gantt__bar" data-reveal="left" data-delay={String(0.1 + i * 0.12)} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  )
}

/** Работы — листы чертежей: рамка, штамп, схема конструкции или фото. */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="rivet-sheets-sec">
      <Head label={s.label} title={s.title} />
      <div className="rivet-sheets">
        {s.items.map((it, i) => {
          const body = (
            <>
              <figure className="rivet-sheet__media">
                {it.image ? <img src={it.image} alt={it.title} loading="lazy" decoding="async" /> : <Truss n={i + 1} w={500} />}
              </figure>
              <div className="rivet-sheet__stamp">
                <span>{[it.category, it.year].filter(Boolean).join(' · ')}</span>
                <h3>{it.title}</h3>
                {it.text ? <p>{it.text}</p> : null}
              </div>
            </>
          )
          return it.href ? (
            <a key={i} className="rivet-sheet" href={it.href} data-cursor={ui(site.lang, 'open')} data-reveal="up">
              {body}
            </a>
          ) : (
            <article key={i} className="rivet-sheet" data-reveal="up" data-delay={String((i % 2) * 0.1)}>
              {body}
            </article>
          )
        })}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, pricing: Pricing, process: Process, works: Works },
}
