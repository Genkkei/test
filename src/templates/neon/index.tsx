import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Clock, Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Rotator, TicketMachine } from './client'

/*
 * НЕОН — рамен-бар в духе Ichiran и ночного Синдзюку: тёмная улица, вывеска, которая
 * мигает при включении, вертикальная катакана, пар над миской, меню как автомат с билетами.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Миска с паром: пар — три размытых столба, поднимаются и тают (только transform/opacity). */
function Bowl() {
  return (
    <div className="neon-bowl" aria-hidden="true">
      <div className="neon-steam">
        <i />
        <i />
        <i />
      </div>
      <svg viewBox="0 0 320 200">
        <defs>
          <linearGradient id="neon-broth" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#f6c37a" />
            <stop offset="1" stopColor="#c47a2e" />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="62" rx="146" ry="34" fill="url(#neon-broth)" />
        <path d="M60 52 C 100 40 130 70 170 56 S 240 44 270 60" fill="none" stroke="#fff3d6" strokeWidth="5" strokeLinecap="round" opacity=".85" />
        <path d="M50 66 C 90 56 140 82 180 66 S 250 58 280 70" fill="none" stroke="#fff3d6" strokeWidth="5" strokeLinecap="round" opacity=".7" />
        <circle cx="110" cy="58" r="18" fill="#fff" />
        <circle cx="110" cy="58" r="9" fill="#ffae1a" />
        <rect x="190" y="38" width="56" height="30" rx="6" fill="#b5543c" transform="rotate(-8 218 53)" />
        <rect x="228" y="48" width="12" height="38" fill="#1e3b2a" transform="rotate(14 234 66)" />
        <path d="M14 62 C 24 150 96 190 160 190 C 224 190 296 150 306 62" fill="currentColor" />
        <path d="M40 120 h240" stroke="var(--bg)" strokeWidth="4" strokeDasharray="12 10" />
        <line x1="250" y1="0" x2="200" y2="70" stroke="#e8d3a9" strokeWidth="6" strokeLinecap="round" />
        <line x1="274" y1="6" x2="214" y2="72" stroke="#e8d3a9" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="neon-header">
        <a href="#top" className="neon-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <span className="neon-logo__jp" aria-hidden="true">
            ラ
          </span>
          {site.name}
        </a>
        <nav className="neon-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="neon-header__side">
          <span className="neon-clock">
            <Clock lang={site.lang} />
          </span>
          {site.nav.cta.label ? (
            <a className="neon-btn neon-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="neon-footer">
        <p className="neon-footer__sign" aria-hidden="true">
          {site.name}
        </p>
        <div className="neon-footer__grid">
          <p className="neon-footer__tag">{site.tagline}</p>
          {b.street ? (
            <p>
              <small>{ui(site.lang, 'address')}</small>
              {[b.street, b.city].filter(Boolean).join(', ')}
            </p>
          ) : null}
          {b.hours.length ? (
            <p>
              <small>{ui(site.lang, 'hours')}</small>
              {b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}
            </p>
          ) : null}
          <p>
            <small>{ui(site.lang, 'phone')}</small>
            {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
          </p>
          <p className="neon-footer__social">
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name} ↗
              </a>
            ))}
          </p>
        </div>
        <p className="neon-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span lang="ja">いただきます</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero neon-hero">
      <div className="neon-hero__glow" aria-hidden="true" />
      <p className="neon-hero__kana" aria-hidden="true" lang="ja">
        ラーメン
      </p>
      <div className="neon-hero__inner">
        {s.eyebrow ? <p className="neon-hero__eyebrow neon-in">{s.eyebrow}</p> : null}
        <h1 className="neon-hero__title">
          <span className="neon-sign">{s.title || site.name}</span>
        </h1>
        {s.words.length ? (
          <p className="neon-hero__rot neon-in" style={{ ['--d' as string]: '1.2s' }}>
            <span>{pick(site.lang, { ru: 'Сегодня в котле:', uz: 'Bugun qozonda:', en: 'In the pot tonight:' })}</span> <Rotator words={s.words} />
          </p>
        ) : null}
        {s.subtitle ? (
          <p className="neon-hero__sub neon-in" style={{ ['--d' as string]: '1.35s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="neon-hero__ctas neon-in" style={{ ['--d' as string]: '1.5s' }}>
          {s.cta.label ? (
            <a className="neon-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="neon-btn neon-btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <Bowl />
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee neon-ticker" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={30} sep="◆" />
    </section>
  )
}

function Menu({ section: s, site }: SectionProps<'menu'>) {
  return (
    <Sec id={s.anchor} type="menu" className="neon-menu-sec">
      <Head label={s.label} title={s.title} />
      <TicketMachine
        groups={s.groups}
        labels={{
          machine: pick(site.lang, { ru: 'Автомат', uz: 'Avtomat', en: 'Machine' }),
          ticket: pick(site.lang, { ru: 'Билет', uz: 'Chipta', en: 'Ticket' }),
          hint: pick(site.lang, { ru: 'Нажмите на блюдо — автомат напечатает билет. Покажите его у стойки.', uz: 'Taomni bosing — avtomat chipta chiqaradi. Uni peshtaxtada ko‘rsating.', en: 'Tap a dish and the machine prints a ticket. Show it at the counter.' }),
          take: pick(site.lang, { ru: 'Заберите билет', uz: 'Chiptani oling', en: 'Take your ticket' }),
        }}
      />
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="neon-steps-sec">
      <Head label={s.label} title={s.title} />
      <ol className="neon-steps">
        {s.items.map((it, i) => (
          <li key={i} className="neon-step" data-reveal="up" data-delay={String(i * 0.1)}>
            <span className="neon-step__no" lang="ja">
              {['一', '二', '三', '四', '五', '六'][i] ?? i + 1}
            </span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  return (
    <Sec id={s.anchor} type="gallery" className="neon-gallery-sec">
      <Head label={s.label} title={s.title} />
      <div className="neon-gallery">
        {s.items.map((it, i) => (
          <figure key={i} className="neon-gallery__item" data-reveal="clip" data-delay={String((i % 4) * 0.08)}>
            <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={i % 2 ? 'rings' : 'grid'} className="media" />
            {it.caption ? <figcaption>{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, menu: Menu, process: Process, gallery: Gallery },
}
