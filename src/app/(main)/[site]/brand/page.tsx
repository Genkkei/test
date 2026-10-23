import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getSite } from '@/lib/store'
import { themeStyle } from '@/components/SiteRenderer'
import { Logo, Mark } from '@/components/brand/Logo'
import { Mockup, MockDefs, SocialGrid, Banners, BusinessCard, Billboard } from '@/components/brand/Mockups'
import { FitLogos } from '@/components/brand/FitLogos'
import { BookMotion } from '@/components/brand/BookMotion'
import { Media, registerBrandArt } from '@/motion/art'
import { fontStack } from '@/lib/fonts'
import { PRINCIPLES, VENN, VENN_X } from '@/lib/brand'
import '@/components/brand/brandbook.css'

/*
 * Бренд-бук сайта по образцам владельца (видео «What is a brand identity?», гайдлайн Doorstep, «10 принципов
 * маркетинга»). Сверху айсберг: айдентика — 20% над водой, стратегия — 80% под водой. Дальше в порядке работы:
 * исследование → стратегия → дизайн. Каждая тема — лист гайдлайна: слева название и пояснение, справа
 * образец. Движение — anime.js (BookMotion): без скрипта и при «меньше движения» всё видно сразу.
 * Адрес — /<slug>/brand, у сайта на своём домене — /brand.
 */

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ site: string }> }): Promise<Metadata> {
  const site = await getSite((await params).site)
  return site ? { title: `Бренд-бук — ${site.name}`, robots: { index: false }, icons: { icon: `/${site.slug}/icon` } } : {}
}

const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

// пункты айсберга — как в образце владельца; ведут к листам книги
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
  ['model', 'Модель бренда'],
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

/** Лист гайдлайна: слева номер, название в две строки и пояснение, справа образец. */
function Sheet({ id, n, title, note, children, tone, flat }: { id?: string; n: string; title: string; note?: ReactNode; children: ReactNode; tone?: 'dark' | 'acc'; flat?: boolean }) {
  return (
    <section id={id} className={`bb-sheet${tone ? ` bb-sheet--${tone}` : ''}`}>
      <header className="bb-sheet__side">
        <span className="bb-n">{n}</span>
        <h3 data-a="split">{title}</h3>
        {note ? <div className="bb-sheet__note">{note}</div> : null}
      </header>
      <div className={`bb-sheet__art${flat ? ' bb-sheet__art--flat' : ''}`}>{children}</div>
    </section>
  )
}

