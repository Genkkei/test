import { pick } from '@/lib/i18n'
import { Logo } from '@/components/brand/Logo'
import type { Site } from '@/lib/schema'
import { Badge, Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { OpenStatus, SkewDriver, SpeedCanvas } from './client'

function hoursOf(site: Site): [number, number] {
  const m = site.business.hours[0]?.match(/(\d{2}):\d{2}-(\d{2}):\d{2}/)
  return m ? [Number(m[1]), Number(m[2]) || 24] : [7, 23]
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const [o, c] = hoursOf(site)
  return (
    <>
      <SkewDriver />
      <header className="v-header">
        <a href="#top" className="v-logo" aria-label={`${site.name} — ${pick(site.lang, { ru: 'наверх', uz: 'yuqoriga', en: 'back to top' })}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          {site.name}
          <sup>®</sup>
            </>
          )}
        </a>
        <OpenStatus open={o} close={c} labels={[pick(site.lang, { ru: 'Часы работы', uz: 'Ish vaqti', en: 'Opening hours' }), pick(site.lang, { ru: 'Клуб открыт', uz: 'Klub ochiq', en: 'Club open' }), pick(site.lang, { ru: 'Сейчас закрыто', uz: 'Hozir yopiq', en: 'Closed now' })]} />
        <nav className="v-nav" aria-label={pick(site.lang, { ru: 'Разделы', uz: 'Bo‘limlar', en: 'Sections' })}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <small>{String(i + 1).padStart(2, '0')}</small>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="v-header__side">
          {site.nav.cta.label ? (
            <a className="v-btn" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="v-footer">
        <div className="v-footer__cta">
          <p className="v-footer__big">
            {pick(site.lang, { ru: <>Твой <span>предел</span> дальше</>, uz: <>Chegarang <span>yanada</span> uzoqda</>, en: <>Your <span>limit</span> is further</> })}
          </p>
          {site.nav.cta.label ? (
            <a className="v-btn v-btn--xl" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label} →
            </a>
          ) : null}
        </div>
        <div className="v-footer__grid">
          <div>
            <small>{pick(site.lang, { ru: 'Адрес', uz: 'Manzil', en: 'Address' })}</small>
            <span>{[site.business.street, site.business.city].filter(Boolean).join(', ')}</span>
          </div>
          <div>
            <small>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</small>
            {site.business.phone ? <a href={`tel:${site.business.phone.replace(/[^\d+]/g, '')}`}>{site.business.phone}</a> : null}
            {site.business.email ? <a href={`mailto:${site.business.email}`}>{site.business.email}</a> : null}
          </div>
          <div>
            <small>{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</small>
            {site.business.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>
        <p className="v-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <p className="v-footer__legal">
          © {new Date().getFullYear()} {site.business.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  const lines = (s.title || site.name).split(/\n|(?<=[.!?])\s+/).filter(Boolean)
  return (
    <section id={s.anchor || undefined} className="s s-hero v-hero">
      <SpeedCanvas colors={[t.bg, t.accent, t.fg, t.muted]} />
      <div className="v-hero__inner">
        {s.eyebrow ? (
          <p className="v-tag" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="v-hero__title v-skew">
          {lines.map((l, i) => (
            <span key={i} className={`v-hero__line${i % 2 ? ' is-outline' : ''}`} data-split="words" data-delay={String(i * 0.15)}>
              {l}{' '}
            </span>
          ))}
        </h1>
        <div className="v-hero__foot">
          {s.subtitle ? (
            <p className="v-hero__sub v-rise" style={{ ['--d' as string]: '.7s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="v-hero__ctas v-rise" style={{ ['--d' as string]: '.85s' }}>
            {s.cta.label ? (
              <a className="v-btn v-btn--xl" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="v-btn v-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          <Badge text={s.words[0] || pick(site.lang, { ru: 'Первая тренировка бесплатно', uz: 'Birinchi mashg‘ulot bepul', en: 'First session free' })} className="badge v-badge" />
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee v-band" aria-label={s.title || pick(site.lang, { ru: 'Направления', uz: 'Yo‘nalishlar', en: 'Programmes' })}>
      <Marquee items={s.items} speed={18} sep="/" />
    </section>
  )
}

/** Направления: строки во всю ширину, при наведении заливаются неоном. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="v-dirs">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ol className="v-dirs__list">
        {s.items.map((it, i) => (
          <li key={i} className="v-dirs__row" data-reveal="left" data-delay={String(i * 0.05)}>
            <span className="v-dirs__num">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="v-dirs__name">{it.title}</h3>
            <p className="v-dirs__text">{it.text}</p>
            <span className="v-dirs__meta">
              {it.tag ? <b>{it.tag}</b> : null}
              {it.price ? <span>{it.price}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services },
}
