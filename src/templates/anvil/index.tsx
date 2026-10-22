import type { Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { ForgeCanvas } from './client'

/*
 * НАКОВАЛЬНЯ — кузница художественной ковки. Тёмный горн во весь первый экран (шейдер:
 * жар и искры), заголовок светится как металл на наковальне и остывает к краям.
 * Каталог изделий — пластины с клеймом и силуэтом изделия, этапы — шкала цветов каления
 * от вишнёвого до белого: чем дальше шаг, тем «горячее» точка.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Силуэт изделия по названию — на любом из трёх языков. */
function Glyph({ title }: { title: string }) {
  const t = title.toLowerCase()
  const k = /мангал|mangal|grill|bbq|барбекю|qozon|казан|kazan/.test(t)
    ? 'grill'
    : /камин|kamin|fire/.test(t)
      ? 'fire'
      : /перил|лестн|zina|panjara|rail|stair/.test(t)
        ? 'rail'
        : /ворот|калит|darvoz|gate/.test(t)
          ? 'gate'
          : /фонар|свет|chiroq|lamp|light/.test(t)
            ? 'lamp'
            : /мебел|стол|кресл|скам|mebel|stol|table|bench|furniture/.test(t)
              ? 'bench'
              : 'scroll'
  const p: Record<string, React.ReactNode> = {
    grill: (
      <>
        <path d="M14 30h52l-6 18H20z" />
        <path d="M22 48l-6 18M58 48l6 18M40 48v18M18 30c4-8 8-8 10 0M38 30c4-10 8-10 10 0M54 30c3-6 6-6 8 0" />
      </>
    ),
    fire: (
      <>
        <path d="M12 66V22h56v44M20 66V34h40v32M8 22h64" />
        <path d="M40 60c-8-4-8-12 0-20 2 6 8 8 6 14 4-2 4-6 3-9 5 6 2 13-9 15z" />
      </>
    ),
    rail: (
      <>
        <path d="M10 20l60 30M10 20v46M70 50v16M10 66h60" />
        <path d="M22 26v40M34 32v34M46 38v28M58 44v22M22 44c6-4 6 6 0 2M46 52c6-4 6 6 0 2" />
      </>
    ),
    gate: (
      <>
        <path d="M10 66V26c10-10 50-10 60 0v40M10 66h60" />
        <path d="M20 66V22M30 66V18M40 66V16M50 66V18M60 66V22M40 16l-3-6 3-4 3 4z" />
      </>
    ),
    lamp: (
      <>
        <path d="M40 66V30M30 66h20M40 30c0-10 14-10 14-2" />
        <path d="M46 28h16l-3 14H49zM54 42v5" />
      </>
    ),
    bench: (
      <>
        <path d="M10 40h60M14 40l-4 26M66 40l4 26M16 52h48" />
        <path d="M14 40c0-14 10-18 18-12M66 40c0-14-10-18-18-12M32 28c4 6 12 6 16 0" />
      </>
    ),
    scroll: (
      <>
        <path d="M40 66V18" />
        <path d="M40 30c-14-10-24 8-12 12 8 3 10-8 2-8M40 44c14-10 24 8 12 12-8 3-10-8-2-8M40 18c-6-6 6-12 6-4" />
      </>
    ),
  }
  return (
    <svg className="anvil-glyph" viewBox="0 0 80 80" aria-hidden="true">
      {p[k]}
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="anvil-header">
        <a href="#top" className="anvil-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <svg viewBox="0 0 40 24" aria-hidden="true">
            <path d="M2 4h26c0 6 6 8 10 8v3H24l-2 5h4v3H8v-3h4l-2-5C5 12 2 9 2 4z" />
          </svg>
          <span>{site.name}</span>
        </a>
        <nav className="anvil-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="anvil-header__side">
          {b.phone ? (
            <a className="anvil-phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="anvil-btn anvil-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="anvil-footer">
        <div className="anvil-footer__glow" aria-hidden="true" />
        <p className="anvil-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <div className="anvil-footer__grid">
          <p className="anvil-footer__tag">{site.tagline}</p>
          <dl>
            {b.street ? (
              <div>
                <dt>{ui(site.lang, 'address')}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
              </div>
            ) : null}
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
                <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
              </div>
            ) : null}
          </dl>
          <ul className="anvil-footer__social">
            {b.socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener me">
                  {s.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="anvil-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Куём вручную, по эскизу заказчика', uz: 'Buyurtmachi eskizi bo‘yicha qo‘lda yasaymiz', en: 'Hand-forged to your sketch' })}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero anvil-hero">
      <ForgeCanvas colors={[t.bg, t.accent, t.fg, t.surface]} />
      <div className="anvil-hero__inner">
        {s.eyebrow ? (
          <p className="anvil-hero__eyebrow anvil-in" style={{ ['--d' as string]: '.15s' }}>
            <i aria-hidden="true" />
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="anvil-hero__title">
          <span className="anvil-hot" data-split="chars">
            {s.title || site.name}
          </span>
        </h1>
        {s.words.length ? (
          <ul className="anvil-hero__words anvil-in" style={{ ['--d' as string]: '.7s' }} aria-label={pick(site.lang, { ru: 'Что куём', uz: 'Nimalar yasaymiz', en: 'What we forge' })}>
            {s.words.map((w, i) => (
              <li key={i} style={{ ['--i' as string]: i }}>
                {w}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="anvil-hero__foot">
          {s.subtitle ? (
            <p className="anvil-hero__sub anvil-in" style={{ ['--d' as string]: '.9s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="anvil-hero__ctas anvil-in" style={{ ['--d' as string]: '1.05s' }}>
            {s.cta.label ? (
              <a className="anvil-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="anvil-btn anvil-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <p className="anvil-hero__temp" aria-hidden="true">
        <span>~ 1200 °C</span>
        <small>{pick(site.lang, { ru: 'температура в горне', uz: 'o‘choqdagi harorat', en: 'in the forge' })}</small>
      </p>
    </section>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee anvil-band" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} speed={42} sep="✦" />
    </section>
  )
}

/** Каталог — пластины с клеймом: силуэт изделия, название, цена «от». */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="anvil-cat-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="anvil-cat">
        {s.items.map((it, i) => (
          <li key={i} className="anvil-plate" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <span className="anvil-plate__mark" aria-hidden="true">
              {site.name.slice(0, 1)}·{String(i + 1).padStart(2, '0')}
            </span>
            <Glyph title={it.title} />
            <h3 className="anvil-plate__name">{it.title}</h3>
            {it.text ? <p className="anvil-plate__text">{it.text}</p> : null}
            <p className="anvil-plate__foot">
              {it.tag ? <span className="anvil-plate__tag">{it.tag}</span> : <span />}
              {it.price ? <b>{it.price}</b> : null}
            </p>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Работы — крупные кадры, при наведении кадр «раскаляется». */
function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="anvil-works-sec">
      <Head label={s.label} title={s.title} />
      <div className="anvil-works">
        {s.items.map((it, i) => (
          <article key={i} className="anvil-work" data-reveal="up" data-delay={String((i % 2) * 0.1)}>
            <figure className="anvil-work__media" data-reveal="clip">
              <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
            </figure>
            <div className="anvil-work__cap">
              <span className="anvil-work__no">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{it.title}</h3>
                <p className="anvil-work__meta">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
                {it.text ? <p className="anvil-work__text">{it.text}</p> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Sec>
  )
}

/** Этапы — шкала цветов каления: вишнёвый → оранжевый → соломенный → белый. */
function Process({ section: s }: SectionProps<'process'>) {
  const n = Math.max(1, s.items.length - 1)
  return (
    <Sec id={s.anchor} type="process" className="anvil-heat-sec">
      <Head label={s.label} title={s.title} />
      <div className="anvil-heat" data-reveal="fade">
        <span className="anvil-heat__line" aria-hidden="true" />
        <ol>
          {s.items.map((it, i) => (
            <li key={i} style={{ ['--k' as string]: i / n, ['--i' as string]: i }}>
              <span className="anvil-heat__dot" aria-hidden="true" />
              <span className="anvil-heat__no">{String(i + 1).padStart(2, '0')}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="anvil-stats-sec">
      <Head label={s.label} title={s.title} />
      <dl className="anvil-stats">
        {s.items.map((it, i) => (
          <div key={i} data-reveal="up" data-delay={String(i * 0.08)}>
            <dd>
              <span className="anvil-hot anvil-hot--soft" data-count>
                {it.value}
              </span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </dd>
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
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, works: Works, process: Process, stats: Stats },
}
