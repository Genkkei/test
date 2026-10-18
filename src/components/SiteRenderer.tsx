import { LeadDialog } from './LeadDialog'
import type { CSSProperties } from 'react'
import type { Site } from '@/lib/schema'
import { buildJsonLd } from '@/lib/seo'
import { fontStack } from '@/lib/fonts'
import { getTemplate } from '@/templates/registry'
import { Answer, BASE } from './sections'
import { MotionRuntime } from '@/motion/runtime'
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

/** Инлайн-скрипт до отрисовки: включает скрытие для появления, только если JS жив.
 *  Если среда движения не запустилась за 4 с — снимает скрытие, текст не теряется. */
const MOTION_BOOT = `(function(){try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('motion');setTimeout(function(){if(!d.classList.contains('motion-live'))d.classList.remove('motion')},4000)}catch(e){}})()`

export function SiteRenderer({ site, langs = [site.lang] }: { site: Site; langs?: string[] }) {
  const tpl = getTemplate(site.template)
  const { Shell } = tpl
  const sections = site.sections.filter((s) => s.enabled)
  const jsonLd = JSON.stringify(buildJsonLd(site)).replace(/</g, '\\u003c')

  return (
    <div className={`site tpl-${tpl.id}`} style={themeStyle(site)} data-template={tpl.id}>
      {site.theme.motion > 0 ? <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} /> : null}
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
      {site.leads.enabled ? <LeadDialog slug={site.slug} lang={site.lang} leads={site.leads} phone={site.business.phone} /> : null}
    </div>
  )
}
