import './style.css'
import type { Site } from '@/lib/schema'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { pick, ui } from '@/lib/i18n'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { DitherCanvas, Live, Scramble } from './client'

function hoursOf(site: Site): [number, number] {
  const m = site.business.hours[0]?.match(/(\d{2}):\d{2}-(\d{2}):\d{2}/)
  return m ? [Number(m[1]), Number(m[2])] : [22, 6]
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const [o, c] = hoursOf(site)
  const b = site.business
  return (
    <>
      <header className="rv-header">
        <a href="#top" className="rv-logo" aria-label={`${site.name} — ${pick(site.lang, { ru: 'наверх', uz: 'yuqoriga', en: 'back to top' })}`}>
          {site.name.toUpperCase()}://{(b.city || 'tashkent').toUpperCase()}
        </a>
        <Live open={o} close={c} />
        <nav className="rv-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              [<Scramble text={l.label} />]
            </a>
          ))}
        </nav>
        <div className="rv-header__side">
          {site.nav.cta.label ? (
            <a className="rv-btn" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label} ↗
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="rv-footer">
        <p className="rv-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="rv-footer__grid">
          <p>
            <span>&gt; ADDRESS</span>
            {[b.street, b.city].filter(Boolean).join(', ')}
          </p>
          <p>
            <span>&gt; OPEN</span>
            {b.hours.map((h) => humanHours(h, site.lang)).join(' / ')}
          </p>
          <p>
            <span>&gt; CONTACT</span>
            {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </p>
          <p>
            <span>&gt; FOLLOW</span>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </p>
        </div>
        <p className="rv-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name} · 18+ · {site.tagline}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero rv-hero">
      <DitherCanvas colors={[t.bg, t.accent, t.fg]} />
      <div className="rv-hero__inner">
        {s.eyebrow ? <p className="rv-hero__eyebrow rv-boot">&gt; {s.eyebrow}</p> : null}
        <h1 className="rv-hero__title" data-text={s.title || site.name}>
          {s.title || site.name}
        </h1>
        <div className="rv-hero__foot">
          {s.subtitle ? (
            <p className="rv-hero__sub rv-boot" style={{ animationDelay: '.5s' }}>
              {s.subtitle}
            </p>
          ) : null}
          {s.words.length ? (
            <ul className="rv-hero__tags rv-boot" style={{ animationDelay: '.6s' }}>
              {s.words.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
          <div className="rv-hero__ctas rv-boot" style={{ animationDelay: '.7s' }}>
            {s.cta.label ? (
              <a className="rv-btn rv-btn--xl" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label} ↗
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="rv-btn rv-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Афиша: раздел меню = вечер (дата и название), позиции = артисты с временем и ценой входа. */
function Lineup({ section: s }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="rv-lineup">
      <Head label={s.label} title={s.title} />
      <ol className="rv-events">
        {s.groups.map((g, i) => {
          const [date, ...rest] = g.name.split('—').map((x) => x.trim())
          return (
            <li key={i} className="rv-event" data-reveal="up">
              <div className="rv-event__date">
                <span>{String(i + 1).padStart(2, '0')}</span>
                {date}
              </div>
              <div className="rv-event__body">
                {rest.length ? <h3 className="rv-event__name">{rest.join(' — ')}</h3> : null}
                <ul className="rv-event__acts">
                  {g.items.map((a, j) => (
                    <li key={j}>
                      <b>
                        <Scramble text={a.name} />
                      </b>
                      {a.text ? <small>{a.text}</small> : null}
                      {a.price ? <em>{a.price}</em> : null}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
      </ol>
    </Sec>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee rv-marquee" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={22} sep="✱" />
    </section>
  )
}

/** Правила клуба — нумерованный список в стиле терминала. */
function Rules({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="rv-rules">
      <Head label={s.label} title={s.title} />
      <ol className="rv-rules__list">
        {s.items.map((it, i) => (
          <li key={i} data-reveal="left" data-delay={String(i * 0.06)}>
            <span className="rv-rules__n">{`0x${(i + 1).toString(16).toUpperCase().padStart(2, '0')}`}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, menu: Lineup, marquee: MarqueeSec, process: Rules },
}
