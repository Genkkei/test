import './style.css'
import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'

/*
 * СТАЛЬ — лазерная резка и металлодекор из кортена. Точная геометрия вместо орнамента-ковки:
 * на первом экране лазерная головка (animateMotion по тому же контуру) режет восьмиконечную
 * звезду гирих — рез светится и остывает; изделия — панели с перфорацией, сквозь которую
 * бьёт тёплый свет; цены — спецификацией, этапы — по линейке в миллиметрах.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** Восьмиконечная звезда (два наложенных квадрата) — контур реза. */
function star(cx: number, cy: number, r: number, inner = 0.72): string {
  const pts: string[] = []
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2
    const rr = i % 2 ? r * inner : r
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`)
  }
  return `M${pts.join(' L')} Z`
}

/** Перфорация панели: шесть узоров по номеру — звёзды, круги, ромбы, волны, соты, полосы. */
function Holes({ n, size = 400, step = 40 }: { n: number; size?: number; step?: number }) {
  const k = n % 6
  const cells: React.ReactNode[] = []
  for (let y = step / 2; y < size; y += step)
    for (let x = step / 2; x < size; x += step) {
      const i = cells.length
      const off = Math.floor(y / step) % 2 ? step / 2 : 0
      if (k === 0) cells.push(<path key={i} d={star(x, y, step * 0.36)} />)
      else if (k === 1) cells.push(<circle key={i} cx={x + off} cy={y} r={step * (0.12 + 0.2 * Math.abs(Math.sin((x + y) / 90)))} />)
      else if (k === 2) cells.push(<rect key={i} x={x - step * 0.2} y={y - step * 0.2} width={step * 0.4} height={step * 0.4} transform={`rotate(45 ${x} ${y})`} />)
      else if (k === 3) cells.push(<rect key={i} x={x - step * 0.42} y={y - 2 + Math.sin(x / 40) * 8} width={step * 0.84} height={4 + 3 * Math.abs(Math.cos(y / 70))} rx={2} />)
      else if (k === 4) cells.push(<path key={i} d={star(x + off, y, step * 0.3, 0.87)} />)
      else cells.push(<rect key={i} x={x - 2} y={y - step * 0.42} width={3 + (x % 3)} height={step * 0.84} rx={1.5} />)
    }
  return <g className="steel-holes">{cells}</g>
}

/** Панель с подсветкой: тёплый свет за металлом проходит сквозь перфорацию. */
function Panel({ n, className = '' }: { n: number; className?: string }) {
  const id = `steel-m${n}`
  return (
    <svg className={`steel-panel ${className}`} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <mask id={id}>
          <rect width="400" height="400" fill="#fff" />
          <g fill="#000">
            <Holes n={n} />
          </g>
        </mask>
        <radialGradient id={`${id}g`} cx="50%" cy="45%" r="65%">
          <stop offset="0" stopColor="#ffd08a" />
          <stop offset=".55" stopColor="#ff7a2a" />
          <stop offset="1" stopColor="#3a1408" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}g)`} className="steel-panel__light" />
      <rect width="400" height="400" mask={`url(#${id})`} className="steel-panel__metal" />
    </svg>
  )
}

const CUT = star(200, 200, 150, 0.7)

