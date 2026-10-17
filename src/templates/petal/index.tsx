import './style.css'
import type { Site } from '@/lib/schema'
import { Art } from '@/motion/art'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { BeforeAfter, DropsCanvas, PetalHeader } from './client'

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  const half = Math.ceil(links.length / 2)
  return (
    <>
      <PetalHeader>
        <nav className="petal-nav" aria-label="Разделы">
          {links.slice(0, half).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="petal-logo" aria-label={`${site.name} — наверх`}>
          {site.name}
        </a>
        <div className="petal-header__side">
          <nav className="petal-nav" aria-label="Ещё разделы">
            {links.slice(half).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          {site.nav.cta.label ? (
            <a className="petal-pill petal-pill--dark" href={site.nav.cta.href || (b.phone ? tel(b.phone) : '#')} data-magnetic>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} />
        </div>
      </PetalHeader>
      <main id="top">{children}</main>
      <footer className="petal-footer">
        <div className="petal-footer__card">
          <p className="petal-footer__word" aria-hidden="true">
            {site.name}
          </p>
          <div className="petal-footer__cols">
            <div>
              <p className="petal-footer__h">Запись</p>
              {b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : null}
              {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
            </div>
            <div>
              <p className="petal-footer__h">Салон</p>
              <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
              {b.hours.map((h) => (
                <p key={h}>{humanHours(h)}</p>
              ))}
            </div>
            <div>
              <p className="petal-footer__h">Мы в сетях</p>
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
          <p className="petal-footer__legal">
            © {new Date().getFullYear()} {b.legalName || site.name}
          </p>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const t = site.theme
  return (
    <section id={s.anchor || undefined} className="s s-hero petal-hero">
      <DropsCanvas colors={[t.bg, t.surface, t.accent, t.fg]} />
      <div className="petal-hero__inner">
        {s.eyebrow ? (
          <p className="petal-hero__eyebrow petal-rise" style={{ ['--d' as string]: '.1s' }}>
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="petal-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="petal-hero__sub petal-rise" style={{ ['--d' as string]: '.5s' }}>
            {s.subtitle}
          </p>
        ) : null}
        <div className="petal-hero__ctas petal-rise" style={{ ['--d' as string]: '.65s' }}>
          {s.cta.label ? (
            <a className="petal-pill petal-pill--dark petal-pill--lg" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="petal-pill petal-pill--lg" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      {s.words.length ? (
        <ul className="petal-hero__chips" aria-label="Направления">
          {s.words.map((w, i) => (
            <li key={w} className="petal-rise" style={{ ['--d' as string]: `${0.8 + i * 0.08}s` }}>
              {w}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function MarqueeSec({ section: s }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee petal-marquee" aria-label="Наши направления">
      <Marquee items={s.items} speed={44} sep="✿" />
    </section>
  )
}

/** Прайс как карточка салона: услуги собраны по метке в группы, цена справа. */
function Services({ section: s }: SectionProps<'services'>) {
  const groups = new Map<string, typeof s.items>()
  for (const it of s.items) {
    const key = it.tag || 'Услуги'
    groups.set(key, [...(groups.get(key) ?? []), it])
  }
  return (
    <Sec id={s.anchor} type="services" className="petal-services">
      <Head label={s.label} title={s.title} center>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="petal-price">
        {[...groups].map(([name, items]) => (
          <div key={name} className="petal-price__group" data-reveal="up">
            <h3 className="petal-price__gname">{name}</h3>
            <ul>
              {items.map((it, i) => (
                <li key={i} className="petal-price__row">
                  <div>
                    <p className="petal-price__name">{it.title}</p>
                    {it.text ? <p className="petal-price__text">{it.text}</p> : null}
                  </div>
                  {it.price ? <span className="petal-price__val">{it.price}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Sec>
  )
}

/** Галерея как «до/после»: без фото — пара генеративных кадров, тусклый и сияющий. */
function Gallery({ section: s, site }: SectionProps<'gallery'>) {
  const p = palette(site)
  return (
    <Sec id={s.anchor} type="gallery" className="petal-gallery">
      <Head label={s.label} title={s.title} center />
      <div className="petal-gallery__grid">
        {s.items.map((it, i) => {
          const seed = `${site.slug}-ba${i}`
          const img = (filter?: boolean) =>
            it.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="media" src={it.image} alt={it.caption || `${site.name} — работа ${i + 1}`} loading="lazy" style={filter ? { filter: 'saturate(.35) brightness(.92) contrast(.9)' } : undefined} />
            ) : (
              <Art className="media" seed={seed} colors={filter ? [p[0], p[3], p[3], p[2]] : p} kind="blobs" label={it.caption} />
            )
          return (
            <figure key={i} className="petal-gallery__item" data-reveal="up" data-delay={String((i % 3) * 0.08)}>
              <BeforeAfter before={img(true)} after={img(false)} label={it.caption || `работа ${i + 1}`} />
              {it.caption ? <figcaption>{it.caption}</figcaption> : null}
            </figure>
          )
        })}
      </div>
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, marquee: MarqueeSec, services: Services, gallery: Gallery },
}
