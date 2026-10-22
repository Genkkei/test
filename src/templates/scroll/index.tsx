import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'

/*
 * ЗАВИТОК — художественная ковка в духе ар-нуво: всё держит одна линия. Решётка-перила
 * первого экрана прорисовывается завиток за завитком (stroke-dashoffset, pathLength=1),
 * изделия каталога — свои кованые знаки, работы — в арочных рамах с кованой кромкой.
 * Без JS линии видны сразу: прячет их только html.motion до появления в кадре.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

/** C-завиток (волюта) — основа всех рисунков: спираль внутрь и хвост. */
const VOLUTE = 'M0 0 C 0 -26 34 -30 38 -8 C 41 8 24 14 17 6 C 12 0 17 -8 23 -6'

/** Пролёт перил: две стойки, верхний и нижний поручень, S-завитки и розетка в центре. */
function Panel({ x = 0, w = 200, h = 220 }: { x?: number; w?: number; h?: number }) {
  const cx = x + w / 2
  return (
    <g>
      <path pathLength={1} d={`M${x} 10 V${h} M${x + w} 10 V${h}`} className="scroll-bar" />
      <path pathLength={1} d={`M${x} 18 H${x + w} M${x} ${h - 14} H${x + w}`} />
      <path pathLength={1} d={`M${cx} 18 V${h - 14}`} />
      {/* S-завитки по обе стороны от центральной стойки */}
      <path pathLength={1} transform={`translate(${cx - 6} ${h * 0.34}) scale(-1 1)`} d={VOLUTE} />
      <path pathLength={1} transform={`translate(${cx + 6} ${h * 0.34})`} d={VOLUTE} />
      <path pathLength={1} transform={`translate(${cx - 6} ${h * 0.7}) scale(-1 -1)`} d={VOLUTE} />
      <path pathLength={1} transform={`translate(${cx + 6} ${h * 0.7}) scale(1 -1)`} d={VOLUTE} />
      <path pathLength={1} d={`M${x + 8} ${h * 0.52} C ${x + 40} ${h * 0.3} ${cx - 30} ${h * 0.3} ${cx - 10} ${h * 0.52} C ${cx - 30} ${h * 0.74} ${x + 40} ${h * 0.74} ${x + 8} ${h * 0.52} Z`} />
      <path pathLength={1} d={`M${x + w - 8} ${h * 0.52} C ${x + w - 40} ${h * 0.3} ${cx + 30} ${h * 0.3} ${cx + 10} ${h * 0.52} C ${cx + 30} ${h * 0.74} ${x + w - 40} ${h * 0.74} ${x + w - 8} ${h * 0.52} Z`} />
      <circle pathLength={1} cx={cx} cy={h * 0.52} r={11} />
      <circle cx={cx} cy={h * 0.52} r={3.4} className="scroll-dot" />
      {/* пики-наконечники над стойками */}
      <path pathLength={1} d={`M${x - 7} 12 L${x} -6 L${x + 7} 12 M${x + w - 7} 12 L${x + w} -6 L${x + w + 7} 12`} />
    </g>
  )
}

function Railing({ panels = 5, className = '' }: { panels?: number; className?: string }) {
  const w = 200
  return (
    <svg className={`scroll-draw ${className}`} viewBox={`-12 -12 ${panels * w + 24} 250`} preserveAspectRatio="xMidYMax meet" aria-hidden="true" data-reveal="fade">
      {Array.from({ length: panels }, (_, i) => (
        <g key={i} style={{ ['--i' as string]: i }}>
          <Panel x={i * w} w={w} />
        </g>
      ))}
    </svg>
  )
}

