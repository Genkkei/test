import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Rotator } from './client'

/*
 * САХАР — кондитерская в духе Ladurée и Milk Bar: пастель, курсивная антиква, фестонные
 * края (как бумажная салфетка под пирожным), ярусный торт на первом экране собирается слоями,
 * витрина с ценниками на ниточках, посыпка медленно падает.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const SPRINKLES = ['#f5a3b7', '#ffd66e', '#9fd8c6', '#b9a6f2', '#ff8a7a', '#fff']

/** Ярусный торт: три яруса падают по очереди, крем стекает, вишенка — последней. */
function Cake() {
  return (
    <div className="sugar-cake" aria-hidden="true">
      <span className="sugar-cake__cherry" />
      <span className="sugar-cake__tier sugar-cake__tier--3" />
      <span className="sugar-cake__tier sugar-cake__tier--2" />
      <span className="sugar-cake__tier sugar-cake__tier--1" />
      <span className="sugar-cake__stand" />
    </div>
  )
}

function Sprinkles() {
  return (
    <div className="sugar-sprinkles" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, background: SPRINKLES[i % SPRINKLES.length], animationDelay: `${(i * 0.73) % 9}s`, animationDuration: `${9 + (i % 5)}s`, rotate: `${(i * 47) % 180}deg` }} />
      ))}
    </div>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="sugar-header">
        <a href="#top" className="sugar-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.name}
          <small>{pick(site.lang, { ru: 'кондитерская', uz: 'qandolatxona', en: 'patisserie' })}</small>
        </a>
        <nav className="sugar-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="sugar-header__side">
          {site.nav.cta.label ? (
            <a className="sugar-btn sugar-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="sugar-footer">
        <div className="sugar-scallop" aria-hidden="true" />
        <div className="sugar-footer__inner">
          <p className="sugar-footer__name">{site.name}</p>
          <p className="sugar-footer__tag">{site.tagline}</p>
          <div className="sugar-footer__cols">
            <p>
              <small>{ui(site.lang, 'address')}</small>
              {[b.street, b.city].filter(Boolean).join(', ')}
            </p>
            <p>
              <small>{ui(site.lang, 'hours')}</small>
              {b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}
            </p>
            <p>
              <small>{ui(site.lang, 'phone')}</small>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            </p>
            <p className="sugar-footer__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </p>
          </div>
          <p className="sugar-footer__bottom">
            © {new Date().getFullYear()} {b.legalName || site.name} · <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero sugar-hero">
      <Sprinkles />
      <div className="sugar-hero__text">
        {s.eyebrow ? <p className="sugar-hero__eyebrow sugar-in">{s.eyebrow}</p> : null}
        <h1 className="sugar-hero__title">
          <span data-split="words">{s.title || site.name}</span>
        </h1>
        {s.words.length ? (
          <p className="sugar-hero__for sugar-in" style={{ ['--d' as string]: '.7s' }}>
            {pick(site.lang, { ru: 'Торт на', uz: 'Tort:', en: 'A cake for a' })} <Rotator words={s.words} />
          </p>
        ) : null}
        {s.subtitle ? (
          <p className="sugar-hero__sub sugar-in" style={{ ['--d' as string]: '.85s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="sugar-hero__ctas sugar-in" style={{ ['--d' as string]: '1s' }}>
          {s.cta.label ? (
            <a className="sugar-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="sugar-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="sugar-hero__visual">
        <span className="sugar-hero__halo" aria-hidden="true" />
        <Cake />
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee sugar-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={46} sep="♡" />
    </section>
  )
}

/** Витрина: полки со стеклом, у каждого пирожного ценник на ниточке — качается при наведении. */
function Menu({ section: s, site }: SectionProps<'menu'>) {
  let n = 0
  return (
    <Sec id={s.anchor} type="menu" className="sugar-case-sec">
      <Head label={s.label} title={s.title} center />
      <div className="sugar-case">
        {s.groups.map((g, gi) => (
          <div key={gi} className="sugar-shelf">
            <h3 className="sugar-shelf__name">{g.name}</h3>
            <ul className="sugar-shelf__row">
              {g.items.map((it, i) => {
                n += 1
                return (
                  <li key={i} className="sugar-item" data-reveal="up" data-delay={String(i * 0.08)}>
                    <figure className="sugar-item__plate">
                      <Media src="" alt={it.name} seed={`${site.slug}-m${n}`} colors={palette(site)} kind="blobs" className="media" />
                    </figure>
                    <span className="sugar-tag">{it.price}</span>
                    <h4 className="sugar-item__name">{it.name}</h4>
                    {it.text ? <p className="sugar-item__text">{it.text}</p> : null}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Pricing({ section: s }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="sugar-tiers-sec">
      <Head label={s.label} title={s.title} center />
      <div className="sugar-tiers">
        {s.items.map((it, i) => (
          <article key={i} className={`sugar-tier${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.1)}>
            <div className="sugar-tier__icon" aria-hidden="true">
              {Array.from({ length: i + 1 }, (_, k) => (
                <span key={k} style={{ width: `${70 - k * 16}%` }} />
              ))}
            </div>
            <h3>{it.name}</h3>
            <p className="sugar-tier__price">
              {it.price}
              {it.period ? <small> / {it.period}</small> : null}
            </p>
            <ul>
              {it.features.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="sugar-steps-sec">
      <Head label={s.label} title={s.title} />
      <ol className="sugar-steps">
        {s.items.map((it, i) => (
          <li key={i} className="sugar-step" data-reveal="up" data-delay={String(i * 0.12)}>
            <span className="sugar-step__no">{i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="sugar-notes-sec">
      <Head label={s.label} title={s.title} center />
      <div className="sugar-notes">
        {s.items.map((it, i) => (
          <figure key={i} className="sugar-note" data-reveal="scale" data-delay={String(i * 0.1)} style={{ ['--tilt' as string]: `${[-2, 1.5, -1][i % 3]}deg` }}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              — {it.author}
              {it.role ? `, ${it.role}` : ''}
            </figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <Sec id={s.anchor} type="gallery" className="sugar-gallery-sec">
      <Head label={s.label} title={s.title} />
      <div className="sugar-gallery">
        {s.items.map((it, i) => (
          <figure key={i} className="sugar-gallery__item" data-reveal="scale" data-delay={String((i % 3) * 0.08)}>
            <div className="sugar-gallery__frame">
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={i % 2 ? 'rings' : 'blobs'} className="media" />
            </div>
            {it.caption ? <figcaption>{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, menu: Menu, pricing: Pricing, process: Process, testimonials: Testimonials, gallery: Gallery },
}
