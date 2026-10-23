import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu, Marquee } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { humanHours, pick, ui } from '@/lib/i18n'
import { fontStack } from '@/lib/fonts'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Cat, PawsHeader, PawTrail } from './client'

/* ЛАПЫ — Chewy, Wild One, Bark: тёплое молоко и рыжий, круглый Nunito, рукописные
   пометки Caveat, зверьки из простых форм, следы лап за курсором. Клиника, в которую
   не страшно ни питомцу, ни хозяину: мягкие капли вместо карточек, экстренная линия на виду. */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

export function Paw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="27" rx="9" ry="8" fill="currentColor" />
      <ellipse cx="9" cy="17" rx="4" ry="5" fill="currentColor" transform="rotate(-20 9 17)" />
      <ellipse cx="16" cy="10" rx="4" ry="5.5" fill="currentColor" />
      <ellipse cx="25" cy="10" rx="4" ry="5.5" fill="currentColor" />
      <ellipse cx="31.5" cy="17" rx="4" ry="5" fill="currentColor" transform="rotate(20 31.5 17)" />
    </svg>
  )
}

const ICONS = [
  // шприц — прививки
  <path key="0" d="M30 10l8 8M34 14L18 30l-6 2 2-6L30 10M22 18l4 4M18 22l4 4M10 38l6-6" />,
  // сердце — терапия
  <path key="1" d="M24 40S8 30 8 18a8 8 0 0116-3 8 8 0 0116 3c0 12-16 22-16 22z" />,
  // ножницы — груминг
  <path key="2" d="M14 14a5 5 0 110 .1M14 34a5 5 0 110 .1M18 17l20 14M18 31l20-14" />,
  // зуб — стоматология
  <path key="3" d="M16 8c-6 0-8 6-6 12 1 4 2 8 3 14 1 4 4 4 5 0l2-8h8l2 8c1 4 4 4 5 0 1-6 2-10 3-14 2-6 0-12-6-12-3 0-5 2-8 2s-5-2-8-2z" />,
  // экран УЗИ
  <path key="4" d="M8 12h32v20H8zM18 40h12M24 32v8M14 26c4-8 8 4 12-4s6 2 8 0" />,
  // пластырь — хирургия
  <path key="5" d="M12 30l18-18a6 6 0 018 8L20 38a6 6 0 01-8-8zM21 21l6 6M20 26h.1M26 20h.1" />,
]

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <div className="pw-root" style={{ ['--hand' as string]: fontStack('Caveat') }}>
      <PawsHeader>
        <a href="#top" className="pw-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop')}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <Paw className="pw-logo__paw" />
          {site.name}
            </>
          )}
        </a>
        <nav className="pw-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="pw-header__side">
          {b.phone ? (
            <a className="pw-sos" href={tel(b.phone)}>
              <i aria-hidden="true" />
              24/7 <b>{b.phone}</b>
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="pw-btn pw-btn--sm" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </PawsHeader>
      <main id="top">{children}</main>
      <footer className="pw-footer">
        <svg className="pw-footer__wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60V30C120 0 240 0 360 30s240 30 360 0 240-30 360 0 240 30 360 0V60z" fill="currentColor" />
        </svg>
        <div className="pw-footer__inner">
          <div className="pw-footer__brand">
            <p className="pw-footer__name">
              <Paw className="pw-footer__paw" />
              {site.name}
            </p>
            <p className="pw-footer__hand">{site.tagline}</p>
          </div>
          <div className="pw-footer__cols">
            <div>
              <h3>{pick(site.lang, { ru: 'Клиника', uz: 'Klinika', en: 'Clinic' })}</h3>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
              {b.hours.map((h) => (
                <p key={h}>{humanHours(h, site.lang)}</p>
              ))}
            </div>
            <div>
              <h3>{pick(site.lang, { ru: 'Позвонить', uz: 'Qo‘ng‘iroq qilish', en: 'Call us' })}</h3>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
              {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
            </div>
            <div>
              <h3>{pick(site.lang, { ru: 'Мы в сетях', uz: 'Ijtimoiy tarmoqlarda', en: 'Follow us' })}</h3>
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="pw-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name} · {pick(site.lang, { ru: 'Лицензия на ветеринарную деятельность — у администратора', uz: 'Veterinariya faoliyati litsenziyasi — administratorda', en: 'Veterinary licence available from reception' })}
        </p>
      </footer>
    </div>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero pw-hero">
      <PawTrail />
      <div className="pw-hero__inner">
        <div className="pw-hero__text">
          {s.eyebrow ? (
            <p className="pw-hero__eyebrow pw-rise" style={{ ['--d' as string]: '0s' }}>
              <Paw className="pw-mini-paw" /> {s.eyebrow}
            </p>
          ) : null}
          <h1 className="pw-hero__title" data-split="words">
            {s.title || site.name}
          </h1>
          {s.subtitle ? (
            <p className="pw-hero__sub pw-rise" style={{ ['--d' as string]: '.45s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="pw-hero__ctas pw-rise" style={{ ['--d' as string]: '.6s' }}>
            {s.cta.label ? (
              <a className="pw-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="pw-btn pw-btn--soft" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          {s.words.length ? (
            <ul className="pw-hero__pets pw-rise" style={{ ['--d' as string]: '.75s' }} aria-label={pick(site.lang, { ru: 'Кого лечим', uz: 'Kimlarni davolaymiz', en: 'Who we treat' })}>
              {s.words.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="pw-hero__visual pw-rise" style={{ ['--d' as string]: '.2s' }}>
          <span className="pw-blob" aria-hidden="true" />
          <span className="pw-bone" aria-hidden="true" />
          <span className="pw-heart" aria-hidden="true">
            ♥
          </span>
          <Cat lang={site.lang} />
          <p className="pw-note" aria-hidden="true">
            {pick(site.lang, { ru: 'это Рыжик,', uz: 'bu Malla,', en: 'this is Ginger,' })}
            <br />
            {pick(site.lang, { ru: 'он тут главврач', uz: 'u bu yerda bosh shifokor', en: 'he’s the head vet' })}
            <svg viewBox="0 0 80 50">
              <path d="M4 6 C 30 4, 60 14, 70 42 M70 42 l -12 -4 M70 42 l 2 -12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </p>
        </div>
      </div>
    </section>
  )
}

function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="pw-care">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="pw-care__grid">
        {s.items.map((it, i) => (
          <li key={i} className="pw-card" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <span className="pw-card__icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[i % ICONS.length]}
              </svg>
            </span>
            {it.tag ? <span className="pw-card__tag">{it.tag}</span> : null}
            <h3 className="pw-card__name">{it.title}</h3>
            {it.text ? <p className="pw-card__text">{it.text}</p> : null}
            {it.price ? <p className="pw-card__price">{it.price}</p> : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee pw-ribbon" aria-label={s.title || pick(site.lang, { ru: 'О клинике', uz: 'Klinika haqida', en: 'About the clinic' })}>
      <Marquee items={s.items} speed={40} sep="🐾" />
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, marquee: MarqueeSec },
}
