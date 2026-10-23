import type { ReactNode } from 'react'
import type { Brand } from '@/lib/brand'
import type { Site } from '@/lib/schema'
import { Logo, Mark } from './Logo'

/*
 * Макеты айдентики для бренд-бука: упаковка, реклама, соцсети. Рисуются кодом в цветах сайта и с его
 * логотипом — у каждого из сайтов свои, без фото и шаблонных картинок. Силуэт — SVG (стакан, бутылка,
 * футболка, фургон), надписи — HTML поверх, в шрифтах бренда.
 */

type M = Brand['packaging'][number]

function Frame({ kind, children, label, text }: { kind: string; children: ReactNode; label: string; text: string }) {
  return (
    <figure className={`mk mk--${kind}`}>
      <div className="mk__stage">{children}</div>
      <figcaption>
        <b>{label}</b>
        {text ? <span>{text}</span> : null}
      </figcaption>
    </figure>
  )
}

const shapes = (site: Site) => site.brand?.logo?.shapes ?? []

export function Mockup({ m, site }: { m: M; site: Site }) {
  // на мелких предметах — логотип без подписи: подпись в узкой сцене переносилась в три строки
  const word = <Logo site={site} variant="header" />
  const full = <Logo site={site} variant="footer" />
  const mark = shapes(site).length ? <Mark shapes={shapes(site)} className="mk__mark" /> : word
  const L = (n: ReactNode) => <div className="mk__logo">{n}</div>
  const title = m.title
  switch (m.kind) {
    case 'cup':
      return (
        <Frame kind="cup" label={title} text={m.text}>
          <svg viewBox="0 0 200 240" className="mk__svg">
            <ellipse cx="100" cy="228" rx="62" ry="7" className="mk-shadow" />
            <path d="M44 48 L156 48 L140 222 Q100 230 60 222 Z" className="mk-body" />
            <path d="M50 108 L150 108 L144 170 L56 170 Z" className="mk-band" />
            <rect x="36" y="30" width="128" height="20" rx="8" className="mk-lid" />
            <rect x="46" y="20" width="108" height="14" rx="7" className="mk-lid2" />
          
            <path d="M44 48 L156 48 L140 222 Q100 230 60 222 Z" className="mk-shade" />
          </svg>
          <div className="mk__on" style={{ top: '46%', left: '50%', width: '44%' }}>{L(mark)}</div>
        </Frame>
      )
    case 'box':
      return (
        <Frame kind="box" label={title} text={m.text}>
          <div className="mk-boxtop">
            <div className="mk-boxtop__band" />
            {L(full)}
            <p className="mk__line">{m.text}</p>
          </div>
        </Frame>
      )
    case 'bag':
      return (
        <Frame kind="bag" label={title} text={m.text}>
          <svg viewBox="0 0 200 240" className="mk__svg">
            <ellipse cx="100" cy="230" rx="70" ry="6" className="mk-shadow" />
            <path d="M70 66 C70 26 130 26 130 66" fill="none" className="mk-handle" />
            <path d="M34 62 L166 62 L174 226 L26 226 Z" className="mk-body" />
            <path d="M34 62 L166 62 L164 78 L36 78 Z" className="mk-band" />
          
            <path d="M34 62 L166 62 L174 226 L26 226 Z" className="mk-shade" />
          </svg>
          <div className="mk__on" style={{ top: '58%', left: '50%', width: '58%' }}>{L(word)}</div>
        </Frame>
      )
    case 'bottle':
      return (
        <Frame kind="bottle" label={title} text={m.text}>
          <svg viewBox="0 0 200 240" className="mk__svg">
            <ellipse cx="100" cy="232" rx="44" ry="5" className="mk-shadow" />
            <rect x="86" y="8" width="28" height="22" rx="4" className="mk-lid" />
            <path d="M88 30 L112 30 L114 60 Q142 74 142 104 L142 220 Q142 230 132 230 L68 230 Q58 230 58 220 L58 104 Q58 74 86 60 Z" className="mk-body" />
            <rect x="58" y="120" width="84" height="74" className="mk-band" />
          
            <path d="M88 30 L112 30 L114 60 Q142 74 142 104 L142 220 Q142 230 132 230 L68 230 Q58 230 58 220 L58 104 Q58 74 86 60 Z" className="mk-shade" />
          </svg>
          <div className="mk__on" style={{ top: '65%', left: '50%', width: '36%' }}>{L(mark)}</div>
        </Frame>
      )
    case 'jar':
      return (
        <Frame kind="jar" label={title} text={m.text}>
          <svg viewBox="0 0 200 240" className="mk__svg">
            <ellipse cx="100" cy="230" rx="66" ry="6" className="mk-shadow" />
            <rect x="48" y="36" width="104" height="30" rx="8" className="mk-lid" />
            <rect x="40" y="62" width="120" height="166" rx="22" className="mk-body" />
            <rect x="40" y="106" width="120" height="84" className="mk-band" />
          
            <rect x="40" y="62" width="120" height="166" rx="22" className="mk-shade" />
          </svg>
          <div className="mk__on" style={{ top: '62%', left: '50%', width: '50%' }}>{L(word)}</div>
        </Frame>
      )
    case 'tube':
      return (
        <Frame kind="tube" label={title} text={m.text}>
          <svg viewBox="0 0 200 240" className="mk__svg">
            <ellipse cx="100" cy="232" rx="40" ry="5" className="mk-shadow" />
            <path d="M58 18 L142 18 L136 30 L64 30 Z" className="mk-band" />
            <path d="M64 30 L136 30 L128 196 L72 196 Z" className="mk-body" />
            <rect x="80" y="196" width="40" height="34" rx="6" className="mk-lid" />
          
            <path d="M64 30 L136 30 L128 196 L72 196 Z" className="mk-shade" />
          </svg>
          <div className="mk__on mk__on--v" style={{ top: '44%', left: '50%', width: '30%' }}>{L(mark)}</div>
        </Frame>
      )
    case 'tag':
      return (
        <Frame kind="tag" label={title} text={m.text}>
          <svg viewBox="0 0 200 240" className="mk__svg">
            <path d="M100 0 C 96 20 108 30 100 46" fill="none" className="mk-string" />
            <path d="M52 50 L100 26 L148 50 L148 222 L52 222 Z" className="mk-body" />
            <circle cx="100" cy="48" r="7" className="mk-hole" />
            <rect x="52" y="176" width="96" height="46" className="mk-band" />
          
            <path d="M52 50 L100 26 L148 50 L148 222 L52 222 Z" className="mk-shade" />
          </svg>
          <div className="mk__on" style={{ top: '50%', left: '50%', width: '36%' }}>{L(mark)}</div>
          <p className="mk__line mk__line--tag">{m.text}</p>
        </Frame>
      )
    case 'card':
      return (
        <Frame kind="card" label={title} text="">
          <div className="mk-card mk-card--back">
            <b>{site.business.phone}</b>
            <span>{[site.business.street, site.business.city].filter(Boolean).join(', ')}</span>
            <span>{site.domains[0] || `${site.slug}.uz`}</span>
          </div>
          <div className="mk-card mk-card--front">{L(word)}</div>
        </Frame>
      )
    case 'sticker':
      return (
        <Frame kind="sticker" label={title} text={m.text}>
          <div className="mk-sticker">
            {L(mark)}
            <span>{m.text}</span>
          </div>
        </Frame>
      )
    case 'menu':
      return (
        <Frame kind="menu" label={title} text="">
          <div className="mk-menu">
            {L(word)}
            <i />
            {(m.text || '').split(';').filter(Boolean).slice(0, 3).map((r, i) => (
              <p key={i}>{r.trim()}</p>
            ))}
          </div>
        </Frame>
      )
    case 'billboard':
      return (
        <Frame kind="billboard" label={title} text="">
          <div className="mk-bill">
            <div className="mk-bill__face">
              <p className="mk-bill__head">{m.text}</p>
              {L(word)}
            </div>
            <i className="mk-bill__leg" />
            <i className="mk-bill__leg mk-bill__leg--r" />
          </div>
        </Frame>
      )
    case 'poster':
      return (
        <Frame kind="poster" label={title} text="">
          <div className="mk-poster">
            {shapes(site).length ? <Mark shapes={shapes(site)} className="mk-poster__big" /> : null}
            <p className="mk-poster__head">{m.text}</p>
            {L(word)}
          </div>
        </Frame>
      )
    case 'sign':
      return (
        <Frame kind="sign" label={title} text={m.text}>
          <div className="mk-sign">
            <div className="mk-sign__wall" />
            <div className="mk-sign__box">{L(word)}</div>
            <div className="mk-sign__door" />
          </div>
        </Frame>
      )
    case 'apparel':
      return (
        <Frame kind="apparel" label={title} text={m.text}>
          <svg viewBox="0 0 200 240" className="mk__svg">
            <path d="M70 20 Q100 40 130 20 L178 44 L162 92 L144 84 L144 226 L56 226 L56 84 L38 92 L22 44 Z" className="mk-body" />
            <path d="M70 20 Q100 40 130 20" fill="none" className="mk-handle" />
          
            <path d="M70 20 Q100 40 130 20 L178 44 L162 92 L144 84 L144 226 L56 226 L56 84 L38 92 L22 44 Z" className="mk-shade" />
          </svg>
          <div className="mk__on" style={{ top: '38%', left: '62%', width: '20%' }}>{L(mark)}</div>
        </Frame>
      )
    case 'vehicle':
      return (
        <Frame kind="vehicle" label={title} text={m.text}>
          <svg viewBox="0 0 280 160" className="mk__svg">
            <ellipse cx="140" cy="146" rx="120" ry="6" className="mk-shadow" />
            <path d="M20 40 Q20 26 34 26 L190 26 Q204 26 214 38 L250 82 Q260 92 260 106 L260 124 Q260 132 252 132 L28 132 Q20 132 20 124 Z" className="mk-body" />
            <path d="M200 40 L232 80 L200 80 Z" className="mk-glass" />
            <rect x="20" y="100" width="240" height="10" className="mk-band" />
            <circle cx="72" cy="132" r="17" className="mk-wheel" />
            <circle cx="214" cy="132" r="17" className="mk-wheel" />
          
            <path d="M20 40 Q20 26 34 26 L190 26 Q204 26 214 38 L250 82 Q260 92 260 106 L260 124 Q260 132 252 132 L28 132 Q20 132 20 124 Z" className="mk-shade" />
          </svg>
          <div className="mk__on" style={{ top: '40%', left: '38%', width: '46%' }}>{L(word)}</div>
        </Frame>
      )
    case 'ticket':
      return (
        <Frame kind="ticket" label={title} text="">
          <div className="mk-ticket">
            <div className="mk-ticket__main">
              {L(word)}
              <p>{m.text}</p>
            </div>
            <div className="mk-ticket__stub">{shapes(site).length ? <Mark shapes={shapes(site)} className="mk__mark" /> : null}</div>
          </div>
        </Frame>
      )
  }
}

