import './style.css'
import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Catalog, Panel } from './client'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <div className="lb-guides" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <header className="lb-header">
        <a href="#top" className="lb-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="lb-logo__dot" aria-hidden="true" />
          {site.name}
        </a>
        <nav className="lb-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        {site.nav.cta.label ? (
          <a className="lb-btn lb-btn--sm" href={site.nav.cta.href || '#'}>
            {site.nav.cta.label}
          </a>
        ) : null}
        <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
      </header>
      <main id="top">{children}</main>
      <footer className="lb-footer">
        <div className="lb-footer__top">
          <p className="lb-footer__lead">{site.tagline}</p>
          {site.nav.cta.label ? (
            <a className="lb-btn" href={site.nav.cta.href || '#'}>
              {site.nav.cta.label}
            </a>
          ) : null}
        </div>
        <dl className="lb-footer__grid">
          <div>
            <dt>{ui(site.lang, 'address')}</dt>
            <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
          </div>
          <div>
            <dt>{ui(site.lang, 'hours')}</dt>
            {b.hours.map((h) => (
              <dd key={h}>{humanHours(h, site.lang)}</dd>
            ))}
          </div>
          <div>
            <dt>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</dt>
            {b.phone ? (
              <dd>
                <a href={tel(b.phone)}>{b.phone}</a>
              </dd>
            ) : null}
            {b.email ? (
              <dd>
                <a href={`mailto:${b.email}`}>{b.email}</a>
              </dd>
            ) : null}
          </div>
          <div>
            <dt>{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</dt>
            {b.socials.map((s) => (
              <dd key={s.url}>
                <a href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              </dd>
            ))}
          </div>
        </dl>
        <p className="lb-footer__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Есть противопоказания. Проконсультируйтесь с врачом.', uz: 'Qarshi ko‘rsatmalar bor. Shifokor bilan maslahatlashing.', en: 'Contraindications apply. Consult a doctor.' })}</span>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const L = site.lang
  // положение точки в диапазоне — от длины названия: стабильно между сборками и языками
  const markers = s.words.map((w) => ({ name: w, v: 0.3 + ((w.length * 37) % 40) / 100 }))
  return (
    <section id={s.anchor || undefined} className="s s-hero lb-hero">
      <div className="lb-hero__text">
        {s.eyebrow ? (
          <p className="lb-hero__eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="lb-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="lb-hero__sub" data-reveal="up" data-delay="0.4">
            {s.subtitle}
          </p>
        ) : null}
        <div className="lb-hero__ctas" data-reveal="up" data-delay="0.55">
          {s.cta.label ? (
            <a className="lb-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="lb-btn lb-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      {markers.length ? (
        <div className="lb-hero__panel" data-reveal="up" data-delay="0.3">
          <Panel
            markers={markers}
            title={pick(L, { ru: 'Ваши показатели', uz: 'Sizning ko‘rsatkichlaringiz', en: 'Your biomarkers' })}
            ok={pick(L, { ru: 'в норме', uz: 'me’yorda', en: 'in range' })}
            live={pick(L, { ru: 'пример отчёта', uz: 'hisobot namunasi', en: 'sample report' })}
          />
        </div>
      ) : null}
    </section>
  )
}

/** Каталог анализов: раздел в tag, срок готовности и цена — строкой таблицы. */
function Tests({ section: s, site }: SectionProps<'services'>) {
  const groups = Array.from(new Set(s.items.map((it) => it.tag).filter(Boolean)))
  return (
    <Sec id={s.anchor} type="services" className="lb-tests">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <Catalog all={pick(site.lang, { ru: 'Все', uz: 'Barchasi', en: 'All' })} groups={groups}>
        <ul className="lb-table">
          {s.items.map((it, i) => (
            <li key={i} className="lb-row" data-group={it.tag} data-reveal="up" data-delay={String((i % 6) * 0.04)}>
              <span className="lb-row__code">{String(i + 1).padStart(3, '0')}</span>
              <div className="lb-row__main">
                <h3>{it.title}</h3>
                {it.text ? <p>{it.text}</p> : null}
              </div>
              {it.tag ? <span className="lb-row__tag">{it.tag}</span> : null}
              <span className="lb-row__price">{it.price}</span>
            </li>
          ))}
        </ul>
      </Catalog>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="lb-stats">
      <Head label={s.label} title={s.title} />
      <dl className="lb-stats__grid">
        {s.items.map((it, i) => (
          <div key={i} className="lb-stat" data-reveal="up" data-delay={String(i * 0.08)}>
            <dt>{it.label}</dt>
            <dd>
              <span data-count>{it.value}</span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </dd>
            <span className="lb-stat__bar" aria-hidden="true" />
          </div>
        ))}
      </dl>
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="lb-steps">
      <Head label={s.label} title={s.title} />
      <ol className="lb-steps__list">
        {s.items.map((it, i) => (
          <li key={i} className="lb-step" data-reveal="up" data-delay={String(i * 0.1)} style={{ ['--i' as string]: i }}>
            <span className="lb-step__n">{String(i + 1).padStart(2, '0')}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Чекапы: карточки с числом показателей крупно, рекомендованный — тёмный. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="lb-plans">
      <Head label={s.label} title={s.title} />
      <div className="lb-plans__grid">
        {s.items.map((it, i) => (
          <article key={i} className={`lb-plan${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            <header>
              <h3>{it.name}</h3>
              {it.featured ? <span>{pick(site.lang, { ru: 'Рекомендуем', uz: 'Tavsiya etamiz', en: 'Recommended' })}</span> : null}
            </header>
            <p className="lb-plan__price">{it.price}</p>
            <p className="lb-plan__period">{it.period}</p>
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

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Tests, stats: Stats, process: Process, pricing: Pricing },
}
