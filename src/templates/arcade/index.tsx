import type { Site } from '@/lib/schema'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Crosshair, ModeTicker, Online } from './client'

/*
 * АРКАДА — компьютерный клуб в духе Riot Games, Valorant и Fnatic: HUD с уголками,
 * глитч-заголовок, онлайн-счётчик мест, зоны карточками со срезанным углом, тарифы как
 * снаряжение, турниры строками сетки.
 */

function Corners() {
  return (
    <>
      <i className="arcade-c arcade-c--tl" aria-hidden="true" />
      <i className="arcade-c arcade-c--tr" aria-hidden="true" />
      <i className="arcade-c arcade-c--bl" aria-hidden="true" />
      <i className="arcade-c arcade-c--br" aria-hidden="true" />
    </>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="arcade-header">
        <a href="#top" className="arcade-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="arcade-logo__mark" aria-hidden="true">
            R
          </span>
          {site.name}
        </a>
        <nav className="arcade-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <span>[{i + 1}]</span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="arcade-header__side">
          {site.nav.cta.label ? (
            <a className="arcade-btn arcade-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="arcade-footer">
        <p className="arcade-footer__gg" aria-hidden="true">
          GG
        </p>
        <div className="arcade-footer__grid">
          <div>
            <p className="arcade-footer__name">{site.name}</p>
            <p className="arcade-footer__tag">{site.tagline}</p>
          </div>
          <ul>
            {b.street ? <li>{[b.street, b.city].filter(Boolean).join(', ')}</li> : null}
            {b.hours.length ? <li>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</li> : null}
            {b.phone ? (
              <li>
                <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a>
              </li>
            ) : null}
          </ul>
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
        <p className="arcade-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name} · {pick(site.lang, { ru: 'После 22:00 — только 18+', uz: '22:00 dan keyin — faqat 18+', en: 'After 22:00 — 18+ only' })}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const stat = site.sections.find((x) => x.type === 'stats')
  const total = Number((stat && stat.type === 'stats' && stat.items[0]?.value) || 60) || 60
  return (
    <section id={s.anchor || undefined} className="s s-hero arcade-hero">
      <div className="arcade-grid" aria-hidden="true" />
      <Crosshair />
      <div className="arcade-hero__inner">
        <div className="arcade-hero__main">
          <Corners />
          {s.eyebrow ? (
            <p className="arcade-hero__eyebrow arcade-in" style={{ ['--d' as string]: '.1s' }}>
              <span className="arcade-dot" aria-hidden="true" />
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="arcade-hero__title arcade-glitch" data-text={s.title || site.name}>
            <span data-split="chars">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="arcade-hero__sub arcade-in" style={{ ['--d' as string]: '.6s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="arcade-hero__ctas arcade-in" style={{ ['--d' as string]: '.75s' }}>
            {s.cta.label ? (
              <a className="arcade-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="arcade-btn arcade-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        <aside className="arcade-hud arcade-in" style={{ ['--d' as string]: '.4s' }}>
          <Corners />
          <p className="arcade-hud__label">{pick(site.lang, { ru: 'Сейчас в клубе', uz: 'Hozir klubda', en: 'Live in the club' })}</p>
          <Online total={total} labels={{ busy: pick(site.lang, { ru: 'Играют', uz: 'O‘ynayapti', en: 'Playing' }), free: pick(site.lang, { ru: 'Свободно мест', uz: 'Bo‘sh joylar', en: 'Seats free' }) }} />
          {s.words.length ? (
            <div className="arcade-hud__mode">
              <span>{pick(site.lang, { ru: 'Режим', uz: 'Rejim', en: 'Mode' })}</span>
              <ModeTicker words={s.words} />
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee arcade-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={30} sep="◆" />
    </section>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section className="s s-stats arcade-stats">
      <div className="s__inner">
        <ul className="arcade-stats__grid">
          {s.items.map((it, i) => (
            <li key={i} data-reveal="up" data-delay={String(i * 0.08)}>
              <span className="arcade-stats__k">0{i + 1}</span>
              <b>
                <span data-count>{it.value}</span>
                <small>{it.suffix}</small>
              </b>
              <span className="arcade-stats__l">{it.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Зоны — карточки со срезанным углом, метка редкости, цена в «HUD». */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="arcade-zones-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="arcade-zones">
        {s.items.map((it, i) => (
          <li key={i} className="arcade-zone" data-reveal="up" data-delay={String(i * 0.06)} style={{ ['--i' as string]: String(i) }}>
            <span className="arcade-zone__tag">{it.tag}</span>
            <h3 className="arcade-zone__name">{it.title}</h3>
            <p className="arcade-zone__text">{it.text}</p>
            <p className="arcade-zone__price">{it.price}</p>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="arcade-plans-sec">
      <Head label={s.label} title={s.title} />
      <div className="arcade-plans">
        {s.items.map((it, i) => (
          <article key={i} className={`arcade-plan${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            <Corners />
            <p className="arcade-plan__lvl">LVL {i + 1}</p>
            {it.featured ? <span className="arcade-plan__hot">{pick(site.lang, { ru: 'Выбор игроков', uz: 'O‘yinchilar tanlovi', en: 'Players’ pick' })}</span> : null}
            <h3 className="arcade-plan__name">{it.name}</h3>
            <p className="arcade-plan__price">{it.price}</p>
            <p className="arcade-plan__period">{it.period}</p>
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

/** Турниры — строки сетки: дата, название, формат, статус регистрации. */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="arcade-cups-sec">
      <Head label={s.label} title={s.title} />
      <ol className="arcade-cups">
        {s.items.map((it, i) => (
          <li key={i} className="arcade-cup" data-reveal="left" data-delay={String(i * 0.07)}>
            <span className="arcade-cup__no">#{String(i + 1).padStart(2, '0')}</span>
            <span className="arcade-cup__date">{it.year}</span>
            <div className="arcade-cup__body">
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            <span className="arcade-cup__fmt">{it.category}</span>
            <span className="arcade-cup__status">{pick(site.lang, { ru: 'Регистрация', uz: 'Ro‘yxatdan o‘tish', en: 'Sign-ups open' })}</span>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Contact({ section: s, site }: SectionProps<'contact'>) {
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-contact arcade-contact">
      <div className="s__inner">
        <div className="arcade-contact__box" data-reveal="scale">
          <Corners />
          {s.label ? <p className="s__label">{s.label}</p> : null}
          <h2 className="arcade-contact__title arcade-glitch" data-text={s.title}>
            {s.title}
          </h2>
          {s.text ? <p className="arcade-contact__text">{s.text}</p> : null}
          <div className="arcade-hero__ctas">
            {s.cta.label ? (
              <a className="arcade-btn" href={s.cta.href || '#'}>
                {s.cta.label}
              </a>
            ) : null}
            {b.phone ? (
              <a className="arcade-btn arcade-btn--ghost" href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>
                {b.phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, stats: Stats, services: Services, pricing: Pricing, works: Works, contact: Contact },
}
