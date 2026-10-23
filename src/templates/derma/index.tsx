import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Glow, Quotes } from './client'

/*
 * КОЖА — эстетическая клиника в духе Dr. Barbara Sturm и The Light Salon: молочный фон
 * с мягким светом на шейдере, курсивная антиква, кадры в арках. Процедуры — прайс
 * строками с длительностью и ценой, раскрываются при наведении; путь пациента — арки;
 * врачи — портреты в арках; отзывы — одна большая цитата за раз.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="derma-header">
        <a href="#top" className="derma-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          {site.name}
            </>
          )}
        </a>
        <nav className="derma-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="derma-header__side">
          {site.nav.cta.label ? (
            <a className="derma-btn derma-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="derma-footer">
        <p className="derma-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="derma-footer__inner">
          <p className="derma-footer__tag">{site.tagline}</p>
          <dl className="derma-footer__facts">
            {b.street ? (
              <div>
                <dt>{ui(site.lang, 'address')}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
              </div>
            ) : null}
            {b.hours.length ? (
              <div>
                <dt>{ui(site.lang, 'hours')}</dt>
                <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
              </div>
            ) : null}
            {b.phone ? (
              <div>
                <dt>{ui(site.lang, 'phone')}</dt>
                <dd>
                  <a href={tel(b.phone)}>{b.phone}</a>
                </dd>
              </div>
            ) : null}
            <div>
              <dt>{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</dt>
              <dd className="derma-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <p className="derma-footer__warn">
          {pick(site.lang, {
            ru: 'Имеются противопоказания. Перед процедурой нужна консультация врача.',
            uz: 'Qarshi ko‘rsatmalar mavjud. Muolajadan oldin shifokor maslahati kerak.',
            en: 'Contraindications apply. A consultation with a doctor is required before any treatment.',
          })}
        </p>
        <div className="derma-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero derma-hero">
      <Glow colors={[t.bg, t.surface, t.accent, t.fg]} />
      <div className="derma-hero__inner">
        <div className="derma-hero__copy">
          {s.eyebrow ? <p className="derma-hero__eyebrow derma-in">{s.eyebrow}</p> : null}
          <h1 className="derma-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="derma-hero__sub derma-in" style={{ ['--d' as string]: '.6s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="derma-hero__ctas derma-in" style={{ ['--d' as string]: '.75s' }}>
            {s.cta.label ? (
              <a className="derma-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="derma-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
        <div className="derma-hero__visual">
          <figure className="derma-arch derma-hero__arch" data-reveal="clip">
            <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-hero`} colors={palette(site)} kind="blobs" className="media" />
          </figure>
          {s.words.length ? (
            <ul className="derma-hero__words">
              {s.words.slice(0, 3).map((w, i) => (
                <li key={w} className="derma-in" style={{ ['--d' as string]: `${1 + i * 0.15}s` }}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {w}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Процедуры — прайс строками: название, длительность, цена; описание раскрывается. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="derma-menu-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="derma-menu__head" aria-hidden="true">
        <span>{pick(site.lang, { ru: 'Процедура', uz: 'Muolaja', en: 'Treatment' })}</span>
        <span>{pick(site.lang, { ru: 'Длительность', uz: 'Davomiyligi', en: 'Duration' })}</span>
        <span>{pick(site.lang, { ru: 'Стоимость', uz: 'Narxi', en: 'Price' })}</span>
      </div>
      <ul className="derma-menu">
        {s.items.map((it, i) => (
          <li key={i} className="derma-row" data-reveal="up" data-delay={String(i * 0.05)} tabIndex={0}>
            <span className="derma-row__no">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="derma-row__name">{it.title}</h3>
            <span className="derma-row__time">{it.tag}</span>
            <span className="derma-row__price">{it.price}</span>
            {it.text ? (
              <div className="derma-row__more">
                <p>{it.text}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Путь пациента: шаги в арках, линия соединяет их по центру. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="derma-path-sec">
      <Head label={s.label} title={s.title} center />
      <ol className="derma-path">
        {s.items.map((it, i) => (
          <li key={i} className="derma-step" data-reveal="up" data-delay={String(i * 0.1)}>
            <span className="derma-step__arch">
              <em>{String(i + 1).padStart(2, '0')}</em>
            </span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Team({ section: s, site }: SectionProps<'team'>) {
  return (
    <Sec id={s.anchor} type="team" className="derma-team-sec">
      <Head label={s.label} title={s.title} />
      <ul className="derma-team">
        {s.items.map((it, i) => (
          <li key={i} className="derma-doc" data-reveal="up" data-delay={String(i * 0.08)}>
            <figure className="derma-arch" data-parallax={i % 2 ? '0.06' : '-0.04'}>
              <Media src={it.image} alt={`${it.name}, ${it.role}`} seed={`${site.slug}-t${i}`} colors={palette(site)} kind="arch" className="media" />
            </figure>
            <h3>{it.name}</h3>
            <p>{it.role}</p>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

function Testimonials({ section: s, site }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="derma-words-sec">
      <Head label={s.label} title={s.title} center />
      <Quotes items={s.items} label={pick(site.lang, { ru: 'Отзывы', uz: 'Fikrlar', en: 'Reviews' })} />
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, process: Process, team: Team, testimonials: Testimonials },
}
