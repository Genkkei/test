import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { AuroraCanvas, AuroraHeader, Glow, Tilt } from './client'

/*
 * АВРОРА — Revolut, Stripe, Arc: северное сияние на шейдере, приложение в телефоне,
 * бенто-сетка функций с подсветкой за курсором, тарифы с градиентной рамкой.
 */

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <AuroraHeader>
        <a href="#top" className="aurora-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <i aria-hidden="true" />
          {site.name}
        </a>
        <nav className="aurora-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="aurora-header__side">
          {site.nav.cta.label ? (
            <a className="aurora-btn aurora-btn--sm" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </AuroraHeader>
      <main id="top">{children}</main>
      <footer className="aurora-footer">
        <div className="aurora-footer__glow" aria-hidden="true" />
        <div className="aurora-footer__inner">
          <div>
            <p className="aurora-logo">
              <i aria-hidden="true" />
              {site.name}
            </p>
            <p className="aurora-footer__tag">{site.tagline}</p>
          </div>
          <div className="aurora-footer__cols">
            <div>
              <p>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
              {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
              {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
            </div>
            <div>
              <p>{pick(site.lang, { ru: 'Офис', uz: 'Ofis', en: 'Office' })}</p>
              <span>{[b.street, b.city].filter(Boolean).join(', ')}</span>
            </div>
            <div>
              <p>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</p>
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="aurora-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}.{' '}
          {pick(site.lang, { ru: 'Условия, лимиты и тарифы — в приложении и договоре.', uz: 'Shartlar, limitlar va tariflar — ilovada va shartnomada.', en: 'Terms, limits and fees are in the app and the agreement.' })}
        </p>
      </footer>
    </>
  )
}

function Phone({ site }: { site: Site }) {
  const L = (ru: string, uz: string, en: string) => pick(site.lang, { ru, uz, en })
  return (
    <Tilt className="aurora-phone-wrap">
      <div className="aurora-phone" aria-hidden="true">
        <div className="aurora-phone__notch" />
        <div className="aurora-phone__screen">
          <div className="aurora-app__top">
            <span className="aurora-app__avatar">{L('А', 'A', 'A')}</span>
            <span>{L('Добрый вечер', 'Xayrli kech', 'Good evening')}</span>
            <span className="aurora-app__bell" />
          </div>
          <p className="aurora-app__label">{L('Общий баланс', 'Umumiy balans', 'Total balance')}</p>
          <p className="aurora-app__balance">
            {L('12 480 000', '12 480 000', '12,480,000')} <small>{L('сум', 'so‘m', 'UZS')}</small>
          </p>
          <div className="aurora-app__chips">
            <span className="is-on">UZS</span>
            <span>USD</span>
            <span>EUR</span>
          </div>
          <div className="aurora-app__card">
            <span className="aurora-app__card-brand">{site.name}</span>
            <span className="aurora-app__card-chip" />
            <span className="aurora-app__card-num">•••• 4821</span>
          </div>
          <div className="aurora-app__actions">
            <span>
              <i>↗</i>{L('Перевод', 'O‘tkazma', 'Send')}
            </span>
            <span>
              <i>＋</i>{L('Пополнить', 'To‘ldirish', 'Top up')}
            </span>
            <span>
              <i>▦</i>QR
            </span>
          </div>
          <ul className="aurora-app__tx">
            <li>
              <b>Korzinka</b>
              <span>−184 000</span>
            </li>
            <li>
              <b>{L('Перевод от Мамы', 'Onamdan o‘tkazma', 'Transfer from Mum')}</b>
              <span className="is-plus">+500 000</span>
            </li>
            <li>
              <b>Yandex Go</b>
              <span>−32 000</span>
            </li>
            <li>
              <b>{L('Кэшбэк за месяц', 'Oylik keshbek', 'Monthly cashback')}</b>
              <span className="is-plus">+12 400</span>
            </li>
          </ul>
        </div>
      </div>
      <span className="aurora-float aurora-float--a">{L('Перевод за 3 секунды', '3 soniyada o‘tkazma', 'Transfer in 3 seconds')}</span>
      <span className="aurora-float aurora-float--b">{L('Кэшбэк до 5%', '5% gacha keshbek', 'Up to 5% cashback')}</span>
    </Tilt>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero aurora-hero">
      <AuroraCanvas colors={[t.bg, t.accent, t.fg, t.surface]} />
      <div className="aurora-hero__inner">
        <div className="aurora-hero__copy">
          {s.eyebrow ? (
            <p className="aurora-pill aurora-in" style={{ ['--d' as string]: '0.1s' }}>
              <i aria-hidden="true" />
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="aurora-hero__title" data-split="lines">
            {s.title || site.name}
          </h1>
          {s.subtitle ? (
            <p className="aurora-hero__sub aurora-in" style={{ ['--d' as string]: '0.45s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="aurora-hero__ctas aurora-in" style={{ ['--d' as string]: '0.6s' }}>
            {s.cta.label ? (
              <a className="aurora-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="aurora-btn aurora-btn--glass" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          {s.words.length ? (
            <ul className="aurora-hero__facts aurora-in" style={{ ['--d' as string]: '0.75s' }}>
              {s.words.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="aurora-hero__device aurora-in" style={{ ['--d' as string]: '0.3s' }}>
          <Phone site={site} />
        </div>
      </div>
    </section>
  )
}

const ICONS = ['◎', '⇄', '✦', '▣', '◔', '⌁', '◇', '☰']

function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="aurora-bento-sec">
      <Head label={s.label} title={s.title} center>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="aurora-bento">
        {s.items.map((it, i) => (
          <Glow key={i} className={`aurora-bento__card aurora-bento__card--${i % 6}`}>
            <div data-reveal="up" data-delay={String((i % 3) * 0.07)}>
              <span className="aurora-bento__icon" aria-hidden="true">
                {ICONS[i % ICONS.length]}
              </span>
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
              <div className="aurora-bento__meta">
                {it.tag ? <span>{it.tag}</span> : null}
                {it.price ? <b>{it.price}</b> : null}
              </div>
            </div>
          </Glow>
        ))}
      </div>
    </Sec>
  )
}

function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="aurora-plans-sec">
      <Head label={s.label} title={s.title} center />
      <div className="aurora-plans">
        {s.items.map((it, i) => (
          <article key={i} className={`aurora-plan${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            {it.featured ? <span className="aurora-plan__badge">{pick(site.lang, { ru: 'Выбор большинства', uz: 'Ko‘pchilik tanlovi', en: 'Most popular' })}</span> : null}
            <h3>{it.name}</h3>
            <p className="aurora-plan__price">
              {it.price}
              {it.period ? <small> {it.period}</small> : null}
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

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, pricing: Pricing },
}