/** Кованые знаки для изделий: перила, лестница, балкон, ворота, декор, мебель — по номеру. */
function Glyph({ n }: { n: number }) {
  const k = n % 6
  return (
    <svg className="scroll-draw scroll-glyph" viewBox="-40 -40 80 80" aria-hidden="true" data-reveal="fade">
      {k === 0 ? (
        <>
          <path pathLength={1} d="M-30 -24 H30 M-30 26 H30 M-30 -24 V26 M30 -24 V26" />
          <path pathLength={1} transform="translate(-4 -2) scale(-.7 .7)" d={VOLUTE} />
          <path pathLength={1} transform="translate(4 -2) scale(.7 .7)" d={VOLUTE} />
        </>
      ) : k === 1 ? (
        <>
          <path pathLength={1} d="M-32 28 H-14 V12 H4 V-4 H22 V-20 H32" />
          <path pathLength={1} d="M-30 18 C -10 -2 10 -18 30 -30" />
          <path pathLength={1} transform="translate(-20 6) scale(.45)" d={VOLUTE} />
        </>
      ) : k === 2 ? (
        <>
          <path pathLength={1} d="M-32 -6 H32 M-32 30 H32" />
          <path pathLength={1} d="M-32 -6 C -32 -30 32 -30 32 -6" />
          <path pathLength={1} d="M-18 -6 V30 M0 -6 V30 M18 -6 V30" />
          <circle pathLength={1} cx={0} cy={-16} r={6} />
        </>
      ) : k === 3 ? (
        <>
          <path pathLength={1} d="M-32 32 V-8 C -32 -34 32 -34 32 -8 V32 M0 -26 V32" />
          <path pathLength={1} transform="translate(-4 4) scale(-.6 .6)" d={VOLUTE} />
          <path pathLength={1} transform="translate(4 4) scale(.6 .6)" d={VOLUTE} />
        </>
      ) : k === 4 ? (
        <>
          <path pathLength={1} d="M0 32 V-6" />
          <path pathLength={1} d="M0 -6 C -26 -10 -26 -36 0 -30 C 26 -36 26 -10 0 -6" />
          <path pathLength={1} transform="translate(2 12) scale(.5)" d={VOLUTE} />
          <path pathLength={1} transform="translate(-2 18) scale(-.5 .5)" d={VOLUTE} />
        </>
      ) : (
        <>
          <path pathLength={1} d="M-30 -2 H30 M-24 -2 V30 M24 -2 V30 M-30 -14 H30" />
          <path pathLength={1} transform="translate(-4 -18) scale(-.5 .5)" d={VOLUTE} />
          <path pathLength={1} transform="translate(4 -18) scale(.5 .5)" d={VOLUTE} />
        </>
      )}
    </svg>
  )
}

