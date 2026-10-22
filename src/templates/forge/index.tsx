import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Seam } from './client'

/*
 * ГОРН — кузнечный цех металлоконструкций в духе индустриальных плакатов (Caterpillar,
 * Carhartt WIP): чёрный и сигнальный жёлтый, тяжёлая плакатная гарнитура, болты по углам.
 * Слова первого экрана въезжают двутавровыми балками, каталог — спецификация с ценой и
 * сроком, работы — техкарты, этапы соединены сварным швом, который проваривается при прокрутке.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Bolt({ className }: { className: string }) {
  return <i className={`forge-bolt ${className}`} aria-hidden="true" />
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="forge-header">
        <a href="#top" className="forge-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="forge-logo__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M2 4h20v4h-8v12h-4V8H2z" />
            </svg>
          </span>
          <span>{site.name}</span>
        </a>
        <nav className="forge-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="forge-header__side">
          {b.phone ? (
            <a className="forge-phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="forge-btn forge-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="forge-footer">
        <div className="forge-hazard" aria-hidden="true" />
        <div className="forge-footer__inner">
          <p className="forge-footer__name">{site.name}</p>
          <div className="forge-footer__cols">
            <p className="forge-footer__tag">{site.tagline}</p>
            <dl>
              {b.street ? (
                <div>
                  <dt>{ui(site.lang, 'address')}</dt>
                  <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
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
              {b.hours.length ? (
                <div>
                  <dt>{ui(site.lang, 'hours')}</dt>
                  <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
                </div>
              ) : null}
            </dl>
            <ul>
              {b.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener me">
                    {s.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="forge-footer__bottom">
            <span>
              © {new Date().getFullYear()} {b.legalName || site.name}
            </span>
            <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
          </div>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero forge-hero">
      <div className="forge-hero__grid" aria-hidden="true" />
      <Bolt className="forge-bolt--tl" />
      <Bolt className="forge-bolt--tr" />
      <div className="forge-hero__inner">
        {s.eyebrow ? (
          <p className="forge-hero__eyebrow forge-in" style={{ ['--d' as string]: '.1s' }}>
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="forge-hero__title" data-split="words">
          {s.title || site.name}
        </h1>
        {s.words.length ? (
          <ul className="forge-beams" aria-label={pick(site.lang, { ru: 'Что делаем', uz: 'Nima qilamiz', en: 'What we build' })}>
            {s.words.map((w, i) => (
              <li key={i} className={`forge-beam forge-beam--${i % 2 ? 'r' : 'l'}`} style={{ ['--i' as string]: i }}>
                <span>{w}</span>
                <i aria-hidden="true">
                  {pick(site.lang, { ru: 'Поз.', uz: 'Poz.', en: 'Pos.' })} {String(i + 1).padStart(2, '0')}
                </i>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="forge-hero__foot">
          {s.subtitle ? (
            <p className="forge-hero__sub forge-in" style={{ ['--d' as string]: '.9s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="forge-hero__ctas forge-in" style={{ ['--d' as string]: '1s' }}>
            {s.cta.label ? (
              <a className="forge-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="forge-btn forge-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="forge-hazard forge-hazard--hero" aria-hidden="true" />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee forge-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={34} sep="■" />
    </section>
  )
}

/** Каталог — спецификация: позиция, изделие, срок, цена. Строка подсвечивается сигнальным жёлтым. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="forge-spec-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="forge-spec" role="table" aria-label={s.title}>
        <div className="forge-spec__head" role="row">
          <span role="columnheader">{pick(site.lang, { ru: 'Поз.', uz: 'Poz.', en: 'Pos.' })}</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Изделие', uz: 'Buyum', en: 'Item' })}</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Срок', uz: 'Muddat', en: 'Lead time' })}</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Цена', uz: 'Narx', en: 'Price' })}</span>
        </div>
        {s.items.map((it, i) => (
          <div key={i} className="forge-spec__row" role="row" data-reveal="up" data-delay={String(i * 0.05)}>
            <span className="forge-spec__no" role="cell">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="forge-spec__item" role="cell">
              <b>{it.title}</b>
              {it.text ? <small>{it.text}</small> : null}
            </span>
            <span className="forge-spec__time" role="cell">
              {it.tag || '—'}
            </span>
            <span className="forge-spec__price" role="cell">
              {it.price || '—'}
            </span>
          </div>
        ))}
      </div>
    </Sec>
  )
}

/** Работы — техкарты: фото, крупное название, таблица параметров. */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="forge-cards-sec">
      <Head label={s.label} title={s.title} />
      <div className="forge-cards">
        {s.items.map((it, i) => (
          <article key={i} className="forge-card" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <div className="forge-card__top">
              <span>{pick(site.lang, { ru: 'Техкарта', uz: 'Texkarta', en: 'Spec sheet' })}</span>
              <span>№ {String(i + 1).padStart(3, '0')}</span>
            </div>
            <figure className="forge-card__media">
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
            </figure>
            <h3>{it.title}</h3>
            <dl>
              {it.category ? (
                <div>
                  <dt>{pick(site.lang, { ru: 'Объект', uz: 'Obyekt', en: 'Site' })}</dt>
                  <dd>{it.category}</dd>
                </div>
              ) : null}
              {it.year ? (
                <div>
                  <dt>{pick(site.lang, { ru: 'Год', uz: 'Yil', en: 'Year' })}</dt>
                  <dd>{it.year}</dd>
                </div>
              ) : null}
            </dl>
            {it.text ? <p>{it.text}</p> : null}
          </article>
        ))}
      </div>
    </Sec>
  )
}

/** Этапы — сварной шов по левому краю, проваривается при прокрутке; на голове шва — искра. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="forge-seam-sec">
      <Head label={s.label} title={s.title} />
      <Seam className="forge-seam">
        <span className="forge-seam__line" aria-hidden="true">
          <i />
        </span>
        <ol>
          {s.items.map((it, i) => (
            <li key={i} data-reveal="up">
              <span className="forge-seam__no">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Seam>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section id={s.anchor || undefined} className="s s-stats forge-stats">
      <div className="s__inner">
        {s.label ? <p className="forge-stats__label">{s.label}</p> : null}
        <dl>
          {s.items.map((it, i) => (
            <div key={i} data-reveal="up" data-delay={String(i * 0.07)}>
              <dd>
                <span data-count>{it.value}</span>
                {it.suffix ? <small>{it.suffix}</small> : null}
              </dd>
              <dt>{it.label}</dt>
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
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, works: Works, process: Process, stats: Stats },
}
