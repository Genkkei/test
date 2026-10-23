import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Progress, SpineLight } from './client'

/*
 * ОПОРА — реабилитация в духе Hinge Health и Sword: клинически чистая сетка, анатомия
 * линиями. На первом экране позвоночник прорисовывается сверху вниз, и по нему идёт
 * волна подсветки; услуги — зоны тела со своими значками; план восстановления — шкала
 * недель, которая заполняется прокруткой; цифры — столбики.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Позвоночник: шейный, грудной и поясничный отделы — позвонки разной ширины по изгибу. */
function Spine() {
  const n = 22
  const pts = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const x = 120 + Math.sin(t * Math.PI * 2.1 + 0.4) * 22
    const y = 28 + t * 420
    const w = 30 + Math.sin(t * Math.PI) * 26 + t * 14
    return { x, y, w, h: 9 + t * 7 }
  })
  return (
    <svg className="spine-svg" viewBox="0 0 240 480" aria-hidden="true">
      <path className="spine-svg__cord" d={`M${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')}`} pathLength={1} />
      {pts.map((p, i) => (
        <g key={i} className="spine-svg__v" style={{ ['--i' as string]: i }}>
          <rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} rx={p.h / 2} pathLength={1} />
          <line x1={p.x - p.w / 2 - 10} y1={p.y} x2={p.x - p.w / 2} y2={p.y + 4} />
          <line x1={p.x + p.w / 2} y1={p.y + 4} x2={p.x + p.w / 2 + 10} y2={p.y} />
        </g>
      ))}
      <path className="spine-svg__pelvis" d="M60 456 C70 430 100 448 120 470 C140 448 170 430 180 456 C176 476 150 480 120 476 C90 480 64 476 60 456 Z" pathLength={1} />
    </svg>
  )
}

/** Значки зон тела: шея, плечо, спина, колено, стопа, осанка. */
const ZONES = [
  'M50 14 a10 10 0 1 1 0 .1 M50 26 v18 M34 44 h32 M50 44 v40',
  'M30 30 a10 10 0 1 1 0 .1 M30 42 q20 -2 34 14 l10 30 M30 42 v40',
  'M50 10 v80 M38 24 h24 M36 40 h28 M36 56 h28 M38 72 h24',
  'M40 10 v36 q0 10 10 14 l-4 40 M46 50 a8 8 0 1 1 0 .1',
  'M40 10 v54 q0 20 20 22 h22 q4 -10 -8 -12 l-16 -4',
  'M50 12 a9 9 0 1 1 0 .1 M50 24 q-8 30 0 56 M34 50 h32 M42 90 l8 -10 l8 10',
]

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="spine-header">
        <a href="#top" className="spine-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <span className="spine-logo__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {site.name}
            </>
          )}
        </a>
        <nav className="spine-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="spine-header__side">
          {b.phone ? (
            <a className="spine-phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="spine-btn spine-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="spine-footer">
        <div className="spine-footer__inner">
          <div>
            <p className="spine-footer__name">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
            <p className="spine-footer__tag">{site.tagline}</p>
          </div>
          <dl className="spine-footer__facts">
            {b.street ? (
              <div>
                <dt>{ui(site.lang, 'address')}</dt>
                <dd>{[b.street, b.city].filter(Boolean).join(', ')}</dd>
              </div>
            ) : null}
            {b.hours.length ? (
              <div>
                <dt>{pick(site.lang, { ru: 'Приём', uz: 'Qabul', en: 'Appointments' })}</dt>
                <dd>{b.hours.map((h) => humanHours(h, site.lang)).join(' · ')}</dd>
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
            <div>
              <dt>{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</dt>
              <dd className="spine-footer__social">
                {b.socials.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <p className="spine-footer__warn">
          {pick(site.lang, {
            ru: 'Имеются противопоказания. Необходима консультация специалиста.',
            uz: 'Qarshi ko‘rsatmalar mavjud. Mutaxassis maslahati zarur.',
            en: 'Contraindications apply. Please consult a specialist.',
          })}
        </p>
        <div className="spine-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero spine-hero">
      <div className="spine-hero__grid" aria-hidden="true" />
      <div className="spine-hero__inner">
        <div className="spine-hero__copy">
          {s.eyebrow ? (
            <p className="spine-hero__eyebrow spine-in">
              <i aria-hidden="true" />
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="spine-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="spine-hero__sub spine-in" style={{ ['--d' as string]: '.5s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="spine-hero__ctas spine-in" style={{ ['--d' as string]: '.65s' }}>
            {s.cta.label ? (
              <a className="spine-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="spine-btn spine-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
        <div className="spine-hero__figure">
          <SpineLight>
            <Spine />
          </SpineLight>
          {s.words.length ? (
            <ul className="spine-hero__chips">
              {s.words.slice(0, 4).map((w, i) => (
                <li key={w} className="spine-in" style={{ ['--d' as string]: `${1.2 + i * 0.15}s`, ['--y' as string]: `${12 + i * 22}%` }}>
                  <i aria-hidden="true" />
                  {w}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Направления — карточки по зонам тела, у каждой свой значок линиями. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="spine-zones-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="spine-zones">
        {s.items.map((it, i) => (
          <li key={i} className="spine-zone" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <svg className="spine-zone__icon" viewBox="0 0 100 100" aria-hidden="true">
              <path d={ZONES[i % ZONES.length]} pathLength={1} />
            </svg>
            <div className="spine-zone__body">
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            <div className="spine-zone__meta">
              {it.tag ? <span>{it.tag}</span> : null}
              {it.price ? <strong>{it.price}</strong> : null}
            </div>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** План восстановления: шкала недель заполняется по мере прокрутки. */
function Process({ section: s, site }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="spine-plan-sec">
      <Head label={s.label} title={s.title} />
      <Progress className="spine-plan" style={{ ['--n' as string]: s.items.length }}>
        <div className="spine-plan__bar" aria-hidden="true">
          <span />
        </div>
        <ol className="spine-plan__steps">
          {s.items.map((it, i) => (
            <li key={i} className="spine-plan__step" style={{ ['--k' as string]: i / Math.max(1, s.items.length - 1) }}>
              <span className="spine-plan__week">
                {pick(site.lang, { ru: 'Этап', uz: 'Bosqich', en: 'Stage' })} {i + 1}
              </span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </Progress>
    </Sec>
  )
}

/** Цифры столбиками: высота столбика растёт от нуля, когда блок входит в кадр. */
function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="spine-stats-sec">
      <Head label={s.label} title={s.title} />
      <dl className="spine-stats">
        {s.items.map((it, i) => (
          <div key={i} className="spine-stat" data-reveal="up" data-delay={String(i * 0.1)} style={{ ['--h' as string]: `${40 + ((i * 23) % 50)}%` }}>
            <span className="spine-stat__bar" aria-hidden="true" />
            <dt className="spine-stat__label">{it.label}</dt>
            <dd className="spine-stat__value">
              <span data-count>{it.value}</span>
              {it.suffix ? <small>{it.suffix}</small> : null}
            </dd>
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
