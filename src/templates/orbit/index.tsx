import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Terminal } from './client'

/*
 * КОД — школа программирования в духе Stripe Press, Linear и freeCodeCamp: тёмное полотно в точку,
 * моноширинный шрифт, терминал, который печатает на первом экране, курсы — объектами в коде,
 * программа — история коммитов, орбиты на фоне медленно вращаются.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
/** короткий «хэш коммита» из строки — одинаков на сервере и в браузере */
const hash = (s: string) => {
  let h = 5381
  for (const c of s) h = (h * 33) ^ c.charCodeAt(0)
  return (h >>> 0).toString(16).padStart(7, '0').slice(0, 7)
}
const q = (s: string) => JSON.stringify(s)

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="orbit-header">
        <a href="#top" className="orbit-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <span aria-hidden="true">{'{'}</span>
          {site.name}
          <span aria-hidden="true">{'}'}</span>
            </>
          )}
        </a>
        <nav className="orbit-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <small>{String(i + 1).padStart(2, '0')}</small>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="orbit-header__side">
          {site.nav.cta.label ? (
            <a className="orbit-btn orbit-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="orbit-footer">
        <div className="orbit-footer__inner">
          <p className="orbit-footer__word" aria-hidden="true">
            {'<'}
            {site.name}
            {' />'}
          </p>
          <pre className="orbit-footer__code">
            <code>
              <span className="tk-k">export const</span> <span className="tk-v">contact</span> = {'{'}
              {'\n'}
              {b.street ? (
                <>
                  {'  '}
                  <span className="tk-p">{pick(site.lang, { ru: 'address', uz: 'manzil', en: 'address' })}</span>: <span className="tk-s">{q([b.street, b.city].filter(Boolean).join(', '))}</span>,{'\n'}
                </>
              ) : null}
              {b.hours.length ? (
                <>
                  {'  '}
                  <span className="tk-p">{pick(site.lang, { ru: 'hours', uz: 'vaqt', en: 'hours' })}</span>: <span className="tk-s">{q(b.hours.map((h) => humanHours(h, site.lang)).join(', '))}</span>,{'\n'}
                </>
              ) : null}
              {b.phone ? (
                <>
                  {'  '}
                  <span className="tk-p">phone</span>: <a className="tk-s" href={tel(b.phone)}>{q(b.phone)}</a>,{'\n'}
                </>
              ) : null}
              {b.email ? (
                <>
                  {'  '}
                  <span className="tk-p">email</span>: <a className="tk-s" href={`mailto:${b.email}`}>{q(b.email)}</a>,{'\n'}
                </>
              ) : null}
              {'}'}
            </code>
          </pre>
          <ul className="orbit-footer__social">
            {b.socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="orbit-footer__legal">
            <span>
              © {new Date().getFullYear()} {b.legalName || site.name}
            </span>
            <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero orbit-hero">
      <div className="orbit-rings" aria-hidden="true">
        <i />
        <i />
        <i />
        <b />
      </div>
      <div className="orbit-hero__inner">
        <div className="orbit-hero__copy">
          {s.eyebrow ? (
            <p className="orbit-eyebrow" data-reveal="fade">
              <span>//</span> {s.eyebrow}
            </p>
          ) : null}
          <h1 className="orbit-hero__title" data-split="words">
            {s.title || site.name}
          </h1>
          {s.subtitle ? (
            <p className="orbit-hero__sub" data-reveal="up" data-delay="0.45">
              {s.subtitle}
            </p>
          ) : null}
          <div className="orbit-hero__ctas" data-reveal="up" data-delay="0.6">
            {s.cta.label ? (
              <a className="orbit-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label} <span aria-hidden="true">→</span>
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="orbit-btn orbit-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        {s.words.length ? (
          <div className="orbit-term" data-reveal="scale" data-delay="0.3">
            <div className="orbit-term__bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>zsh — {site.slug}</span>
            </div>
            <Terminal lines={s.words} done={pick(site.lang, { ru: 'готово', uz: 'tayyor', en: 'done' })} />
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** Курсы — объекты в коде: название, срок и цена подсвечены как синтаксис. */
function Services({ section: s, site }: SectionProps<'services'>) {
  const k = {
    title: pick(site.lang, { ru: 'title', uz: 'nomi', en: 'title' }),
    length: pick(site.lang, { ru: 'duration', uz: 'muddat', en: 'duration' }),
    price: pick(site.lang, { ru: 'price', uz: 'narx', en: 'price' }),
  }
  return (
    <Sec id={s.anchor} type="services" className="orbit-courses-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="orbit-courses">
        {s.items.map((it, i) => (
          <article key={i} className="orbit-course" data-reveal="up" data-delay={String((i % 2) * 0.08)}>
            <p className="orbit-course__file">
              <i aria-hidden="true" />
              course-{String(i + 1).padStart(2, '0')}.ts
            </p>
            <h3 className="orbit-course__name">{it.title}</h3>
            <pre className="orbit-course__code" aria-hidden="true">
              <code>
                <span className="ln">1</span>
                <span className="tk-k">const</span> <span className="tk-v">course</span> = {'{'}
                {'\n'}
                <span className="ln">2</span>
                {'  '}
                <span className="tk-p">{k.title}</span>: <span className="tk-s">{q(it.title)}</span>,{'\n'}
                {it.tag ? (
                  <>
                    <span className="ln">3</span>
                    {'  '}
                    <span className="tk-p">{k.length}</span>: <span className="tk-s">{q(it.tag)}</span>,{'\n'}
                  </>
                ) : null}
                {it.price ? (
                  <>
                    <span className="ln">4</span>
                    {'  '}
                    <span className="tk-p">{k.price}</span>: <span className="tk-n">{q(it.price)}</span>,{'\n'}
                  </>
                ) : null}
                <span className="ln">5</span>
                {'}'}
              </code>
            </pre>
            {it.text ? (
              <p className="orbit-course__text">
                <span className="tk-c">{'// '}</span>
                {it.text}
              </p>
            ) : null}
            <div className="orbit-course__foot">
              {it.tag ? <span className="orbit-chip">{it.tag}</span> : null}
              {it.price ? <span className="orbit-course__price">{it.price}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </Sec>
  )
}

/** Программа — история коммитов: ветка, точки, хэши; точки загораются по очереди. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="orbit-log-sec">
      <Head label={s.label} title={s.title} />
      <ol className="orbit-log">
        {s.items.map((it, i) => (
          <li key={i} className="orbit-commit" data-reveal="left" data-delay={String(i * 0.12)}>
            <span className="orbit-commit__dot" aria-hidden="true" />
            <p className="orbit-commit__meta">
              <span className="tk-n">{hash(it.title + i)}</span> <span className="orbit-commit__branch">{i === s.items.length - 1 ? 'main' : `step-${i + 1}`}</span>
            </p>
            <h3>{it.title}</h3>
            <p className="orbit-commit__text">{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

/** Цифры — индикаторы прогресса в духе терминала. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="orbit-stats-sec">
      <Head label={s.label} title={s.title} />
      <dl className="orbit-stats">
        {s.items.map((it, i) => (
          <div key={i} className="orbit-stat" data-reveal="up" data-delay={String(i * 0.08)}>
            <dd>
              <span data-count>{it.value}</span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </dd>
            <span className="orbit-stat__bar" aria-hidden="true" style={{ ['--w' as string]: `${30 + ((i * 23) % 60)}%` }} />
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, process: Process, stats: Stats },
}
