import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { ChromeHeader, Glare, MetalCanvas, Tach } from './client'

function tel(p: string) {
  return `tel:${p.replace(/[^\d+]/g, '')}`
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <ChromeHeader>
        <a href="#top" className="ch-logo" aria-label={`${site.name} — ${pick(site.lang, { ru: 'наверх', uz: 'yuqoriga', en: 'back to top' })}`}>
          <i aria-hidden="true" />
          {site.name}
        </a>
        <nav className="ch-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ch-header__side">
          {b.phone ? (
            <a className="ch-header__tel" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="ch-btn ch-btn--red" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
        <span className="ch-header__progress" aria-hidden="true" />
      </ChromeHeader>
      <main id="top">{children}</main>
      <footer className="ch-footer">
        <div className="ch-footer__grid">
          <div>
            <p className="ch-footer__k">{ui(site.lang, 'address')}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
          </div>
          <div>
            <p className="ch-footer__k">{ui(site.lang, 'hours')}</p>
            <p>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</p>
          </div>
          <div>
            <p className="ch-footer__k">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="ch-footer__k">{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>
        <p className="ch-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="ch-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{site.tagline}</span>
          <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  // «значение|подпись» — характеристики под заголовком, как у спецификаций автомобиля
  const specs = s.words.map((w) => w.split('|')).filter((p) => p.length === 2)
  return (
    <section id={s.anchor || undefined} className="s s-hero ch-hero">
      <MetalCanvas colors={[t.bg, t.surface, t.fg, t.accent]} />
      <div className="ch-hero__inner">
        {s.eyebrow ? <p className="ch-hero__eyebrow ch-rise">{s.eyebrow}</p> : null}
        <h1 className="ch-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        <div className="ch-hero__row">
          {s.subtitle ? <p className="ch-hero__sub ch-rise" style={{ animationDelay: '.5s' }}>{s.subtitle}</p> : null}
          <div className="ch-hero__ctas ch-rise" style={{ animationDelay: '.65s' }}>
            {s.cta.label ? (
              <a className="ch-btn ch-btn--light" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="ch-btn ch-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        {specs.length ? (
          <dl className="ch-specs ch-rise" style={{ animationDelay: '.8s' }}>
            {specs.map(([v, l], i) => (
              <div key={i}>
                <dd>{v}</dd>
                <dt>{l}</dt>
              </div>
            ))}
          </dl>
        ) : null}
        <Tach label={pick(site.lang, { ru: 'об/мин', uz: 'ayl/daq', en: 'rpm' })} />
      </div>
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="ch-stats">
      <Head label={s.label} title={s.title} />
      <dl className="ch-stats__sheet">
        {s.items.map((it, i) => (
          <div key={i} className="ch-stats__row" data-reveal="up" data-delay={String(i * 0.06)}>
            <dt>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {it.label}
            </dt>
            <dd>
              <b data-count>{it.value}</b>
              {it.suffix ? <i>{it.suffix}</i> : null}
            </dd>
            <span className="ch-stats__bar" aria-hidden="true" style={{ ['--w' as string]: `${30 + ((i * 23) % 70)}%` }} />
          </div>
        ))}
      </dl>
    </Sec>
  )
}

function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="ch-works">
      <Head label={s.label} title={s.title} />
      <div className="ch-works__rail">
        {s.items.map((it, i) => {
          const body = (
            <Glare className="ch-work">
              <figure className="ch-work__media">
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
                <span className="ch-work__glare" aria-hidden="true" />
              </figure>
              <div className="ch-work__cap">
                <span className="ch-work__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{it.title}</h3>
                <p className="ch-work__meta">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
                {it.text ? <p className="ch-work__text">{it.text}</p> : null}
              </div>
            </Glare>
          )
          return (
            <div key={i} data-reveal="up" data-delay={String((i % 3) * 0.08)}>
              {it.href ? <a href={it.href}>{body}</a> : body}
            </div>
          )
        })}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = { ...meta, Shell, sections: { hero: Hero, stats: Stats, works: Works } }
