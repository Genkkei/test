import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Clock, Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { DotMatrix } from './client'

/*
 * ПИКСЕЛЬ — магазин электроники в духе Nothing, Teenage Engineering и Apple Store:
 * заголовок точечной матрицей, товары карточками-спецификациями, сервис логом терминала,
 * цифры на светодиодном табло. Один красный цвет-сигнал на сером алюминии.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const no = (i: number) => String(i + 1).padStart(3, '0')

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="pixel-header">
        <a href="#top" className="pixel-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <i aria-hidden="true" />
          {site.name}
        </a>
        <nav className="pixel-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="pixel-header__side">
          <span className="pixel-clock" aria-label={pick(site.lang, { ru: 'Время в Ташкенте', uz: 'Toshkent vaqti', en: 'Tashkent time' })}>
            TAS <Clock lang={site.lang} />
          </span>
          {site.nav.cta.label ? (
            <a className="pixel-btn pixel-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="pixel-footer">
        <div className="pixel-footer__grid">
          <div className="pixel-footer__cell pixel-footer__cell--lead">
            <span className="pixel-tag">{pick(site.lang, { ru: 'Магазин', uz: 'Do‘kon', en: 'Store' })}</span>
            <p>{site.tagline}</p>
          </div>
          {b.street ? (
            <div className="pixel-footer__cell">
              <span className="pixel-tag">{ui(site.lang, 'address')}</span>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            </div>
          ) : null}
          {b.hours.length ? (
            <div className="pixel-footer__cell">
              <span className="pixel-tag">{ui(site.lang, 'hours')}</span>
              <p>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</p>
            </div>
          ) : null}
          <div className="pixel-footer__cell">
            <span className="pixel-tag">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</span>
            <p>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              ))}
            </p>
          </div>
        </div>
        <p className="pixel-footer__word" aria-hidden="true">
          {site.name}
          <i />
        </p>
        <div className="pixel-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Официальная гарантия на всю технику', uz: 'Barcha texnikaga rasmiy kafolat', en: 'Official warranty on every device' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero pixel-hero">
      <div className="pixel-hero__inner">
        <div className="pixel-hero__bar" data-reveal="fade">
          {s.eyebrow ? <span>{s.eyebrow}</span> : null}
          <span className="pixel-rec" aria-hidden="true">
            <i /> LIVE
          </span>
        </div>
        <DotMatrix text={s.title || site.name} color={t.fg} accent={t.accent} />
        <div className="pixel-hero__foot">
          {s.subtitle ? (
            <p className="pixel-hero__sub" data-reveal="up" data-delay="0.3">
              {s.subtitle}
            </p>
          ) : null}
          {s.words.length ? (
            <ul className="pixel-hero__specs" data-reveal="up" data-delay="0.45">
              {s.words.map((w, i) => (
                <li key={i}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {w}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="pixel-hero__ctas" data-reveal="up" data-delay="0.6">
            {s.cta.label ? (
              <a className="pixel-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
                <i aria-hidden="true">→</i>
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="pixel-btn pixel-btn--ghost" href={s.ctaSecondary.href || '#'}>
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
    <section className="s s-marquee pixel-led" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={40} sep="●" />
    </section>
  )
}

/** Товары — карточки-спецификации: номер, характеристики строками, цена моноширинным. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="pixel-spec-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="pixel-specs">
        {s.items.map((it, i) => (
          <li key={i} className="pixel-card" data-reveal="up" data-delay={String((i % 3) * 0.07)}>
            <div className="pixel-card__top">
              <span>{no(i)}</span>
              {it.tag ? <span className="pixel-card__tag">{it.tag}</span> : null}
            </div>
            <figure className="pixel-card__media">
              <Media src="" alt={it.title} seed={`${site.slug}-p${i}`} colors={palette(site)} kind="grid" className="media" />
            </figure>
            <h3 className="pixel-card__name">{it.title}</h3>
            <ul className="pixel-card__rows">
              {it.text.split(' · ').map((row, j) => (
                <li key={j}>
                  <span aria-hidden="true">{String(j + 1).padStart(2, '0')}</span>
                  {row}
                </li>
              ))}
            </ul>
            {it.price ? <p className="pixel-card__price">{it.price}</p> : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Сервис — лог терминала: строки печатаются по очереди, в конце мигает курсор. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="pixel-log-sec">
      <Head label={s.label} title={s.title} />
      <div className="pixel-term" data-reveal="up">
        <div className="pixel-term__bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>service.log</span>
        </div>
        <ol className="pixel-term__lines">
          {s.items.map((it, i) => (
            <li key={i} style={{ ['--pixel-d' as string]: `${0.25 + i * 0.35}s` }}>
              <span className="pixel-term__ts">[{String(i * 15).padStart(2, '0')}:00]</span>
              <b>{it.title}</b>
              <span className="pixel-term__msg">{it.text}</span>
              <span className="pixel-term__ok">OK</span>
            </li>
          ))}
          <li className="pixel-term__caret" aria-hidden="true">
            &gt; <i />
          </li>
        </ol>
      </div>
    </Sec>
  )
}

/** Цифры — светодиодное табло: точечный фон, красные цифры. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="pixel-board-sec">
      {s.title ? <Head label={s.label} title={s.title} /> : null}
      <dl className="pixel-board">
        {s.items.map((it, i) => (
          <div key={i} className="pixel-board__cell" data-reveal="up" data-delay={String(i * 0.08)}>
            <dd>
              <span data-count>{it.value}</span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, process: Process, stats: Stats },
}
