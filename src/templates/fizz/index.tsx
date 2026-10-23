import { pick } from '@/lib/i18n'
import { Logo } from '@/components/brand/Logo'
import type { Site } from '@/lib/schema'
import { Marquee, MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { Can, Curtain, FizzHeader } from './client'

/** Цвета вкусов: акцент сайта первым, дальше фиксированная «газировочная» палитра. */
const FLAVORS = ['#ff4d1c', '#c8f53b', '#ff5fa2', '#3f7bff', '#ffcf2e', '#22c9a0']
function flavorColor(site: Site, i: number) {
  return i === 0 ? site.theme.accent : FLAVORS[i % FLAVORS.length]
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  return (
    <>
      <Curtain word={site.name} />
      <FizzHeader>
        <a href="#top" className="fizz-logo" aria-label={`${site.name} — ${pick(site.lang, { ru: 'наверх', uz: 'yuqoriga', en: 'back to top' })}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          {site.name}
            </>
          )}
        </a>
        <nav className="fizz-nav" aria-label={pick(site.lang, { ru: 'Разделы', uz: 'Bo‘limlar', en: 'Sections' })}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="fizz-header__side">
          {site.nav.cta.label ? (
            <a className="fizz-cta" href={site.nav.cta.href} data-magnetic>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </FizzHeader>
      <main id="top">{children}</main>
      <footer className="fizz-footer">
        <Marquee items={[site.tagline || site.name, site.name, site.tagline || site.name, site.name]} className="marquee fizz-footer__mq" speed={30} sep="●" />
        <div className="fizz-footer__grid">
          <div>
            <p className="fizz-sticker">{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</p>
            {site.business.phone ? <a href={`tel:${site.business.phone.replace(/[^\d+]/g, '')}`}>{site.business.phone}</a> : null}
            {site.business.email ? <a href={`mailto:${site.business.email}`}>{site.business.email}</a> : null}
          </div>
          <div>
            <p className="fizz-sticker">{pick(site.lang, { ru: 'Адрес', uz: 'Manzil', en: 'Address' })}</p>
            <span>{[site.business.street, site.business.city].filter(Boolean).join(', ')}</span>
          </div>
          <div>
            <p className="fizz-sticker">{pick(site.lang, { ru: 'Соцсети', uz: 'Ijtimoiy tarmoqlar', en: 'Social' })}</p>
            {site.business.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <p className="fizz-footer__word" aria-hidden="true">
          {site.name}
        </p>
        <p className="fizz-footer__legal">
          © {new Date().getFullYear()} {site.business.legalName || site.name}. {pick(site.lang, { ru: 'Тонизирующий напиток. Не рекомендуется детям, беременным и кормящим.', uz: 'Tetiklashtiruvchi ichimlik. Bolalar, homilador va emizikli ayollarga tavsiya etilmaydi.', en: 'Energy drink. Not recommended for children or pregnant or breastfeeding women.' })}
        </p>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const words = s.words.length ? s.words : [site.name]
  return (
    <section id={s.anchor || undefined} className="s s-hero fizz-hero">
      <div className="fizz-hero__bg" aria-hidden="true">
        <Marquee items={words} className="marquee fizz-hero__mq" speed={22} sep="✱" />
        <Marquee items={[...words].reverse()} className="marquee fizz-hero__mq fizz-hero__mq--rev" speed={26} sep="✱" />
      </div>
      <div className="fizz-hero__stage fizz-rise" style={{ ['--d' as string]: '1.25s' }}>
        <Can strip={pick(site.lang, { ru: '0% сахара · 250 мл', uz: '0% shakar · 250 ml', en: '0% sugar · 250 ml' })} name={site.name} flavor={s.eyebrow || 'Original'} color={site.theme.accent} className="can--hero" />
        <span className="fizz-hero__sticker" aria-hidden="true">
          {pick(site.lang, { ru: '0 г', uz: '0 g', en: '0 g' })}<br />{pick(site.lang, { ru: 'сахара', uz: 'shakar', en: 'sugar' })}
        </span>
      </div>
      <div className="fizz-hero__copy">
        <h1 className="fizz-hero__title" data-split="words">
          {s.title || site.name}
        </h1>
        <div className="fizz-hero__row">
          {s.subtitle ? (
            <p className="fizz-hero__sub fizz-rise" style={{ ['--d' as string]: '1.6s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="fizz-hero__ctas fizz-rise" style={{ ['--d' as string]: '1.75s' }}>
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
      </div>
    </section>
  )
}

/** Вкусы — карточки-продукты с собственной банкой. */
function Services({ section: s, site }: SectionProps<'services'>) {
  return (
    <Sec id={s.anchor} type="services" className="fizz-flavors">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <div className="fizz-flavors__grid">
        {s.items.map((it, i) => (
          <article key={i} className="fizz-flavor" style={{ ['--fl' as string]: flavorColor(site, i) }} data-reveal="up" data-delay={String((i % 3) * 0.08)}>
            <div className="fizz-flavor__stage">
              <Can strip={pick(site.lang, { ru: '0% сахара · 250 мл', uz: '0% shakar · 250 ml', en: '0% sugar · 250 ml' })} name={site.name} flavor={it.title} color={flavorColor(site, i)} live={false} className="can--card" />
              {it.tag ? <span className="fizz-flavor__tag">{it.tag}</span> : null}
            </div>
            <div className="fizz-flavor__body">
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            {it.price ? <p className="fizz-flavor__price">{it.price}</p> : null}
          </article>
        ))}
      </div>
    </Sec>
  )
}

function MarqueeSec({ section: s, site }: SectionProps<'marquee'>) {
  return (
    <section className="s s-marquee fizz-band" aria-label={s.title || pick(site.lang, { ru: 'Ключевые слова', uz: 'Kalit so‘zlar', en: 'Keywords' })}>
      <Marquee items={s.items} speed={28} sep="✱" />
      <Marquee items={s.items} className="marquee fizz-band__back" speed={34} sep="✱" />
    </section>
  )
}

function About({ section: s }: SectionProps<'about'>) {
  return (
    <Sec id={s.anchor} type="about" className="fizz-about">
      {s.label ? (
        <p className="fizz-sticker" data-reveal="scale">
          {s.label}
        </p>
      ) : null}
      <h2 className="fizz-about__title" data-split="words">
        {s.title}
      </h2>
      {s.text ? (
        <p className="fizz-about__text" data-reveal="up">
          {s.text}
        </p>
      ) : null}
    </Sec>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, marquee: MarqueeSec, about: About },
}
