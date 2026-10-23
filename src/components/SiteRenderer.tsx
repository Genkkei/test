import { LeadDialog } from './LeadDialog'
import { NicheActor } from './niche/NicheActor'
import { actorFor } from './niche/actors'
import { SiteChrome } from './SiteChrome'
import { FitLogos } from './brand/FitLogos'
import { CartDrawer, type Product } from './shop/CartDrawer'
import type { CSSProperties } from 'react'
import type { Site } from '@/lib/schema'
import { buildJsonLd } from '@/lib/seo'
import { fontStack } from '@/lib/fonts'
import { getTemplate } from '@/templates/registry'
import { TPL_CSS } from '@/templates/styles.generated'
import { Answer, BASE } from './sections'
import { MotionRuntime } from '@/motion/runtime'
import { registerBrandArt } from '@/motion/art'
import { LANG_LABEL, LANG_NAME, ui } from '@/lib/i18n'
import { primaryLang } from '@/lib/seo'

/** Переключатель языка — один на все шаблоны, в углу экрана. Ссылки внутри конструктора
 *  (/<slug>/uz); статическая выгрузка переписывает их в корень своего домена (/uz). */
function LangSwitch({ site, langs }: { site: Site; langs: string[] }) {
  if (langs.length < 2) return null
  const base = primaryLang(site)
  return (
    <nav className="lang-switch" aria-label={ui(site.lang, 'language')}>
      {langs.map((l) => (
        <a key={l} href={l === base ? `/${site.slug}` : `/${site.slug}/${l}`} hrefLang={l} lang={l} title={LANG_NAME[l]} aria-current={l === site.lang ? 'true' : undefined}>
          {LANG_LABEL[l] ?? l}
        </a>
      ))}
    </nav>
  )
}

export function themeStyle(site: Site): CSSProperties {
  const t = site.theme
  return {
    ['--bg' as string]: t.bg,
    ['--fg' as string]: t.fg,
    ['--accent' as string]: t.accent,
    ['--muted' as string]: t.muted,
    ['--surface' as string]: t.surface,
    ['--line' as string]: t.line,
    ['--font-display' as string]: fontStack(t.display),
    ['--font-body' as string]: fontStack(t.body),
  }
}

// Телефон: страница раскладывается на ширину экрана / 0.76 и вписывается в экран — все объекты
// шаблона (шрифты, отступы, картинки) становятся мельче одинаково, без правки каждого шаблона.
// Планшеты и компьютеры не трогает. Метку Next не правим — добавляем свою последней (браузер берёт
// последнюю): правленую метку React при загрузке считал чужой и вставлял свою, ширина страницы скакала
// 513 → 390 → 513 px прямо во время запуска анимаций, на iPhone вместе с масштабом. Если React всё же
// добавит метку, наша снова встаёт последней.
const PHONE_SCALE = `(function(){try{var w=Math.min(screen.width,innerWidth||screen.width);if(w>=600)return;var h=document.head,m=document.createElement('meta');m.name='viewport';m.content='width='+Math.round(w/0.76)+', viewport-fit=cover';m.setAttribute('data-atlas','');var put=function(){var l=h.querySelectorAll('meta[name=viewport]');if(l[l.length-1]!==m)h.appendChild(m)};put();new MutationObserver(put).observe(h,{childList:true})}catch(e){}})()`

