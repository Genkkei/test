import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { Clock, MobileMenu } from '@/motion/widgets'
import { humanHours, pick, ui } from '@/lib/i18n'
import { navLinks, palette, type SectionProps, type TemplateDef } from '../types'
import { Media } from '@/motion/art'
import { meta } from './meta'
import { Ruler, Voice, ClipReveal } from './client'

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <Ruler />
      <header className="ledger-header">
        <div className="ledger-header__top">
          <span>
            {b.city || pick(site.lang, { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent' })}, <Clock lang={site.lang} />
          </span>
          {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
        </div>
        <div className="ledger-header__main">
          <a href="#top" className="ledger-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop')}`}>
            {site.brand?.logo ? (
              <Logo site={site} />
            ) : (
              <>
            {site.name}
              </>
            )}
          </a>
          <nav className="ledger-nav" aria-label={ui(site.lang, 'sections')}>
            {links.map((l, i) => (
              <a key={l.href} href={l.href}>
                <sup>{String(i + 1).padStart(2, '0')}</sup>
                {l.label}
              </a>
            ))}
          </nav>
          {site.nav.cta.label ? (
            <a className="ledger-header__cta" href={site.nav.cta.href}>
              {site.nav.cta.label} <span aria-hidden="true">→</span>
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <ClipReveal />
      <main id="top" className="ledger-main">
        {children}
      </main>
      <footer className="ledger-footer">
        <div className="ledger-footer__grid">
          <p className="ledger-footer__brand">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
          <div>
            <small>{pick(site.lang, { ru: 'Офис', uz: 'Ofis', en: 'Office' })}</small>
            <p>{[b.street, b.city].filter(Boolean).join(', ')}</p>
            {b.hours.map((h) => (
              <p key={h}>{humanHours(h, site.lang)}</p>
            ))}
          </div>
          <div>
            <small>{pick(site.lang, { ru: 'Связь', uz: 'Aloqa', en: 'Contact' })}</small>
            {b.phone ? <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a> : null}
            {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
          </div>
          <div>
            <small>{pick(site.lang, { ru: 'Профили', uz: 'Profillar', en: 'Profiles' })}</small>
            {b.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <div className="ledger-footer__legal">
          <span>
            © {new Date().getFullYear()} {b.legalName || site.name}
          </span>
          <span>{pick(site.lang, { ru: 'Материалы сайта носят информационный характер и не являются юридической консультацией.', uz: 'Sayt materiallari ma’lumot uchun mo‘ljallangan va yuridik maslahat hisoblanmaydi.', en: 'The content of this site is for information only and is not legal advice.' })}</span>
        </div>
      </footer>
    </>
  )
}

function Hero({ section: s, site }: SectionProps<'hero'>) {
  const stats = site.sections.find((x) => x.type === 'stats' && x.enabled)
  const facts = stats && stats.type === 'stats' ? stats.items.slice(0, 3) : []
  return (
    <section id={s.anchor || undefined} className="s s-hero ledger-hero">
      <div className="ledger-hero__inner">
        <div className="ledger-hero__index ledger-in" style={{ ['--i' as string]: 0 }}>
          <span>§ 00</span>
          <span>{s.eyebrow}</span>
        </div>
        <h1 className="ledger-hero__title">
          <span data-split="lines">{s.title || site.name}</span> <Voice words={s.words} />
        </h1>
        <div className="ledger-hero__foot">
          {s.subtitle ? (
            <p className="ledger-hero__sub ledger-in" style={{ ['--i' as string]: 4 }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="ledger-hero__ctas ledger-in" style={{ ['--i' as string]: 5 }}>
            {s.cta.label ? (
              <a className="btn btn--primary" href={s.cta.href || '#'}>
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
      <figure className="ledger-hero__plate" aria-hidden="true">
        <Media src={s.image} alt="" seed={`${site.slug}-hero`} colors={palette(site)} kind="grid" className="media" />
        {facts.length ? (
          <figcaption className="ledger-dossier">
            <span className="ledger-dossier__tab">{pick(site.lang, { ru: 'Досье фирмы', uz: 'Firma dosyesi', en: 'Firm dossier' })}</span>
            <dl>
              {facts.map((f, i) => (
                <div key={i}>
                  <dt>
                    {f.value}
                    {f.suffix ? <small> {f.suffix}</small> : null}
                  </dt>
                  <dd>{f.label}</dd>
                </div>
              ))}
            </dl>
          </figcaption>
        ) : null}
      </figure>
    </section>
  )
}

/** Практики — оглавление кодекса: «ст. 01» и название крупно; наведение раскрывает строку, справа цена и срок. */
function Services({ section: s }: SectionProps<'services'>) {
  return (
    <section id={s.anchor || undefined} className="s s-services ledger-code">
      <div className="s__inner">
        <div className="s__head">
          {s.label ? <p className="s__label">{s.label}</p> : null}
          {s.title ? <h2 className="s__title">{s.title}</h2> : null}
          {s.intro ? <p className="s__intro">{s.intro}</p> : null}
        </div>
        <ol className="ledger-code__list">
          {s.items.map((it, i) => (
            <li key={i} className="ledger-article" tabIndex={0} data-reveal="up">
              <span className="ledger-article__n">ст. {String(i + 1).padStart(2, '0')}</span>
              <h3 className="ledger-article__title">{it.title}</h3>
              <div className="ledger-article__body">
                <div>
                  {it.text ? <p>{it.text}</p> : null}
                  <p className="ledger-article__meta">
                    {it.price ? <b>{it.price}</b> : null}
                    {it.tag ? <span>{it.tag}</span> : null}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** Дела — список слева, справа закреплённая «папка» со снимком дела под курсором (без скрипта — первое дело). */
function Works({ section: s, site }: SectionProps<'works'>) {
  return (
    <section id={s.anchor || undefined} className="s s-works ledger-cases">
      <div className="s__inner">
        <div className="s__head">
          {s.label ? <p className="s__label">{s.label}</p> : null}
          {s.title ? <h2 className="s__title">{s.title}</h2> : null}
        </div>
        <div className="ledger-cases__body">
          <ul className="ledger-cases__list">
            {s.items.map((it, i) => (
              <li key={i} className="ledger-case" tabIndex={0} style={{ ['--k' as string]: i }}>
                <span className="ledger-case__meta">
                  {it.category} · {it.year}
                </span>
                <h3 className="ledger-case__title">{it.title}</h3>
                {it.text ? <p className="ledger-case__text">{it.text}</p> : null}
                <div className="ledger-case__img">
                  <Media src={it.image} alt={it.title} seed={`${site.slug}-w${i}`} colors={palette(site)} kind="grid" className="media" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: { hero: Hero, services: Services, works: Works },
}
