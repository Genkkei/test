import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { SizeBoard, Ticket, TiltCup } from './client'

/*
 * ОКОШКО — кофе навынос в духе Dutch Bros и Joe & the Juice: всё крупно и быстро. Огромный
 * гротеск, стакан с крышкой, табло «готовится №…», меню-плитки с переключателем S·M·L,
 * точки сети — список с пульсирующими маркерами, отзывы — чеки.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Cup({ className = '', label }: { className?: string; label: string }) {
  return (
    <svg className={`kiosk-cup ${className}`} viewBox="0 0 220 300" aria-hidden="true">
      <path d="M38 62 h144 l-6 -22 a10 10 0 0 0 -10 -8 h-112 a10 10 0 0 0 -10 8 z" fill="#1a1a1a" />
      <rect x="28" y="60" width="164" height="18" rx="9" fill="#1a1a1a" />
      <path d="M44 78 h132 l-16 196 a14 14 0 0 1 -14 12 h-72 a14 14 0 0 1 -14 -12 z" fill="#fff" stroke="#1a1a1a" strokeWidth="6" />
      <path d="M50 140 h120 l-6 74 h-108 z" fill="currentColor" />
      <text x="110" y="188" textAnchor="middle" fill="#fff" fontSize="26" fontFamily="var(--font-display)">
        {label}
      </text>
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="kiosk-header">
        <a href="#top" className="kiosk-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          {site.name}
            </>
          )}
        </a>
        <nav className="kiosk-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="kiosk-header__side">
          {b.hours[0] ? <span className="kiosk-open">● {humanHours(b.hours[0], site.lang)}</span> : null}
          {site.nav.cta.label ? (
            <a className="kiosk-btn kiosk-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="kiosk-footer">
        <p className="kiosk-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="kiosk-footer__cols">
          <p>{site.tagline}</p>
          <p>
            <b>{ui(site.lang, 'address')}</b>
            {[b.street, b.city].filter(Boolean).join(', ')}
          </p>
          <p>
            <b>{ui(site.lang, 'phone')}</b>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
          </p>
          <p className="kiosk-footer__social">
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name} ↗
              </a>
            ))}
          </p>
        </div>
        <p className="kiosk-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero kiosk-hero">
      <div className="kiosk-hero__text">
        {s.eyebrow ? <p className="kiosk-hero__eyebrow">{s.eyebrow}</p> : null}
        <h1 className="kiosk-hero__title">
          <span data-split="words">{s.title || site.name}</span>
        </h1>
        {s.subtitle ? <p className="kiosk-hero__sub kiosk-in">{s.subtitle}</p> : null}
        <div className="kiosk-hero__ctas kiosk-in" style={{ ['--d' as string]: '.7s' }}>
          {s.cta.label ? (
            <a className="kiosk-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label} →
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="kiosk-btn kiosk-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="kiosk-hero__visual">
        <span className="kiosk-blob" aria-hidden="true" />
        <TiltCup>
          <Cup label={site.name} />
        </TiltCup>
        <Ticket label={pick(site.lang, { ru: 'готовится', uz: 'tayyorlanmoqda', en: 'now brewing' })} />
      </div>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee kiosk-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={26} sep="✺" />
    </section>
  )
}

function Menu({ section: s, site }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="kiosk-menu-sec">
      <Head label={s.label} title={s.title} />
      <SizeBoard
        groups={s.groups}
        sizes={[pick(site.lang, { ru: '250 мл', uz: '250 ml', en: '250 ml' }), pick(site.lang, { ru: '350 мл', uz: '350 ml', en: '350 ml' }), pick(site.lang, { ru: '450 мл', uz: '450 ml', en: '450 ml' })]}
        orderHref={site.nav.cta.href || '#contact'}
        orderLabel={pick(site.lang, { ru: 'Заказать', uz: 'Buyurtma', en: 'Order' })}
      />
    </Sec>
  )
}

function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="kiosk-spots-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? <p className="s__intro">{s.intro}</p> : null}
      </Head>
      <div className="kiosk-spots">
        <div className="kiosk-map" aria-hidden="true">
          {s.items.map((_, i) => (
            <span key={i} className="kiosk-map__pin" style={{ left: `${[22, 64, 40, 78, 30, 55, 14, 70][i % 8]}%`, top: `${[30, 22, 58, 62, 80, 42, 60, 84][i % 8]}%`, ['--d' as string]: `${i * 0.35}s` }} />
          ))}
        </div>
        <ol className="kiosk-spots__list">
          {s.items.map((it, i) => (
            <li key={i} data-reveal="right" data-delay={String(i * 0.06)}>
              <span className="kiosk-spots__n">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{it.title}</h3>
                {it.text ? <p>{it.text}</p> : null}
              </div>
              {it.tag || it.price ? <span className="kiosk-spots__tag">{it.tag || it.price}</span> : null}
            </li>
          ))}
        </ol>
      </div>
      <p className="kiosk-spots__hint">{pick(site.lang, { ru: 'Заказ можно забрать на любой точке сети', uz: 'Buyurtmani tarmoqning istalgan nuqtasidan olish mumkin', en: 'Pick up your order at any spot in the chain' })}</p>
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="kiosk-steps-sec">
      <Head label={s.label} title={s.title} />
      <ol className="kiosk-steps">
        {s.items.map((it, i) => (
          <li key={i} data-reveal="up" data-delay={String(i * 0.1)}>
            <span className="kiosk-steps__big">{i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="kiosk-stats-sec">
      <dl className="kiosk-stats">
        {s.items.map((it, i) => (
          <div key={i} className="kiosk-stat" data-reveal="scale" data-delay={String(i * 0.08)}>
            <dd>
              <span data-count>{it.value}</span>
              <small>{it.suffix}</small>
            </dd>
            <dt>{it.label}</dt>
          </div>
        ))}
      </dl>
    </Sec>
  )
}

function Testimonials({ section: s, site }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="kiosk-receipts-sec">
      <Head label={s.label} title={s.title} />
      <div className="kiosk-receipts">
        {s.items.map((it, i) => (
          <figure key={i} className="kiosk-receipt" data-reveal="up" data-delay={String(i * 0.1)}>
            <p className="kiosk-receipt__head">
              <span>{site.name}</span>
              <span>#{String(1042 + i * 17)}</span>
            </p>
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              — {it.author}
              {it.role ? `, ${it.role}` : ''}
            </figcaption>
            <span className="kiosk-receipt__bars" aria-hidden="true" />
          </figure>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, menu: Menu, services: Services, process: Process, stats: Stats, testimonials: Testimonials },
}
