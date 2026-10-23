import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import { getSite } from '@/lib/store'
import { themeStyle } from '@/components/SiteRenderer'
import { Logo, Mark } from '@/components/brand/Logo'
import { Mockup, SocialGrid } from '@/components/brand/Mockups'
import { FitLogos } from '@/components/brand/FitLogos'
import { fontStack } from '@/lib/fonts'
import '@/components/brand/brandbook.css'

/*
 * Бренд-бук сайта — айсберг (образец владельца: «Brand Strategy 80%»): над водой то, что видно людям
 * (логотип, цвет, шрифты, упаковка, реклама, соцсети, сайт), под водой то, на чём это стоит (исследование,
 * предложение, конкуренты, отличие, клиенты, история, обещание, миссия, тон и голос, образ, видение).
 * Адрес — /<slug>/brand, у сайта на своём домене — /brand.
 */

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ site: string }> }): Promise<Metadata> {
  const site = await getSite((await params).site)
  return site ? { title: `Бренд-бук — ${site.name}`, robots: { index: false } } : {}
}

const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

const ABOVE = [
  ['logo', 'Логотип'],
  ['colour', 'Цвет'],
  ['type', 'Типографика'],
  ['packaging', 'Упаковка'],
  ['marketing', 'Маркетинг'],
  ['social', 'Соцсети'],
  ['website', 'Сайт'],
] as const
const BELOW = [
  ['research', 'Исследование'],
  ['offering', 'Предложение'],
  ['competition', 'Конкуренты'],
  ['difference', 'Отличие'],
  ['customers', 'Клиенты'],
  ['story', 'История бренда'],
  ['promise', 'Обещание'],
  ['mission', 'Миссия'],
  ['voice', 'Тон и голос'],
  ['look', 'Образ'],
  ['vision', 'Видение'],
] as const

function Iceberg() {
  return (
    <svg className="bb-ice" viewBox="0 0 420 640" aria-hidden="true">
      <path className="bb-ice__under" d="M118 214 L60 330 L28 382 L70 448 L84 520 L132 570 L170 612 L212 600 L256 560 L282 534 L296 556 L304 500 L330 474 L368 388 L332 300 L284 286 L278 214 Z" />
      <path className="bb-ice__top" d="M118 214 L132 116 L196 50 L228 112 L276 140 L278 214 Z" />
      <path className="bb-ice__wave" d="M-40 214 q26 -14 52 0 t52 0 t52 0 t52 0 t52 0 t52 0 t52 0 t52 0 t52 0 t52 0" />
    </svg>
  )
}

