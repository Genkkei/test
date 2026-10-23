import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Frame, SHAPES } from './frames'
import { TryOn } from './client'

/*
 * ОПТИКА — салон очков в духе Warby Parker, Ace & Tate и Gentle Monster: примерочная оправ на
 * первом экране, каталог с силуэтами оправ, проверка зрения строками таблицы Сивцева, рецепт
 * линз вместо сухих цифр.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Glyph() {
  return (
    <svg viewBox="-20 -10 440 180" className="optic-glyph" aria-hidden="true">
      <Frame shape="round" lens={false} />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="optic-header">
        <a href="#top" className="optic-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <Glyph />
          <span>{site.name}</span>
            </>
          )}
        </a>
        <nav className="optic-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="optic-header__side">
          {b.phone ? (
            <a className="optic-header__tel" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="optic-btn optic-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="optic-footer">
        <div className="optic-footer__top">
          <p className="optic-footer__lead">{site.tagline}</p>
          <dl className="optic-footer__facts">
            {b.street ? (
              <div>
                <dt>{ui(site.lang, 'address')}</dt>
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
              <dd className="optic-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name} ↗
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div className="optic-footer__word" aria-hidden="true">
          <span>{site.name}</span>
          <Glyph />
        </div>
        <div className="optic-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Есть противопоказания, нужна консультация специалиста', uz: 'Qarshi ko‘rsatmalar bor, mutaxassis maslahati zarur', en: 'Contraindications apply; consult a specialist' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const shapes = [
    pick(site.lang, { ru: 'Круглые', uz: 'Dumaloq', en: 'Round' }),
    pick(site.lang, { ru: 'Квадратные', uz: 'To‘rtburchak', en: 'Square' }),
    pick(site.lang, { ru: 'Кошачий глаз', uz: 'Mushuk ko‘zi', en: 'Cat-eye' }),
    pick(site.lang, { ru: 'Авиаторы', uz: 'Aviator', en: 'Aviator' }),
  ]
  const colors = [
    { name: pick(site.lang, { ru: 'Чёрный', uz: 'Qora', en: 'Black' }), value: '#13213c' },
    { name: pick(site.lang, { ru: 'Черепаховый', uz: 'Toshbaqa', en: 'Tortoiseshell' }), value: '#8a4b26' },
    { name: pick(site.lang, { ru: 'Синий', uz: 'Ko‘k', en: 'Blue' }), value: site.theme.accent },
    { name: pick(site.lang, { ru: 'Золото', uz: 'Oltin', en: 'Gold' }), value: '#c79a3c' },
  ]
  return (
    <section id={s.anchor || undefined} className="s s-hero optic-hero">
      <div className="optic-hero__grid">
        <div className="optic-hero__copy">
          {s.eyebrow ? (
            <p className="optic-hero__eyebrow" data-reveal="fade">
              <i aria-hidden="true" />
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="optic-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="optic-hero__sub" data-reveal="up" data-delay="0.4">
              {s.subtitle}
            </p>
          ) : null}
          <div className="optic-hero__ctas" data-reveal="up" data-delay="0.55">
            {s.cta.label ? (
              <a className="optic-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="optic-btn optic-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          {s.words.length ? (
            <ul className="optic-hero__facts" data-reveal="up" data-delay="0.7">
              {s.words.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="optic-hero__stage" data-reveal="scale" data-delay="0.2">
          <p className="optic-hero__hint">{pick(site.lang, { ru: 'Примерьте оправу', uz: 'Gardishni sinab ko‘ring', en: 'Try a frame on' })}</p>
          <TryOn shapes={shapes} colors={colors} label={pick(site.lang, { ru: 'Форма оправы', uz: 'Gardish shakli', en: 'Frame shape' })} />
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee optic-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={44} sep="◎" />
    </section>
  )
}

/** Каталог: у каждой позиции — силуэт своей оправы, форма меняется по кругу. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="optic-cat-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="optic-cat">
        {s.items.map((it, i) => (
          <li key={i} className="optic-item" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <div className="optic-item__stage">
              <svg viewBox="-20 -10 440 180" aria-hidden="true">
                <Frame shape={SHAPES[i % SHAPES.length]} className="optic-item__frame" />
              </svg>
              {it.tag ? <span className="optic-item__tag">{it.tag}</span> : null}
            </div>
            <div className="optic-item__body">
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            {it.price ? (
              <p className="optic-item__price">
                <small>{pick(site.lang, { ru: 'от', uz: 'dan', en: 'from' })}</small> {it.price}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

const CHART: Record<string, string[]> = {
  ru: ['Ш Б', 'М Н К', 'Ы М Б Ш', 'Б Ы Н К М', 'И Н Ш М К', 'Н К И Б М Ш'],
  latin: ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D', 'E D F C Z P'],
}

/** Проверка зрения: каждый шаг — строка таблицы, буквы мельчают от шага к шагу. */
function Process({ section: s, site }: SectionProps<'process'>) {
  const rows = site.lang === 'ru' ? CHART.ru : CHART.latin
  return (
    <Sec id={s.anchor} type="process" className="optic-chart-sec">
      <Head label={s.label} title={s.title} />
      <ol className="optic-chart">
        {s.items.map((it, i) => (
          <li key={i} className="optic-row" data-reveal="up" data-delay={String(i * 0.07)} style={{ ['--optic-size' as string]: `${Math.max(18, 74 - i * 11)}px` }}>
            <span className="optic-row__letters" aria-hidden="true">
              {rows[i % rows.length]}
            </span>
            <span className="optic-row__no">{String(i + 1).padStart(2, '0')}</span>
            <div className="optic-row__text">
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Цифры — бланк рецепта: таблица с подписями, как у офтальмолога. */
function Stats({ section: s, site }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="optic-rx-sec">
      <div className="optic-rx" data-reveal="up">
        <div className="optic-rx__head">
          <span>Rx</span>
          <span>{s.title || site.name}</span>
          <span>{site.name}</span>
        </div>
        <dl className="optic-rx__grid">
          {s.items.map((it, i) => (
            <div key={i} className="optic-rx__cell">
              <dt>{it.label}</dt>
              <dd>
                <span data-count>{it.value}</span>
                {it.suffix ? <small>{it.suffix}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
        <p className="optic-rx__sign" aria-hidden="true">
          {pick(site.lang, { ru: 'подпись врача', uz: 'shifokor imzosi', en: 'optometrist’s signature' })}
        </p>
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, process: Process, stats: Stats },
}
