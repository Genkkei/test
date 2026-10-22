import type { Site } from '@/lib/schema'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Tracker } from './client'

/*
 * КЛЮЧ — сервис «мастер на час» в духе Monzo, Checkatrade, Bolt: жёлтый сервисный цвет,
 * трекер заявки вместо картинки, прайс плитками с иконками, кнопка вызова всегда под рукой.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Иконка по категории: капля — сантехника, молния — электрика, шестерня — техника. */
function Icon({ kind }: { kind: number }) {
  const paths = [
    'M24 6 C 24 6, 10 22, 10 31 a14 14 0 0 0 28 0 C 38 22, 24 6, 24 6 Z M17 31 a7 7 0 0 0 7 7',
    'M27 4 L 11 27 H 23 L 19 44 L 37 19 H 25 Z',
    'M24 15 a9 9 0 1 0 0.01 0 Z M24 4 v6 M24 38 v6 M4 24 h6 M38 24 h6 M10 10 l4 4 M34 34 l4 4 M38 10 l-4 4 M14 34 l-4 4',
    'M8 40 L 26 22 M22 10 a9 9 0 0 0 12 12 l6 -6 -4 -4 -5 5 -4 -1 -1 -4 5 -5 -4 -4 Z',
  ]
  return (
    <svg className="pipe-ico" viewBox="0 0 48 48" aria-hidden="true">
      <path d={paths[kind % paths.length]} />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="pipe-header">
        <a href="#top" className="pipe-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="pipe-logo__mark" aria-hidden="true">
            <Icon kind={3} />
          </span>
          {site.name}
        </a>
        <nav className="pipe-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="pipe-header__side">
          {b.phone ? (
            <a className="pipe-header__tel" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="pipe-btn pipe-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      {b.phone ? (
        <a className="pipe-fab" href={tel(b.phone)} aria-label={`${ui(site.lang, 'phone')}: ${b.phone}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
          </svg>
          {pick(site.lang, { ru: 'Позвонить', uz: 'Qo‘ng‘iroq', en: 'Call' })}
        </a>
      ) : null}
      <footer className="pipe-footer">
        <div className="pipe-footer__inner">
          <div>
            <p className="pipe-footer__name">{site.name}</p>
            <p className="pipe-footer__tag">{site.tagline}</p>
          </div>
          <dl className="pipe-footer__facts">
            {b.phone ? (
              <div>
                <dt>{ui(site.lang, 'phone')}</dt>
                <dd>
                  <a href={tel(b.phone)}>{b.phone}</a>
                </dd>
              </div>
            ) : null}
            {b.hours.length ? (
              <div>
                <dt>{ui(site.lang, 'hours')}</dt>
                <dd>{pick(site.lang, { ru: 'Круглосуточно, без выходных', uz: 'Kecha-kunduz, dam olishsiz', en: 'Around the clock, every day' })}</dd>
              </div>
            ) : null}
            {b.street ? (
              <div>
                <dt>{ui(site.lang, 'address')}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
              </div>
            ) : null}
            <div>
              <dt>{pick(site.lang, { ru: 'Мы в сети', uz: 'Tarmoqlarda', en: 'Online' })}</dt>
              <dd className="pipe-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <p className="pipe-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name} · {pick(site.lang, { ru: 'Гарантия на работу 6 месяцев', uz: 'Ishga 6 oy kafolat', en: '6-month guarantee on work' })}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const stat = site.sections.find((x) => x.type === 'stats')
  const eta = Number((stat && stat.type === 'stats' && stat.items[0]?.value) || 60) || 60
  return (
    <section id={s.anchor || undefined} className="s s-hero pipe-hero">
      <span className="pipe-hero__big" aria-hidden="true">
        24
      </span>
      <div className="pipe-hero__inner">
        <div className="pipe-hero__copy">
          {s.eyebrow ? (
            <p className="pipe-chip pipe-in" style={{ ['--d' as string]: '.05s' }}>
              <i aria-hidden="true" />
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="pipe-hero__title">
            <span data-split="words">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="pipe-hero__sub pipe-in" style={{ ['--d' as string]: '.5s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="pipe-hero__ctas pipe-in" style={{ ['--d' as string]: '.65s' }}>
            {s.cta.label ? (
              <a className="pipe-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label} →
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="pipe-btn pipe-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        <div className="pipe-hero__card pipe-in" style={{ ['--d' as string]: '.3s' }}>
          <Tracker
            steps={s.words.length ? s.words : [s.title]}
            eta={eta}
            labels={{
              order: pick(site.lang, { ru: 'Заявка', uz: 'Buyurtma', en: 'Request' }),
              eta: pick(site.lang, { ru: 'Мастер будет через', uz: 'Usta yetib keladi', en: 'Pro arrives in' }),
              min: pick(site.lang, { ru: 'мин', uz: 'daq', en: 'min' }),
              pro: pick(site.lang, { ru: 'Уста Бобур · сантехник, 7 лет опыта', uz: 'Usta Bobur · santexnik, 7 yillik tajriba', en: 'Bobur · plumber, 7 years on the job' }),
            }}
          />
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee pipe-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={32} sep="●" />
    </section>
  )
}

function Services({ section: s }: SectionProps<'services'>) {
  const tags = [...new Set(s.items.map((i) => i.tag).filter(Boolean))]
  return (
    <Sec id={s.anchor} type="services" className="pipe-svc-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="pipe-svc">
        {s.items.map((it, i) => (
          <li key={i} className="pipe-tile" data-reveal="up" data-delay={String((i % 4) * 0.06)}>
            <div className="pipe-tile__top">
              <Icon kind={Math.max(0, tags.indexOf(it.tag))} />
              {it.tag ? <span className="pipe-tile__tag">{it.tag}</span> : null}
            </div>
            <h3 className="pipe-tile__name">{it.title}</h3>
            {it.text ? <p className="pipe-tile__text">{it.text}</p> : null}
            {it.price ? <p className="pipe-tile__price">{it.price}</p> : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <section className="s s-stats pipe-stats">
      <div className="s__inner">
        <ul className="pipe-stats__grid">
          {s.items.map((it, i) => (
            <li key={i} data-reveal="up" data-delay={String(i * 0.08)}>
              <b>
                <span data-count>{it.value}</span>
                <small>{it.suffix}</small>
              </b>
              <span>{it.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Как это работает — статусы заявки на одной линии, линия заполняется при появлении. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="pipe-flow-sec">
      <Head label={s.label} title={s.title} />
      <ol className="pipe-flow" data-reveal="fade">
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: String(i) }}>
            <span className="pipe-flow__dot" aria-hidden="true">
              {i + 1}
            </span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Contact({ section: s, site }: SectionProps<'contact'>) {
  const b = site.business
  return (
    <section id={s.anchor || undefined} className="s s-contact pipe-call">
      <div className="s__inner">
        <div className="pipe-call__box" data-reveal="scale">
          {s.label ? <p className="pipe-chip pipe-chip--dark">{s.label}</p> : null}
          <h2 className="pipe-call__title" data-split="lines">
            {s.title}
          </h2>
          {s.text ? <p className="pipe-call__text">{s.text}</p> : null}
          {b.phone ? (
            <a className="pipe-call__tel" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          <div className="pipe-call__row">
            {s.cta.label ? (
              <a className="pipe-btn pipe-btn--dark" href={s.cta.href || '#'}>
                {s.cta.label} →
              </a>
            ) : null}
            {b.hours.length ? <span className="pipe-call__hours">{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</span> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, stats: Stats, process: Process, contact: Contact },
}
