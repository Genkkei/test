import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { ColorField, FitWord } from './client'

/*
 * ГАЛЕРЕЯ — белый куб в духе Serpentine, Tate и MoMA: гигантская типографика во всю ширину,
 * красный как единственный акцент, выставки индексом с номерами, работы развеской
 * «салоном» с музейными этикетками, первая работа — живое цветовое поле на стене.
 */

const pad = (n: number) => String(n).padStart(2, '0')
const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="gal-header">
        <a href="#top" className="gal-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.name}
        </a>
        <nav className="gal-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="gal-header__side">
          {site.nav.cta.label ? (
            <a className="gal-btn gal-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="gal-footer">
        <div className="gal-footer__cols">
          <div>
            <p className="gal-k">{pick(site.lang, { ru: 'Посещение', uz: 'Tashrif', en: 'Visit' })}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.length ? <p>{b.hours.map((h) => humanHours(h, site.lang)).join(', ')}</p> : null}
          </div>
          <div>
            <p className="gal-k">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="gal-k">{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name} ↗
              </a>
            ))}
          </div>
          <div>
            <p className="gal-k">{site.name}</p>
            <p>{site.tagline}</p>
          </div>
        </div>
        <div className="gal-footer__word">
          <FitWord text={site.name} className="gal-fit" />
        </div>
        <p className="gal-footer__legal">
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
  const t = site.theme
  const label = s.eyebrow.split(' · ').filter(Boolean)
  return (
    <section id={s.anchor || undefined} className="s s-hero gal-hero">
      <div className="gal-hero__word gal-rise">
        <FitWord text={site.name} className="gal-fit" />
      </div>
      <div className="gal-hero__grid">
        <div className="gal-hero__text">
          <p className="gal-k gal-rise" style={{ ['--d' as string]: '.3s' }}>
            <span className="gal-dot" aria-hidden="true" /> {pick(site.lang, { ru: 'Сейчас в галерее', uz: 'Hozir galereyada', en: 'Now on view' })}
          </p>
          <h1 className="gal-hero__title" data-split="lines">
            {s.title || site.name}
          </h1>
          {s.subtitle ? (
            <p className="gal-hero__sub gal-rise" style={{ ['--d' as string]: '.7s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="gal-hero__ctas gal-rise" style={{ ['--d' as string]: '.85s' }}>
            {s.cta.label ? (
              <a className="gal-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="gal-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
        <figure className="gal-hero__work gal-rise" style={{ ['--d' as string]: '.45s' }}>
          <div className="gal-hero__canvas">
            <ColorField colors={['#efe9df', t.accent, '#1d2a4a']} />
          </div>
          {label.length ? (
            <figcaption className="gal-label">
              <b>{label[0]}</b>
              {label.slice(1).map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </figcaption>
          ) : null}
        </figure>
      </div>
      {s.words.length ? (
        <ul className="gal-hero__tags gal-rise" style={{ ['--d' as string]: '1s' }}>
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
    <section className="s s-marquee gal-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={55} sep="●" />
    </section>
  )
}

/** Манифест: заголовок крупно на всю ширину, текст двумя колонками, год основания красным. */
function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="gal-about">
      <p className="s__label" data-reveal="fade">
        {s.label}
      </p>
      <h2 className="gal-about__title" data-split="words">
        {s.title}
      </h2>
      <div className="gal-about__body">
        {site.business.founded ? (
          <p className="gal-about__year" data-reveal="up">
            <span>{pick(site.lang, { ru: 'с', uz: '', en: 'since' })}</span> {site.business.founded}
          </p>
        ) : (
          <span />
        )}
        <p className="gal-about__text" data-reveal="up" data-delay="0.1">
          {s.text}
        </p>
      </div>
    </Sec>
  )
}

/** Выставки — индекс: номер, название крупно, автор и даты; при наведении строка раскрывает кадр. */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="gal-index-sec">
      <Head label={s.label} title={s.title} />
      <ol className="gal-index">
        {s.items.map((it, i) => {
          const Tag = it.href ? 'a' : 'div'
          return (
            <li key={i} data-reveal="up" data-delay={String(i * 0.05)}>
              <Tag className="gal-row" {...(it.href ? { href: it.href } : {})}>
                <span className="gal-row__no">{pad(i + 1)}</span>
                <span className="gal-row__title">{it.title}</span>
                <span className="gal-row__meta">
                  <span>{it.category}</span>
                  <span>{it.year}</span>
                </span>
                <span className="gal-row__more">
                  <span className="gal-row__inner">
                    <span className="gal-row__media">
                      <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
                    </span>
                    {it.text ? <span className="gal-row__text">{it.text}</span> : null}
                  </span>
                </span>
              </Tag>
            </li>
          )
        })}
      </ol>
    </Sec>
  )
}

/** Развеска «салоном»: рамы разных пропорций колонками, у каждой музейная этикетка. */
function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  const ratios = ['4 / 5', '1 / 1', '3 / 4', '5 / 4', '2 / 3', '4 / 3']
  return (
    <Sec id={s.anchor} type="gallery" className="gal-salon-sec">
      <Head label={s.label} title={s.title} />
      <div className="gal-salon">
        {s.items.map((it, i) => (
          <figure key={i} className="gal-frame" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <div className="gal-frame__mat" style={{ aspectRatio: ratios[i % ratios.length] }}>
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
            </div>
            <figcaption className="gal-label gal-label--sm">
              <b>{pad(i + 1)}.</b>
              <span>{it.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="gal-quotes-sec">
      <Head label={s.label} title={s.title} />
      <div className="gal-quotes">
        {s.items.map((it, i) => (
          <figure key={i} className="gal-quote" data-reveal="up" data-delay={String(i * 0.08)}>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              <b>{it.author}</b>
              {it.role ? <span>{it.role}</span> : null}
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
  sections: { hero: Hero, marquee: MarqueeSec, about: About, works: Works, gallery: Gallery, testimonials: Testimonials },
}
