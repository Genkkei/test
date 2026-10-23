import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Checklist } from './client'

/*
 * БАЛАНС — бухгалтерия в духе Pilot.com, Bench, Deloitte: спокойный тёмно-синий, один зелёный
 * «сходится», всё выровнено как в ведомости. Первый экран — карточка закрытия месяца, галочки
 * ставятся по очереди; услуги — таблица с колонками; цифры — показатели со спарклайном.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="audit-header">
        <a href="#top" className="audit-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <span className="audit-logo__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {site.name}
            </>
          )}
        </a>
        <nav className="audit-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="audit-header__side">
          {b.phone ? (
            <a className="audit-header__phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="audit-btn audit-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="audit-footer">
        <div className="audit-footer__grid">
          <div>
            <p className="audit-footer__name">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
            <p className="audit-footer__tag">{site.tagline}</p>
          </div>
          <table className="audit-footer__table">
            <tbody>
              {b.phone ? (
                <tr>
                  <th>{ui(site.lang, 'phone')}</th>
                  <td>
                    <a href={tel(b.phone)}>{b.phone}</a>
                  </td>
                </tr>
              ) : null}
              {b.email ? (
                <tr>
                  <th>{ui(site.lang, 'email')}</th>
                  <td>
                    <a href={`mailto:${b.email}`}>{b.email}</a>
                  </td>
                </tr>
              ) : null}
              {b.street ? (
                <tr>
                  <th>{ui(site.lang, 'address')}</th>
                  <td>{[b.street, b.city].filter(Boolean).join(', ')}</td>
                </tr>
              ) : null}
              {b.hours.length ? (
                <tr>
                  <th>{ui(site.lang, 'hours')}</th>
                  <td>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</td>
                </tr>
              ) : null}
              <tr>
                <th>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</th>
                <td className="audit-footer__social">
                  {b.socials.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                      {s.name}
                    </a>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="audit-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const month = pick(site.lang, { ru: 'Закрытие месяца', uz: 'Oyni yopish', en: 'Month-end close' })
  const rows = s.words.length ? s.words : [pick(site.lang, { ru: 'Сверка с банком', uz: 'Bank bilan solishtirish', en: 'Bank reconciliation' })]
  return (
    <section id={s.anchor || undefined} className="s s-hero audit-hero">
      <div className="audit-hero__inner">
        <div className="audit-hero__text">
          {s.eyebrow ? (
            <p className="audit-hero__eyebrow" data-reveal="fade">
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="audit-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="audit-hero__sub" data-reveal="up" data-delay="0.45">
              {s.subtitle}
            </p>
          ) : null}
          <div className="audit-hero__ctas" data-reveal="up" data-delay="0.6">
            {s.cta.label ? (
              <a className="audit-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="audit-btn audit-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        <div className="audit-ledger" data-reveal="up" data-delay="0.3">
          <div className="audit-ledger__head">
            <span>{month}</span>
            <span className="audit-ledger__tab">{site.business.legalName ? site.name : month}</span>
          </div>
          <Checklist items={rows} done={pick(site.lang, { ru: 'Всё сходится · отчёты сданы в срок', uz: 'Hammasi mos · hisobotlar o‘z vaqtida topshirildi', en: 'Everything balances · filed on time' })} />
          <svg className="audit-ledger__spark" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 52 L30 48 L60 50 L90 38 L120 41 L150 30 L180 33 L210 22 L240 25 L270 14 L300 10" pathLength={1} />
          </svg>
        </div>
      </div>
    </section>
  )
}

/** Услуги — ведомость: номер строки, услуга, что входит, срок и цена в своих колонках. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="audit-sheet-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="audit-sheet" role="table" aria-label={s.title}>
        <div className="audit-sheet__row audit-sheet__row--head" role="row">
          <span role="columnheader">№</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Услуга', uz: 'Xizmat', en: 'Service' })}</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Что входит', uz: 'Nimalar kiradi', en: 'What’s included' })}</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Формат', uz: 'Format', en: 'Format' })}</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Цена', uz: 'Narx', en: 'Price' })}</span>
        </div>
        {s.items.map((it, i) => (
          <div key={i} className="audit-sheet__row" role="row" data-reveal="up" data-delay={String(i * 0.05)}>
            <span role="cell" className="audit-sheet__no">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 role="cell" className="audit-sheet__name">
              {it.title}
            </h3>
            <p role="cell" className="audit-sheet__text">
              {it.text}
            </p>
            <span role="cell" className="audit-sheet__tag">
              {it.tag}
            </span>
            <span role="cell" className="audit-sheet__price">
              {it.price}
            </span>
          </div>
        ))}
      </div>
    </Sec>
  )
}

const SPARKS = ['M0 30 L20 26 L40 28 L60 18 L80 20 L100 8', 'M0 10 L20 14 L40 12 L60 20 L80 22 L100 28', 'M0 26 L20 22 L40 24 L60 14 L80 12 L100 6', 'M0 22 L20 18 L40 20 L60 16 L80 10 L100 12']

/** Показатели: значение, подпись и маленький спарклайн, который прорисовывается. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="audit-kpi-sec">
      <Head label={s.label} title={s.title} />
      <dl className="audit-kpis">
        {s.items.map((it, i) => (
          <div key={i} className="audit-kpi" data-reveal="up" data-delay={String(i * 0.08)}>
            <dt>{it.label}</dt>
            <dd>
              <span data-count>{it.value}</span>
              {it.suffix ? <span className="audit-kpi__suffix">{it.suffix}</span> : null}
            </dd>
            <svg viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true">
              <path d={SPARKS[i % SPARKS.length]} pathLength={1} />
            </svg>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

/** Тарифы — строки с точками до значения, как в счёте. */
function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="audit-plans-sec">
      <Head label={s.label} title={s.title} />
      <div className="audit-plans">
        {s.items.map((it, i) => (
          <article key={i} className={`audit-plan${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            {it.featured ? <p className="audit-plan__flag">{pick(site.lang, { ru: 'Выбирают чаще всего', uz: 'Eng ko‘p tanlanadi', en: 'Most popular' })}</p> : null}
            <h3>{it.name}</h3>
            <p className="audit-plan__price">
              {it.price}
              {it.period ? <span>{it.period}</span> : null}
            </p>
            <ul>
              {it.features.map((f, j) => (
                <li key={j}>
                  <span>{f}</span>
                  <i aria-hidden="true" />
                  <b aria-hidden="true">✓</b>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Sec>
  )
}

/** Этапы — месяц по неделям: каждая неделя — своя задача, полоса заполняется. */
function Process({ section: s, site }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="audit-month-sec">
      <Head label={s.label} title={s.title} />
      <ol className="audit-month">
        {s.items.map((it, i) => (
          <li key={i} className="audit-week" data-reveal="up" data-delay={String(i * 0.1)}>
            <p className="audit-week__when">
              {pick(site.lang, { ru: 'Шаг', uz: 'Qadam', en: 'Step' })} {i + 1}
            </p>
            <span className="audit-week__bar" aria-hidden="true" />
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
  sections: { hero: Hero, services: Services, stats: Stats, pricing: Pricing, process: Process },
}
