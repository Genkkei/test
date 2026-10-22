import type { Site } from '@/lib/schema'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Couch, couchKind } from './couch'
import { Configurator, type Fabric } from './client'

/*
 * ДИВАН — DTC-магазин мягкой мебели в духе Article, Burrow и Floyd: один герой-диван,
 * который покупатель перекрашивает в образцы ткани, модели карточками с силуэтом,
 * неделя до доставки дорожкой с фургоном. Тёплый молочный фон и скруглённые формы.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function fabrics(lang: string): Fabric[] {
  return [
    { color: '#3f6b5c', name: pick(lang, { ru: 'Изумруд', uz: 'Zumrad', en: 'Emerald' }), note: pick(lang, { ru: 'велюр', uz: 'velyur', en: 'velour' }) },
    { color: '#c0613d', name: pick(lang, { ru: 'Терракота', uz: 'Terrakota', en: 'Terracotta' }), note: pick(lang, { ru: 'рогожка', uz: 'rogojka', en: 'basket weave' }) },
    { color: '#cdb391', name: pick(lang, { ru: 'Песок', uz: 'Qum', en: 'Sand' }), note: pick(lang, { ru: 'букле', uz: 'bukle', en: 'bouclé' }) },
    { color: '#4b4c52', name: pick(lang, { ru: 'Графит', uz: 'Grafit', en: 'Graphite' }), note: pick(lang, { ru: 'микровелюр', uz: 'mikrovelyur', en: 'micro-velour' }) },
    { color: '#d29b2c', name: pick(lang, { ru: 'Горчица', uz: 'Xantal', en: 'Mustard' }), note: pick(lang, { ru: 'вельвет', uz: 'velvet', en: 'corduroy' }) },
    { color: '#7f9cb5', name: pick(lang, { ru: 'Небо', uz: 'Osmon', en: 'Sky' }), note: pick(lang, { ru: 'рогожка', uz: 'rogojka', en: 'basket weave' }) },
  ]
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="sofa-header">
        <a href="#top" className="sofa-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="sofa-logo__mark" aria-hidden="true" />
          {site.name}
        </a>
        <nav className="sofa-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="sofa-header__side">
          {site.nav.cta.label ? (
            <a className="sofa-btn sofa-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="sofa-footer">
        <div className="sofa-footer__top">
          <div>
            <p className="sofa-footer__name">{site.name}</p>
            <p className="sofa-footer__tag">{site.tagline}</p>
          </div>
          <div className="sofa-footer__dots" aria-hidden="true">
            {fabrics(site.lang).map((f) => (
              <i key={f.color} style={{ background: f.color }} />
            ))}
          </div>
        </div>
        <dl className="sofa-footer__facts">
          {b.street ? (
            <div>
              <dt>{pick(site.lang, { ru: 'Шоурум', uz: 'Shou-rum', en: 'Showroom' })}</dt>
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
          <div>
            <dt>{pick(site.lang, { ru: 'Мы в сетях', uz: 'Ijtimoiy tarmoqlar', en: 'Follow us' })}</dt>
            <dd className="sofa-footer__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </dd>
          </div>
        </dl>
        <p className="sofa-footer__bottom">
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
  return (
    <section id={s.anchor || undefined} className="s s-hero sofa-hero">
      <div className="sofa-hero__head">
        {s.eyebrow ? (
          <p className="sofa-sticker sofa-in" style={{ ['--d' as string]: '.1s' }}>
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="sofa-hero__title">
          <span data-split="words">{s.title || site.name}</span>
        </h1>
        {s.subtitle ? (
          <p className="sofa-hero__sub sofa-in" style={{ ['--d' as string]: '.5s' }}>
            {s.subtitle}
          </p>
        ) : null}
      </div>
      <div className="sofa-in sofa-hero__conf" style={{ ['--d' as string]: '.35s' }}>
        <Configurator fabrics={fabrics(site.lang)} label={pick(site.lang, { ru: 'Цвет обивки', uz: 'Qoplama rangi', en: 'Upholstery colour' })} />
      </div>
      <div className="sofa-hero__foot sofa-in" style={{ ['--d' as string]: '.7s' }}>
        {s.cta.label ? (
          <a className="sofa-btn" href={s.cta.href || '#'} data-magnetic>
            {s.cta.label}
          </a>
        ) : null}
        {s.ctaSecondary.label ? (
          <a className="sofa-btn sofa-btn--ghost" href={s.ctaSecondary.href || '#'}>
            {s.ctaSecondary.label}
          </a>
        ) : null}
      </div>
      {s.words.length ? (
        <ul className="sofa-perks sofa-in" style={{ ['--d' as string]: '.85s' }}>
          {s.words.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee sofa-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={50} sep="●" />
    </section>
  )
}

/** Модели — карточки с силуэтом в ткани своего цвета. */
function Services({ section: s, site }: SectionProps<'services'>) {
  const fab = fabrics(site.lang)
  return (
    <Sec id={s.anchor} type="services" className="sofa-models">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="sofa-models__grid">
        {s.items.map((it, i) => (
          <li key={i} className="sofa-model" data-reveal="up" data-delay={String((i % 3) * 0.08)} style={{ ['--sofa-fabric' as string]: fab[i % fab.length].color }}>
            <div className="sofa-model__stage">
              <Couch kind={couchKind(it.title, i)} className="sofa-model__art" />
              {it.tag ? <span className="sofa-model__tag">{it.tag}</span> : null}
            </div>
            <div className="sofa-model__body">
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
              <div className="sofa-model__foot">
                <span className="sofa-model__price">{it.price}</span>
                <span className="sofa-model__dots" aria-hidden="true">
                  {fab.slice(0, 4).map((f) => (
                    <i key={f.color} style={{ background: f.color }} />
                  ))}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Неделя до дивана: дорожка с днями, фургон проезжает её, когда блок появляется. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="sofa-week">
      <Head label={s.label} title={s.title} center />
      <div className="sofa-road" data-reveal="fade">
        <div className="sofa-road__track" aria-hidden="true">
          <span className="sofa-road__fill" />
          <svg className="sofa-van" viewBox="0 0 64 36">
            <rect x="2" y="6" width="38" height="22" rx="4" style={{ fill: 'var(--accent)' }} />
            <path d="M40 12h12l8 8v8H40z" style={{ fill: 'var(--accent)' }} />
            <path d="M44 15h7l5 5h-12z" fill="rgb(255 255 255 / .75)" />
            <circle cx="14" cy="29" r="5" style={{ fill: 'var(--fg)' }} />
            <circle cx="50" cy="29" r="5" style={{ fill: 'var(--fg)' }} />
          </svg>
        </div>
        <ol className="sofa-road__steps">
          {s.items.map((it, i) => (
            <li key={i} style={{ ['--i' as string]: i }}>
              <span className="sofa-road__pin">{i + 1}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="sofa-stats">
      <Head label={s.label} title={s.title} />
      <dl className="sofa-stats__grid">
        {s.items.map((it, i) => (
          <div key={i} className="sofa-stat" data-reveal="scale" data-delay={String(i * 0.08)}>
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

function Testimonials({ section: s, site }: SectionProps<'testimonials'>) {
  const fab = fabrics(site.lang)
  return (
    <Sec id={s.anchor} type="testimonials" className="sofa-reviews">
      <Head label={s.label} title={s.title} />
      <div className="sofa-reviews__list">
        {s.items.map((it, i) => (
          <figure key={i} className="sofa-review" data-reveal="up" data-delay={String(i * 0.08)}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              <i style={{ background: fab[(i + 1) % fab.length].color }} aria-hidden="true" />
              <span>
                <b>{it.author}</b>
                {it.role ? <small>{it.role}</small> : null}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, process: Process, stats: Stats, testimonials: Testimonials },
}
