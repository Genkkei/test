import './style.css'
import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Cursor, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { DevelopCanvas, FrameCounter } from './client'

/*
 * ПРОЯВКА — тёмная комната фотографа: красный фонарь, проявляющийся отпечаток,
 * работы как контактный лист с пометкой восковым карандашом, галерея как плёнка
 * с перфорацией, моноширинные подписи кадров.
 */

const pad = (n: number) => String(n).padStart(2, '0')

function Perforation() {
  return <div className="dark-perf" aria-hidden="true" />
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <Cursor className="cursor dark-cursor" />
      <header className="dark-header">
        <a href="#top" className="dark-logo" aria-label={`${site.name} — наверх`}>
          <i aria-hidden="true" />
          {site.name}
        </a>
        <nav className="dark-nav" aria-label="Разделы">
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <small>{pad(i + 1)}</small>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="dark-header__side">
          <FrameCounter />
          {site.nav.cta.label ? (
            <a className="dark-link" href={site.nav.cta.href}>
              {site.nav.cta.label} ↗
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="dark-footer">
        <Perforation />
        <div className="dark-footer__inner">
          <p className="dark-footer__lead" data-split="lines">
            {site.tagline || site.name}
          </p>
          <dl className="dark-footer__facts">
            {b.phone ? (
              <div>
                <dt>Тел.</dt>
                <dd>
                  <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a>
                </dd>
              </div>
            ) : null}
            {b.email ? (
              <div>
                <dt>Почта</dt>
                <dd>
                  <a href={`mailto:${b.email}`}>{b.email}</a>
                </dd>
              </div>
            ) : null}
            {b.street ? (
              <div>
                <dt>Студия</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
              </div>
            ) : null}
            <div>
              <dt>Сети</dt>
              <dd className="dark-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div className="dark-footer__edge">
          <span>{site.name.toUpperCase()} 400</span>
          <span>▸ 36</span>
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">▲ В начало</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero dark-hero">
      <DevelopCanvas colors={[t.bg, t.accent, t.fg, t.muted]} />
      <Perforation />
      <div className="dark-hero__edge dark-hero__edge--top" aria-hidden="true">
        <span>{site.name.toUpperCase()} 400TX</span>
        <span>▸ 24</span>
        <span>SAFELIGHT ON</span>
        <span>▸ 25</span>
      </div>
      <div className="dark-hero__inner">
        {s.eyebrow ? (
          <p className="dark-hero__eyebrow dark-fade" style={{ ['--d' as string]: '0.2s' }}>
            <i aria-hidden="true" /> {s.eyebrow}
          </p>
        ) : null}
        <h1 className="dark-hero__title" data-split="words">
          {s.title || site.name}
        </h1>
        <div className="dark-hero__foot">
          {s.subtitle ? (
            <p className="dark-hero__sub dark-fade" style={{ ['--d' as string]: '0.8s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="dark-hero__ctas dark-fade" style={{ ['--d' as string]: '1s' }}>
            {s.cta.label ? (
              <a className="dark-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="dark-btn dark-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        {s.words.length ? (
          <ul className="dark-hero__tags dark-fade" style={{ ['--d' as string]: '1.2s' }}>
            {s.words.map((w, i) => (
              <li key={w}>
                <small>{pad(i + 1)}</small>
                {w}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Perforation />
    </section>
  )
}

/** Контактный лист: кадры сеткой, первый обведён «восковым карандашом». */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="dark-sheet-sec">
      <Head label={s.label} title={s.title} />
      <div className="dark-sheet">
        <div className="dark-sheet__edge" aria-hidden="true">
          <span>CONTACT SHEET · {site.name.toUpperCase()}</span>
          <span>{s.items.length} FRAMES</span>
        </div>
        <div className="dark-sheet__grid">
          {s.items.map((it, i) => {
            const body = (
              <>
                <figure className="dark-sheet__media">
                  <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
                  {i === 0 ? <span className="dark-sheet__mark" aria-hidden="true" /> : null}
                </figure>
                <div className="dark-sheet__cap">
                  <span className="dark-sheet__no">
                    {pad(i + 1)}A ▸
                  </span>
                  <h3>{it.title}</h3>
                  <p className="dark-sheet__meta">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
                  {it.text ? <p className="dark-sheet__text">{it.text}</p> : null}
                </div>
              </>
            )
            return it.href ? (
              <a key={i} href={it.href} className="dark-sheet__item" data-reveal="fade" data-delay={String((i % 3) * 0.08)} data-cursor="Смотреть">
                {body}
              </a>
            ) : (
              <article key={i} className="dark-sheet__item" data-reveal="fade" data-delay={String((i % 3) * 0.08)}>
                {body}
              </article>
            )
          })}
        </div>
      </div>
    </Sec>
  )
}

/** Галерея — плёнка, листается вбок; на телефоне пальцем, на компьютере колесом через Lenis/тачпад. */
function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <section id={s.anchor || undefined} className="s s-gallery dark-film-sec">
      <div className="s__inner">
        <Head label={s.label} title={s.title} />
      </div>
      <div className="dark-film" data-lenis-prevent-wheel>
        <Perforation />
        <div className="dark-film__track" tabIndex={0} aria-label="Плёнка: листайте вбок">
          {s.items.map((it, i) => (
            <figure key={i} className="dark-film__frame">
              <Media src={it.image} alt={it.caption || `${site.name} — кадр ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
              <figcaption>
                <span>{pad(i + 1)}A</span>
                {it.caption}
              </figcaption>
            </figure>
          ))}
        </div>
        <Perforation />
      </div>
    </section>
  )
}

function Pricing({ section: s }: SectionProps<'pricing'>) {
  return (
    <Sec id={s.anchor} type="pricing" className="dark-packs-sec">
      <Head label={s.label} title={s.title} />
      <div className="dark-packs">
        {s.items.map((it, i) => (
          <article key={i} className={`dark-pack${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            <div className="dark-pack__top">
              <span>PKG {pad(i + 1)}</span>
              {it.featured ? <span className="dark-pack__flag">● Чаще выбирают</span> : null}
            </div>
            <h3>{it.name}</h3>
            <p className="dark-pack__price">
              {it.price}
              {it.period ? <small>{it.period}</small> : null}
            </p>
            <ul>
              {it.features.map((f, j) => (
                <li key={j}>
                  <span>{pad(j + 1)}</span>
                  {f}
                </li>
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
  sections: { hero: Hero, works: Works, gallery: Gallery, pricing: Pricing },
}