// Появление блоков — с первой отрисовки и без React: прячет html.motion, показывает свой наблюдатель
// (и проверка по прокрутке — на случай, если наблюдатель в WebKit промолчит), новые блоки подхватываются
// сами. Раньше блоки прятались сразу, а показывал их только запустившийся React; если запуск шёл дольше
// 4 с, скрытие снималось и потом включалось снова — страница мигала, анимации пропадали. Заголовки по
// строкам (data-split) режет GSAP после запуска; не успел за 2,5 с — заголовки показываются как есть.
const MOTION_BOOT = `(function(){try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;d.classList.add('motion');var wait=[],show=function(t){(t.__rv||[t]).forEach(function(el){el.classList.add('is-in')});var k=wait.indexOf(t);if(k>=0)wait.splice(k,1);io.unobserve(t)};var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)show(e.target)})},{rootMargin:'0px 0px 56px 0px'});var seen=new WeakSet(),scan=function(){var l=document.querySelectorAll('[data-reveal]');for(var i=0;i<l.length;i++){var el=l[i];if(seen.has(el))continue;seen.add(el);var dl=el.getAttribute('data-delay');if(dl)el.style.setProperty('--reveal-delay',dl+'s');var t=el.getAttribute('data-reveal')==='clip'&&el.parentElement?el.parentElement:el;if(!t.__rv){t.__rv=[];wait.push(t);io.observe(t)}t.__rv.push(el)}};var raf=0,sweep=function(){raf=0;var H=innerHeight+56;wait.slice().forEach(function(t){var r=t.getBoundingClientRect();if(r.top<H&&r.bottom>-56)show(t)})};addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(sweep)},{passive:true});var go=function(){scan();sweep();new MutationObserver(function(){scan()}).observe(document.body,{childList:true,subtree:true})};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();setTimeout(function(){if(!d.classList.contains('motion-live'))d.classList.add('split-late')},2500)}catch(e){}})()`

export function SiteRenderer({ site, langs = [site.lang] }: { site: Site; langs?: string[] }) {
  const tpl = getTemplate(site.template)
  registerBrandArt(site.slug, site.brand?.logo?.shapes ?? [], site.theme)
  const { Shell } = tpl
  const sections = site.sections.filter((s) => s.enabled)
  const jsonLd = JSON.stringify(buildJsonLd(site)).replace(/</g, '\\u003c')
  // товары всех секций магазина — для корзины (ключ «секция:номер», как у кнопки «В корзину»)
  const products: Product[] = sections.flatMap((s) =>
    s.type === 'shop' ? s.items.flatMap((it, i) => (it.price > 0 ? [{ key: `${s.id}:${i}`, name: it.name, price: it.price, unit: it.unit, image: it.image }] : [])) : [],
  )

  return (
    <div className={`site tpl-${tpl.id}`} style={themeStyle(site)} data-template={tpl.id}>
      {/* стили только этого шаблона (scripts/seeds.mjs); React поднимает ссылку в <head> */}
      {TPL_CSS[tpl.id] ? <link rel="stylesheet" href={TPL_CSS[tpl.id]} precedence="tpl" /> : null}
      <script dangerouslySetInnerHTML={{ __html: PHONE_SCALE }} />
      {site.theme.motion > 0 ? <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} /> : null}
      <SiteChrome />
      {site.brand?.logo ? <FitLogos /> : null}
      {site.theme.motion > 0 && site.theme.actor !== 'none' ? (
        <NicheActor kind={actorFor(site.slug, site.business.type, site.theme.actor)} colors={{ a: site.theme.accent, f: site.theme.fg, b: site.theme.bg }} />
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <MotionRuntime level={site.theme.motion} />
      <Shell site={site}>
        {sections.map((section, index) => {
          const Renderer = (tpl.sections[section.type] ?? BASE[section.type]) as React.ComponentType<{
            section: typeof section
            site: Site
            index: number
            art: typeof tpl.art
          }>
          return (
            <div key={section.id} className="s-wrap" data-type={section.type}>
              <Renderer section={section} site={site} index={index} art={tpl.art} />
              {section.type === 'hero' && index === 0 ? <Answer site={site} /> : null}
            </div>
          )
        })}
      </Shell>
      <LangSwitch site={site} langs={langs} />
      {site.leads.enabled || site.listing.forSale ? <LeadDialog slug={site.slug} lang={site.lang} leads={site.leads} phone={site.business.phone} /> : null}
      {products.length ? <CartDrawer slug={site.slug} lang={site.lang} products={products} demo={site.listing.forSale} phone={site.business.phone} /> : null}
    </div>
  )
}
