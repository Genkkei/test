import type { ReactNode } from 'react'
import type { SectionType, Site } from '@/lib/schema'
import { Media } from '@/motion/art'
import { Marquee } from '@/motion/widgets'
import { humanHours, ui } from '@/lib/i18n'
import { palette, type SectionProps, type SectionRenderers } from '@/templates/types'

/*
 * Базовые секции. Разметка семантическая и одинаковая для всех шаблонов,
 * а вид задаёт CSS шаблона по классам s-*. Шаблон переопределяет секцию целиком,
 * только когда его фирменный приём не выражается стилями (список работ с фото за курсором,
 * стеклянная сфера и т. п.).
 */

export function Head({ label, title, children, center }: { label?: string; title?: string; children?: ReactNode; center?: boolean }) {
  if (!label && !title && !children) return null
  return (
    <header className={`s__head${center ? ' s__head--center' : ''}`}>
      {label ? (
        <p className="s__label" data-reveal="fade">
          {label}
        </p>
      ) : null}
      {title ? (
        <h2 className="s__title" data-split="lines">
          {title}
        </h2>
      ) : null}
      {children}
    </header>
  )
}

export function Shell({ id, type, children, className = '' }: { id?: string; type: string; children: ReactNode; className?: string }) {
  return (
    <section id={id || undefined} className={`s s-${type} ${className}`.trim()}>
      <div className="s__inner">{children}</div>
    </section>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  return (
    <section id={s.anchor || undefined} className="s s-hero">
      <div className="s__inner">
        {s.eyebrow ? (
          <p className="s-hero__eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
        ) : null}
        <h1 className="s-hero__title" data-split="lines">
          {s.title || site.name}
        </h1>
        {s.subtitle ? (
          <p className="s-hero__sub" data-reveal="up" data-delay="0.3">
            {s.subtitle}
          </p>
        ) : null}
        <div className="s-hero__ctas" data-reveal="up" data-delay="0.45">
          {s.cta.label ? (
            <a className="btn btn--primary" href={s.cta.href || '#'} data-magnetic>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a className="btn btn--ghost" href={s.ctaSecondary.href || '#'}>
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function MarqueeSection({ section: s, site }: SectionProps<'marquee'>) {
  if (!s.items.length) return null
  return (
    <section className="s s-marquee" aria-label={s.title || ui(site.lang, 'keywords')}>
      <Marquee items={s.items} />
    </section>
  )
}

function About({ section: s, site, art }: SectionProps<'about'>) {
  return (
    <Shell id={s.anchor} type="about">
      <Head label={s.label} title={s.title} />
      <div className="s-about__body">
        <p className="s-about__text" data-reveal="up">
          {s.text}
        </p>
        <figure className="s-about__media" data-reveal="clip">
          <Media src={s.image} alt={s.title || site.name} seed={`${site.slug}-about`} colors={palette(site)} kind={art} className="media" />
        </figure>
      </div>
    </Shell>
  )
}

function Services({ section: s }: SectionProps<'services'>) {
  return (
    <Shell id={s.anchor} type="services">
      <Head label={s.label} title={s.title}>
        {s.intro ? <p className="s__intro" data-reveal="up">{s.intro}</p> : null}
      </Head>
      <ol className="s-services__list">
        {s.items.map((it, i) => (
          <li key={i} className="s-services__item" data-reveal="up" data-delay={String(i * 0.06)}>
            <span className="s-services__num">{String(i + 1).padStart(2, '0')}</span>
            <div className="s-services__main">
              <h3 className="s-services__name">{it.title}</h3>
              {it.text ? <p className="s-services__text">{it.text}</p> : null}
            </div>
            <div className="s-services__meta">
              {it.tag ? <span className="s-services__tag">{it.tag}</span> : null}
              {it.price ? <span className="s-services__price">{it.price}</span> : null}
            </div>
          </li>
        ))}
      </ol>
    </Shell>
  )
}

function Works({ section: s, site, art }: SectionProps<'works'>) {
  return (
    <Shell id={s.anchor} type="works">
      <Head label={s.label} title={s.title} />
      <div className="s-works__grid">
        {s.items.map((it, i) => {
          const body = (
            <>
              <figure className="s-works__media" data-reveal="clip">
                <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind={art} className="media" />
              </figure>
              <div className="s-works__cap">
                <h3 className="s-works__name">{it.title}</h3>
                <p className="s-works__meta">{[it.category, it.year].filter(Boolean).join(' · ')}</p>
                {it.text ? <p className="s-works__text">{it.text}</p> : null}
              </div>
            </>
          )
          return it.href ? (
            <a key={i} className="s-works__item" href={it.href} data-cursor={ui(site.lang, 'open')}>
              {body}
            </a>
          ) : (
            <article key={i} className="s-works__item">
              {body}
            </article>
          )
        })}
      </div>
    </Shell>
  )
}

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Shell id={s.anchor} type="stats">
      <Head label={s.label} title={s.title} />
      <dl className="s-stats__grid">
        {s.items.map((it, i) => (
          <div key={i} className="s-stats__item" data-reveal="up" data-delay={String(i * 0.08)}>
            <dt className="s-stats__label">{it.label}</dt>
            <dd className="s-stats__value">
              <span data-count>{it.value}</span>
              {it.suffix ? <span className="s-stats__suffix">{it.suffix}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </Shell>
  )
}

function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Shell id={s.anchor} type="process">
      <Head label={s.label} title={s.title} />
      <ol className="s-process__list">
        {s.items.map((it, i) => (
          <li key={i} className="s-process__item" data-reveal="up" data-delay={String(i * 0.08)}>
            <span className="s-process__num">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="s-process__name">{it.title}</h3>
            <p className="s-process__text">{it.text}</p>
          </li>
        ))}
      </ol>
    </Shell>
  )
}

function Testimonials({ section: s }: SectionProps<'testimonials'>) {
  return (
    <Shell id={s.anchor} type="testimonials">
      <Head label={s.label} title={s.title} />
      <div className="s-testimonials__list">
        {s.items.map((it, i) => (
          <figure key={i} className="s-testimonials__item" data-reveal="up" data-delay={String(i * 0.08)}>
            <blockquote className="s-testimonials__quote">{it.quote}</blockquote>
            <figcaption className="s-testimonials__who">
              <b>{it.author}</b>
              {it.role ? <span>{it.role}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </Shell>
  )
}

function Team({ section: s, site }: SectionProps<'team'>) {
  return (
    <Shell id={s.anchor} type="team">
      <Head label={s.label} title={s.title} />
      <ul className="s-team__grid">
        {s.items.map((it, i) => (
          <li key={i} className="s-team__item" data-reveal="up" data-delay={String(i * 0.06)}>
            <figure className="s-team__media">
              <Media src={it.image} alt={`${it.name}, ${it.role}`} seed={`${site.slug}-t${i}`} colors={palette(site)} kind="blobs" className="media" />
            </figure>
            <h3 className="s-team__name">{it.name}</h3>
            <p className="s-team__role">{it.role}</p>
          </li>
        ))}
      </ul>
    </Shell>
  )
}

function Pricing({ section: s }: SectionProps<'pricing'>) {
  return (
    <Shell id={s.anchor} type="pricing">
      <Head label={s.label} title={s.title} />
      <div className="s-pricing__grid">
        {s.items.map((it, i) => (
          <article key={i} className={`s-pricing__item${it.featured ? ' is-featured' : ''}`} data-reveal="up" data-delay={String(i * 0.08)}>
            <h3 className="s-pricing__name">{it.name}</h3>
            <p className="s-pricing__price">
              {it.price}
              {it.period ? <span> {it.period}</span> : null}
            </p>
            <ul className="s-pricing__features">
              {it.features.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Shell>
  )
}

function Menu({ section: s }: SectionProps<'menu'>) {
  return (
    <Shell id={s.anchor} type="menu">
      <Head label={s.label} title={s.title} />
      <div className="s-menu__groups">
        {s.groups.map((g, i) => (
          <div key={i} className="s-menu__group" data-reveal="up">
            <h3 className="s-menu__gname">{g.name}</h3>
            <ul className="s-menu__items">
              {g.items.map((it, j) => (
                <li key={j} className="s-menu__item">
                  <div className="s-menu__row">
                    <span className="s-menu__name">{it.name}</span>
                    <span className="s-menu__dots" aria-hidden="true" />
                    <span className="s-menu__price">{it.price}</span>
                  </div>
                  {it.text ? <p className="s-menu__text">{it.text}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Shell>
  )
}

function Gallery({ section: s, site, art }: SectionProps<'gallery'>) {
  return (
    <Shell id={s.anchor} type="gallery">
      <Head label={s.label} title={s.title} />
      <div className="s-gallery__grid">
        {s.items.map((it, i) => (
          <figure key={i} className="s-gallery__item" data-reveal="clip" data-delay={String((i % 3) * 0.08)}>
            <Media src={it.image} alt={it.caption || `${site.name} — ${ui(site.lang, 'photo')} ${i + 1}`} seed={`${site.slug}-g${i}`} colors={palette(site)} kind={art} className="media" />
            {it.caption ? <figcaption>{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Shell>
  )
}

function Faq({ section: s }: SectionProps<'faq'>) {
  // Ответы всегда в HTML: <details> сворачивает их визуально, краулер видит текст.
  return (
    <Shell id={s.anchor} type="faq">
      <Head label={s.label} title={s.title} />
      <div className="s-faq__list">
        {s.items.map((it, i) => (
          <details key={i} className="s-faq__item" data-reveal="up" open={i === 0}>
            <summary className="s-faq__q">
              <span>{it.q}</span>
              <i aria-hidden="true" />
            </summary>
            <div className="s-faq__a">
              <p>{it.a}</p>
            </div>
          </details>
        ))}
      </div>
    </Shell>
  )
}

function Contact({ section: s, site }: SectionProps<'contact'>) {
  const b = site.business
  const address = [b.street, b.city].filter(Boolean).join(', ')
  return (
    <Shell id={s.anchor} type="contact">
      <Head label={s.label} title={s.title}>
        {s.text ? <p className="s__intro" data-reveal="up">{s.text}</p> : null}
      </Head>
      <div className="s-contact__body" data-reveal="up">
        {s.cta.label ? (
          <a className="btn btn--primary btn--xl" href={s.cta.href || (b.phone ? `tel:${b.phone.replace(/[^\d+]/g, '')}` : '#')} data-magnetic>
            {s.cta.label}
          </a>
        ) : null}
        <address className="s-contact__facts">
          {b.phone ? (
            <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>
              <small>{ui(site.lang, 'phone')}</small>
              {b.phone}
            </a>
          ) : null}
          {b.email ? (
            <a href={`mailto:${b.email}`}>
              <small>{ui(site.lang, 'email')}</small>
              {b.email}
            </a>
          ) : null}
          {address ? (
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener">
              <small>{ui(site.lang, 'address')}</small>
              {address}
            </a>
          ) : null}
          {b.hours.length ? (
            <p>
              <small>{ui(site.lang, 'hours')}</small>
              {b.hours.map((h) => humanHours(h, site.lang)).join(', ')}
            </p>
          ) : null}
        </address>
      </div>
    </Shell>
  )
}

export { humanHours }

export const BASE: { [K in SectionType]: SectionRenderers[K] } = {
  hero: Hero,
  marquee: MarqueeSection,
  about: About,
  services: Services,
  works: Works,
  stats: Stats,
  process: Process,
  testimonials: Testimonials,
  team: Team,
  pricing: Pricing,
  menu: Menu,
  gallery: Gallery,
  faq: Faq,
  contact: Contact,
}

/** Сводка-ответ (AEO) — фактический абзац сразу после первого экрана. */
export function Answer({ site }: { site: Site }) {
  if (!site.seo.answer) return null
  return (
    <section className="s s-answer" aria-label={ui(site.lang, 'about')}>
      <div className="s__inner">
        <p className="s-answer__text" data-speakable data-reveal="up">
          {site.seo.answer}
        </p>
      </div>
    </section>
  )
}

export function BaseFooter({ site }: { site: Site }) {
  const b = site.business
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__brand">{site.name}</p>
        {site.tagline ? <p className="site-footer__tag">{site.tagline}</p> : null}
        <ul className="site-footer__social">
          {b.socials.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        <p className="site-footer__legal">
          © {new Date().getFullYear()} {b.legalName || site.name}
          {b.city ? ` · ${b.city}` : ''}
        </p>
      </div>
    </footer>
  )
}