export function SocialGrid({ site }: { site: Site }) {
  const b = site.brand!
  const sh = shapes(site)
  return (
    <div className="sg">
      <div className="sg__head">
        <span className="sg__ava">{sh.length ? <Mark shapes={sh} className="mk__mark" /> : null}</span>
        <div>
          <b>{b.social.handle || site.slug}</b>
          <p>{b.social.bio}</p>
        </div>
      </div>
      <div className="sg__grid">
        {b.social.posts.map((p, i) => (
          <div key={i} className={`sg-post sg-post--${p.kind}`}>
            {p.kind === 'product' && sh.length ? <Mark shapes={sh} className="sg-post__mark" /> : null}
            {p.kind === 'quote' ? <span className="sg-post__q">“</span> : null}
            <b>{p.title}</b>
            {p.text ? <span>{p.text}</span> : null}
            <span className="sg-post__logo">
              <Logo site={site} variant="header" />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Свет для предметов: один набор градиентов на страницу, url(#…) работает из любого SVG документа. */
export function MockDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="bb-shade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".38" />
          <stop offset=".22" stopColor="#fff" stopOpacity=".08" />
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset=".86" stopColor="#000" stopOpacity=".16" />
          <stop offset="1" stopColor="#000" stopOpacity=".3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const where = (site: Site) => [site.business.street, site.business.city].filter(Boolean).join(', ')
const domain = (site: Site) => site.domains[0] || `${site.slug}.uz`

/** Шапка профиля в соцсети и широкая обложка канала. */
export function Banners({ site }: { site: Site }) {
  const b = site.brand!
  const sh = shapes(site)
  return (
    <div className="bn">
      <div className="bn-wide">
        <div className="bn-wide__art" aria-hidden="true">
          {sh.length ? Array.from({ length: 14 }, (_, i) => <Mark key={i} shapes={sh} />) : null}
        </div>
        <p className="bn-wide__head">{b.cover || b.promise}</p>
        <div className="bn-wide__foot">
          <Logo site={site} variant="header" />
          <span>{domain(site)}</span>
        </div>
      </div>
      <div className="bn-phone">
        <div className="bn-phone__cover">
          <p>{b.cover || b.promise}</p>
        </div>
        <div className="bn-phone__ava">{sh.length ? <Mark shapes={sh} /> : null}</div>
        <div className="bn-phone__body">
          <b>{site.name}</b>
          <span>{b.social.handle || site.slug}</span>
          <p>{b.social.bio}</p>
          <div className="bn-phone__btns">
            <i>Заказать</i>
            <i>Написать</i>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Визитка: лицо со знаком на тёмном, оборот с контактами — в перспективе, как на столе. */
export function BusinessCard({ site }: { site: Site }) {
  const b = site.brand!
  const sh = shapes(site)
  return (
    <div className="bc">
      <div className="bc-card bc-card--front">
        <Logo site={site} variant="book" />
      </div>
      <div className="bc-card bc-card--back">
        <div>
          {b.card.name ? <b>{b.card.name}</b> : <b>{site.name}</b>}
          <span>{b.card.role}</span>
        </div>
        <div className="bc-card__contacts">
          <span>{site.business.phone}</span>
          <span>{where(site)}</span>
          <span>{domain(site)}</span>
        </div>
        {sh.length ? <Mark shapes={sh} className="bc-card__mark" /> : null}
      </div>
    </div>
  )
}

/** Билборд на крыше: небо, здание, щит с обещанием и логотипом. */
export function Billboard({ site }: { site: Site }) {
  const b = site.brand!
  const sh = shapes(site)
  const head = b.marketing.find((m) => m.kind === 'billboard')?.text || b.promise
  return (
    <div className="bd">
      <div className="bd-sky" aria-hidden="true" />
      <div className="bd-board">
        <div className="bd-face">
          <p>{head}</p>
          <div className="bd-face__side">
            {sh.length ? <Mark shapes={sh} className="bd-face__mark" /> : null}
            <Logo site={site} variant="header" />
          </div>
        </div>
        <div className="bd-rail" aria-hidden="true" />
        <div className="bd-legs" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="bd-building" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
    </div>
  )
}