/** Кованая заглушка для работы без фото: силуэт изделия в тоне сайта. */
function WorkArt({ n }: { n: number }) {
  return (
    <svg className="scroll-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="300" className="scroll-art__bg" />
      <g transform={`translate(${n % 2 ? 40 : 100} 50) scale(${n % 3 === 0 ? 1.1 : 0.9})`}>
        <Panel x={0} w={200} h={210} />
      </g>
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="scroll-header">
        <a href="#top" className="scroll-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          <svg viewBox="-24 -24 48 48" aria-hidden="true">
            <path transform="translate(-2 2) scale(-.55 .55)" d={VOLUTE} />
            <path transform="translate(2 2) scale(.55 .55)" d={VOLUTE} />
          </svg>
          <span>{site.name}</span>
        </a>
        <nav className="scroll-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="scroll-header__side">
          {b.phone ? (
            <a className="scroll-header__tel" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="scroll-btn scroll-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="scroll-footer">
        <Railing panels={12} className="scroll-footer__rail" />
        <div className="scroll-footer__grid">
          <div>
            <p className="scroll-footer__name">{site.name}</p>
            <p className="scroll-footer__tag">{site.tagline}</p>
          </div>
          <dl className="scroll-footer__facts">
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
                <dt>{pick(site.lang, { ru: 'Мы в сетях', uz: 'Ijtimoiy tarmoqlar', en: 'Follow us' })}</dt>
                <dd className="scroll-footer__social">
                  {b.socials.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                      {s.name}
                    </a>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="scroll-footer__bottom">
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
    <section id={s.anchor || undefined} className="s s-hero scroll-hero">
      <div className="scroll-hero__text">
        {s.eyebrow ? (
          <p className="scroll-hero__eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="scroll-hero__title">
          <span data-split="lines">{s.title || site.name}</span>
        </h1>
        {s.subtitle ? (
          <p className="scroll-hero__sub" data-reveal="up" data-delay="0.35">
            {s.subtitle}
          </p>
        ) : null}
        <div className="scroll-hero__ctas" data-reveal="up" data-delay="0.5">
          {s.cta.label ? (
            <a className="scroll-btn" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="scroll-link" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label} →
            </a>
          ) : null}
        </div>
        {s.words.length ? (
          <ul className="scroll-hero__words" data-reveal="fade" data-delay="0.7">
            {s.words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <Railing panels={5} className="scroll-hero__rail" />
    </section>
  )
}

/** Каталог изделий: у каждого — свой кованый знак, цена «от» и срок. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="scroll-cat-sec">
      <Head label={s.label} title={s.title} center>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="scroll-cat">
        {s.items.map((it, i) => (
          <li key={i} className="scroll-cat__item" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <Glyph n={i} />
            <h3>{it.title}</h3>
            {it.text ? <p>{it.text}</p> : null}
            <div className="scroll-cat__foot">
              {it.price ? <span className="scroll-cat__price">{it.price}</span> : null}
              {it.tag ? <span className="scroll-cat__tag">{it.tag}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Работы — в арочных рамах, как витражные окна; подпись — табличкой под аркой. */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="scroll-works-sec">
      <Head label={s.label} title={s.title} />
      <div className="scroll-works">
        {s.items.map((it, i) => {
          const body = (
            <>
              <figure className="scroll-arch" data-reveal="clip">
                {it.image ? <img src={it.image} alt={it.title} loading="lazy" decoding="async" /> : <WorkArt n={i} />}
              </figure>
              <div className="scroll-works__cap">
                <p className="scroll-works__meta">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
                <h3>{it.title}</h3>
                {it.text ? <p>{it.text}</p> : null}
              </div>
            </>
          )
          return it.href ? (
            <a key={i} className="scroll-works__item" href={it.href} data-cursor={ui(site.lang, 'open')}>
              {body}
            </a>
          ) : (
            <article key={i} className="scroll-works__item">
              {body}
            </article>
          )
        })}
      </div>
    </Sec>
  )
}

/** О мастерской: текст слева, справа — арка с кованой решёткой (или фото). */
function About({ section: s, site }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="scroll-about-sec">
      <Head label={s.label} title={s.title} />
      <div className="s-about__body">
        <p className="s-about__text" data-reveal="up">
          {s.text}
        </p>
        <figure className="s-about__media scroll-about__arch" data-reveal="clip">
          {s.image ? <img src={s.image} alt={s.title || site.name} loading="lazy" decoding="async" /> : <WorkArt n={1} />}
        </figure>
      </div>
    </Sec>
  )
}

/** Этапы — по одной кованой линии, которая вьётся от шага к шагу. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="scroll-steps-sec">
      <Head label={s.label} title={s.title} center />
      <div className="scroll-steps">
        <svg className="scroll-draw scroll-steps__vine" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true" data-reveal="fade">
          <path pathLength={1} d="M50 0 C 90 120 10 220 50 340 C 90 460 10 560 50 680 C 90 800 10 900 50 1000" />
        </svg>
        <ol className="scroll-steps__list">
        {s.items.map((it, i) => (
          <li key={i} className="scroll-step" data-reveal={i % 2 ? 'left' : 'right'} data-delay="0.1">
            <span className="scroll-step__no">{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][i] ?? i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
        </ol>
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, about: About, services: Services, works: Works, process: Process },
}
