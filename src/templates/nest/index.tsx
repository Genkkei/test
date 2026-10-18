import './style.css'
import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Plans, Windows } from './client'

/*
 * КВАРТАЛ — жилой комплекс в духе презентаций Apple и сайтов Brookfield: спокойный серый,
 * золото как акцент, крупные цифры. На первом экране силуэт квартала, окна в котором
 * зажигаются по одному; планировки — чертежи, собранные из данных, с переключателем
 * комнатности; ход строительства — шкалы с процентами; цены — от и до за тип квартиры.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function rng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

/** Квартал: башни разной высоты с сеткой окон. Окна зажигает клиентская часть. */
function Skyline({ seed }: { seed: string }) {
  const r = rng(seed)
  const towers = [
    { x: 20, w: 120, f: 12 },
    { x: 160, w: 150, f: 18 },
    { x: 330, w: 110, f: 9 },
    { x: 460, w: 170, f: 22 },
    { x: 650, w: 120, f: 14 },
  ]
  const H = 520
  return (
    <svg className="nest-sky" viewBox="0 0 800 540" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <line x1="0" y1={H} x2="800" y2={H} className="nest-sky__ground" />
      {towers.map((t, ti) => {
        const fh = 20
        const top = H - t.f * fh - 14
        const cols = Math.round(t.w / 22)
        const cw = (t.w - 16) / cols
        return (
          <g key={ti} className="nest-sky__tower" style={{ ['--t' as string]: ti }}>
            <rect x={t.x} y={top} width={t.w} height={H - top} className="nest-sky__body" />
            <rect x={t.x - 4} y={top - 6} width={t.w + 8} height={8} className="nest-sky__roof" />
            {Array.from({ length: t.f }, (_, f) =>
              Array.from({ length: cols }, (_, c) => (
                <rect
                  key={`${f}-${c}`}
                  x={t.x + 8 + c * cw + 3}
                  y={top + 10 + f * fh + 4}
                  width={cw - 6}
                  height={fh - 9}
                  className={`nest-win${r() > 0.72 ? ' is-on' : ''}`}
                />
              )),
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Чертёж квартиры: делим прямоугольник на комнаты рекурсивно, стены толстые, двери — разрывы. */
export function FloorPlan({ seed, rooms }: { seed: string; rooms: number }) {
  const r = rng(seed)
  const W = 300
  const H = 200
  const cells: { x: number; y: number; w: number; h: number }[] = [{ x: 0, y: 0, w: W, h: H }]
  const target = Math.min(7, rooms + 3)
  while (cells.length < target) {
    cells.sort((a, b) => b.w * b.h - a.w * a.h)
    const c = cells.shift()!
    const vertical = c.w > c.h * 1.1 || (c.w > c.h * 0.8 && r() > 0.5)
    const k = 0.38 + r() * 0.24
    if (vertical) {
      const w1 = Math.round(c.w * k)
      cells.push({ x: c.x, y: c.y, w: w1, h: c.h }, { x: c.x + w1, y: c.y, w: c.w - w1, h: c.h })
    } else {
      const h1 = Math.round(c.h * k)
      cells.push({ x: c.x, y: c.y, w: c.w, h: h1 }, { x: c.x, y: c.y + h1, w: c.w, h: c.h - h1 })
    }
  }
  return (
    <svg className="nest-plan" viewBox="-12 -12 324 224" aria-hidden="true">
      {cells.map((c, i) => (
        <g key={i}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h} className={`nest-plan__room${c.w * c.h > 12000 ? ' is-big' : ''}`} pathLength={1} />
          <rect x={c.x + c.w / 2 - 9} y={c.y + c.h - 3} width={18} height={6} className="nest-plan__door" />
          <text x={c.x + c.w / 2} y={c.y + c.h / 2 + 4} className="nest-plan__area">
            {((c.w * c.h) / 900).toFixed(1).replace('.', ',')}
          </text>
        </g>
      ))}
      <rect x={0} y={0} width={W} height={H} className="nest-plan__outer" pathLength={1} />
      <rect x={W * 0.2} y={-6} width={W * 0.3} height={12} className="nest-plan__window" />
      <rect x={W * 0.62} y={-6} width={W * 0.24} height={12} className="nest-plan__window" />
    </svg>
  )
}

const roomsOf = (s: string, i: number) => {
  const m = s.match(/(\d)/)
  return m ? Number(m[1]) : i + 1
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="nest-header">
        <a href="#top" className="nest-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="nest-logo__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {site.name}
        </a>
        <nav className="nest-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nest-header__side">
          {b.phone ? (
            <a className="nest-phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="nest-btn nest-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="nest-footer">
        <div className="nest-footer__inner">
          <div>
            <p className="nest-footer__name">{site.name}</p>
            <p className="nest-footer__tag">{site.tagline}</p>
          </div>
          <dl className="nest-footer__facts">
            {b.street ? (
              <div>
                <dt>{pick(site.lang, { ru: 'Офис продаж', uz: 'Savdo ofisi', en: 'Sales office' })}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
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
              <dt>{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</dt>
              <dd className="nest-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <p className="nest-footer__note">
          {pick(site.lang, {
            ru: 'Не является публичной офертой. Цены и наличие квартир уточняйте в офисе продаж.',
            uz: 'Ommaviy oferta emas. Narxlar va bo‘sh xonadonlarni savdo ofisidan aniqlang.',
            en: 'This is not a public offer. Please confirm prices and availability with the sales office.',
          })}
        </p>
        <div className="nest-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero nest-hero">
      <div className="nest-hero__inner">
        <div className="nest-hero__copy">
          {s.eyebrow ? <p className="nest-hero__eyebrow nest-in">{s.eyebrow}</p> : null}
          <h1 className="nest-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="nest-hero__sub nest-in" style={{ ['--d' as string]: '.5s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="nest-hero__ctas nest-in" style={{ ['--d' as string]: '.65s' }}>
            {s.cta.label ? (
              <a className="nest-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="nest-btn nest-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        <Windows>
          <Skyline seed={site.slug} />
        </Windows>
      </div>
      {s.words.length ? (
        <ul className="nest-hero__facts">
          {s.words.map((w, i) => (
            <li key={w} className="nest-in" style={{ ['--d' as string]: `${0.9 + i * 0.1}s` }}>
              {w}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

/** Планировки: переключатель по типам квартир, чертёж, площадь и цена. */
function Works({ section: s, site }: SectionProps<'works'>) {
  const items = s.items.map((it, i) => ({
    title: it.title,
    area: it.category,
    price: it.year,
    text: it.text,
    plan: <FloorPlan seed={`${site.slug}-${i}`} rooms={roomsOf(it.title, i)} />,
  }))
  return (
    <Sec id={s.anchor} type="works" className="nest-plans-sec">
      <Head label={s.label} title={s.title} />
      <Plans items={items} label={pick(site.lang, { ru: 'Тип квартиры', uz: 'Xonadon turi', en: 'Apartment type' })} areaLabel={pick(site.lang, { ru: 'Площадь', uz: 'Maydoni', en: 'Area' })} priceLabel={pick(site.lang, { ru: 'Стоимость', uz: 'Narxi', en: 'Price' })} />
    </Sec>
  )
}

/** Ход строительства: процент берётся из заголовка («Каркас — 100%»), шкала растёт при входе. */
function Process({ section: s, site }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="nest-build-sec">
      <Head label={s.label} title={s.title} />
      <ol className="nest-build">
        {s.items.map((it, i) => {
          const m = it.title.match(/(\d{1,3})\s*%/)
          const pct = m ? Math.min(100, Number(m[1])) : 0
          const name = it.title.replace(/\s*[—–-]?\s*\d{1,3}\s*%\s*$/, '')
          return (
            <li key={i} className="nest-stage" data-reveal="up" data-delay={String(i * 0.08)} style={{ ['--pct' as string]: pct / 100 }}>
              <div className="nest-stage__top">
                <h3>{name}</h3>
                <span className="nest-stage__pct">{m ? `${pct}%` : ''}</span>
              </div>
              <div className="nest-stage__bar" aria-hidden="true">
                <span />
              </div>
              <p>
                {pct >= 100 ? <b>{pick(site.lang, { ru: 'Готово', uz: 'Tayyor', en: 'Done' })} · </b> : null}
                {it.text}
              </p>
            </li>
          )
        })}
      </ol>
    </Sec>
  )
}

function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="nest-price-sec">
      <Head label={s.label} title={s.title} />
      <div className="nest-prices">
        {s.items.map((it, i) => (
          <article key={i} className={`nest-price${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            <div className="nest-price__plan">
              <FloorPlan seed={`${site.slug}-p${i}`} rooms={roomsOf(it.name, i)} />
            </div>
            <h3>{it.name}</h3>
            <p className="nest-price__value">
              {it.price}
              {it.period ? <small> {it.period}</small> : null}
            </p>
            <ul>
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

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats nest-stats-sec">
      <div className="s__inner">
        <Head label={s.label} title={s.title} />
        <dl className="nest-stats">
          {s.items.map((it, i) => (
            <div key={i} className="nest-stat" data-reveal="up" data-delay={String(i * 0.08)}>
              <dt>{it.label}</dt>
              <dd>
                <span data-count>{it.value}</span>
                {it.suffix ? <small>{it.suffix}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, works: Works, process: Process, pricing: Pricing, stats: Stats },
}
