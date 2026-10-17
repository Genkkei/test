import './style.css'
import type { Site } from '@/lib/schema'
import { MobileMenu, Marquee } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { RoastHeader, SteamCanvas, TiltShelf } from './client'

/* ОБЖАРКА — Blue Bottle, Onyx Coffee Lab, Sey: крафтовая бумага, один синий,
   узкий плакатный гротеск. Сорта — пачки на полке с этикеткой, путь зерна — штампы
   по маршруту, первый экран — синее окно с чашкой и живым паром. */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Bean({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="20" rx="12" ry="16" transform="rotate(30 20 20)" fill="currentColor" />
      <path d="M13 9c7 6 7 16 14 22" fill="none" stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" transform="rotate(2 20 20)" />
    </svg>
  )
}

function Cup() {
  return (
    <svg className="rs-cup" viewBox="0 0 320 200" aria-hidden="true">
      <ellipse cx="160" cy="176" rx="150" ry="20" fill="color-mix(in srgb, var(--bg) 92%, black)" />
      <ellipse cx="160" cy="170" rx="132" ry="15" fill="var(--bg)" />
      <path d="M62 52h196c0 0 4 92-34 112H96C58 144 62 52 62 52z" fill="var(--bg)" />
      <path d="M256 74c38-6 46 46 6 58" fill="none" stroke="var(--bg)" strokeWidth="14" strokeLinecap="round" />
      <ellipse cx="160" cy="52" rx="98" ry="16" fill="color-mix(in srgb, var(--fg) 82%, var(--accent))" />
      <ellipse cx="160" cy="49" rx="80" ry="10" fill="color-mix(in srgb, var(--fg) 60%, #b07a4a)" opacity=".7" />
      <path d="M120 49c18-6 42-6 66 0" stroke="#f3e6d2" strokeWidth="3" fill="none" opacity=".55" strokeLinecap="round" />
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <RoastHeader>
        <a href="#top" className="rs-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop')}`}>
          <Bean className="rs-logo__bean" />
          <span>{site.name}</span>
        </a>
        <nav className="rs-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="rs-header__side">
          {site.nav.cta.label ? (
            <a className="rs-btn rs-btn--blue rs-btn--sm" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </RoastHeader>
      <main id="top">{children}</main>
      <footer className="rs-footer">
        <div className="rs-footer__top">
          <div className="rs-stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path id="rs-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
              </defs>
              <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="60" cy="60" r="32" fill="none" stroke="currentColor" strokeWidth="1" />
              <text>
                <textPath href="#rs-ring">{`${site.name} · ${pick(site.lang, { ru: `обжарено в ${b.city || 'Ташкенте'}`, uz: `${b.city || 'Toshkent'}da qovurilgan`, en: `roasted in ${b.city || 'Tashkent'}` })} · ${b.founded || ''} · `}</textPath>
              </text>
            </svg>
            <Bean className="rs-stamp__bean" />
          </div>
          <p className="rs-footer__tag">{site.tagline}</p>
          <div className="rs-footer__cols">
            <div>
              <h3>{pick(site.lang, { ru: 'Кофейня', uz: 'Qahvaxona', en: 'Café' })}</h3>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
              {b.hours.map((h) => (
                <p key={h}>{humanHours(h, site.lang)}</p>
              ))}
            </div>
            <div>
              <h3>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</h3>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
              {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
            </div>
            <div>
              <h3>{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</h3>
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="rs-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <p className="rs-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero rs-hero">
      <div className="rs-hero__text">
        {s.eyebrow ? (
          <p className="rs-hero__eyebrow rs-rise" style={{ ['--d' as string]: '.1s' }}>
            <Bean className="rs-mini-bean" /> {s.eyebrow}
          </p>
        ) : null}
        <h1 className="rs-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="rs-hero__sub rs-rise" style={{ ['--d' as string]: '.45s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="rs-hero__ctas rs-rise" style={{ ['--d' as string]: '.6s' }}>
          {s.cta.label ? (
            <a className="rs-btn rs-btn--blue" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="rs-btn rs-btn--line" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="rs-hero__window">
        <SteamCanvas color={site.theme.bg} />
        <Cup />
        {s.words.length ? (
          <ul className="rs-hero__notes" aria-label={pick(site.lang, { ru: 'Ноты вкуса', uz: 'Ta’m notalari', en: 'Tasting notes' })}>
            {s.words.map((w, i) => (
              <li key={w} style={{ ['--i' as string]: i }}>
                {w}
              </li>
            ))}
          </ul>
        ) : null}
        <span className="rs-hero__badge rs-rise" style={{ ['--d' as string]: '.8s' }}>
          {pick(site.lang, { ru: 'обжарка', uz: 'qovurish', en: 'roasted' })}
          <br />
          {pick(site.lang, { ru: 'каждый вторник', uz: 'har seshanba', en: 'every Tuesday' })}
        </span>
      </div>
    </section>
  )
}

const BAG_TONES = ['#2f5bd3', '#c9572f', '#5f6b3a', '#d8a531', '#2b1d14', '#8a3b5c']

function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="rs-shelf-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <TiltShelf>
        {s.items.map((it, i) => {
          const notes = it.text.split(/[,;·]/).map((n) => n.trim()).filter(Boolean)
          return (
            <article key={i} className="rs-bag" data-reveal="up" data-delay={String((i % 3) * 0.08)} style={{ ['--tone' as string]: BAG_TONES[i % BAG_TONES.length] }}>
              <div className="rs-bag__body">
                <span className="rs-bag__crimp" aria-hidden="true" />
                <div className="rs-bag__label">
                  <Bean className="rs-bag__bean" />
                  <p className="rs-bag__no">№ {String(i + 1).padStart(3, '0')}</p>
                  <h3 className="rs-bag__name">{it.title}</h3>
                  {it.tag ? <p className="rs-bag__origin">{it.tag}</p> : null}
                  <ul className="rs-bag__notes">
                    {notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {it.price ? <p className="rs-bag__price">{it.price}</p> : null}
            </article>
          )
        })}
      </TiltShelf>
    </Sec>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="rs-route-sec">
      <Head label={s.label} title={s.title} />
      <ol className="rs-route">
        {s.items.map((it, i) => (
          <li key={i} className="rs-route__step" data-reveal="up" data-delay={String(i * 0.1)}>
            <span className="rs-route__stamp">
              <b>{String(i + 1).padStart(2, '0')}</b>
            </span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </Sec>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee rs-tape" aria-label={s.title || pick(site.lang, { ru: 'О кофе', uz: 'Qahva haqida', en: 'About the coffee' })}>
      <Marquee items={s.items} speed={34} sep="●" />
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, process: Process, marquee: MarqueeSec },
}