function Chapter({ id, n, title, text }: { id: string; n: string; title: string; text: string }) {
  return (
    <header id={id} className="bb-chapter">
      <span className="bb-n">{n}</span>
      <h2 data-a="split">{title}</h2>
      <p>{text}</p>
    </header>
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
  const sh = logo.shapes
  registerBrandArt(site.slug, sh, t)
  const venn = b.venn
  const hasVenn = Object.values(venn).some(Boolean)
  const principles = PRINCIPLES.filter(([k]) => b.principles[k])
  // второй цвет знака на четвёртом фоне — первый цвет палитры, которого нет в теме
  const extra = b.palette.find((c) => ![t.bg, t.fg, t.accent, t.surface].includes(c.hex.toLowerCase()))?.hex

  return (
    <main className="bb" style={style}>
      <FitLogos />
      <BookMotion />
      <MockDefs />
      <nav className="bb-top">
        <span className="bb-top__name">
          <Logo site={site} /> <em>бренд-бук</em>
        </span>
        <span className="bb-top__links">
          <a href="#discovery">Исследование</a>
          <a href="#strategy">Стратегия</a>
          <a href="#design">Дизайн</a>
        </span>
        <a className="bb-top__site" href={sitePath}>
          На сайт ↗
        </a>
      </nav>

      {/* ── айсберг ── */}
      <section className="bb-hero">
        <div className="bb-hero__title">
          <p className="bb-kicker">Бренд {site.name}</p>
          <h1 data-a="split">Что такое бренд?</h1>
          <p className="bb-hero__lead">Не только логотип. Над водой — 20%, которые видят люди. Под водой — 80%, на которых всё держится.</p>
        </div>
        <div className="bb-hero__berg">
          <Iceberg />
          <div className="bb-hero__col bb-hero__col--above">
            <b>Айдентика · 20%</b>
            <ul className="bb-hero__list" data-a="rise">
              {ABOVE.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="bb-hero__col bb-hero__col--below">
            <b>Стратегия · 80%</b>
            <ul className="bb-hero__list" data-a="rise">
              {BELOW.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── порядок работы ── */}
      <section className="bb-flow" aria-label="Порядок работы">
        <ol className="bb-flow__steps">
          <li>
            <a href="#discovery">Исследование</a>
          </li>
          <li className="bb-flow__main">
            <a href="#strategy">Стратегия</a>
          </li>
          <li>
            <a href="#design">Дизайн</a>
          </li>
        </ol>
        <p>Сначала узнаём рынок и людей, потом решаем, кем быть, и только потом рисуем.</p>
      </section>

      {/* ── 1. исследование ── */}
      <div className="bb-part">
        <Chapter id="discovery" n="I" title="Исследование" text="Рынок, люди и то, что мы им предлагаем." />
        <Sheet id="research" n="01" title="Исследование рынка" note="Что происходит в нише и где для нас место.">
          <div className="bb-text bb-text--lead">
            <Para text={b.research} />
          </div>
        </Sheet>
        <Sheet id="competition" n="02" title="Конкуренты" note="С кем нас сравнивают и чем они сильны.">
          <div className="bb-rows" data-a="rise">
            {b.competitors.map((c, i) => (
              <div key={i} className="bb-row">
                <b>{c.name}</b>
                <span>{c.note}</span>
              </div>
            ))}
          </div>
        </Sheet>
        <Sheet id="customers" n="03" title="Клиенты" note="Для кого мы работаем — по порядку важности.">
          <div className="bb-cards" data-a="rise">
            {b.customers.map((c, i) => (
              <div key={i} className="bb-card">
                <span className="bb-card__n">0{i + 1}</span>
                <b>{c.name}</b>
                <span>{c.need}</span>
              </div>
            ))}
          </div>
        </Sheet>
        <Sheet id="offering" n="04" title="Предложение" note="Что получает клиент — одной фразой и цифрами.">
          <div className="bb-text bb-text--big">
            <Para text={b.offering} />
          </div>
        </Sheet>
      </div>

      {/* ── 2. стратегия ── */}
      <div className="bb-part bb-part--dark">
        <Chapter id="strategy" n="II" title="Стратегия" text="Кто мы, для кого и почему нам верят. На этом стоит вся айдентика." />
        {hasVenn ? (
          <Sheet id="model" n="05" title="Модель бренда" note="Четыре круга: аудитория, продукт, история и характер. Где они пересекаются — там бренд." tone="dark">
            <div className="bb-venn">
              <svg viewBox="0 0 400 400" className="bb-venn__svg" data-a="draw" aria-hidden="true">
                {[
                  [200, 128],
                  [272, 200],
                  [128, 200],
                  [200, 272],
                ].map(([cx, cy], i) => (
                  <circle key={i} className="draw" cx={cx} cy={cy} r={96} />
                ))}
                <g className="bb-venn__labels">
                  <text x={200} y={84}>{VENN.audience}</text>
                  <text x={318} y={204}>{VENN.product}</text>
                  <text x={82} y={204}>{VENN.story}</text>
                  <text x={200} y={326}>{VENN.personality}</text>
                  <text className="x" x={150} y={156}>{VENN_X.connect}</text>
                  <text className="x" x={250} y={156}>{VENN_X.position}</text>
                  <text className="x" x={150} y={252}>{VENN_X.emote}</text>
                  <text className="x" x={250} y={252}>{VENN_X.apply}</text>
                </g>
              </svg>
              <dl className="bb-venn__legend" data-a="rise">
                {(Object.keys(VENN) as (keyof typeof VENN)[]).map((k) =>
                  venn[k] ? (
                    <div key={k}>
                      <dt>{VENN[k]}</dt>
                      <dd>{venn[k]}</dd>
                    </div>
                  ) : null,
                )}
                {(Object.keys(VENN_X) as (keyof typeof VENN_X)[]).map((k) =>
                  venn[k] ? (
                    <div key={k} className="x">
                      <dt>{VENN_X[k]}</dt>
                      <dd>{venn[k]}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </div>
          </Sheet>
        ) : null}
        {b.archetype.name ? (
          <Sheet n="06" title="Архетип" note="Характер, по которому бренд узнают в каждом слове и картинке." tone="dark">
            <div className="bb-arch">
              <p className="bb-arch__name" data-a="scramble">
                {b.archetype.name}
              </p>
              <div className="bb-chips" data-a="rise">
                {b.archetype.traits.map((x, i) => (
                  <span key={i}>{x}</span>
                ))}
              </div>
              <div className="bb-text">
                <Para text={b.archetype.text} />
              </div>
            </div>
          </Sheet>
        ) : null}
        <Sheet id="difference" n="07" title="Отличие" note="Почему выбирают нас, а не соседей." tone="dark">
          <div className="bb-text bb-text--big">
            <Para text={b.differentiation} />
          </div>
        </Sheet>
        <Sheet id="story" n="08" title="История бренда" tone="dark">
          <div className="bb-text bb-text--lead">
            <Para text={b.story} />
          </div>
        </Sheet>
        <Sheet id="mission" n="09" title="Обещание, миссия, видение" tone="dark">
          <div className="bb-trio" data-a="rise">
            <div>
              <span>Обещание</span>
              <p>{b.promise}</p>
            </div>
            <div>
              <span>Миссия</span>
              <p>{b.mission}</p>
            </div>
            <div id="vision">
              <span>Видение</span>
              <p>{b.vision}</p>
            </div>
          </div>
        </Sheet>
        {b.values.length ? (
          <Sheet n="10" title="Ценности" tone="dark">
            <div className="bb-cards" data-a="rise">
              {b.values.map((v, i) => (
                <div key={i} className="bb-card">
                  <b>{v.title}</b>
                  <span>{v.text}</span>
                </div>
              ))}
            </div>
          </Sheet>
        ) : null}
        <Sheet id="voice" n="11" title="Тон и голос" note="Как мы говорим — на сайте, в постах и в чате." tone="dark">
          <div className="bb-chips" data-a="rise">
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
        </Sheet>
        <Sheet id="look" n="12" title="Образ" note="Каким бренд выглядит и ощущается." tone="dark">
          <div className="bb-chips" data-a="rise">
            {b.look.keywords.map((x, i) => (
              <span key={i}>{x}</span>
            ))}
          </div>
          <div className="bb-text">
            <Para text={b.look.text} />
          </div>
        </Sheet>
        {principles.length ? (
          <Sheet n="13" title="Маркетинг: десять принципов" note="Как бренд продаёт. Каждый принцип — что он значит для нас." tone="dark" flat>
            <ol className="bb-ten" data-a="rise">
              {principles.map(([k, title], i) => (
                <li key={k}>
                  <span className="bb-ten__n">
                    {PRINCIPLES.findIndex(([x]) => x === k) + 1}/10
                  </span>
                  <b>{title}</b>
                  <p>{b.principles[k]}</p>
                </li>
              ))}
            </ol>
          </Sheet>
        ) : null}
      </div>

      {/* ── 3. дизайн ── */}
      <div className="bb-part">
        <Chapter id="design" n="III" title="Дизайн" text="Айдентика: всё, что видят люди. Каждое решение — из стратегии выше." />

        {logo.variants.length && sh.length ? (
          <Sheet n="14" title="Поиск знака" note={logo.why ? <Para text={logo.why} /> : undefined}>
            <div className="bb-explore" data-a="rise">
              {logo.variants.map((v, i) => (
                <figure key={i} className="bb-explore__item">
                  <div className="bb-explore__mark">
                    <Mark shapes={v.shapes} />
                  </div>
                  <figcaption>
                    <b>Вариант {i + 1}</b>
                    {v.note}
                  </figcaption>
                </figure>
              ))}
              <figure className="bb-explore__item bb-explore__item--chosen">
                <div className="bb-explore__mark">
                  <Mark shapes={sh} />
                </div>
                <figcaption>
                  <b>Выбран</b>
                  {logo.idea.split('.')[0]}.
                </figcaption>
              </figure>
            </div>
          </Sheet>
        ) : null}

        <Sheet id="logo" n="15" title="Основной логотип" note={logo.idea ? <Para text={logo.idea} /> : undefined}>
          <div className="bb-pair">
            <div className="bb-panel bb-panel--light">
              <Logo site={site} variant="book" className="bb-logo-l" />
            </div>
            <div className="bb-panel bb-panel--dark">
              <Logo site={site} variant="book" className="bb-logo-l" />
            </div>
          </div>
        </Sheet>

        {sh.length ? (
          <Sheet n="16" title="Знак" note="Знак без надписи — для иконки, аватара, штампа и узора. Работает на любом цвете палитры.">
            <div className="bb-quad" data-a="rise">
              <div className="bb-panel bb-panel--light">
                <Mark shapes={sh} className="bb-mark" />
              </div>
              <div className="bb-panel bb-panel--dark">
                <Mark shapes={sh} className="bb-mark" />
              </div>
              <div className="bb-panel bb-panel--acc">
                <Mark shapes={sh} className="bb-mark" />
              </div>
              <div className="bb-panel bb-panel--surface" style={extra ? ({ background: extra, color: lum(extra) > 0.4 ? dark : light } as CSSProperties) : undefined}>
                <Mark shapes={sh} className="bb-mark" colors={extra ? { bg: extra, accent: lum(extra) > 0.4 ? t.accent : light } : undefined} />
              </div>
            </div>
          </Sheet>
        ) : null}

        <Sheet n="17" title="Охранное поле" note="Вокруг логотипа всегда пусто на x — высоту знака, делённую на четыре. В это поле не заходят текст, края и другие знаки.">
          <div className="bb-panel bb-panel--light bb-clear" data-a="clear">
            <div className="bb-clear__box">
              <Logo site={site} variant="header" className="bb-logo-m" />
              {['tl', 'tr', 'bl', 'br'].map((c) => (
                <i key={c} className={`bb-clear__x bb-clear__x--${c}`} />
              ))}
            </div>
          </div>
        </Sheet>

        {sh.length ? (
          <Sheet n="18" title="Размеры и ошибки" note="Знак отдельно — от 16 px, логотип со словом — от 24 px в высоту. Не растягивать, не поворачивать, не перекрашивать.">
            <div className="bb-sizes">
              {[96, 64, 40, 24, 16].map((s) => (
                <span key={s} className="bb-sizes__item">
                  <span style={{ width: s, height: s }}>
                    <Mark shapes={sh} />
                  </span>
                  <i>{s}</i>
                </span>
              ))}
            </div>
            <div className="bb-misuse" data-a="rise">
              {[
                ['stretch', 'Не растягивать'],
                ['rotate', 'Не поворачивать'],
                ['recolor', 'Не перекрашивать'],
                ['busy', 'Не ставить на пёстрое'],
              ].map(([k, label]) => (
                <figure key={k} className={`bb-misuse__item bb-misuse__item--${k}`}>
                  <div>
                    <Logo site={site} variant="header" />
                  </div>
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </div>
          </Sheet>
        ) : null}

        <Sheet id="type" n="19" title="Шрифт" note={b.type.notes ? <Para text={b.type.notes} /> : undefined}>
          <div className="bb-panel bb-panel--surface bb-face">
            <p className="bb-face__name" style={{ fontFamily: fontStack(display) }} data-a="scramble">
              {display}
            </p>
            <p className="bb-face__weights" style={{ fontFamily: fontStack(body) }}>
              <span>заголовки — {display}</span>
              <span>текст — {body}:</span>
              {[300, 400, 500, 700].map((w) => (
                <span key={w} style={{ fontWeight: w }}>
                  {w === 300 ? 'Light' : w === 400 ? 'Regular' : w === 500 ? 'Medium' : 'Bold'}
                </span>
              ))}
            </p>
            <p className="bb-face__abc" style={{ fontFamily: fontStack(display) }}>
              АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ
              <br />
              ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
            </p>
          </div>
        </Sheet>

        <Sheet n="20" title="Иерархия текста">
          <div className="bb-panel bb-panel--light bb-hier" data-a="rise">
            <div style={{ fontFamily: fontStack(display), fontSize: 'clamp(30px, 4.4vw, 56px)', lineHeight: 1 }}>
              {site.name}
              <i>Заголовок · 56</i>
            </div>
            <div style={{ fontFamily: fontStack(display), fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: 1.05 }}>
              {b.promise.split(/[—.,]/)[0].trim()}
              <i>H1 · 36</i>
            </div>
            <div style={{ fontFamily: fontStack(display), fontSize: 24, lineHeight: 1.1 }}>
              {b.customers[0]?.name || 'Подзаголовок'}
              <i>H2 · 24</i>
            </div>
            <div style={{ fontFamily: fontStack(body), fontSize: 18, fontWeight: 600 }}>
              {b.values[0]?.title || 'Подпись'}
              <i>H3 · 18</i>
            </div>
            <div style={{ fontFamily: fontStack(body), fontSize: 16, lineHeight: 1.55, maxWidth: '52ch' }}>
              {b.voice.sample || site.seo.description}
              <i>Текст · 16</i>
            </div>
          </div>
        </Sheet>

        <Sheet id="colour" n="21" title="Палитра" note="Пропорции — как в полосах: фон и текст несут бренд, акцент — только там, где нужно действие.">
          <div className="bb-stripes" data-a="stripes">
            {b.palette.map((c, i) => (
              <div
                key={i}
                className="bb-stripe"
                style={{ background: c.hex, color: lum(c.hex) > 0.4 ? '#111' : '#fff', flexGrow: [5, 3, 2, 1.4, 1][i] ?? 1 }}
              >
                <b>{c.name}</b>
                <span>{c.hex.toUpperCase()}</span>
                <span className="bb-stripe__role">{c.role}</span>
              </div>
            ))}
          </div>
        </Sheet>

        <Sheet n="22" title="Изображения" note={b.imagery ? <Para text={b.imagery} /> : undefined}>
          <div className="bb-imgs" data-a="rise">
            {[1, 2, 3, 4, 5].map((i) => (
              <Media key={i} className="bb-img" seed={`${site.slug}-book-img-${i}`} alt="" colors={[t.accent, t.surface, t.fg]} />
            ))}
          </div>
        </Sheet>

        {sh.length ? (
          <Sheet n="23" title="Графический узор" note="Знак, повторённый сеткой, — для упаковки, фона постов и подложки. Наведите или коснитесь: узор отвечает.">
            <div className="bb-pattern" data-a="pattern">
              {Array.from({ length: 48 }, (_, i) => (
                <span key={i}>
                  <Mark shapes={sh} />
                </span>
              ))}
            </div>
          </Sheet>
        ) : null}

        {b.social.posts.length ? (
          <Sheet id="social" n="24" title="Креативы для соцсетей">
            <SocialGrid site={site} />
          </Sheet>
        ) : null}

        <Sheet n="25" title="Обложки страниц" note="Шапка профиля и обложка канала: знак, обещание, адрес.">
          <Banners site={site} />
        </Sheet>

        {b.packaging.length ? (
          <Sheet id="packaging" n="26" title="Упаковка" flat>
            <div className="bb-mocks" data-a="rise">
              {b.packaging.filter((m) => m.kind !== 'card').map((m, i) => (
                <Mockup key={i} m={m} site={site} />
              ))}
            </div>
          </Sheet>
        ) : null}

        {b.marketing.length ? (
          <Sheet id="marketing" n="27" title="Носители" flat>
            <div className="bb-mocks bb-mocks--wide" data-a="rise">
              {b.marketing.filter((m) => m.kind !== 'billboard').map((m, i) => (
                <Mockup key={i} m={m} site={site} />
              ))}
            </div>
          </Sheet>
        ) : null}

        <Sheet n="28" title="Визитка">
          <BusinessCard site={site} />
        </Sheet>

        <Sheet n="29" title="Билборд">
          <Billboard site={site} />
        </Sheet>

        <Sheet id="website" n="30" title="Сайт" note={<a href={sitePath}>Открыть сайт ↗</a>}>
          <div className="bb-browser">
            <div className="bb-browser__bar">
              <i />
              <i />
              <i />
              <span>{site.domains[0] || `${site.slug}.genkai.workers.dev`}</span>
            </div>
            <iframe src={`/${site.slug}`} title={`Сайт ${site.name}`} tabIndex={-1} />
          </div>
        </Sheet>
      </div>

      <footer className="bb-foot">
        <Logo site={site} variant="book" className="bb-foot__logo" />
        <span>Бренд-бук · {new Date().getFullYear()}</span>
      </footer>
    </main>
  )
}