/** Лазерная резка в реальном времени: контур, светящийся рез и головка, бегущая по нему. */
function Laser() {
  return (
    <div className="steel-laser" aria-hidden="true">
      <svg viewBox="0 0 400 400">
        <defs>
          <filter id="steel-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="steel-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" className="steel-laser__gridline" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="400" height="400" className="steel-laser__sheet" />
        <rect x="0" y="0" width="400" height="400" fill="url(#steel-grid)" />
        <path d={CUT} className="steel-laser__guide" />
        <path id="steel-cut" d={CUT} pathLength={1} className="steel-laser__kerf" filter="url(#steel-glow)">
          {/* рез и головка на одном таймлайне SMIL — так они не расходятся ни на кадр */}
          <animate attributeName="stroke-dashoffset" from="1" to="0" dur="7s" repeatCount="indefinite" />
        </path>
        <g className="steel-laser__head">
          <circle r="14" className="steel-laser__halo" />
          <circle r="4.5" className="steel-laser__dot" />
          <animateMotion dur="7s" repeatCount="indefinite" rotate="0">
            <mpath href="#steel-cut" />
          </animateMotion>
        </g>
        <g className="steel-laser__dims">
          <path d="M50 380 H350 M50 372 V388 M350 372 V388" />
          <text x="200" y="374">300.0 mm</text>
          <path d="M20 50 V350 M12 50 H28 M12 350 H28" />
          <text x="0" y="0" transform="translate(14 200) rotate(-90)">300.0 mm</text>
        </g>
      </svg>
      <p className="steel-laser__readout">
        <span>X 214.6</span>
        <span>Y 098.2</span>
        <span>F 6000</span>
      </p>
    </div>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="steel-header">
        <a href="#top" className="steel-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d={star(20, 20, 17, 0.7)} />
          </svg>
          <span>{site.name}</span>
        </a>
        <nav className="steel-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <small>{String(i + 1).padStart(2, '0')}</small>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="steel-header__side">
          {site.nav.cta.label ? (
            <a className="steel-btn steel-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="steel-footer">
        <div className="steel-footer__strip" aria-hidden="true">
          <Panel n={0} />
          <Panel n={2} />
          <Panel n={4} />
          <Panel n={1} />
        </div>
        <div className="steel-footer__grid">
          <p className="steel-footer__name">{site.name}</p>
          <dl className="steel-footer__facts">
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
            {b.socials.length ? (
              <div>
                <dt>{pick(site.lang, { ru: 'Сети', uz: 'Tarmoqlar', en: 'Social' })}</dt>
                <dd className="steel-footer__social">
                  {b.socials.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                      {s.name} ↗
                    </a>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="steel-footer__bottom">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{site.tagline}</span>
          <a href="#top">↑ {ui(site.lang, 'toTop')}</a>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero steel-hero">
      <div className="steel-hero__inner">
        <div className="steel-hero__text">
          {s.eyebrow ? (
            <p className="steel-hero__eyebrow" data-reveal="fade">
              <i aria-hidden="true" /> {s.eyebrow}
            </p>
          ) : null}
          <h1 className="steel-hero__title">
            <span data-split="lines">{s.title || site.name}</span>
          </h1>
          {s.subtitle ? (
            <p className="steel-hero__sub" data-reveal="up" data-delay="0.3">
              {s.subtitle}
            </p>
          ) : null}
          <div className="steel-hero__ctas" data-reveal="up" data-delay="0.45">
            {s.cta.label ? (
              <a className="steel-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="steel-btn steel-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          {s.words.length ? (
            <ul className="steel-hero__chips" data-reveal="fade" data-delay="0.6">
              {s.words.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <Laser />
      </div>
    </section>
  )
}

/** Цены спецификацией: услуга, что режем, толщина, цена — строка подсвечивается лучом. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="steel-spec-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="steel-spec" role="table" aria-label={s.title}>
        <div className="steel-spec__row steel-spec__row--head" role="row">
          <span role="columnheader">№</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Работа', uz: 'Ish', en: 'Service' })}</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Толщина / формат', uz: 'Qalinlik / format', en: 'Thickness / format' })}</span>
          <span role="columnheader">{pick(site.lang, { ru: 'Цена', uz: 'Narx', en: 'Price' })}</span>
        </div>
        {s.items.map((it, i) => (
          <div key={i} className="steel-spec__row" role="row" data-reveal="up" data-delay={String(i * 0.05)}>
            <span className="steel-spec__no" role="cell">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span role="cell">
              <b>{it.title}</b>
              {it.text ? <small>{it.text}</small> : null}
            </span>
            <span className="steel-spec__tag" role="cell">
              {it.tag}
            </span>
            <span className="steel-spec__price" role="cell">
              {it.price}
            </span>
          </div>
        ))}
      </div>
    </Sec>
  )
}

/** Работы — перфорированные панели с подсветкой: у каждой свой узор. */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="steel-works-sec">
      <Head label={s.label} title={s.title} />
      <div className="steel-works">
        {s.items.map((it, i) => {
          const body = (
            <>
              <figure className="steel-works__media" data-reveal="clip">
                {it.image ? <img src={it.image} alt={it.title} loading="lazy" decoding="async" /> : <Panel n={i} />}
              </figure>
              <div className="steel-works__cap">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{it.title}</h3>
                <p>{[it.category, it.year].filter(Boolean).join(' · ')}</p>
              </div>
              {it.text ? <p className="steel-works__text">{it.text}</p> : null}
            </>
          )
          return it.href ? (
            <a key={i} className="steel-works__item" href={it.href} data-cursor={ui(site.lang, 'open')}>
              {body}
            </a>
          ) : (
            <article key={i} className="steel-works__item">
              {body}
            </article>
          )
        })}
      </div>
    </Sec>
  )
}

/** Этапы по линейке: деления в миллиметрах, шаг — отметка на шкале. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="steel-ruler-sec">
      <Head label={s.label} title={s.title} />
      <div className="steel-ruler" data-reveal="fade">
        <div className="steel-ruler__scale" aria-hidden="true">
          {Array.from({ length: 61 }, (_, i) => (
            <i key={i} className={i % 10 === 0 ? 'is-cm' : i % 5 === 0 ? 'is-half' : ''} />
          ))}
        </div>
        <ol className="steel-ruler__steps" style={{ ['--n' as string]: s.items.length }}>
          {s.items.map((it, i) => (
            <li key={i} data-reveal="up" data-delay={String(0.15 + i * 0.1)}>
              <span className="steel-ruler__mark">{String(i * 10).padStart(3, '0')}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  )
}

function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="steel-about-sec">
      <div className="steel-about">
        <div>
          <Head label={s.label} title={s.title} />
          <p className="steel-about__text" data-reveal="up">
            {s.text}
          </p>
        </div>
        <figure className="steel-about__media" data-reveal="clip">
          {s.image ? <img src={s.image} alt={s.title || site.name} loading="lazy" decoding="async" /> : <Panel n={3} />}
        </figure>
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, about: About, services: Services, works: Works, process: Process },
}
