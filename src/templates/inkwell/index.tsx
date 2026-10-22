import type { Site } from '@/lib/schema'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'

/*
 * ПЕРЕПЛЁТ — книжный магазин в духе Daunt Books, Penguin Classics и The Paris Review: тёплая бумага,
 * антиква, двойные линейки. Первый экран — полка с корешками, новинки — обложки в три полосы,
 * как классическая серия Penguin, услуги — библиотечные карточки каталога.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const SPINES = ['#2e5a3c', '#d9682b', '#2a4b7c', '#7c2a2e', '#d7a531', '#5d3f6a', '#3f6b6b', '#1d1b17']
const pickColor = (i: number) => SPINES[i % SPINES.length]

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="inkwell-header">
        <div className="inkwell-header__top">
          <span className="inkwell-header__meta">{b.city || pick(site.lang, { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent' })}</span>
          <a href="#top" className="inkwell-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
            {site.name}
          </a>
          <span className="inkwell-header__side">
            {site.nav.cta.label ? (
              <a className="inkwell-link" href={site.nav.cta.href}>
                {site.nav.cta.label} →
              </a>
            ) : null}
            <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
          </span>
        </div>
        <nav className="inkwell-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      </header>
      <main id="top">{children}</main>
      <footer className="inkwell-footer">
        <div className="inkwell-footer__inner">
          <div className="inkwell-stamp" aria-hidden="true">
            <span>Ex libris</span>
            <b>{site.name}</b>
            <span>{b.founded ? toRoman(Number(b.founded)) : ''}</span>
          </div>
          <div className="inkwell-footer__cols">
            <div>
              <p className="inkwell-k">{ui(site.lang, 'address')}</p>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
              {b.hours.map((h) => (
                <p key={h}>{humanHours(h, site.lang)}</p>
              ))}
            </div>
            <div>
              <p className="inkwell-k">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
              {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
            </div>
            <div>
              <p className="inkwell-k">{pick(site.lang, { ru: 'Читайте нас', uz: 'Bizni o‘qing', en: 'Read us' })}</p>
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="inkwell-footer__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <a href="#top">{ui(site.lang, 'toTop')} ↑</a>
        </p>
      </footer>
    </>
  )
}

function toRoman(n: number) {
  if (!n) return ''
  const m: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let out = ''
  for (const [v, s] of m) while (n >= v) (out += s), (n -= v)
  return out
}

/** Первый экран: заголовок и полка корешков — по одному на жанр, корешки выезжают снизу по очереди. */
function Hero({ section: s, site }: SectionProps<'hero'>) {
  const spines = s.words.length ? s.words : [site.name]
  return (
    <section id={s.anchor || undefined} className="s s-hero inkwell-hero">
      <div className="inkwell-hero__inner">
        <div className="inkwell-hero__copy">
          {s.eyebrow ? (
            <p className="inkwell-eyebrow" data-reveal="fade">
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="inkwell-hero__title" data-split="lines">
            {s.title || site.name}
          </h1>
          {s.subtitle ? (
            <p className="inkwell-hero__sub" data-reveal="up" data-delay="0.4">
              {s.subtitle}
            </p>
          ) : null}
          <div className="inkwell-hero__ctas" data-reveal="up" data-delay="0.55">
            {s.cta.label ? (
              <a className="inkwell-btn" href={s.cta.href || '#'}>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="inkwell-link" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label} →
              </a>
            ) : null}
          </div>
        </div>
        <div className="inkwell-shelf" aria-label={pick(site.lang, { ru: 'Разделы магазина', uz: 'Do‘kon bo‘limlari', en: 'Shop sections' })}>
          <ul className="inkwell-shelf__books">
            {spines.map((w, i) => (
              <li
                key={w}
                className="inkwell-spine"
                style={{
                  ['--c' as string]: pickColor(i),
                  ['--h' as string]: `${72 + ((i * 37) % 26)}%`,
                  ['--w' as string]: `${46 + ((i * 17) % 24)}px`,
                  ['--d' as string]: `${0.3 + i * 0.08}s`,
                  ['--r' as string]: i === spines.length - 1 ? '-7deg' : '0deg',
                }}
              >
                <span>{w}</span>
              </li>
            ))}
          </ul>
          <span className="inkwell-shelf__plank" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

/** Новинки — обложки в три полосы, как классическая серия Penguin; цена под обложкой. */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <Sec id={s.anchor} type="works" className="inkwell-new-sec">
      <Head label={s.label} title={s.title} />
      <ul className="inkwell-covers">
        {s.items.map((it, i) => {
          const card = (
            <>
              <div className="inkwell-cover" style={{ ['--c' as string]: pickColor(i + 1) }}>
                <span className="inkwell-cover__mark" aria-hidden="true">
                  {site.name.slice(0, 1)}
                </span>
                <div className="inkwell-cover__band">
                  <p className="inkwell-cover__author">{it.category}</p>
                  <h3 className="inkwell-cover__title">{it.title}</h3>
                </div>
                <span className="inkwell-cover__series" aria-hidden="true">
                  {site.name}
                </span>
              </div>
              <div className="inkwell-cover__cap">
                {it.text ? <p>{it.text}</p> : null}
                {it.year ? <b>{it.year}</b> : null}
              </div>
            </>
          )
          return (
            <li key={i} data-reveal="up" data-delay={String((i % 3) * 0.08)}>
              {it.href ? <a href={it.href}>{card}</a> : card}
            </li>
          )
        })}
      </ul>
    </Sec>
  )
}

/** Услуги — библиотечные карточки каталога: линовка, красная черта, отверстие для штыря. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="inkwell-cards-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="inkwell-cards">
        {s.items.map((it, i) => (
          <li key={i} className="inkwell-card" data-reveal="up" data-delay={String(i * 0.07)} style={{ ['--rot' as string]: `${((i % 3) - 1) * 0.8}deg` }}>
            <p className="inkwell-card__no">
              № {String(i + 1).padStart(3, '0')}
              {it.tag ? <span>{it.tag}</span> : null}
            </p>
            <h3>{it.title}</h3>
            {it.text ? <p className="inkwell-card__text">{it.text}</p> : null}
            {it.price ? <p className="inkwell-card__price">{it.price}</p> : null}
            <i className="inkwell-card__hole" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </Sec>
  )
}

/** Отзывы — цитаты крупным курсивом, как врезки литературного журнала. */
function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <Sec id={s.anchor} type="testimonials" className="inkwell-quotes-sec">
      <Head label={s.label} title={s.title} center />
      <div className="inkwell-quotes">
        {s.items.map((it, i) => (
          <figure key={i} className="inkwell-quote" data-reveal="up" data-delay={String(i * 0.1)}>
            <blockquote data-split="words">{it.quote}</blockquote>
            <figcaption>
              — {it.author}
              {it.role ? <span>, {it.role}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, works: Works, services: Services, testimonials: Testimonials },
}
