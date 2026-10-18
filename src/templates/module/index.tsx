import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { pick, ui } from '@/lib/i18n'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Configurator } from './client'
import { parseRates } from './rates'
import { FurnitureObject, kindOf } from '../oak/objects'

/* МОДУЛЬ — IKEA, USM Haller, Tylko: инструкция по сборке как язык сайта. Жёлтый на белом,
   сетка миллиметровки, размерные линии, жирный гротеск. Главное — конфигуратор шкафа. */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

const orderHref = (site: Site) => {
  if (site.leads.enabled) return '#order'
  const c = site.sections.find((s) => s.type === 'contact')
  return c?.anchor ? `#${c.anchor}` : '#top'
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="module-header">
        <a href="#top" className="module-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.name}
        </a>
        <nav className="module-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <i>{String(i + 1).padStart(2, '0')}</i>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="module-header__side">
          {b.phone ? (
            <a className="module-phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="module-cta" href={site.nav.cta.href || '#'}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="module-footer">
        <div className="module-footer__top">
          <p className="module-footer__word">{site.name}</p>
          <p className="module-footer__tag">{site.tagline}</p>
        </div>
        <div className="module-footer__grid">
          <div>
            <p className="module-footer__h">{pick(site.lang, { ru: 'Шоурум и цех', uz: 'Shou-rum va sex', en: 'Showroom & workshop' })}</p>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <p className="module-footer__h">{pick(site.lang, { ru: 'Замер и расчёт', uz: 'O‘lchov va hisob', en: 'Measuring & quote' })}</p>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <p className="module-footer__h">{pick(site.lang, { ru: 'Мы в сети', uz: 'Biz tarmoqda', en: 'Online' })}</p>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <p className="module-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

/** Первый экран: шкаф собирается из модулей — короба въезжают в каркас по очереди. */
function Hero({ section: s, site }: SectionProps<'hero'>) {
  const [first, ...rest] = (s.title || site.name).split(' ')
  return (
    <section id={s.anchor || undefined} className="s s-hero module-hero">
      <div className="module-hero__text">
        {s.eyebrow ? <p className="module-eyebrow">{s.eyebrow}</p> : null}
        <h1 className="module-hero__title">
          <mark>{first}</mark> {rest.join(' ')}
        </h1>
        {s.subtitle ? <p className="module-hero__sub">{s.subtitle}</p> : null}
        <div className="module-hero__ctas">
          {s.cta.label ? (
            <a className="btn btn--primary" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="btn btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
        {s.words.length ? (
          <ul className="module-hero__words">
            {s.words.map((w, i) => (
              <li key={w}>
                <b>{String.fromCharCode(65 + i)}</b> {w}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="module-build" aria-hidden="true">
        <div className="module-build__frame">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`module-build__box module-build__box--${i}`} style={{ ['--module-i' as string]: i }}>
              <em>{String.fromCharCode(65 + i)}</em>
            </span>
          ))}
        </div>
        <span className="module-build__dim module-build__dim--w">2400</span>
        <span className="module-build__dim module-build__dim--h">2600</span>
      </div>
    </section>
  )
}

function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  const L = (ru: string, uz: string, en: string) => pick(site.lang, { ru, uz, en })
  return (
    <Sec id={s.anchor} type="pricing" className="module-calc">
      <Head label={s.label} title={s.title} />
      <Configurator
        rates={parseRates(s.items)}
        lang={site.lang}
        href={orderHref(site)}
        labels={{
          width: L('Ширина', 'Kenglik', 'Width'),
          height: L('Высота', 'Balandlik', 'Height'),
          sections: L('Секций', 'Seksiyalar', 'Sections'),
          doors: L('Фасад', 'Fasad', 'Doors'),
          extras: L('Дополнения', 'Qo‘shimchalar', 'Extras'),
          total: L('Ориентировочно', 'Taxminan', 'Estimate'),
          term: L('Изготовление', 'Tayyorlash', 'Lead time'),
          days: L('дней', 'kun', 'days'),
          cm: L('см', 'sm', 'cm'),
          approx: '≈',
          order: L('Вызвать замерщика', 'O‘lchovchini chaqirish', 'Book a measurement'),
          sum: L('сум', 'so‘m', 'UZS'),
        }}
      />
      <p className="module-calc__note">
        {L(
          'Расчёт ориентировочный: точную цену называем после бесплатного замера, она фиксируется в договоре.',
          'Hisob taxminiy: aniq narxni bepul o‘lchovdan keyin aytamiz, u shartnomada qayd etiladi.',
          'This is an estimate: we confirm the exact price after a free measurement and fix it in the contract.',
        )}
      </p>
    </Sec>
  )
}

/** Что делаем: плитки-«детали» с номером артикула, предмет нарисован по названию. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="module-parts">
      <Head label={s.label} title={s.title}>
        {s.intro ? <p className="s__intro">{s.intro}</p> : null}
      </Head>
      <ul className="module-parts__grid">
        {s.items.map((it, i) => (
          <li key={i} className="module-part" data-reveal="up" data-delay={String((i % 3) * 0.07)}>
            <span className="module-part__no">{String.fromCharCode(65 + (i % 26))}</span>
            <FurnitureObject kind={kindOf(it.tag, it.title)} body={site.theme.accent} wood={site.theme.fg} line={site.theme.fg} className="module-part__obj" />
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            <div className="module-part__foot">
              {it.price ? <b>{it.price}</b> : null}
              {it.tag ? <span>{it.tag}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Проекты: карточки с паспортом — размеры и материалы моноширинным, как в спецификации. */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="module-projects">
      <Head label={s.label} title={s.title} />
      <ul className="module-projects__grid">
        {s.items.map((it, i) => (
          <li key={i} data-reveal="up" data-delay={String((i % 2) * 0.08)}>
            <figure className="module-projects__media">
              <Media src={it.image} alt={it.title} seed={`${site.slug}-p${i}`} colors={['#e9e8e2', '#ffcc00', '#111111', '#c9c7bd', '#ffffff']} kind={art} className="media" />
              <figcaption>{String(i + 1).padStart(3, '0')}</figcaption>
            </figure>
            <h3>{it.title}</h3>
            <p className="module-projects__meta">{[it.category, it.year].filter(Boolean).join(' / ')}</p>
            {it.text ? <p className="module-projects__text">{it.text}</p> : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Как работаем: шаги инструкции — номер в квадрате, стрелка к следующему. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="module-steps">
      <Head label={s.label} title={s.title} />
      <ol className="module-steps__list">
        {s.items.map((it, i) => (
          <li key={i} data-reveal="up" data-delay={String(i * 0.07)}>
            <span className="module-steps__no">{i + 1}</span>
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
  sections: { hero: Hero, pricing: Pricing, services: Services, works: Works, process: Process },
}
