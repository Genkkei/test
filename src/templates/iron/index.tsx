import type { Site } from '@/lib/schema'
import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/motion/widgets'
import { Head, Shell as Sec, humanHours } from '@/components/sections'
import { navLinks, type SectionProps, type TemplateDef } from '../types'
import { meta } from './meta'
import { pick, ui } from '@/lib/i18n'
import { Calc, GateScroll } from './client'

/*
 * ВОРОТА — каталог ворот и заборов в духе инженерных каталогов (Hörmann, Jansen):
 * светлый лист с миллиметровкой, чертёж откатных ворот на первом экране — створка
 * отъезжает при прокрутке, размерные линии подписаны моноширинным. Каталог — образцы
 * секций с ценой за погонный метр, под ними калькулятор «модель × длина». Подвал —
 * штамп чертежа с реквизитами.
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

type Kind = 'spears' | 'louver' | 'sheet' | 'mesh' | 'ranch' | 'ornament'
function kindOf(title: string, i: number): Kind {
  const t = title.toLowerCase()
  if (/жалюз|jalyuz|louv/.test(t)) return 'louver'
  if (/профнаст|profnastil|profil|sheet|corrugat/.test(t)) return 'sheet'
  if (/3d|сетк|to‘r|tor\b|mesh|panel/.test(t)) return 'mesh'
  if (/ранчо|rancho|ranch|штакет|shtaket|picket/.test(t)) return 'ranch'
  if (/художеств|ornament|badiiy|art|узор|naqsh/.test(t)) return 'ornament'
  if (/кован|temir|forged|wrought|пик|nayza|spear/.test(t)) return 'spears'
  return (['spears', 'louver', 'sheet', 'mesh', 'ranch', 'ornament'] as Kind[])[i % 6]
}

/** Образец секции забора 160×100: у каждого типа свой рисунок. */
function Sample({ kind }: { kind: Kind }) {
  const bars = Array.from({ length: 11 }, (_, i) => 12 + i * 13.6)
  return (
    <svg className="iron-sample" viewBox="0 0 160 100" aria-hidden="true">
      <path className="iron-sample__post" d="M4 6v92M156 6v92" />
      {kind === 'spears' && (
        <>
          <path d="M8 22h144M8 86h144" />
          {bars.map((x) => (
            <path key={x} d={`M${x} 92V14m-3 5 3-9 3 9`} />
          ))}
        </>
      )}
      {kind === 'louver' && Array.from({ length: 9 }, (_, i) => <path key={i} d={`M8 ${12 + i * 9.5}h144l0 5H8z`} />)}
      {kind === 'sheet' && (
        <path d={`M8 10${Array.from({ length: 18 }, (_, i) => `L${8 + i * 8 + 4} ${i % 2 ? 10 : 14}`).join('')}L152 10V92H8Z M${Array.from({ length: 18 }, (_, i) => `${12 + i * 8} 14V92`).join(' M')}`} />
      )}
      {kind === 'mesh' && (
        <>
          <path d="M8 10h144v82H8z" />
          {Array.from({ length: 13 }, (_, i) => (
            <path key={`v${i}`} d={`M${8 + i * 12} 10v82`} />
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <path key={`h${i}`} d={`M8 ${26 + i * 20}h144`} />
          ))}
          <path d="M8 58q72-10 144 0" />
        </>
      )}
      {kind === 'ranch' &&
        Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M8 ${18 + i * 20}h144v9H8z`} />
        ))}
      {kind === 'ornament' && (
        <>
          <path d="M8 14h144M8 88h144" />
          {[30, 80, 130].map((x) => (
            <path key={x} d={`M${x} 88V14 M${x} 50c-14-14-26 4-14 10 8 4 12-6 4-8 M${x} 50c14-14 26 4 14 10-8 4-12-6-4-8 M${x} 30c-8-8-16 2-8 6 M${x} 30c8-8 16 2 8 6`} />
          ))}
          {[55, 105].map((x) => (
            <path key={x} d={`M${x} 88V14`} />
          ))}
        </>
      )}
    </svg>
  )
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site)
  const b = site.business
  return (
    <>
      <header className="iron-header">
        <a href="#top" className="iron-logo" aria-label={`${site.name} — ${ui(site.lang, 'toTop').toLowerCase()}`}>
          {site.brand?.logo ? (
            <Logo site={site} />
          ) : (
            <>
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <path d="M3 25V8l11-5 11 5v17M8 25V11M14 25V9M20 25V11M3 16h22" />
          </svg>
          <span>{site.name}</span>
            </>
          )}
        </a>
        <nav className="iron-nav" aria-label={ui(site.lang, 'sections')}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href}>
              <small>{String(i + 1).padStart(2, '0')}</small>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="iron-header__side">
          {b.phone ? (
            <a className="iron-phone" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
          {site.nav.cta.label ? (
            <a className="iron-btn iron-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="iron-footer">
        <div className="iron-footer__inner">
          <div className="iron-footer__brand">
            <p className="iron-footer__name">{site.brand?.logo ? <Logo site={site} variant="footer" /> : site.name}</p>
            <p className="iron-footer__tag">{site.tagline}</p>
            <ul className="iron-footer__social">
              {b.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener me">
                    {s.name} →
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* штамп чертежа: графы с реквизитами */}
          <table className="iron-stamp">
            <tbody>
              <tr>
                <th>{pick(site.lang, { ru: 'Изготовитель', uz: 'Ishlab chiqaruvchi', en: 'Maker' })}</th>
                <td colSpan={3}>{b.legalName || site.name}</td>
              </tr>
              <tr>
                <th>{ui(site.lang, 'address')}</th>
                <td colSpan={3}>{[b.street, b.city].filter(Boolean).join(', ')}</td>
              </tr>
              <tr>
                <th>{ui(site.lang, 'phone')}</th>
                <td>{b.phone ? <a href={tel(b.phone)}>{b.phone}</a> : '—'}</td>
                <th>{ui(site.lang, 'hours')}</th>
                <td>{b.hours.map((h) => humanHours(h, site.lang)).join(', ') || '—'}</td>
              </tr>
              <tr>
                <th>{pick(site.lang, { ru: 'Лист', uz: 'Varaq', en: 'Sheet' })}</th>
                <td>1 / 1</td>
                <th>{pick(site.lang, { ru: 'Масштаб', uz: 'Masshtab', en: 'Scale' })}</th>
                <td>1:1</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="iron-footer__bottom">
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
  const bars = Array.from({ length: 14 }, (_, i) => 40 + i * 22)
  return (
    <section id={s.anchor || undefined} className="s s-hero iron-hero">
      <div className="iron-hero__inner">
        <div className="iron-hero__text">
          {s.eyebrow ? (
            <p className="iron-hero__eyebrow iron-in" style={{ ['--d' as string]: '.1s' }}>
              <span>№ 01</span>
              {s.eyebrow}
            </p>
          ) : null}
          <h1 className="iron-hero__title" data-split="lines">
            {s.title || site.name}
          </h1>
          {s.subtitle ? (
            <p className="iron-hero__sub iron-in" style={{ ['--d' as string]: '.5s' }}>
              {s.subtitle}
            </p>
          ) : null}
          <div className="iron-hero__ctas iron-in" style={{ ['--d' as string]: '.65s' }}>
            {s.cta.label ? (
              <a className="iron-btn" href={s.cta.href || '#'} data-magnetic>
                {s.cta.label}
              </a>
            ) : null}
            {s.ctaSecondary.label ? (
              <a className="iron-btn iron-btn--ghost" href={s.ctaSecondary.href || '#'}>
                {s.ctaSecondary.label}
              </a>
            ) : null}
          </div>
          {s.words.length ? (
            <ul className="iron-hero__spec iron-in" style={{ ['--d' as string]: '.8s' }}>
              {s.words.map((w, i) => (
                <li key={i}>
                  <span>{String.fromCharCode(65 + i)}</span>
                  {w}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <GateScroll>
          <svg className="iron-gate__svg" viewBox="0 0 400 300" role="img" aria-label={pick(site.lang, { ru: 'Чертёж откатных ворот', uz: 'Surma darvoza chizmasi', en: 'Sliding gate drawing' })}>
            {/* земля, столбы и направляющая */}
            <path className="iron-draw iron-draw--thin" pathLength={1} d="M0 262h400" />
            <path className="iron-draw" pathLength={1} d="M362 262V70h14v192" />
            {/* неподвижная калитка слева нарисована пунктиром — проём */}
            <path className="iron-dash" d="M38 96h324M38 246h324M38 96v150M362 96v150" />
            {/* откатная створка */}
            <g className="iron-gate__leaf">
              <path className="iron-draw" pathLength={1} d="M38 96h324v150H38zM38 118h324M38 226h324" />
              {bars.map((x, i) => (
                <path key={x} className="iron-draw iron-draw--bar" pathLength={1} style={{ ['--i' as string]: i }} d={`M${x} 246V84m-4 8 4-12 4 12`} />
              ))}
              <path className="iron-draw iron-draw--thin" pathLength={1} d="M150 172c-14-16-30 4-16 12 10 5 14-8 4-10M250 172c14-16 30 4 16 12-10 5-14-8-4-10M200 160c0-14 12-14 12-4" />
              <circle cx="70" cy="254" r="7" className="iron-draw iron-draw--thin" pathLength={1} />
              <circle cx="330" cy="254" r="7" className="iron-draw iron-draw--thin" pathLength={1} />
            </g>
            {/* левый столб — поверх створки: она уезжает за него */}
            <path className="iron-draw iron-post" pathLength={1} d="M24 262V70h14v192z" />
            {/* размеры */}
            <g className="iron-dim">
              <path d="M38 286h324M38 280v12M362 280v12" />
              <text x="200" y="282">4000</text>
              <path d="M392 96v150M386 96h12M386 246h12" />
              <text x="396" y="176" transform="rotate(90 396 176)">1800</text>
            </g>
          </svg>
          <p className="iron-gate__cap">
            <span>{pick(site.lang, { ru: 'Откатные ворота · пики · ширина 4000 мм', uz: 'Surma darvoza · nayzali · kengligi 4000 mm', en: 'Sliding gate · spear tops · 4000 mm wide' })}</span>
            <span className="iron-gate__hint">{pick(site.lang, { ru: 'листайте — ворота откроются', uz: 'pastga suring — darvoza ochiladi', en: 'scroll to open the gate' })}</span>
          </p>
        </GateScroll>
      </div>
    </section>
  )
}

/** Каталог: образец секции, цена за погонный метр; ниже — калькулятор. */
function Services({ section: s, site }: SectionProps<'services'>) {
  const cta = site.nav.cta.label ? site.nav.cta : { label: pick(site.lang, { ru: 'Вызвать замерщика', uz: 'O‘lchovchini chaqirish', en: 'Book a measurer' }), href: '#order' }
  return (
    <Sec id={s.anchor} type="services" className="iron-cat-sec">
      <Head label={s.label} title={s.title}>
        {s.intro ? (
          <p className="s__intro" data-reveal="up">
            {s.intro}
          </p>
        ) : null}
      </Head>
      <ul className="iron-cat">
        {s.items.map((it, i) => (
          <li key={i} className="iron-card" data-reveal="up" data-delay={String((i % 3) * 0.07)}>
            <div className="iron-card__sample">
              <Sample kind={kindOf(it.title, i)} />
              <span className="iron-card__code">
                {pick(site.lang, { ru: 'Арт.', uz: 'Art.', en: 'Ref.' })} VP-{String(i + 1).padStart(3, '0')}
              </span>
            </div>
            <div className="iron-card__body">
              <h3>{it.title}</h3>
              {it.text ? <p>{it.text}</p> : null}
            </div>
            <div className="iron-card__foot">
              {it.tag ? <span className="iron-card__tag">{it.tag}</span> : <span />}
              {it.price ? <b>{it.price}</b> : null}
            </div>
          </li>
        ))}
      </ul>
      <Calc items={s.items.map((i) => ({ title: i.title, price: i.price }))} lang={site.lang} cta={cta} />
    </Sec>
  )
}

/** Этапы — размерная цепочка: отрезки между засечками, под каждым — шаг. */
function Process({ section: s }: SectionProps<'process'>) {
  return (
    <Sec id={s.anchor} type="process" className="iron-chain-sec">
      <Head label={s.label} title={s.title} />
      <ol className="iron-chain" data-reveal="fade" style={{ ['--n' as string]: s.items.length }}>
        {s.items.map((it, i) => (
          <li key={i} style={{ ['--i' as string]: i }}>
            <span className="iron-chain__dim" aria-hidden="true">
              <i />
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

function Stats({ section: s }: SectionProps<'stats'>) {
  return (
    <Sec id={s.anchor} type="stats" className="iron-stats-sec">
      <Head label={s.label} title={s.title} />
      <dl className="iron-stats">
        {s.items.map((it, i) => (
          <div key={i} data-reveal="up" data-delay={String(i * 0.07)}>
            <dt>{it.label}</dt>
            <dd>
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
