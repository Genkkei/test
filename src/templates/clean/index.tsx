import type { Site } from '@/lib/schema'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { BeforeAfter, Bubbles } from './client'
import { Room } from './room'

/*
 * БЛЕСК — клининг в духе Handy, Grove, Mr. Clean: мятный и белый, мыльные пузыри, которые лопаются
 * от курсора, и «до/после» с ручкой. Этапы проявляются из-под запотевшего стекла, как после стяжки.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Sparkle({ className = 'clean-sparkle' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.5c.6 5.2 2.3 8 10.5 10.5-8.2 2.5-9.9 5.3-10.5 10.5C11.4 17.3 9.7 14.5 1.5 12 9.7 9.5 11.4 6.7 12 1.5Z" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="clean-header">
        <a href="#top" className="clean-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="clean-logo__drop" aria-hidden="true" />
          {site.name}
        </a>
        <nav className="clean-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="clean-header__side">
          {b.phone ? (
            <a className="clean-header__phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="clean-btn clean-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="clean-footer">
        <div className="clean-footer__wave" aria-hidden="true" />
        <div className="clean-footer__inner">
          <div>
            <p className="clean-footer__name">
              {site.name} <Sparkle />
            </p>
            <p className="clean-footer__tag">{site.tagline}</p>
          </div>
          <ul className="clean-footer__facts">
            {b.phone ? (
              <li>
                <small>{ui(site.lang, 'phone')}</small>
                <a href={tel(b.phone)}>{b.phone}</a>
              </li>
            ) : null}
            {b.hours.length ? (
              <li>
                <small>{ui(site.lang, 'hours')}</small>
                {b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}
              </li>
            ) : null}
            {b.street ? (
              <li>
                <small>{ui(site.lang, 'address')}</small>
                {[b.street, b.city].filter(Boolean).join(', ')}
              </li>
            ) : null}
            <li>
              <small>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</small>
              <span className="clean-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </span>
            </li>
          </ul>
        </div>
        <div className="clean-footer__bottom">
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
  return (
    <section id={s.anchor || undefined} className="s s-hero clean-hero">
      <Bubbles />
      <div className="clean-hero__inner">
        <div className="clean-hero__text">
          {s.eyebrow ? (
            <p className="clean-hero__eyebrow" data-reveal="fade">
              <Sparkle /> {s.eyebrow}
            </p>
          ) : null}
          <h1 className="clean-hero__title">
            <span data-split="words">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="clean-hero__sub" data-reveal="up" data-delay="0.45">
              {s.subtitle}
            </p>
          ) : null}
          <div className="clean-hero__ctas" data-reveal="up" data-delay="0.6">
            {s.cta.label ? (
              <a className="clean-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="clean-btn clean-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          {s.words.length ? (
            <ul className="clean-hero__pills" data-reveal="up" data-delay="0.75">
              {s.words.map((w, i) => (
                <li key={i}>✓ {w}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="clean-hero__ba" data-reveal="scale" data-delay="0.3">
          <BeforeAfter
            before={<Room dirty />}
            after={<Room />}
            labelBefore={pick(site.lang, { ru: 'До', uz: 'Oldin', en: 'Before' })}
            labelAfter={pick(site.lang, { ru: 'После', uz: 'Keyin', en: 'After' })}
            hint={pick(site.lang, { ru: 'Сдвиньте, чтобы сравнить до и после', uz: 'Oldin va keyinni solishtirish uchun suring', en: 'Drag to compare before and after' })}
          />
        </div>
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee clean-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={42} sep="✦" />
    </section>
  )
}

/** Услуги — карточки комнат: при наведении по карточке пробегает блеск и вспыхивают искры. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="clean-rooms-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="clean-rooms">
        {s.items.map((it, i) => (
          <li key={i} className="clean-room" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <Sparkle className="clean-sparkle clean-room__s1" />
            <Sparkle className="clean-sparkle clean-room__s2" />
            {it.tag ? <span className="clean-room__tag">{it.tag}</span> : null}
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
            {it.price ? <p className="clean-room__price">{it.price}</p> : null}
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Этапы — карточки под запотевшим стеклом: при появлении стяжка проводит по ним полосой. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="clean-steps-sec">
      <Head label={s.label} title={s.title} />
      <ol className="clean-steps">
        {s.items.map((it, i) => (
          <li key={i} className="clean-step" data-reveal="fade" data-delay={String(i * 0.18)}>
            <span className="clean-step__no">{i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
            <span className="clean-step__fog" aria-hidden="true" />
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="clean-stats-sec">
      <Head label={s.label} title={s.title} />
      <dl className="clean-stats">
        {s.items.map((it, i) => (
          <div key={i} className="clean-stat" data-reveal="scale" data-delay={String(i * 0.08)} style={{ ['--f' as string]: `${5 + i * 1.3}s` }}>
            <dd>
              <span data-count>{it.value}</span>
              {it.suffix ? <span className="clean-stat__suffix">{it.suffix}</span> : null}
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

function Pricing({ section: s, site }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="clean-plans-sec">
      <Head label={s.label} title={s.title} center />
      <div className="clean-plans">
        {s.items.map((it, i) => (
          <article key={i} className={`clean-plan${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            {it.featured ? <p className="clean-plan__flag">{pick(site.lang, { ru: 'Чаще заказывают', uz: 'Ko‘proq buyurtma qilinadi', en: 'Most booked' })}</p> : null}
            <h3>{it.name}</h3>
            <p className="clean-plan__price">
              {it.price}
              {it.period ? <span>{it.period}</span> : null}
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
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, process: Process, stats: Stats, pricing: Pricing },
}
