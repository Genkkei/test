import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { NowPlaying, Record } from './client'

/*
 * ВИНИЛ — музыкальная школа в духе Rough Trade, Spotify и Berklee: тёмная сливовая комната, огромная
 * пластинка на первом экране крутится и разгоняется от прокрутки, инструменты — треки плейлиста
 * с эквалайзером, педагоги — обложки альбомов.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="vinyl-header">
        <a href="#top" className="vinyl-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="vinyl-logo__disc" aria-hidden="true" />
          {site.name}
        </a>
        <nav className="vinyl-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="vinyl-header__side">
          {site.nav.cta.label ? (
            <a className="vinyl-btn vinyl-btn--sm" href={site.nav.cta.href}>
              ▶ {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="vinyl-footer">
        <Marquee items={[site.name, site.tagline || site.niche]} className="marquee vinyl-footer__run" speed={30} sep="●" />
        <div className="vinyl-footer__grid">
          <div>
            <p className="vinyl-k">{ui(site.lang, 'address')}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
          </div>
          {b.hours.length ? (
            <div>
              <p className="vinyl-k">{ui(site.lang, 'hours')}</p>
              {b.hours.map((h) => (
                <p key={h}>{humanHours(h, site.lang)}</p>
              ))}
            </div>
          ) : null}
          <div>
            <p className="vinyl-k">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="vinyl-k">{pick(site.lang, { ru: 'Слушайте нас', uz: 'Bizni tinglang', en: 'Listen in' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>
        <p className="vinyl-footer__legal">
          <span>
            ℗ © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero vinyl-hero">
      <div className="vinyl-hero__copy">
        {s.eyebrow ? (
          <p className="vinyl-eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="vinyl-hero__title" data-split="words">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="vinyl-hero__sub" data-reveal="up" data-delay="0.4">
            {s.subtitle}
          </p>
        ) : null}
        <div className="vinyl-hero__ctas" data-reveal="up" data-delay="0.55">
          {s.cta.label ? (
            <a className="vinyl-btn" href={s.cta.href || '#'} data-magnetic>
              ▶ {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="vinyl-btn vinyl-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {s.words.length ? <NowPlaying words={s.words} label={pick(site.lang, { ru: 'Сейчас играет', uz: 'Hozir yangramoqda', en: 'Now playing' })} /> : null}
      </div>
      <div className="vinyl-deck" data-reveal="scale" data-delay="0.2" aria-hidden="true">
        <Record>
          <div className="vinyl-disc">
            <div className="vinyl-label">
              <b>{site.name}</b>
              <span>33⅓ RPM · A</span>
            </div>
          </div>
        </Record>
        <svg className="vinyl-arm" viewBox="0 0 120 300">
          <circle cx="90" cy="26" r="18" />
          <path d="M90 26 L96 210 L70 262" />
          <rect x="54" y="254" width="26" height="36" rx="4" transform="rotate(28 67 272)" />
        </svg>
      </div>
    </section>
  )
}

/** Инструменты — треклист: номер сменяется эквалайзером при наведении, длительность и цена справа. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="vinyl-list-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="vinyl-playlist" data-reveal="up">
        <div className="vinyl-playlist__head" aria-hidden="true">
          <span>#</span>
          <span>{pick(site.lang, { ru: 'Название', uz: 'Nomi', en: 'Title' })}</span>
          <span>◷</span>
          <span>{pick(site.lang, { ru: 'Урок', uz: 'Dars', en: 'Lesson' })}</span>
        </div>
        <ol>
          {s.items.map((it, i) => (
            <li key={i} className="vinyl-track">
              <span className="vinyl-track__n">
                <em>{i + 1}</em>
                <span className="vinyl-eq vinyl-eq--sm" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </span>
              <span className="vinyl-track__cover" aria-hidden="true" style={{ ['--h' as string]: `${(i * 47) % 360}deg` }} />
              <span className="vinyl-track__main">
                <b>{it.title}</b>
                {it.text ? <small>{it.text}</small> : null}
              </span>
              <span className="vinyl-track__time">{it.tag}</span>
              <span className="vinyl-track__price">{it.price}</span>
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  )
}

/** Цифры — с волной звука под каждым числом. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="vinyl-stats-sec">
      <Head label={s.label} title={s.title} />
      <dl className="vinyl-stats">
        {s.items.map((it, i) => (
          <div key={i} className="vinyl-stat" data-reveal="up" data-delay={String(i * 0.08)}>
            <dd>
              <span data-count>{it.value}</span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </dd>
            <span className="vinyl-wave" aria-hidden="true">
              {Array.from({ length: 28 }, (_, k) => (
                <i key={k} style={{ ['--k' as string]: k, ['--v' as string]: (0.25 + Math.abs(Math.sin(k * 0.7 + i * 2)) * 0.75).toFixed(2) }} />
              ))}
            </span>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

/** Педагоги — обложки альбомов: квадрат, на наведении из-за обложки выезжает пластинка. */
function Team({ section: s, site }: SectionProps<'team'>) {
  return (
    <Sec id={s.anchor} type="team" className="vinyl-team-sec">
      <Head label={s.label} title={s.title} />
      <ul className="vinyl-albums">
        {s.items.map((it, i) => (
          <li key={i} className="vinyl-album" data-reveal="up" data-delay={String(i * 0.06)}>
            <div className="vinyl-album__sleeve">
              <span className="vinyl-album__disc" aria-hidden="true" />
              <figure className="vinyl-album__cover">
                <Media src={it.image} alt={`${it.name}, ${it.role}`} seed={`${site.slug}-t${i}`} colors={palette(site)} kind="rings" className="media" />
                <figcaption aria-hidden="true">{it.name}</figcaption>
              </figure>
            </div>
            <h3>{it.name}</h3>
            <p>{it.role}</p>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, stats: Stats, team: Team },
}
