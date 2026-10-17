import type { Metadata } from 'next'
import Link from 'next/link'
import './home.css'
import { listSites } from '@/lib/store'
import { getTemplateMeta, TEMPLATE_METAS } from '@/templates/meta'
import { fontStack } from '@/lib/fonts'
import { Art } from '@/motion/art'
import { PLATFORM_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: 'Atlas — конструктор сайтов уровня студий: 10 шаблонов, SEO, AEO, GEO' },
  description: 'Десять шаблонов в духе monopo, alche, Ciao Energy, Aesop и Lando Norris. WebGL, кинетика, разметка schema.org, llms.txt и админка у каждого сайта.',
  alternates: { canonical: PLATFORM_URL },
}

export const revalidate = 3600

export default async function Home() {
  const sites = await listSites()
  return (
    <div className="home">
      <header className="home-top">
        <span className="home-logo">Atlas</span>
        <nav>
          <a href="#sites">Сайты</a>
          <a href="#templates">Шаблоны</a>
          <a href="#seo">SEO · AEO · GEO</a>
          <Link href="/admin" className="home-top__cta">
            Админка →
          </Link>
        </nav>
      </header>

      <section className="home-hero">
        <p className="home-kicker">Конструктор сайтов · {TEMPLATE_METAS.length} шаблонов · {sites.length} готовых сайтов</p>
        <h1>
          Сайты уровня <em>студий</em>, которые собираются за вечер
        </h1>
        <p className="home-lead">
          Каждый шаблон — отдельный мир со своим шейдером, кинетикой и типографикой. Каждый сайт — с полной разметкой schema.org,
          FAQ для ответов поисковиков, llms.txt для ИИ и своей админкой.
        </p>
      </section>

      <section id="sites" className="home-grid" aria-label="Готовые сайты">
        {sites.map((s, i) => {
          const tpl = getTemplateMeta(s.template)
          const t = s.theme
          return (
            <article key={s.slug} className="home-card" style={{ ['--c-bg' as string]: t.bg, ['--c-fg' as string]: t.fg, ['--c-ac' as string]: t.accent, ['--c-font' as string]: fontStack(t.display) }}>
              <Link href={`/${s.slug}`} className="home-card__visual" aria-label={`Открыть сайт ${s.name}`}>
                <Art seed={s.slug} colors={[t.bg, t.accent, t.surface, t.muted]} kind={tpl.art} className="home-card__art" />
                <span className="home-card__word">{s.name}</span>
                <span className="home-card__num">{String(i + 1).padStart(2, '0')}</span>
              </Link>
              <div className="home-card__body">
                <div>
                  <h2>{s.name}</h2>
                  <p>{s.niche}</p>
                </div>
                <p className="home-card__tpl">
                  Шаблон «{tpl.name}» · {tpl.inspiredBy.split('—')[0].trim()}
                </p>
                <div className="home-card__links">
                  <Link href={`/${s.slug}`}>Сайт ↗</Link>
                  <Link href={`/admin/sites/${s.slug}`}>Редактировать</Link>
                  <a href={`/${s.slug}/llms.txt`}>llms.txt</a>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section id="templates" className="home-tpls">
        <h2>Шаблоны и их ориентиры</h2>
        <ol>
          {TEMPLATE_METAS.map((t) => (
            <li key={t.id} style={{ ['--c-ac' as string]: t.preview.accent }}>
              <span className="home-tpls__name" style={{ fontFamily: fontStack(t.defaultTheme.display) }}>
                {t.name}
              </span>
              <span className="home-tpls__insp">{t.inspiredBy}</span>
              <span className="home-tpls__niche">{t.niches.join(', ')}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="seo" className="home-seo">
        <h2>Поисковики, ответы и нейросети — из одних данных</h2>
        <div className="home-seo__cols">
          <div>
            <h3>SEO</h3>
            <p>Заголовок, описание, canonical, Open Graph с автообложкой, sitemap.xml с картинками, robots, свой домен у каждого сайта.</p>
          </div>
          <div>
            <h3>AEO</h3>
            <p>Сводка-ответ на первом экране, FAQ в HTML и в FAQPage, этапы в HowTo, Speakable для голосовых ассистентов.</p>
          </div>
          <div>
            <h3>GEO</h3>
            <p>llms.txt и llms-full.txt собираются из услуг, цен, меню и FAQ. GPTBot, ClaudeBot, PerplexityBot разрешены явно.</p>
          </div>
        </div>
      </section>

      <footer className="home-foot">
        <span>Atlas · конструктор</span>
        <a href="/llms.txt">llms.txt</a>
        <a href="/sitemap.xml">sitemap.xml</a>
      </footer>
    </div>
  )
}
