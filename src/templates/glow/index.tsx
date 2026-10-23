import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Serum } from './client'

/*
 * СИЯНИЕ — бьюти-бренд в духе Glossier, Aesop и The Ordinary: молочно-розовая бумага,
 * капля сыворотки на шейдере, флаконы на полке, состав крупно, ритуал утро/вечер.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Флакон четырёх видов: пипетка, туба, баночка, помпа — рисуется линией и заливкой палитры. */
function Bottle({ kind, tone }: { kind: number; tone: string }) {
  const k = kind % 4
  return (
    <svg className="glow-bottle" viewBox="0 0 120 200" aria-hidden="true" style={{ ['--tone' as string]: tone }}>
      {k === 0 ? (
        <>
          <rect x="52" y="10" width="16" height="34" rx="8" className="glow-bottle__cap" />
          <rect x="46" y="40" width="28" height="14" rx="3" className="glow-bottle__neck" />
          <rect x="30" y="54" width="60" height="132" rx="14" className="glow-bottle__body" />
          <rect x="38" y="96" width="44" height="56" rx="2" className="glow-bottle__label" />
        </>
      ) : k === 1 ? (
        <>
          <path d="M34 22 H86 L80 168 Q60 178 40 168 Z" className="glow-bottle__body" />
          <rect x="44" y="168" width="32" height="22" rx="4" className="glow-bottle__cap" />
          <rect x="42" y="60" width="36" height="60" rx="2" className="glow-bottle__label" />
          <path d="M34 22 H86" className="glow-bottle__seam" />
        </>
      ) : k === 2 ? (
        <>
          <rect x="18" y="88" width="84" height="22" rx="6" className="glow-bottle__cap" />
          <rect x="22" y="108" width="76" height="80" rx="16" className="glow-bottle__body" />
          <rect x="34" y="128" width="52" height="38" rx="2" className="glow-bottle__label" />
        </>
      ) : (
        <>
          <path d="M60 8 H86 V16 H66 V30" className="glow-bottle__seam" />
          <rect x="52" y="28" width="16" height="20" rx="3" className="glow-bottle__cap" />
          <rect x="44" y="46" width="32" height="12" rx="3" className="glow-bottle__neck" />
          <rect x="28" y="58" width="64" height="130" rx="30" className="glow-bottle__body" />
          <rect x="40" y="100" width="40" height="54" rx="2" className="glow-bottle__label" />
        </>
      )}
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="glow-header">
        <nav className="glow-nav" aria-label={ui(site.lang, 'sections')}>
          {links.slice(0, 4).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="glow-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          {site.name}
            </>
          )}
        </a>
        <div className="glow-header__side">
          <nav className="glow-nav glow-nav--r" aria-label={ui(site.lang, 'sections')}>
            {links.slice(4, 6).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          {site.nav.cta.label ? (
            <a className="glow-pill" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="glow-footer">
        <div className="glow-footer__grid">
          <div>
            <p className="glow-footer__lead">{site.tagline}</p>
            {site.nav.cta.label ? (
              <a className="glow-pill glow-pill--dark" href={site.nav.cta.href}>
                {site.nav.cta.label}
              </a>
            ) : null}
          </div>
          <dl className="glow-footer__facts">
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
              <dt>{pick(site.lang, { ru: 'Мы в сетях', uz: 'Tarmoqlarda', en: 'Follow' })}</dt>
              <dd className="glow-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <p className="glow-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="glow-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Не тестируем на животных', uz: 'Hayvonlarda sinovdan o‘tkazmaymiz', en: 'Never tested on animals' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero glow-hero">
      <Serum colors={[t.bg, t.accent, t.surface, t.fg]} />
      <div className="glow-hero__inner">
        {s.eyebrow ? (
          <p className="glow-hero__eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="glow-hero__title">
          <span data-split="lines">{s.title || site.name}</span>
        </h1>
        {s.words.length ? (
          <ul className="glow-hero__ing" aria-label={pick(site.lang, { ru: 'Ключевые компоненты', uz: 'Asosiy tarkib', en: 'Key ingredients' })}>
            {s.words.map((w, i) => (
              <li key={i} className="glow-chip" style={{ ['--d' as string]: `${0.5 + i * 0.09}s` }}>
                {w}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="glow-hero__foot">
          {s.subtitle ? (
            <p className="glow-hero__sub" data-reveal="up" data-delay="0.5">
              {s.subtitle}
            </p>
          ) : null}
          <div className="glow-hero__ctas" data-reveal="up" data-delay="0.65">
            {s.cta.label ? (
              <a className="glow-pill glow-pill--dark glow-pill--lg" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="glow-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <aside className="glow-label" data-reveal="up" data-delay="0.8" aria-hidden="true">
        <span>{site.name}</span>
        <span>{pick(site.lang, { ru: 'Сделано в Ташкенте', uz: 'Toshkentda tayyorlangan', en: 'Made in Tashkent' })}</span>
        <span>{s.words.slice(0, 3).join(' · ')}</span>
      </aside>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee glow-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={52} sep="✿" />
    </section>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="glow-about">
      <p className="glow-kicker" data-reveal="fade">
        {s.label}
      </p>
      <div className="glow-about__body">
        <figure className="glow-about__media" data-reveal="scale">
          <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind="blobs" className="media" />
        </figure>
        <div>
          <h2 className="glow-about__title" data-split="words">
            {s.title}
          </h2>
          {s.text ? (
            <p className="glow-about__text" data-reveal="up">
              {s.text}
            </p>
          ) : null}
        </div>
      </div>
    </Sec>
  )
}

/** Полка: флаконы стоят в ряд, активный компонент — крупно, как на этикетке The Ordinary. */
function Services({ section: s, site }: SectionProps<'services'>) {
  const tones = [site.theme.accent, site.theme.surface, '#f3d9c9', '#d9e3d6', '#e9d6e6', '#f6e3b8']
  return (
    <Sec id={s.anchor} type="services" className="glow-shelf-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="glow-shelf">
        {s.items.map((it, i) => (
          <li key={i} className="glow-product" data-reveal="up" data-delay={String((i % 4) * 0.08)}>
            <div className="glow-product__stage">
              <Bottle kind={i} tone={tones[i % tones.length]} />
              {it.tag ? <span className="glow-product__active">{it.tag}</span> : null}
            </div>
            <div className="glow-product__meta">
              <h3>{it.title}</h3>
              {it.price ? <span className="glow-product__price">{it.price}</span> : null}
            </div>
            {it.text ? <p className="glow-product__text">{it.text}</p> : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Цифры — кольца прогресса: число набегает, кольцо заполняется по проценту. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="glow-rings-sec">
      <Head label={s.label} title={s.title} center />
      <dl className="glow-rings">
        {s.items.map((it, i) => {
          const n = parseFloat(it.value.replace(/\s/g, '').replace(',', '.'))
          const p = it.suffix.trim() === '%' && n <= 100 ? n : 100
          return (
            <div key={i} className="glow-ring" data-reveal="scale" data-delay={String(i * 0.1)} style={{ ['--glow-p' as string]: p }}>
              <dd className="glow-ring__value">
                <span data-count>{it.value}</span>
                {it.suffix ? <small>{it.suffix}</small> : null}
              </dd>
              <dt className="glow-ring__label">{it.label}</dt>
            </div>
          )
        })}
      </dl>
    </Sec>
  )
}

/** Ритуал: шаги нанизаны на нить с каплями; первая половина — утро, вторая — вечер. */
function Process({ section: s, site }: SectionProps<'process'>) {
  const half = Math.ceil(s.items.length / 2)
  return (
    <Sec id={s.anchor} type="process" className="glow-ritual-sec">
      <Head label={s.label} title={s.title} />
      <div className="glow-ritual">
        {[s.items.slice(0, half), s.items.slice(half)].map((group, g) =>
          group.length ? (
            <div key={g} className="glow-ritual__col">
              <p className="glow-ritual__time">
                {g === 0 ? pick(site.lang, { ru: 'Утро', uz: 'Ertalab', en: 'Morning' }) : pick(site.lang, { ru: 'Вечер', uz: 'Kechqurun', en: 'Evening' })}
              </p>
              <ol>
              {group.map((it, i) => (
                <li key={i} className="glow-step" data-reveal="up" data-delay={String(i * 0.08)}>
                  <span className="glow-step__drop" aria-hidden="true" />
                  <span className="glow-step__num">{String(g * half + i + 1).padStart(2, '0')}</span>
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                </li>
              ))}
              </ol>
            </div>
          ) : null,
        )}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, about: About, services: Services, stats: Stats, process: Process },
}
