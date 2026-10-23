import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { DayTabs, Titles } from './client'

/*
 * КАДР — кинотеатр в духе A24, Mubi и Alamo Drafthouse: луч проектора, мерцающий кадр с
 * перфорацией, интертитры, афиша по дням, постеры программ и билеты с отрывным корешком.
 */

const POSTER = ['#ffcc00', '#d8452b', '#efe7d6', '#2f5bd3']

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="cinema-header">
        <a href="#top" className="cinema-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <span className="cinema-logo__frame" aria-hidden="true" />
          {site.name}
            </>
          )}
        </a>
        <nav className="cinema-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="cinema-header__side">
          {site.nav.cta.label ? (
            <a className="cinema-btn cinema-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="cinema-footer">
        <div className="cinema-strip" aria-hidden="true" />
        <div className="cinema-footer__inner">
          <p className="cinema-footer__end" aria-hidden="true">
            {pick(site.lang, { ru: 'Конец', uz: 'Tamom', en: 'The End' })}
          </p>
          <div className="cinema-footer__cols">
            <div>
              <p className="cinema-footer__name">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
              <p className="cinema-footer__tag">{site.tagline}</p>
            </div>
            <dl>
              {b.street ? (
                <div>
                  <dt>{ui(site.lang, 'address')}</dt>
                  <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
                </div>
              ) : null}
              {b.hours.length ? (
                <div>
                  <dt>{pick(site.lang, { ru: 'Сеансы', uz: 'Seanslar', en: 'Shows' })}</dt>
                  <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
                </div>
              ) : null}
              {b.phone ? (
                <div>
                  <dt>{pick(site.lang, { ru: 'Касса', uz: 'Kassa', en: 'Box office' })}</dt>
                  <dd>
                    <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>{pick(site.lang, { ru: 'Следите', uz: 'Kuzating', en: 'Follow' })}</dt>
                <dd className="cinema-footer__social">
                  {b.socials.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                      {s.name}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
          <p className="cinema-footer__legal">
            © {new Date().getFullYear()} {b.legalName || site.name}
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero cinema-hero">
      <div className="cinema-beam" aria-hidden="true" />
      <div className="cinema-hero__inner">
        <div className="cinema-screen cinema-in" style={{ ['--d' as string]: '.2s' }}>
          <span className="cinema-screen__holes cinema-screen__holes--l" aria-hidden="true" />
          <div className="cinema-screen__frame">
            <span className="cinema-grain" aria-hidden="true" />
            {s.words.length ? <Titles words={s.words} /> : null}
            <span className="cinema-screen__count" aria-hidden="true" />
          </div>
          <span className="cinema-screen__holes cinema-screen__holes--r" aria-hidden="true" />
        </div>
        <div className="cinema-hero__copy">
          {s.eyebrow ? (
            <p className="cinema-hero__eyebrow cinema-in" style={{ ['--d' as string]: '.5s' }}>
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="cinema-hero__title">
            <span data-split="chars">{s.title || site.name}</span>
          </h1>
          <div className="cinema-hero__foot">
            {s.subtitle ? (
              <p className="cinema-hero__sub cinema-in" style={{ ['--d' as string]: '.8s' }}>
                {s.subtitle}
              </p>
            ) : null}
            <div className="cinema-hero__ctas cinema-in" style={{ ['--d' as string]: '.95s' }}>
              {s.cta.label ? (
                <a className="cinema-btn" href={s.cta.href || '#'} data-magnetic>
                  {s.cta.label}
                </a>
              ) : null}
              {s.ctaSecondary.label ? (
                <a className="cinema-btn cinema-btn--ghost" href={s.ctaSecondary.href || '#'}>
                  {s.ctaSecondary.label}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee cinema-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={40} sep="●" />
    </section>
  )
}

/** Афиша: вкладки по дням, сеанс — строка «время · фильм · режиссёр». */
function Menu({ section: s, site }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="cinema-sched-sec">
      <Head label={s.label} title={s.title} />
      <DayTabs days={s.groups.map((g) => g.name)} label={s.title || s.label}>
        {s.groups.map((g, gi) => (
          <ol key={gi} className="cinema-sched">
            <li className="cinema-sched__day">{g.name}</li>
            {g.items.map((it, i) => {
              const [time, hall] = it.price.split(' · ')
              return (
                <li key={i} className="cinema-row" data-reveal="up" data-delay={String(i * 0.06)}>
                  <span className="cinema-row__time">{time}</span>
                  <div className="cinema-row__film">
                    <h3>{it.name}</h3>
                    {it.text ? <p>{it.text}</p> : null}
                  </div>
                  {hall ? <span className="cinema-row__hall">{hall}</span> : null}
                  <a className="cinema-row__buy" href="#tickets" aria-label={`${pick(site.lang, { ru: 'Билет на', uz: 'Chipta:', en: 'Ticket for' })} ${it.name}`}>
                    {pick(site.lang, { ru: 'Билет', uz: 'Chipta', en: 'Ticket' })} →
                  </a>
                </li>
              )
            })}
          </ol>
        ))}
      </DayTabs>
    </Sec>
  )
}

/** Программы — постеры 2:3: огромное название, полоса с датами, цвет из короткой палитры. */
function Works({ section: s }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="cinema-posters-sec">
      <Head label={s.label} title={s.title} />
      <ul className="cinema-posters">
        {s.items.map((it, i) => (
          <li key={i} className="cinema-poster" data-reveal="up" data-delay={String(i * 0.08)} style={{ ['--pc' as string]: POSTER[i % POSTER.length] }}>
            <div className="cinema-poster__sheet">
              <span className="cinema-poster__cat">{it.category}</span>
              <h3 className="cinema-poster__title">{it.title}</h3>
              <span className="cinema-poster__date">{it.year}</span>
            </div>
            {it.text ? <p className="cinema-poster__text">{it.text}</p> : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Билеты с отрывным корешком. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="cinema-tickets-sec">
      <Head label={s.label} title={s.title} />
      <div className="cinema-tickets">
        {s.items.map((it, i) => (
          <article key={i} className={`cinema-ticket${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            <div className="cinema-ticket__main">
              <p className="cinema-ticket__kind">
                {site.name} · {pick(site.lang, { ru: 'билет', uz: 'chipta', en: 'admit one' })}
              </p>
              <h3 className="cinema-ticket__name">{it.name}</h3>
              <p className="cinema-ticket__price">{it.price}</p>
              <ul>
                {it.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="cinema-ticket__stub">
              <span>{it.period}</span>
              <b>№ {String(2140 + i * 37).padStart(6, '0')}</b>
            </div>
          </article>
        ))}
      </div>
    </Sec>
  )
}

function Contact({ section: s, site }: SectionProps<'contact'>) {
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-contact cinema-contact">
      <div className="s__inner">
        {s.label ? <p className="s__label">{s.label}</p> : null}
        <h2 className="cinema-contact__title" data-split="lines">
          {s.title}
        </h2>
        <div className="cinema-contact__row" data-reveal="up">
          {s.text ? <p>{s.text}</p> : null}
          {s.cta.label ? (
            <a className="cinema-btn" href={s.cta.href || '#'}>
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="cinema-contact__tel" href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>
              {b.phone}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, menu: Menu, works: Works, pricing: Pricing, contact: Contact },
}