function Para({ text }: { text: string }) {
  return (
    <>
      {text
        .split('\n')
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </>
  )
}

function Block({ id, n, title, children, wide }: { id: string; n: string; title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section id={id} className={`bb-block${wide ? ' bb-block--wide' : ''}`}>
      <header className="bb-block__head">
        <span className="bb-n">{n}</span>
        <h2>{title}</h2>
      </header>
      <div className="bb-block__body">{children}</div>
    </section>
  )
}

export default async function BrandBook({ params }: { params: Promise<{ site: string }> }) {
  const site = await getSite((await params).site)
  if (!site || !site.brand?.logo) notFound()
  const b = site.brand
  const logo = b.logo!
  const t = site.theme
  const dark = lum(t.bg) < lum(t.fg) ? t.bg : t.fg
  const light = dark === t.bg ? t.fg : t.bg
  const style = { ...themeStyle(site), ['--dark' as string]: dark, ['--light' as string]: light } as CSSProperties
  const display = b.type.display || t.display
  const body = b.type.body || t.body
  const sitePath = site.domains[0] ? `https://${site.domains[0]}` : `/${site.slug}`

  return (
    <main className="bb" style={style}>
      <FitLogos />
      <nav className="bb-top">
        <span className="bb-top__name">
          <Logo site={site} /> <em>бренд-бук</em>
        </span>
        <a href={sitePath}>На сайт ↗</a>
      </nav>

      <section className="bb-hero">
        <div className="bb-hero__title">
          <p>Айдентика — 20%</p>
          <h1>
            Бренд <span style={{ fontFamily: fontStack(display) }}>{site.name}</span>
          </h1>
          <p>Стратегия — 80%</p>
        </div>
        <div className="bb-hero__berg">
          <Iceberg />
          <ul className="bb-hero__list bb-hero__list--above">
            {ABOVE.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ul>
          <ul className="bb-hero__list bb-hero__list--below">
            {BELOW.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="bb-zone bb-zone--above">
        <p className="bb-zone__label">Над водой — то, что видят люди</p>

        <Block id="logo" n="01" title="Логотип" wide>
          <div className="bb-logo-main">
            <Logo site={site} variant="book" className="bb-logo-xl" />
          </div>
          <div className="bb-logo-row">
            <div className="bb-tile bb-tile--accent">
              <Logo site={site} variant="book" />
            </div>
            <div className="bb-tile bb-tile--dark">
              <Logo site={site} variant="book" />
            </div>
            {logo.shapes.length ? (
              <div className="bb-tile bb-tile--grid">
                <Mark shapes={logo.shapes} className="bb-construct" />
                <span>сетка 100 × 100</span>
              </div>
            ) : null}
            {logo.shapes.length ? (
              <div className="bb-tile bb-tile--sizes">
                {[64, 40, 24, 16].map((s) => (
                  <span key={s} style={{ width: s, height: s }}>
                    <Mark shapes={logo.shapes} />
                  </span>
                ))}
                <span className="bb-tile__note">иконка сайта</span>
              </div>
            ) : null}
          </div>
          {logo.idea ? <div className="bb-text"><Para text={logo.idea} /></div> : null}
        </Block>

        <Block id="colour" n="02" title="Цвет" wide>
          <div className="bb-swatches">
            {b.palette.map((c, i) => (
              <div key={i} className="bb-swatch" style={{ background: c.hex, color: lum(c.hex) > 0.4 ? '#111' : '#fff' }}>
                <b>{c.name}</b>
                <span>{c.hex.toUpperCase()}</span>
                <span>{c.role}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block id="type" n="03" title="Типографика" wide>
          <div className="bb-type">
            <div className="bb-type__spec" style={{ fontFamily: fontStack(display) }}>
              <span className="bb-type__aa">Аа</span>
              <span className="bb-type__name">{display}</span>
              <span className="bb-type__abc">АБВГДЕЁЖЗИЙКЛМНОП abcdefghijklm 0123456789</span>
            </div>
            <div className="bb-type__spec bb-type__spec--body" style={{ fontFamily: fontStack(body) }}>
              <span className="bb-type__name">{body}</span>
              <p>{b.voice.sample || site.seo.description}</p>
            </div>
          </div>
          {b.type.notes ? <div className="bb-text"><Para text={b.type.notes} /></div> : null}
        </Block>

        {b.packaging.length ? (
          <Block id="packaging" n="04" title="Упаковка" wide>
            <div className="bb-mocks">
              {b.packaging.map((m, i) => (
                <Mockup key={i} m={m} site={site} />
              ))}
            </div>
          </Block>
        ) : null}

        {b.marketing.length ? (
          <Block id="marketing" n="05" title="Маркетинг" wide>
            <div className="bb-mocks bb-mocks--wide">
              {b.marketing.map((m, i) => (
                <Mockup key={i} m={m} site={site} />
              ))}
            </div>
          </Block>
        ) : null}

        {b.social.posts.length ? (
          <Block id="social" n="06" title="Соцсети" wide>
            <SocialGrid site={site} />
          </Block>
        ) : null}

        <Block id="website" n="07" title="Сайт" wide>
          <div className="bb-browser">
            <div className="bb-browser__bar">
              <i />
              <i />
              <i />
              <span>{site.domains[0] || `${site.slug}.genkai.workers.dev`}</span>
            </div>
            <iframe src={`/${site.slug}`} title={`Сайт ${site.name}`} tabIndex={-1} />
          </div>
          <p className="bb-text">
            <a href={sitePath}>Открыть сайт ↗</a>
          </p>
        </Block>
      </div>

      <div className="bb-water" aria-hidden="true" />

      <div className="bb-zone bb-zone--below">
        <p className="bb-zone__label">Под водой — то, на чём всё стоит</p>

        <Block id="research" n="08" title="Исследование">
          <div className="bb-text"><Para text={b.research} /></div>
        </Block>
        <Block id="offering" n="09" title="Предложение">
          <div className="bb-text"><Para text={b.offering} /></div>
        </Block>
        <Block id="competition" n="10" title="Конкуренты" wide>
          <div className="bb-rows">
            {b.competitors.map((c, i) => (
              <div key={i} className="bb-row">
                <b>{c.name}</b>
                <span>{c.note}</span>
              </div>
            ))}
          </div>
        </Block>
        <Block id="difference" n="11" title="Отличие" wide>
          <div className="bb-text bb-text--big"><Para text={b.differentiation} /></div>
        </Block>
        <Block id="customers" n="12" title="Клиенты" wide>
          <div className="bb-cards">
            {b.customers.map((c, i) => (
              <div key={i} className="bb-card">
                <b>{c.name}</b>
                <span>{c.need}</span>
              </div>
            ))}
          </div>
        </Block>
        <Block id="story" n="13" title="История бренда">
          <div className="bb-text"><Para text={b.story} /></div>
        </Block>
        <Block id="promise" n="14" title="Обещание">
          <div className="bb-text bb-text--big"><Para text={b.promise} /></div>
        </Block>
        <Block id="mission" n="15" title="Миссия">
          <div className="bb-text bb-text--big"><Para text={b.mission} /></div>
          {b.values.length ? (
            <div className="bb-cards bb-cards--values">
              {b.values.map((v, i) => (
                <div key={i} className="bb-card">
                  <b>{v.title}</b>
                  <span>{v.text}</span>
                </div>
              ))}
            </div>
          ) : null}
        </Block>
        <Block id="vision" n="16" title="Видение">
          <div className="bb-text bb-text--big"><Para text={b.vision} /></div>
        </Block>
        <Block id="voice" n="17" title="Тон и голос" wide>
          <div className="bb-chips">
            {b.voice.traits.map((x, i) => (
              <span key={i}>{x}</span>
            ))}
          </div>
          <div className="bb-dodont">
            <div>
              <b>Говорим</b>
              <ul>
                {b.voice.do.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <b>Не говорим</b>
              <ul>
                {b.voice.dont.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
          {b.voice.sample ? <blockquote className="bb-quote">{b.voice.sample}</blockquote> : null}
        </Block>
        <Block id="look" n="18" title="Образ" wide>
          <div className="bb-chips">
            {b.look.keywords.map((x, i) => (
              <span key={i}>{x}</span>
            ))}
          </div>
          <div className="bb-text"><Para text={b.look.text} /></div>
        </Block>
      </div>

      <footer className="bb-foot">
        <Logo site={site} variant="footer" />
        <span>Бренд-бук · {new Date().getFullYear()}</span>
      </footer>
    </main>
  )
}

