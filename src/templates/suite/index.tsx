import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { BookingBar, Drift, LatticeLight, SuiteHeader } from './client'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <SuiteHeader>
        <nav className="su-nav" aria-label={ui(site.lang, 'sections')}>
          {links.slice(0, 4).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="su-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.name}
        </a>
        <div className="su-header__side">
          {site.nav.cta.label ? (
            <a className="su-link" href={site.nav.cta.href || '#'}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </SuiteHeader>
      <main id="top">{children}</main>
      <footer className="su-footer">
        <p className="su-footer__mark" aria-hidden="true">
          {site.name}
        </p>
        <p className="su-footer__lead">{site.tagline}</p>
        <div className="su-footer__grid">
          <div>
            <p className="su-footer__h">{ui(site.lang, 'address')}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
          </div>
          <div>
            <p className="su-footer__h">{pick(site.lang, { ru: 'Ресепшен', uz: 'Qabulxona', en: 'Reception' })}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="su-footer__h">{pick(site.lang, { ru: 'Следите', uz: 'Kuzatib boring', en: 'Follow' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <p className="su-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
          <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  const L = site.lang
  return (
    <section id={s.anchor || undefined} className="s s-hero su-hero">
      <div className="su-hero__light" aria-hidden="true">
        {s.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="media" src={s.image} alt="" />
        ) : (
          <LatticeLight colors={[t.surface, t.bg, t.accent, t.fg]} />
        )}
      </div>
      <div className="su-hero__inner">
        {s.eyebrow ? (
          <p className="su-hero__eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="su-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="su-hero__sub" data-reveal="up" data-delay="0.5">
            {s.subtitle}
          </p>
        ) : null}
      </div>
      <div className="su-hero__bar" data-reveal="up" data-delay="0.8">
        <BookingBar
          href={s.cta.href || site.nav.cta.href || '#contact'}
          labels={{
            in: pick(L, { ru: 'Заезд', uz: 'Kelish', en: 'Arrival' }),
            out: pick(L, { ru: 'Выезд', uz: 'Ketish', en: 'Departure' }),
            guests: pick(L, { ru: 'Гости', uz: 'Mehmonlar', en: 'Guests' }),
            go: s.cta.label || pick(L, { ru: 'Проверить даты', uz: 'Sanalarni tekshirish', en: 'Check dates' }),
            g: pick(L, {
              ru: ['1 гость', '2 гостя', '3 гостя', '4 гостя'],
              uz: ['1 mehmon', '2 mehmon', '3 mehmon', '4 mehmon'],
              en: ['1 guest', '2 guests', '3 guests', '4 guests'],
            }),
          }}
        />
      </div>
      <span className="su-hero__scroll" aria-hidden="true" />
    </section>
  )
}

/** О доме: одна длинная фраза по центру с буквицей. */
function About({ section: s }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="su-about">
      {s.label ? (
        <p className="s__label" data-reveal="fade">
          {s.label}
        </p>
      ) : null}
      {s.title ? (
        <h2 className="su-about__title" data-split="lines">
          {s.title}
        </h2>
      ) : null}
      <p className="su-about__text" data-reveal="up">
        {s.text}
      </p>
      <span className="su-ornament" aria-hidden="true" />
    </Sec>
  )
}

/** Номера каталогом: большой кадр с медленным параллаксом, паспорт номера рядом. */
function Rooms({ section: s, site, art }: SectionProps<'services'>) {
  const t = site.theme
  const soft = [t.surface, t.accent, '#c9b79c', t.muted, t.bg]
  return (
    <Sec id={s.anchor} type="services" className="su-rooms">
      <Head label={s.label} title={s.title} center>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="su-rooms__list">
        {s.items.map((it, i) => (
          <article key={i} className="su-room">
            <figure className="su-room__media" data-reveal="clip">
              <div className="su-room__wrap">
                <div className="su-room__img" data-parallax="0.12">
                  <Media src="" alt={it.title} seed={`${site.slug}-r${i}`} colors={soft} kind={art} className="media" />
                </div>
              </div>
            </figure>
            <div className="su-room__cap" data-reveal="up">
              <p className="su-room__no">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="su-room__name">{it.title}</h3>
              {it.tag ? <p className="su-room__tag">{it.tag}</p> : null}
              {it.text ? <p className="su-room__text">{it.text}</p> : null}
              {it.price ? <p className="su-room__price">{it.price}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </Sec>
  )
}

function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery su-moments">
      <div className="s__inner">
        <Head label={s.label} title={s.title} />
      </div>
      <Drift>
        {s.items.map((it, i) => (
          <figure key={i} className="su-moment" style={{ ['--h' as string]: ['72vh', '54vh', '64vh', '48vh', '70vh', '58vh'][i % 6] }}>
            <div className="su-moment__img">
              <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
            </div>
            <figcaption>
              <span>{String(i + 1).padStart(2, '0')}</span> {it.caption}
            </figcaption>
          </figure>
        ))}
      </Drift>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, about: About, services: Rooms, gallery: Gallery },
}
