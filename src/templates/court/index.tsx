import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Booking } from './client'

/*
 * КОРТ — падел-клуб в духе Wimbledon, Padel Haus и Nike Tennis: корт сверху прорисовывается
 * мелом, мяч летит по дуге с тенью, табло бронирования на неделю, цифры на табло счёта.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Ball({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`court-ball ${className}`} aria-hidden="true">
      <circle cx="20" cy="20" r="18" />
      <path d="M6 9 Q20 20 6 31 M34 9 Q20 20 34 31" />
    </svg>
  )
}

/** Корт падела сверху: стекло по периметру, сетка, линии подачи — 20 × 10 м. */
function CourtPlan() {
  return (
    <svg viewBox="0 0 400 220" className="court-plan" aria-hidden="true">
      <rect x="10" y="10" width="380" height="200" rx="4" className="court-plan__turf" />
      <g className="court-plan__lines">
        <rect x="10" y="10" width="380" height="200" rx="4" pathLength={1} />
        <path d="M200 6 V214" pathLength={1} className="court-plan__net" />
        <path d="M66 10 V210 M334 10 V210" pathLength={1} />
        <path d="M66 110 H334" pathLength={1} />
      </g>
      <path d="M40 160 Q 200 -40 360 70" className="court-plan__arc" pathLength={1} />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="court-header">
        <a href="#top" className="court-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <Ball />
          <span>{site.name}</span>
            </>
          )}
        </a>
        <nav className="court-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="court-header__side">
          {site.nav.cta.label ? (
            <a className="court-btn court-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="court-footer">
        <div className="court-footer__top">
          <p className="court-footer__lead">{site.tagline}</p>
          {site.nav.cta.label ? (
            <a className="court-btn" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
        </div>
        <div className="court-footer__grid">
          {b.street ? (
            <div>
              <small>{ui(site.lang, 'address')}</small>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            </div>
          ) : null}
          {b.hours.length ? (
            <div>
              <small>{ui(site.lang, 'hours')}</small>
              <p>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</p>
            </div>
          ) : null}
          {b.phone ? (
            <div>
              <small>{ui(site.lang, 'phone')}</small>
              <p>
                <a href={tel(b.phone)}>{b.phone}</a>
              </p>
            </div>
          ) : null}
          <div>
            <small>{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</small>
            <p className="court-footer__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </p>
          </div>
        </div>
        <p className="court-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="court-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Ракетки и мячи — в аренду', uz: 'Raketka va to‘plar — ijaraga', en: 'Rackets and balls for hire' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero court-hero">
      <div className="court-hero__grid">
        <div className="court-hero__copy">
          {s.eyebrow ? (
            <p className="court-hero__eyebrow" data-reveal="fade">
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="court-hero__title">
            <span data-split="words">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="court-hero__sub" data-reveal="up" data-delay="0.4">
              {s.subtitle}
            </p>
          ) : null}
          <div className="court-hero__ctas" data-reveal="up" data-delay="0.55">
            {s.cta.label ? (
              <a className="court-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="court-btn court-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        <div className="court-hero__stage">
          <div className="court-hero__tilt">
            <CourtPlan />
            <div className="court-hero__fly" aria-hidden="true">
              <Ball className="court-ball--fly" />
            </div>
            <span className="court-hero__shadow" aria-hidden="true" />
          </div>
          {s.words.length ? (
            <ul className="court-hero__chips" data-reveal="up" data-delay="0.7">
              {s.words.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee court-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={42} sep="●" />
    </section>
  )
}

/** Корты и цены строками, под ними — табло бронирования на неделю. */
function Services({ section: s, site }: SectionProps<'services'>) {
  const contact = site.sections.find((x) => x.type === 'contact')
  const href = contact && contact.type === 'contact' && contact.cta.href ? contact.cta.href : site.nav.cta.href || '#'
  return (
    <Sec id={s.anchor} type="services" className="court-courts-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="court-courts">
        <ul className="court-list">
          {s.items.map((it, i) => (
            <li key={i} className="court-list__row" data-reveal="up" data-delay={String(i * 0.06)}>
              <span className="court-list__no">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{it.title}</h3>
                {it.text ? <p>{it.text}</p> : null}
              </div>
              <div className="court-list__meta">
                {it.price ? <b>{it.price}</b> : null}
                {it.tag ? <small>{it.tag}</small> : null}
              </div>
            </li>
          ))}
        </ul>
        <div data-reveal="up" data-delay="0.15">
          <Booking
            lang={site.lang}
            href={href}
            courts={[1, 2, 3, 4].map((n) => `${pick(site.lang, { ru: 'Корт', uz: 'Kort', en: 'Court' })} ${n}`)}
            labels={{
              free: pick(site.lang, { ru: 'свободно', uz: 'bo‘sh', en: 'free' }),
              taken: pick(site.lang, { ru: 'занято', uz: 'band', en: 'booked' }),
              pick: pick(site.lang, { ru: 'Выберите день и время — отправим бронь в Telegram.', uz: 'Kun va vaqtni tanlang — bronni Telegramga yuboramiz.', en: 'Pick a day and time and we’ll send the booking to Telegram.' }),
              book: pick(site.lang, { ru: 'Забронировать', uz: 'Bron qilish', en: 'Book' }),
              court: pick(site.lang, { ru: 'Корт', uz: 'Kort', en: 'Court' }),
            }}
          />
          <p className="court-book__note">{pick(site.lang, { ru: 'Занятость на табло — пример: актуальное расписание подтверждает администратор.', uz: 'Tablodagi bandlik — namuna: amaldagi jadvalni administrator tasdiqlaydi.', en: 'Availability shown is a sample; the front desk confirms the live schedule.' })}</p>
        </div>
      </div>
    </Sec>
  )
}

/** Цифры — табло счёта: тёмно-зелёная панель, жёлтые цифры в ячейках. */
function Stats({ section: s, site }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="court-score-sec">
      <div className="court-score" data-reveal="up">
        <div className="court-score__head">
          <span>{site.name}</span>
          <span>{s.title || pick(site.lang, { ru: 'Счёт', uz: 'Hisob', en: 'Score' })}</span>
        </div>
        <dl className="court-score__rows">
          {s.items.map((it, i) => (
            <div key={i} className="court-score__row">
              <dt>{it.label}</dt>
              <dd>
                <span data-count>{it.value}</span>
                {it.suffix ? <small>{it.suffix}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Sec>
  )
}

/** Как начать — шаги на линии корта, мяч катится от шага к шагу. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="court-steps-sec">
      <Head label={s.label} title={s.title} />
      <ol className="court-steps" data-reveal="fade">
        {s.items.map((it, i) => (
          <li key={i} className="court-step" style={{ ['--court-i' as string]: i }}>
            <span className="court-step__dot" aria-hidden="true" />
            <span className="court-step__no">{String(i + 1).padStart(2, '0')}</span>
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
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, stats: Stats, process: Process },
}
